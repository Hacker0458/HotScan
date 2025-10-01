/**
 * useThrottle Hook
 * 
 * 节流函数调用，限制函数执行频率
 */

import { useRef, useCallback } from 'react'

/**
 * Throttle Hook
 * 
 * @param callback - 要节流的回调函数
 * @param delay - 节流时间间隔（毫秒），默认1000ms
 * @returns 节流后的函数
 * 
 * @example
 * const loadMore = useThrottle(() => {
 *   fetchNextPage()
 * }, 1000)
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', loadMore)
 *   return () => window.removeEventListener('scroll', loadMore)
 * }, [loadMore])
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
): T {
  const lastRun = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRun.current

      // 如果已经过了delay时间，立即执行
      if (timeSinceLastRun >= delay) {
        callback(...args)
        lastRun.current = now
      } else {
        // 否则，清除之前的定时器，设置新的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args)
            lastRun.current = Date.now()
          },
          delay - timeSinceLastRun
        )
      }
    },
    [callback, delay]
  ) as T
}

