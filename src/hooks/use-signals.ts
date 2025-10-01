/**
 * useSignals Hook
 * 
 * 使用SWR获取信号列表，带缓存和自动重新验证
 */

import useSWR, { type SWRConfiguration } from 'swr'
import type { SignalResponse, PaginatedResponse } from '@/types/api'

interface SignalsParams {
  window?: string
  limit?: number
  offset?: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/**
 * 获取信号列表
 * 
 * @param params - 查询参数
 * @param config - SWR配置
 * @returns 信号列表和加载状态
 * 
 * @example
 * const { signals, isLoading, error, mutate } = useSignals({ 
 *   window: '1h', 
 *   limit: 20 
 * })
 */
export function useSignals(
  params?: SignalsParams,
  config?: SWRConfiguration
) {
  const query = new URLSearchParams()
  if (params?.window) query.set('window', params.window)
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))

  const { data, error, mutate, isLoading, isValidating } = useSWR<
    PaginatedResponse<SignalResponse>
  >(
    `/api/signals?${query.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false, // 不在焦点时重新验证
      dedupingInterval: 10000, // 10秒内去重
      ...config,
    }
  )

  return {
    signals: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
  }
}

/**
 * 获取单个信号详情
 * 
 * @param id - 信号ID
 * @returns 信号详情和加载状态
 * 
 * @example
 * const { signal, isLoading } = useSignal(signalId)
 */
export function useSignal(id: string | null) {
  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean
    data: SignalResponse
  }>(
    id ? `/api/signals/${id}` : null,
    fetcher
  )

  return {
    signal: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

