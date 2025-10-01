/**
 * 随机术语 API
 * 
 * GET /api/learn/random?count={number}
 * 
 * 获取随机术语（用于"每日一词"功能）
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRandomTerms } from '@/lib/rag'
import { z } from 'zod'

const randomSchema = z.object({
  count: z.coerce.number().int().min(1).max(10).default(1).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const count = searchParams.get('count')
    
    const validation = randomSchema.safeParse({ count })
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }
    
    const { count: countValue } = validation.data
    
    const terms = await getRandomTerms(countValue)
    
    return NextResponse.json({
      success: true,
      data: {
        terms,
        count: terms.length,
      },
    })
  } catch (error) {
    console.error('Random terms API error:', error)
    
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

