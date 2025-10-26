'use client'

import { useEffect, useState } from 'react'
import { Clock, ExternalLink, TrendingUp, TrendingDown } from './icons'
import { useI18n } from './LangProvider'

interface NewsItem {
  id: string
  title: string
  summary?: string
  url: string
  source: string
  category: string
  publishedAt: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  relatedAssets?: string[]
}

export function NewsSidebar({ limit = 5 }: { limit?: number }) {
  const { lang } = useI18n()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/news?limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch news')
      const data = await res.json()
      setNews(data.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    // 每5分钟自动刷新
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [limit])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    
    if (diff < 1) return lang === 'zh' ? '刚刚' : 'Just now'
    if (diff < 60) return lang === 'zh' ? `${diff}分钟前` : `${diff}m ago`
    if (diff < 1440) {
      const hours = Math.floor(diff / 60)
      return lang === 'zh' ? `${hours}小时前` : `${hours}h ago`
    }
    const days = Math.floor(diff / 1440)
    return lang === 'zh' ? `${days}天前` : `${days}d ago`
  }

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === 'positive') {
      return <TrendingUp className="h-3 w-3 text-emerald-500" />
    }
    if (sentiment === 'negative') {
      return <TrendingDown className="h-3 w-3 text-rose-500" />
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {lang === 'zh' ? '📰 最新快讯' : '📰 Latest News'}
        </h3>
        <button
          onClick={fetchNews}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          title={lang === 'zh' ? '刷新' : 'Refresh'}
        >
          🔄
        </button>
      </div>

      {/* Content */}
      {loading && news.length === 0 ? (
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-rose-500">
          {lang === 'zh' ? '加载失败' : 'Failed to load'}: {error}
        </div>
      ) : news.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          {lang === 'zh' ? '暂无快讯' : 'No news available'}
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block space-y-2 rounded-lg border border-transparent p-2 hover:border-border hover:bg-muted/50 transition-all"
            >
              {/* Title */}
              <div className="flex items-start gap-2">
                {getSentimentIcon(item.sentiment)}
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(item.publishedAt)}
                </span>
                <span>·</span>
                <span>{item.source}</span>
                {item.relatedAssets && item.relatedAssets.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-primary font-medium">
                      {item.relatedAssets.slice(0, 2).join(', ')}
                    </span>
                  </>
                )}
                <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Summary (optional) */}
              {item.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-center">
        <button
          onClick={fetchNews}
          className="text-xs text-primary hover:underline"
        >
          {lang === 'zh' ? '查看更多快讯 →' : 'View more news →'}
        </button>
      </div>
    </div>
  )
}

