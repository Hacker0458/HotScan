/**
 * API Route: /api/signals
 * 
 * 功能：获取交易信号列表
 * 方法：GET
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const window = searchParams.get('window')
    const minRiskScore = searchParams.get('minRiskScore')
    const maxRiskScore = searchParams.get('maxRiskScore')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 构建查询条件
    const where: any = {}
    if (assetId) where.assetId = assetId
    if (window) where.window = window
    if (minRiskScore || maxRiskScore) {
      where.riskScore = {}
      if (minRiskScore) where.riskScore.gte = parseFloat(minRiskScore)
      if (maxRiskScore) where.riskScore.lte = parseFloat(maxRiskScore)
    }

    // 查询信号
    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        include: {
          asset: {
            select: {
              id: true,
              symbol: true,
              name: true,
              chain: true,
              logo: true,
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.signal.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: signals,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Signals GET error:', error)
    return NextResponse.json(
      { error: error.message || '获取信号失败' },
      { status: 500 }
    )
  }
}
