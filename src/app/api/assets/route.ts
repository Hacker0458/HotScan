/**
 * API Route: /api/assets
 * 
 * 功能：资产列表
 * 方法：GET
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // stock, crypto
    const sort = searchParams.get('sort') || 'volume' // volume, change, views
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (type) where.type = type

    // Determine sort order
    let orderBy: any = {}
    switch (sort) {
      case 'change':
        orderBy = { change24h: 'desc' }
        break
      case 'views':
        orderBy = { viewCount: 'desc' }
        break
      case 'volume':
      default:
        orderBy = { volume24h: 'desc' }
        break
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: {
              signals: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Assets GET error:', error)
    return NextResponse.json(
      { error: error.message || '获取资产失败' },
      { status: 500 }
    )
  }
}
