import { describe, it, expect } from 'vitest'
import { calculateTrendScore, type NewsArticle } from '@/lib/news-fetcher'

describe('News Fetcher', () => {
  describe('calculateTrendScore', () => {
    it('gives higher score to recent articles', () => {
      const recentArticle: NewsArticle = {
        title: 'Test',
        source: 'test',
        sourceUrl: 'https://test.com',
        publishedAt: new Date(),
        category: 'tech',
      }

      const oldArticle: NewsArticle = {
        title: 'Test',
        source: 'test',
        sourceUrl: 'https://test.com',
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        category: 'tech',
      }

      const recentScore = calculateTrendScore(recentArticle)
      const oldScore = calculateTrendScore(oldArticle)

      expect(recentScore).toBeGreaterThan(oldScore)
    })

    it('gives bonus for articles with images and descriptions', () => {
      const articleWithMedia: NewsArticle = {
        title: 'Test',
        description: 'A long description that is more than 100 characters long to test the scoring system properly',
        source: 'test',
        sourceUrl: 'https://test.com',
        publishedAt: new Date(),
        imageUrl: 'https://test.com/image.jpg',
        category: 'tech',
      }

      const basicArticle: NewsArticle = {
        title: 'Test',
        source: 'test',
        sourceUrl: 'https://test.com',
        publishedAt: new Date(),
        category: 'tech',
      }

      const mediaScore = calculateTrendScore(articleWithMedia)
      const basicScore = calculateTrendScore(basicArticle)

      expect(mediaScore).toBeGreaterThan(basicScore)
    })

    it('keeps score within 0-100 range', () => {
      const article: NewsArticle = {
        title: 'Test',
        description: 'A long description that is more than 100 characters long to test the scoring system properly and ensure it works correctly',
        source: 'test',
        sourceUrl: 'https://test.com',
        publishedAt: new Date(),
        imageUrl: 'https://test.com/image.jpg',
        category: 'tech',
      }

      const score = calculateTrendScore(article)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })
})
