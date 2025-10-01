import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatDate,
  getSentimentColor,
  getSentimentLabel,
  getCategoryLabel,
  getTrendingBadgeColor,
} from '@/lib/utils'

describe('Utils', () => {
  describe('formatNumber', () => {
    it('formats numbers correctly', () => {
      expect(formatNumber(500)).toBe('500')
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(1500000)).toBe('1.5M')
    })
  })

  describe('getSentimentLabel', () => {
    it('returns correct sentiment labels', () => {
      expect(getSentimentLabel('positive')).toBe('正面')
      expect(getSentimentLabel('negative')).toBe('负面')
      expect(getSentimentLabel('neutral')).toBe('中性')
      expect(getSentimentLabel(null)).toBe('中性')
    })
  })

  describe('getCategoryLabel', () => {
    it('returns correct category labels', () => {
      expect(getCategoryLabel('tech')).toBe('科技')
      expect(getCategoryLabel('finance')).toBe('财经')
      expect(getCategoryLabel('entertainment')).toBe('娱乐')
    })
  })

  describe('getTrendingBadgeColor', () => {
    it('returns correct colors based on score', () => {
      expect(getTrendingBadgeColor(95)).toContain('red')
      expect(getTrendingBadgeColor(80)).toContain('orange')
      expect(getTrendingBadgeColor(60)).toContain('yellow')
      expect(getTrendingBadgeColor(40)).toContain('gray')
    })
  })
})
