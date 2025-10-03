/**
 * Cron Job: Fetch Trending News
 * 
 * 定时任务：抓取热点新闻
 * - 每小时运行一次
 * - 使用 Vercel Cron 或手动触发
 * 
 * 使用方式：
 * 在 vercel.json 中配置：
 * {
 *   "crons": [{
 *     "path": "/api/cron/fetch-news",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchTrendingNews, calculateTrendScore } from '@/lib/news-fetcher'
import { analyzeSentiment, extractKeywords, generateEmbedding } from '@/lib/openai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret (for security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Update cron job status
    await prisma.cronJob.upsert({
      where: { name: 'fetch-news' },
      update: {
        status: 'running',
        lastRun: new Date(),
      },
      create: {
        name: 'fetch-news',
        status: 'running',
        lastRun: new Date(),
      },
    })

    const categories = ['tech', 'finance', 'entertainment', 'sports', 'health']
    let totalProcessed = 0
    let totalCreated = 0

    for (const category of categories) {
      const articles = await fetchTrendingNews(category)
      
      for (const article of articles) {
        totalProcessed++

        // Check if article already exists
        const existing = await prisma.article.findUnique({
          where: { sourceUrl: article.sourceUrl },
        })

        if (existing) continue

        // Analyze content
        const sentiment = await analyzeSentiment(
          `${article.title} ${article.description || ''}`
        )
        const keywords = await extractKeywords(
          `${article.title} ${article.description || ''}`,
          10
        )

        // Group similar articles into topics
        const topicTitle = article.title
        const topicDescription = article.description || ''

        // Try to find existing topic or create new one
        let topic = await prisma.trendingTopic.findFirst({
          where: {
            title: { contains: topicTitle.slice(0, 30) },
            category,
          },
        })

        if (!topic) {
          // Generate embedding for semantic search
          const embedding = process.env.OPENAI_API_KEY 
            ? await generateEmbedding(topicTitle)
            : null

          topic = await prisma.trendingTopic.create({
            data: {
              title: topicTitle,
              description: topicDescription,
              category,
              source: article.source,
              sourceUrl: article.sourceUrl,
              trendScore: calculateTrendScore(article),
              sentiment,
              keywords,
              imageUrl: article.imageUrl,
              embedding: embedding ? JSON.stringify(embedding) : null,
            },
          })
          totalCreated++
        }

        // Create article
        await prisma.article.create({
          data: {
            topicId: topic.id,
            title: article.title,
            content: article.content,
            summary: article.description,
            author: article.author,
            source: article.source,
            sourceUrl: article.sourceUrl,
            publishedAt: article.publishedAt,
            imageUrl: article.imageUrl,
            sentiment,
            keyPoints: keywords,
          },
        })
      }
    }

    // Update cron job status
    await prisma.cronJob.update({
      where: { name: 'fetch-news' },
      data: {
        status: 'success',
        errorMessage: null,
      },
    })

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      created: totalCreated,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)

    // Update cron job status
    await prisma.cronJob.update({
      where: { name: 'fetch-news' },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    })

    return NextResponse.json(
      { error: 'Cron job failed', message: error.message },
      { status: 500 }
    )
  }
}
