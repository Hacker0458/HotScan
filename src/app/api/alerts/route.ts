import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/alerts?userId=xxx
 * List all alerts for a user
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }
    
    const alerts = await prisma.alert.findMany({
      where: { userId },
      include: {
        asset: {
          select: {
            id: true,
            symbol: true,
            name: true,
            chain: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length
    })
  } catch (error: any) {
    console.error('[Alerts API] GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      userId,
      assetId,
      alertType,
      targetValue,
      timeWindow,
      notifyBrowser = true,
      notifyEmail = false
    } = body
    
    // Validation
    if (!userId || !assetId || !alertType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, assetId, alertType' },
        { status: 400 }
      )
    }
    
    // Validate alert type
    const validTypes = ['price_above', 'price_below', 'change_pct_up', 'change_pct_down', 'risk_level_change']
    if (!validTypes.includes(alertType)) {
      return NextResponse.json(
        { success: false, error: `Invalid alertType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Create alert
    const alert = await prisma.alert.create({
      data: {
        userId,
        assetId,
        alertType,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        timeWindow,
        notifyBrowser,
        notifyEmail
      },
      include: {
        asset: {
          select: {
            id: true,
            symbol: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('[Alerts API] POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/alerts
 * Update an alert (toggle enabled, modify target, etc.)
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, enabled, targetValue, notifyBrowser, notifyEmail } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert id is required' },
        { status: 400 }
      )
    }
    
    // Build update data
    const updateData: any = {}
    if (typeof enabled === 'boolean') updateData.enabled = enabled
    if (targetValue !== undefined) updateData.targetValue = parseFloat(targetValue)
    if (typeof notifyBrowser === 'boolean') updateData.notifyBrowser = notifyBrowser
    if (typeof notifyEmail === 'boolean') updateData.notifyEmail = notifyEmail
    
    // Reset triggered status if re-enabling
    if (enabled === true) {
      updateData.triggered = false
    }
    
    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: {
        asset: {
          select: {
            symbol: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert updated successfully'
    })
  } catch (error: any) {
    console.error('[Alerts API] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/alerts?id=xxx
 * Delete an alert
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert id is required' },
        { status: 400 }
      )
    }
    
    await prisma.alert.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    })
  } catch (error: any) {
    console.error('[Alerts API] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

