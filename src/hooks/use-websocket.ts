/**
 * useWebSocket Hook
 * 
 * React hook for consuming Server-Sent Events (SSE) as WebSocket alternative
 */

import { useEffect, useRef, useState, useCallback } from 'react'

export interface WebSocketMessage {
  type: string
  data?: any
  message?: string
  timestamp?: string
}

export interface UseWebSocketOptions {
  channel?: 'signals' | 'news' | 'prices'
  lang?: 'zh' | 'en'
  assetId?: string
  enabled?: boolean
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Error) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    channel = 'signals',
    lang = 'zh',
    assetId,
    enabled = true,
    onMessage,
    onError
  } = options
  
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  
  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current?.readyState === EventSource.OPEN) {
      return
    }
    
    try {
      // Build URL with parameters
      const params = new URLSearchParams({
        channel,
        lang
      })
      
      if (assetId) {
        params.append('assetId', assetId)
      }
      
      const url = `/api/ws?${params.toString()}`
      
      console.log(`[WebSocket] Connecting to ${url}...`)
      
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource
      
      eventSource.onopen = () => {
        console.log('[WebSocket] Connected')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }
      
      eventSource.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          setLastMessage(message)
          onMessage?.(message)
          
          if (message.type === 'error') {
            console.error('[WebSocket] Server error:', message.message)
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err)
        }
      }
      
      eventSource.onerror = (err) => {
        console.error('[WebSocket] Connection error:', err)
        setIsConnected(false)
        
        const error = new Error('WebSocket connection failed')
        setError(error)
        onError?.(error)
        
        // Auto-reconnect with exponential backoff
        eventSource.close()
        
        if (reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/5)`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else {
          console.error('[WebSocket] Max reconnection attempts reached')
        }
      }
    } catch (err: any) {
      console.error('[WebSocket] Failed to create connection:', err)
      setError(err)
      onError?.(err)
    }
  }, [channel, lang, assetId, enabled, onMessage, onError])
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (eventSourceRef.current) {
      console.log('[WebSocket] Disconnecting...')
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [])
  
  // Connect on mount and when options change
  useEffect(() => {
    if (enabled) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])
  
  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect
  }
}

/**
 * Higher-level hook for signals channel
 */
export function useSignalsWebSocket(options: Omit<UseWebSocketOptions, 'channel'> = {}) {
  const [signals, setSignals] = useState<any[]>([])
  
  const { isConnected, error } = useWebSocket({
    ...options,
    channel: 'signals',
    onMessage: (message) => {
      if (message.type === 'signals' && message.data) {
        setSignals(message.data)
      }
      options.onMessage?.(message)
    }
  })
  
  return {
    signals,
    isConnected,
    error
  }
}

/**
 * Higher-level hook for news channel
 */
export function useNewsWebSocket(options: Omit<UseWebSocketOptions, 'channel'> = {}) {
  const [news, setNews] = useState<any[]>([])
  
  const { isConnected, error } = useWebSocket({
    ...options,
    channel: 'news',
    onMessage: (message) => {
      if (message.type === 'news' && message.data) {
        setNews(message.data)
      }
      options.onMessage?.(message)
    }
  })
  
  return {
    news,
    isConnected,
    error
  }
}

/**
 * Higher-level hook for price updates
 */
export function usePriceWebSocket(assetId: string, options: Omit<UseWebSocketOptions, 'channel' | 'assetId'> = {}) {
  const [price, setPrice] = useState<any>(null)
  
  const { isConnected, error } = useWebSocket({
    ...options,
    channel: 'prices',
    assetId,
    onMessage: (message) => {
      if (message.type === 'price' && message.data) {
        setPrice(message.data)
      }
      options.onMessage?.(message)
    }
  })
  
  return {
    price,
    isConnected,
    error
  }
}

