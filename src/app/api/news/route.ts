import { NextResponse } from 'next/server'
import { fetchLatestNews, fetchNewsByCategory, searchNews } from '@/lib/news-aggregator'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5分钟

/**
 * GET /api/news?limit=10&category=news&search=BTC
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || '10')
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    
    let news
    
    if (search) {
      // 搜索模式
      news = await searchNews(search, limit)
    } else if (category) {
      // 分类模式
      news = await fetchNewsByCategory(category, limit)
    } else {
      // 默认模式：获取最新新闻
      news = await fetchLatestNews({ maxItems: limit })
    }
    
    // 可选：将新闻保存到数据库（去重）
    try {
      for (const item of news) {
        await prisma.newsItem.upsert({
          where: { url: item.url },
          create: {
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source,
            category: item.category,
            publishedAt: item.publishedAt,
            sentiment: item.sentiment,
            relatedAssets: item.relatedAssets || []
          },
          update: {
            viewCount: { increment: 1 }
          }
        })
      }
    } catch (error) {
      // 数据库错误不影响API返回
      console.error('[News API] Database save error:', error)
    }
    
    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        count: news.length,
        category,
        search,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[News API Error]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        detail: error.message
      },
      { status: 500 }
    )
  }
}

