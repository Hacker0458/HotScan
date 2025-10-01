/**
 * 术语列表 API
 * 
 * GET /api/learn/terms
 * 
 * 获取所有术语（用于术语库页面）
 */

import { NextResponse } from 'next/server'
import { getAllTerms } from '@/lib/rag'

export async function GET() {
  try {
    const terms = await getAllTerms()
    
    return NextResponse.json({
      success: true,
      data: {
        terms,
        count: terms.length,
      },
    })
  } catch (error) {
    console.error('Terms API error:', error)
    
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

