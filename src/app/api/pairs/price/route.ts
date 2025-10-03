import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'assetId is required' },
        { status: 400 }
      )
    }

    // 查询该资产的 pairs，按流动性排序取最活跃的
    const pairs = await prisma.pair.findMany({
      where: {
        assetId,
        isActive: true
      },
      select: {
        id: true,
        priceUsd: true,
        priceChange1h: true,
        priceChange24h: true,
        liquidityUSD: true,
        volumeH24: true,
        fdv: true,
        dexId: true,
        chainId: true,
        updatedAt: true
      },
      orderBy: {
        liquidityUSD: 'desc'
      },
      take: 5 // 返回流动性最大的 5 个交易对
    })

    if (pairs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active pairs found for this asset' },
        { status: 404 }
      )
    }

    // 返回主要交易对（流动性最大的）和其他交易对
    const [primaryPair, ...otherPairs] = pairs

    return NextResponse.json({
      success: true,
      data: {
        primary: primaryPair,
        others: otherPairs
      },
      meta: {
        totalPairs: pairs.length,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Pairs price GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '获取价格失败' 
      },
      { status: 500 }
    )
  }
}

