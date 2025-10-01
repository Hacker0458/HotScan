import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 7) {
    return `${days}天前`
  }
  
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getSentimentColor(sentiment: string | null): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 dark:text-green-400'
    case 'negative':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

export function getSentimentLabel(sentiment: string | null): string {
  switch (sentiment) {
    case 'positive':
      return '正面'
    case 'negative':
      return '负面'
    default:
      return '中性'
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    tech: '科技',
    finance: '财经',
    entertainment: '娱乐',
    sports: '体育',
    politics: '政治',
    health: '健康',
    education: '教育',
    other: '其他',
  }
  return labels[category] || category
}

export function getTrendingBadgeColor(score: number): string {
  if (score >= 90) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  if (score >= 75) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}
