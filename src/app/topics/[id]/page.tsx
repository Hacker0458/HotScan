import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, getCategoryLabel, getSentimentColor, getSentimentLabel } from '@/lib/utils'
import { TrendingUp, Calendar, Tag, BarChart3 } from 'lucide-react'
import Link from 'next/link'

async function getTopic(id: string) {
  const topic = await prisma.trendingTopic.findUnique({
    where: { id },
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

  if (!topic) return null

  // Update view count
  await prisma.topicAnalytics.upsert({
    where: {
      topicId_date: {
        topicId: id,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    update: {
      viewCount: { increment: 1 },
    },
    create: {
      topicId: id,
      viewCount: 1,
      date: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  })

  return topic
}

export default async function TopicDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const topic = await getTopic(params.id)

  if (!topic) {
    notFound()
  }

  const totalViews = topic.analytics.reduce((sum, a) => sum + a.viewCount, 0)

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{getCategoryLabel(topic.category)}</Badge>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              热度 {topic.trendScore.toFixed(1)}
            </Badge>
            {topic.sentiment && (
              <Badge variant="outline" className={getSentimentColor(topic.sentiment)}>
                {getSentimentLabel(topic.sentiment)}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{topic.title}</h1>

          {topic.description && (
            <p className="text-lg text-muted-foreground mb-6">{topic.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(topic.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>{totalViews} 次浏览</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{topic._count.bookmarks} 个收藏</span>
            </div>
          </div>
        </div>

        {/* Keywords */}
        {topic.keywords.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">关键词</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topic.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">相关文章</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topic.articles.length > 0 ? (
                topic.articles.map((article) => (
                  <div key={article.id} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold mb-2">
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </a>
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{article.source}</span>
                      <span>{formatDate(article.publishedAt)}</span>
                      {article.sentiment && (
                        <Badge
                          variant="outline"
                          className={getSentimentColor(article.sentiment)}
                        >
                          {getSentimentLabel(article.sentiment)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  暂无相关文章
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-muted text-sm text-muted-foreground">
          <p className="font-semibold mb-1">免责声明</p>
          <p>
            本页面展示的信息来自公开的新闻源，仅供参考。
            我们不对信息的准确性、完整性或时效性做出保证。
            任何投资决策应基于您自己的研究和判断。
          </p>
        </div>
      </div>
    </div>
  )
}
