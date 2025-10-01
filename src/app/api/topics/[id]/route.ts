import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topic = await prisma.trendingTopic.findUnique({
      where: { id: params.id },
      include: {
        articles: {
          orderBy: { publishedAt: 'desc' },
          take: 10,
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 7,
        },
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.topicAnalytics.upsert({
      where: {
        topicId_date: {
          topicId: params.id,
          date: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      update: {
        viewCount: { increment: 1 },
      },
      create: {
        topicId: params.id,
        viewCount: 1,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    })

    return NextResponse.json(topic)
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}
