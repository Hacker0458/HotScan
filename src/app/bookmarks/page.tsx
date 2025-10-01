import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TrendingCard } from '@/components/trending-card'
import { Bookmark as BookmarkIcon } from 'lucide-react'

async function getBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      topic: {
        include: {
          analytics: {
            where: {
              date: {
                gte: new Date(new Date().setDate(new Date().getDate() - 1)),
              },
            },
          },
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookmarks.map(bookmark => ({
    ...bookmark.topic,
    viewCount: bookmark.topic.analytics.reduce((sum, a) => sum + a.viewCount, 0),
    bookmarkCount: bookmark.topic._count.bookmarks,
    bookmarkedAt: bookmark.createdAt,
    notes: bookmark.notes,
  }))
}

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const bookmarks = await getBookmarks(session.user.id)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookmarkIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">我的收藏</h1>
        </div>
        <p className="text-muted-foreground">
          {bookmarks.length} 个已收藏的热点话题
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((topic) => (
            <TrendingCard
              key={topic.id}
              id={topic.id}
              title={topic.title}
              description={topic.description}
              category={topic.category}
              trendScore={topic.trendScore}
              sentiment={topic.sentiment}
              keywords={topic.keywords}
              createdAt={topic.createdAt}
              viewCount={topic.viewCount}
              bookmarkCount={topic.bookmarkCount}
              isBookmarked={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookmarkIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">暂无收藏</h2>
          <p className="text-muted-foreground mb-6">
            浏览热点话题并点击收藏按钮来保存感兴趣的内容
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            浏览热点
          </a>
        </div>
      )}
    </div>
  )
}
