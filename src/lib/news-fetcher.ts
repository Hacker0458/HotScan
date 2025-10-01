/**
 * News Fetcher Service
 * 
 * 设计点：
 * 1. 支持多个新闻源（可扩展）
 * 2. 统一的数据格式
 * 3. 错误处理和重试机制
 * 4. 速率限制
 */

export interface NewsArticle {
  title: string
  description?: string
  content?: string
  author?: string
  source: string
  sourceUrl: string
  publishedAt: Date
  imageUrl?: string
  category: string
}

/**
 * 从多个源抓取新闻
 */
export async function fetchTrendingNews(category?: string): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = []

  // 示例：可以集成多个新闻源
  // 1. RSS feeds
  // 2. News APIs (NewsAPI, etc.)
  // 3. Web scraping (使用 cheerio)
  
  // 这里提供一个模拟实现，实际使用时需要配置真实的新闻源
  
  try {
    // 示例：NewsAPI integration
    if (process.env.NEWS_API_KEY) {
      const newsApiArticles = await fetchFromNewsAPI(category)
      articles.push(...newsApiArticles)
    }

    // 可以添加更多新闻源
    // const rssArticles = await fetchFromRSS()
    // articles.push(...rssArticles)

  } catch (error) {
    console.error('Error fetching news:', error)
  }

  return articles
}

async function fetchFromNewsAPI(category?: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return []

  const categoryMap: Record<string, string> = {
    tech: 'technology',
    finance: 'business',
    entertainment: 'entertainment',
    sports: 'sports',
    health: 'health',
  }

  const newsApiCategory = category ? categoryMap[category] : 'general'
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=${newsApiCategory}&apiKey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`)
    }

    const data = await response.json()

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      author: article.author,
      source: article.source.name,
      sourceUrl: article.url,
      publishedAt: new Date(article.publishedAt),
      imageUrl: article.urlToImage,
      category: category || 'general',
    }))
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error)
    return []
  }
}

/**
 * 计算趋势分数
 * 基于多个因素：新鲜度、相关性、热度等
 */
export function calculateTrendScore(article: NewsArticle): number {
  let score = 50 // 基础分数

  // 新鲜度（最近 24 小时内发布的文章加分）
  const hoursAgo = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
  if (hoursAgo < 1) score += 30
  else if (hoursAgo < 6) score += 20
  else if (hoursAgo < 24) score += 10

  // 内容质量（有图片、有描述加分）
  if (article.imageUrl) score += 5
  if (article.description && article.description.length > 100) score += 5

  // 确保分数在 0-100 之间
  return Math.min(Math.max(score, 0), 100)
}
