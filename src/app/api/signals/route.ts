import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // 解析查询参数
    const window = searchParams.get('window') || undefined
    const assetId = searchParams.get('assetId') || undefined
    const minRiskScore = searchParams.get('minRiskScore')
    const maxRiskScore = searchParams.get('maxRiskScore')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // 构建查询条件
    const where: any = {}
    if (window) where.window = window
    if (assetId) where.assetId = assetId
    if (minRiskScore || maxRiskScore) {
      where.riskScore = {}
      if (minRiskScore) where.riskScore.gte = parseFloat(minRiskScore)
      if (maxRiskScore) where.riskScore.lte = parseFloat(maxRiskScore)
    }

    // 查询信号和总数
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
              pairs: {
                select: {
                  id: true,
                  priceUsd: true,
                  priceChange1h: true,
                  priceChange24h: true,
                  liquidityUSD: true,
                  volumeH24: true,
                  fdv: true,
                  dexId: true,
                  chainId: true
                },
                orderBy: {
                  liquidityUSD: 'desc'
                },
                take: 1 // 取流动性最大的那个 pair
              }
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.signal.count({ where })
    ])

    // 将 pair 信息扁平化到结果中
    const signalsWithPair = signals.map(signal => {
      const pair = signal.asset.pairs[0] || null
      const { pairs, ...assetWithoutPairs } = signal.asset
      return {
        ...signal,
        asset: assetWithoutPairs,
        pair
      }
    })

    return NextResponse.json({
      success: true,
      data: signalsWithPair,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Signals GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '获取信号失败' 
      },
      { status: 500 }
    )
  }
}
