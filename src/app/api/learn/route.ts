/**
 * RAG 问答 API
 * 
 * GET /api/learn?q={query}
 * 
 * 检索相关术语，生成新手友好的解释
 */

import { NextRequest, NextResponse } from 'next/server'
import { answerQuery } from '@/lib/rag'
import { prisma } from '@/lib/prisma'

/**
 * 带超时的 Promise 包装器
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ])
}

/**
 * 指数退避重试
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 只在 429 或 5xx 错误时重试
      const shouldRetry = 
        lastError.message.includes('429') ||
        lastError.message.includes('5') ||
        lastError.message.includes('timeout')
      
      if (attempt < maxRetries && shouldRetry) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        console.log(`[learn] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }
  
  throw lastError
}

/**
 * 兜底查询 - 从 Term 表直接查找
 */
async function fallbackSearch(q: string) {
  try {
    // 尝试模糊匹配
    const term = await prisma.term.findFirst({
      where: {
        OR: [
          { term: { contains: q, mode: 'insensitive' } },
          { term: { equals: q, mode: 'insensitive' } },
        ],
      },
      select: {
        term: true,
        definition: true,
      },
    })
    
    if (term) {
      return {
        answer: `${term.term}：${term.definition}`,
        sources: [{ term: term.term, definition: term.definition, similarity: 1.0 }],
      }
    }
    
    // 完全找不到，返回占位
    return {
      answer: `"${q}"是加密货币和DeFi领域的常见术语。当前无法检索到详细条目，建议您：1) 检查拼写是否正确；2) 尝试使用相关术语（如"流动性"、"智能合约"等）；3) 稍后再试。`,
      sources: [],
    }
  } catch (error) {
    console.error('[learn] Fallback search error:', error)
    return {
      answer: `抱歉，暂时无法检索"${q}"的相关信息。请稍后重试或尝试其他术语。`,
      sources: [],
    }
  }
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const searchParams = request.nextUrl.searchParams
  const rawQuery = searchParams.get('q')
  
  console.log('[learn] Request started:', { q: rawQuery })
  
  try {
    // 防御式校验 - 检查 q 是否为空
    if (!rawQuery || rawQuery.trim().length === 0) {
      console.log('[learn] Missing query parameter')
      return NextResponse.json(
        { error: 'Missing q' },
        { status: 400 }
      )
    }
    
    // 去除首尾空白并限制长度
    const q = rawQuery.trim()
    if (q.length > 50) {
      console.log('[learn] Query too long:', q.length)
      return NextResponse.json(
        { error: 'Query too long (max 50 characters)' },
        { status: 400 }
      )
    }
    
    // 解析 k 参数（可选）
    const rawTopK = searchParams.get('k')
    let k = 3 // 默认值
    if (rawTopK) {
      const parsedK = parseInt(rawTopK, 10)
      if (!isNaN(parsedK) && parsedK >= 1 && parsedK <= 10) {
        k = parsedK
      }
    }
    
    console.log('[learn] Executing RAG query:', { q, k })
    
    // 执行RAG问答（带超时和重试）
    const result = await retryWithBackoff(
      () => withTimeout(answerQuery(q, k), 15000),
      2
    )
    
    const elapsed = Date.now() - startedAt
    console.log('[learn] Success:', { q, elapsed, sourcesCount: result.sources.length })
    
    return NextResponse.json({
      success: true,
      data: {
        query: result.query,
        answer: result.answer,
        sources: result.sources.map(s => ({
          term: s.term,
          definition: s.definition,
          similarity: Math.round(s.similarity * 100) / 100,
        })),
      },
    })
  } catch (error) {
    const elapsed = Date.now() - startedAt
    console.error('[learn] Error:', {
      q: rawQuery,
      elapsed,
      error: error instanceof Error ? error.message : String(error),
    })
    
    // 兜底：尝试直接从 Term 表查询
    try {
      const q = rawQuery?.trim() || ''
      const fallbackResult = await fallbackSearch(q)
      
      console.log('[learn] Fallback used:', { q, sourcesCount: fallbackResult.sources.length })
      
      return NextResponse.json({
        success: true,
        data: {
          query: q,
          answer: fallbackResult.answer,
          sources: fallbackResult.sources,
        },
      })
    } catch (fallbackError) {
      console.error('[learn] Fallback also failed:', fallbackError)
      
      return NextResponse.json(
        {
          success: false,
          error: '查询失败，请稍后重试',
        },
        { status: 500 }
      )
    }
  } finally {
    const totalTime = Date.now() - startedAt
    console.log('[learn] Request completed:', { q: rawQuery, totalTime })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
