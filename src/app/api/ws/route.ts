/**
 * WebSocket API using Server-Sent Events (SSE)
 * 
 * This provides real-time updates for:
 * - New signals
 * - Price changes
 * - Alert triggers
 * - News updates
 * 
 * Note: Next.js App Router doesn't support WebSocket directly in serverless.
 * We use SSE as an alternative which works well with Vercel.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/ws?channel=signals&lang=zh
 * 
 * Channels:
 * - signals: Latest trading signals
 * - news: Latest news updates
 * - prices: Price updates for specific assets
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const channel = url.searchParams.get('channel') || 'signals'
  const lang = url.searchParams.get('lang') || 'zh'
  const assetId = url.searchParams.get('assetId') // For price channel
  
  // Create a TransformStream for SSE
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ 
          type: 'connected', 
          channel, 
          timestamp: new Date().toISOString() 
        })}\n\n`)
      )
      
      // Polling interval (check for updates every 5 seconds)
      const intervalId = setInterval(async () => {
        try {
          let data = null
          
          switch (channel) {
            case 'signals':
              // Get latest 5 signals
              const signals = await prisma.$queryRawUnsafe(`
                WITH latest_pairs AS (
                  SELECT DISTINCT ON (p."assetId") p.*
                  FROM "Pair" p
                  ORDER BY p."assetId", p."createdAt" DESC
                )
                SELECT s.*,
                       json_build_object('id', a."id", 'symbol', a."symbol", 'name', a."name") AS asset,
                       json_build_object(
                         'priceUsd', p."priceUsd",
                         'priceChange1h', p."priceChange1h",
                         'priceChange24h', p."priceChange24h"
                       ) AS pair
                FROM "Signal" s
                JOIN "Asset" a ON a."id" = s."assetId"
                LEFT JOIN latest_pairs p ON p."assetId" = a."id"
                WHERE s."window" = '1h'
                ORDER BY s."createdAt" DESC
                LIMIT 5
              `)
              
              data = {
                type: 'signals',
                data: (signals as any[]).map((s: any) => ({
                  ...s,
                  summary: lang === 'en' ? (s.summaryEn || s.aiSummary) : (s.summaryZh || s.aiSummary)
                })),
                timestamp: new Date().toISOString()
              }
              break
              
            case 'news':
              // Get latest 3 news items
              const news = await prisma.newsItem.findMany({
                orderBy: { publishedAt: 'desc' },
                take: 3,
                select: {
                  id: true,
                  title: true,
                  url: true,
                  source: true,
                  publishedAt: true,
                  sentiment: true
                }
              })
              
              data = {
                type: 'news',
                data: news,
                timestamp: new Date().toISOString()
              }
              break
              
            case 'prices':
              if (!assetId) {
                data = { type: 'error', message: 'assetId required for prices channel' }
                break
              }
              
              // Get latest price for specific asset
              const pair = await prisma.pair.findFirst({
                where: { assetId },
                orderBy: { createdAt: 'desc' },
                include: {
                  asset: {
                    select: {
                      symbol: true,
                      name: true
                    }
                  }
                }
              })
              
              data = {
                type: 'price',
                data: pair,
                timestamp: new Date().toISOString()
              }
              break
              
            default:
              data = { type: 'error', message: 'Unknown channel' }
          }
          
          // Send data
          if (data) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }
        } catch (error: any) {
          console.error('[WebSocket API] Error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: error.message 
            })}\n\n`)
          )
        }
      }, 5000) // Update every 5 seconds
      
      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId)
        controller.close()
      })
    }
  })
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    }
  })
}

