/**
 * 术语搜索 API
 * 
 * GET /api/learn/search?q={prefix}
 * 
 * 用于自动补全和术语查找
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchTermsByPrefix } from '@/lib/rag'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = searchParams.get('limit')
    
    const validation = searchSchema.safeParse({
      q: query,
      limit,
    })
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }
    
    const { q, limit: limitValue } = validation.data
    
    const results = await searchTermsByPrefix(q, limitValue)
    
    return NextResponse.json({
      success: true,
      data: {
        query: q,
        results,
        count: results.length,
      },
    })
  } catch (error) {
    console.error('Search API error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
