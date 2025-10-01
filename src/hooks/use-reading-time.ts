/**
 * 阅读时长追踪Hook
 */

import { useEffect, useRef } from 'react'
import { trackReadingTime } from '@/lib/analytics'

export function useReadingTime(
  contentType: 'signal' | 'term' | 'asset',
  contentId: string,
  options: {
    minDuration?: number // 最小追踪时长（秒）
    enabled?: boolean
  } = {}
) {
  const { minDuration = 3, enabled = true } = options
  const startTimeRef = useRef<number>(Date.now())
  const hasTrackedRef = useRef(false)
  
  useEffect(() => {
    if (!enabled) return
    
    startTimeRef.current = Date.now()
    hasTrackedRef.current = false
    
    return () => {
      if (!hasTrackedRef.current) {
        const duration = (Date.now() - startTimeRef.current) / 1000
        
        if (duration >= minDuration) {
          trackReadingTime(contentType, contentId, Math.round(duration))
          hasTrackedRef.current = true
        }
      }
    }
  }, [contentType, contentId, minDuration, enabled])
}

