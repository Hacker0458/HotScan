'use client'

/**
 * Analytics Provider
 * 
 * 初始化PostHog并提供分析上下文
 */

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, trackPageView } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 初始化 PostHog
  useEffect(() => {
    initPostHog()
  }, [])
  
  // 追踪页面浏览
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(pathname, { url })
    }
  }, [pathname, searchParams])
  
  return <>{children}</>
}

