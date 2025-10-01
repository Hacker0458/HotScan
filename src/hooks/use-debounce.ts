/**
 * useDebounce Hook
 * 
 * 延迟更新值，用于减少频繁的API调用或重渲染
 */

import { useEffect, useState } from 'react'

/**
 * Debounce Hook
 * 
 * @param value - 要防抖的值
 * @param delay - 延迟时间（毫秒），默认500ms
 * @returns 防抖后的值
 * 
 * @example
 * const [query, setQuery] = useState('')
 * const debouncedQuery = useDebounce(query, 500)
 * 
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     fetchResults(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 设置定时器延迟更新
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清理函数：如果value在delay时间内再次变化，清除之前的定时器
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

