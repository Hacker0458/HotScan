/**
 * News Aggregator
 * 
 * 聚合多个加密货币新闻源，提供7x24小时实时快讯
 * 
 * 数据源：
 * - CryptoPanic API (免费)
 * - CoinDesk RSS
 * - CoinTelegraph RSS
 */

import { callAI } from './ai/smart-caller'

export interface NewsItem {
  id: string
  title: string
  summary?: string
  url: string
  source: string
  category: string
  publishedAt: Date
  sentiment?: 'positive' | 'negative' | 'neutral'
  relatedAssets?: string[]
}

export interface NewsAggregatorConfig {
  maxItems?: number
  categories?: string[]
  minPublishTime?: Date
}

/**
 * 从CryptoPanic获取新闻
 */
async function fetchFromCryptoPanic(config: NewsAggregatorConfig): Promise<NewsItem[]> {
  try {
    // CryptoPanic提供免费API，无需key也能使用
    // 文档: https://cryptopanic.com/developers/api/
    const params = new URLSearchParams({
      public: 'true',
      kind: 'news',
      filter: 'hot',  // 热门新闻
      currencies: 'BTC,ETH,SOL',  // 主要货币
    })
    
    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?${params.toString()}`,
      { next: { revalidate: 300 } } // 5分钟缓存
    )
    
    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    const items: NewsItem[] = (data.results || []).slice(0, config.maxItems || 10).map((item: any) => ({
      id: `cp-${item.id}`,
      title: item.title,
      url: item.url,
      source: item.source?.title || 'CryptoPanic',
      category: item.kind || 'news',
      publishedAt: new Date(item.published_at),
      sentiment: item.votes?.positive > item.votes?.negative ? 'positive' : 
                 item.votes?.negative > item.votes?.positive ? 'negative' : 'neutral',
      relatedAssets: item.currencies?.map((c: any) => c.code) || []
    }))
    
    return items
  } catch (error) {
    console.error('[News] CryptoPanic fetch error:', error)
    return []
  }
}

/**
 * 解析RSS Feed
 */
async function parseRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      throw new Error(`RSS fetch error: ${response.status}`)
    }
    
    const xml = await response.text()
    
    // 简单的RSS解析（生产环境建议使用xml2js等库）
    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      
      const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(itemXml)
      const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml)
      const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml)
      const descriptionMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/.exec(itemXml)
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1] || titleMatch[2]
        const url = linkMatch[1]
        const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date()
        const description = descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2]) : undefined
        
        items.push({
          id: `rss-${Buffer.from(url).toString('base64').slice(0, 16)}`,
          title,
          summary: description?.replace(/<[^>]*>/g, '').slice(0, 200),
          url,
          source: sourceName,
          category: 'news',
          publishedAt: pubDate
        })
      }
    }
    
    return items
  } catch (error) {
    console.error(`[News] RSS fetch error (${sourceName}):`, error)
    return []
  }
}

/**
 * 从CoinDesk RSS获取新闻
 */
async function fetchFromCoinDesk(): Promise<NewsItem[]> {
  return parseRSSFeed('https://www.coindesk.com/arc/outboundfeeds/rss/', 'CoinDesk')
}

/**
 * 从Cointelegraph RSS获取新闻
 */
async function fetchFromCointelegraph(): Promise<NewsItem[]> {
  return parseRSSFeed('https://cointelegraph.com/rss', 'Cointelegraph')
}

/**
 * 使用AI分析新闻情感
 */
async function analyzeSentiment(items: NewsItem[]): Promise<NewsItem[]> {
  const itemsNeedingSentiment = items.filter(item => !item.sentiment)
  
  if (itemsNeedingSentiment.length === 0) {
    return items
  }
  
  try {
    // 批量分析情感（每10条一批）
    for (let i = 0; i < itemsNeedingSentiment.length; i += 10) {
      const batch = itemsNeedingSentiment.slice(i, i + 10)
      
      for (const item of batch) {
        try {
          const prompt = `分析以下加密货币新闻的情感倾向（仅回复positive/negative/neutral之一）：
标题：${item.title}
${item.summary ? `摘要：${item.summary}` : ''}`
          
          const sentiment = await callAI('news', prompt, { maxTokens: 10 })
          const trimmed = sentiment.toLowerCase().trim()
          
          if (trimmed.includes('positive')) {
            item.sentiment = 'positive'
          } else if (trimmed.includes('negative')) {
            item.sentiment = 'negative'
          } else {
            item.sentiment = 'neutral'
          }
        } catch {
          // AI失败，设置为neutral
          item.sentiment = 'neutral'
        }
      }
    }
  } catch (error) {
    console.error('[News] Sentiment analysis error:', error)
  }
  
  return items
}

/**
 * 聚合所有新闻源
 */
export async function fetchLatestNews(config: NewsAggregatorConfig = {}): Promise<NewsItem[]> {
  const {
    maxItems = 20,
    categories = ['news', 'hot', 'rising'],
    minPublishTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 默认24小时内
  } = config
  
  console.log('[News] Fetching latest news...')
  
  // 并行获取所有新闻源
  const [cryptoPanicNews, coinDeskNews, cointelegraphNews] = await Promise.all([
    fetchFromCryptoPanic(config),
    fetchFromCoinDesk(),
    fetchFromCointelegraph()
  ])
  
  // 合并所有新闻
  let allNews = [...cryptoPanicNews, ...coinDeskNews, ...cointelegraphNews]
  
  // 过滤时间
  allNews = allNews.filter(item => item.publishedAt >= minPublishTime)
  
  // 去重（基于URL）
  const seen = new Set<string>()
  allNews = allNews.filter(item => {
    if (seen.has(item.url)) {
      return false
    }
    seen.add(item.url)
    return true
  })
  
  // 按时间排序
  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  
  // 限制数量
  allNews = allNews.slice(0, maxItems)
  
  // 分析情感（异步，不阻塞）
  analyzeSentiment(allNews).catch(err => {
    console.error('[News] Sentiment analysis failed:', err)
  })
  
  console.log(`[News] Fetched ${allNews.length} news items`)
  
  return allNews
}

/**
 * 按分类获取新闻
 */
export async function fetchNewsByCategory(category: string, maxItems = 10): Promise<NewsItem[]> {
  const allNews = await fetchLatestNews({ maxItems: 50 })
  return allNews
    .filter(item => item.category === category || !category)
    .slice(0, maxItems)
}

/**
 * 搜索新闻
 */
export async function searchNews(query: string, maxItems = 10): Promise<NewsItem[]> {
  const allNews = await fetchLatestNews({ maxItems: 100 })
  const lowerQuery = query.toLowerCase()
  
  return allNews
    .filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.summary?.toLowerCase().includes(lowerQuery) ||
      item.relatedAssets?.some(asset => asset.toLowerCase().includes(lowerQuery))
    )
    .slice(0, maxItems)
}

