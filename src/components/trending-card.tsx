import Link from 'next/link'
import { TrendingUp, Bookmark, Share2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatNumber, getCategoryLabel, getTrendingBadgeColor, getSentimentLabel, getSentimentColor } from '@/lib/utils'

interface TrendingCardProps {
  id: string
  title: string
  description?: string | null
  category: string
  trendScore: number
  sentiment?: string | null
  keywords: string[]
  createdAt: Date
  viewCount?: number
  bookmarkCount?: number
  isBookmarked?: boolean
  onBookmark?: () => void
  onShare?: () => void
}

export function TrendingCard({
  id,
  title,
  description,
  category,
  trendScore,
  sentiment,
  keywords,
  createdAt,
  viewCount = 0,
  bookmarkCount = 0,
  isBookmarked = false,
  onBookmark,
  onShare,
}: TrendingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/topics/${id}`}>
              <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(category)}
              </Badge>
              <Badge className={getTrendingBadgeColor(trendScore)}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {trendScore.toFixed(1)}
              </Badge>
              {sentiment && (
                <Badge variant="outline" className={getSentimentColor(sentiment)}>
                  {getSentimentLabel(sentiment)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {keywords.slice(0, 5).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground"
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="w-3 h-3" />
              {formatNumber(bookmarkCount)}
            </span>
          </div>
          <span>{formatDate(createdAt)}</span>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onBookmark}
          >
            <Bookmark className={`w-4 h-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
            收藏
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4 mr-1" />
            分享
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
