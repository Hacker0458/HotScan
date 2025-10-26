import { NextResponse } from 'next/server'
import { checkAllAlerts, resetTriggeredAlerts, cleanupOldAlerts } from '@/lib/alert-checker'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds max

/**
 * POST /api/alerts/check
 * Manually trigger alert checking (called by cron)
 * 
 * Requires JOB_TOKEN for security
 */
export async function POST(req: Request) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (token !== process.env.JOB_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('[Alert Check API] Starting alert check...')
    const startTime = Date.now()
    
    // Check all alerts
    const results = await checkAllAlerts()
    
    const triggeredCount = results.filter(r => r.triggered).length
    
    // Reset alerts that were triggered more than 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const resetCount = await resetTriggeredAlerts(oneHourAgo)
    
    // Cleanup old disabled alerts (optional, runs weekly)
    let cleanupCount = 0
    const url = new URL(req.url)
    if (url.searchParams.get('cleanup') === 'true') {
      cleanupCount = await cleanupOldAlerts()
    }
    
    const duration = Date.now() - startTime
    
    console.log(`[Alert Check API] Completed in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      data: {
        checked: results.length,
        triggered: triggeredCount,
        reset: resetCount,
        cleaned: cleanupCount,
        duration: `${duration}ms`
      }
    })
  } catch (error: any) {
    console.error('[Alert Check API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/alerts/check
 * Get alert check status (no auth required, read-only)
 */
export async function GET() {
  try {
    const stats = await prisma.alert.groupBy({
      by: ['alertType', 'enabled'],
      _count: true
    })
    
    return NextResponse.json({
      success: true,
      stats,
      info: 'Use POST with JOB_TOKEN to trigger alert checking'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

