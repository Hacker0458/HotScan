/**
 * PostHog 分析库
 * 
 * 统一的事件追踪和用户行为分析
 */

import posthog from 'posthog-js'
import { PostHog } from 'posthog-node'

// ============================================
// 客户端 PostHog（浏览器）
// ============================================

let isInitialized = false

/**
 * 初始化 PostHog（客户端）
 */
export function initPostHog() {
  if (typeof window === 'undefined') return
  if (isInitialized) return
  
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  
  if (!apiKey) {
    console.warn('PostHog API key not found')
    return
  }
  
  posthog.init(apiKey, {
    api_host: apiHost,
    // 自动捕获
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    
    // 隐私设置
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-sensitive]',
    },
    
    // 性能优化
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug()
      }
    },
  })
  
  isInitialized = true
  console.log('✅ PostHog initialized')
}

/**
 * 获取 PostHog 实例（客户端）
 */
export function getPostHog() {
  if (typeof window === 'undefined') return null
  return posthog
}

// ============================================
// 服务端 PostHog（Node.js）
// ============================================

let serverPostHog: PostHog | null = null

/**
 * 获取服务端 PostHog 实例
 */
export function getServerPostHog(): PostHog {
  if (serverPostHog) return serverPostHog
  
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  
  if (!apiKey) {
    throw new Error('PostHog API key not found')
  }
  
  serverPostHog = new PostHog(apiKey, {
    host: apiHost,
  })
  
  return serverPostHog
}

// ============================================
// 事件类型定义
// ============================================

export type AnalyticsEvent =
  | 'signal_viewed'
  | 'share_generated'
  | 'term_clicked'
  | 'subscribe_tag'
  | 'ai_summary_copied'
  | 'poster_downloaded'
  | 'asset_detail_viewed'
  | 'learn_query_submitted'
  | 'short_link_visited'

export interface EventProperties {
  // 通用属性
  symbol?: string
  riskScore?: number
  window?: string
  source?: string
  
  // 特定属性
  assetId?: string
  assetName?: string
  shareId?: string
  term?: string
  tag?: string
  query?: string
  responseTime?: number
  
  // 元数据
  timestamp?: string
  userAgent?: string
  referrer?: string
}

// ============================================
// 事件追踪函数
// ============================================

/**
 * 追踪事件（客户端）
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
) {
  if (typeof window === 'undefined') return
  
  const ph = getPostHog()
  if (!ph) return
  
  const enrichedProperties = {
    ...properties,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer || 'direct',
  }
  
  ph.capture(event, enrichedProperties)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event tracked:', event, enrichedProperties)
  }
}

/**
 * 追踪事件（服务端）
 */
export function trackServerEvent(
  distinctId: string,
  event: AnalyticsEvent,
  properties?: EventProperties
) {
  try {
    const ph = getServerPostHog()
    
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
    }
    
    ph.capture({
      distinctId,
      event,
      properties: enrichedProperties,
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Server event tracked:', event, enrichedProperties)
    }
  } catch (error) {
    console.error('Failed to track server event:', error)
  }
}

// ============================================
// 特定事件追踪函数
// ============================================

/**
 * 追踪信号查看
 */
export function trackSignalViewed(properties: {
  symbol: string
  assetId: string
  assetName: string
  riskScore: number
  window: string
  source: string
}) {
  trackEvent('signal_viewed', properties)
}

/**
 * 追踪分享生成
 */
export function trackShareGenerated(properties: {
  symbol: string
  assetId: string
  shareId: string
  source: string
}) {
  trackEvent('share_generated', properties)
}

/**
 * 追踪术语点击
 */
export function trackTermClicked(properties: {
  term: string
  source: string
}) {
  trackEvent('term_clicked', properties)
}

/**
 * 追踪订阅标签
 */
export function trackSubscribeTag(properties: {
  tag: string
  source: string
}) {
  trackEvent('subscribe_tag', properties)
}

/**
 * 追踪AI摘要复制
 */
export function trackAiSummaryCopied(properties: {
  symbol: string
  assetId: string
  source: string
}) {
  trackEvent('ai_summary_copied', properties)
}

/**
 * 追踪海报下载
 */
export function trackPosterDownloaded(properties: {
  symbol: string
  assetId: string
  source: string
}) {
  trackEvent('poster_downloaded', properties)
}

/**
 * 追踪资产详情查看
 */
export function trackAssetDetailViewed(properties: {
  symbol: string
  assetId: string
  assetName: string
  source: string
}) {
  trackEvent('asset_detail_viewed', properties)
}

/**
 * 追踪学习查询提交
 */
export function trackLearnQuerySubmitted(properties: {
  query: string
  responseTime?: number
  source: string
}) {
  trackEvent('learn_query_submitted', properties)
}

/**
 * 追踪短链访问
 */
export function trackShortLinkVisited(properties: {
  shareId: string
  symbol: string
  source: string
}) {
  trackEvent('short_link_visited', properties)
}

// ============================================
// 用户识别
// ============================================

/**
 * 识别用户
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  const ph = getPostHog()
  if (!ph) return
  
  ph.identify(userId, properties)
}

/**
 * 重置用户
 */
export function resetUser() {
  if (typeof window === 'undefined') return
  
  const ph = getPostHog()
  if (!ph) return
  
  ph.reset()
}

// ============================================
// 页面追踪
// ============================================

/**
 * 追踪页面浏览
 */
export function trackPageView(pageName?: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  const ph = getPostHog()
  if (!ph) return
  
  ph.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
    ...properties,
  })
}

// ============================================
// 性能追踪
// ============================================

/**
 * 追踪性能指标
 */
export function trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  const ph = getPostHog()
  if (!ph) return
  
  ph.capture('performance_metric', {
    metric,
    value,
    ...properties,
  })
}

/**
 * 追踪阅读时长
 */
export function trackReadingTime(
  contentType: 'signal' | 'term' | 'asset',
  contentId: string,
  durationSeconds: number
) {
  trackEvent('content_read', {
    source: contentType,
    assetId: contentId,
    responseTime: durationSeconds,
  } as any)
}

