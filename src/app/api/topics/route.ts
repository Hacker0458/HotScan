import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = category ? { category } : {}

    const topics = await prisma.trendingTopic.findMany({
      where,
      orderBy: [
        { trendScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            articles: true,
            bookmarks: true,
          },
        },
      },
    })

    const total = await prisma.trendingTopic.count({ where })

    return NextResponse.json({
      topics,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, category, source, sourceUrl, keywords, imageUrl } = body

    if (!title || !category || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const topic = await prisma.trendingTopic.create({
      data: {
        title,
        description,
        category,
        source,
        sourceUrl,
        keywords: keywords || [],
        imageUrl,
        trendScore: 50, // Default score
      },
    })

    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
