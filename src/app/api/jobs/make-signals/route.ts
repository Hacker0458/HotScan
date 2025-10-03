/**
 * API Route: /api/jobs/make-signals
 * 
 * 功能：触发信号生成任务
 * 方法：POST
 * 安全：需要 CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { makeSignals } from '@/jobs/make-signals'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await makeSignals()

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('Make signals job error:', error)
    return NextResponse.json(
      { error: error.message || '任务执行失败' },
      { status: 500 }
    )
  }
}

// Allow GET for manual trigger in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const result = await makeSignals()
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
