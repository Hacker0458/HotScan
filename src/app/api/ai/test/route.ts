import { NextResponse } from 'next/server'
import { callAI, getAICacheStats } from '@/lib/ai/smart-caller'

export const dynamic = 'force-dynamic'

/**
 * Test AI System
 * GET /api/ai/test?prompt=test&useCase=summary
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const prompt = url.searchParams.get('prompt') || '分析BTC市场趋势'
    const useCase = (url.searchParams.get('useCase') || 'summary') as any
    
    const startTime = Date.now()
    
    // 调用AI
    const result = await callAI(useCase, prompt, {
      maxTokens: 200
    })
    
    const duration = Date.now() - startTime
    const stats = getAICacheStats()
    
    return NextResponse.json({
      success: true,
      result,
      meta: {
        duration: `${duration}ms`,
        useCase,
        cacheSize: stats.size,
        dailyCount: stats.dailyCount
      }
    })
  } catch (error: any) {
    console.error('[AI Test Error]', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        detail: error.stack
      },
      { status: 500 }
    )
  }
}

