import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit  = Number(url.searchParams.get('limit')  ?? '60')
  const offset = Number(url.searchParams.get('offset') ?? '0')
  const window = url.searchParams.get('window') ?? '1h'
  const lang   = (url.searchParams.get('lang') || req.headers.get('accept-language') || 'zh')
                  .toLowerCase().startsWith('en') ? 'en' : 'zh'

  try {
    // ✅ 方案 A：按 Symbol 去重（每个 a."symbol" 只取最新一条）
    const rows: any[] = await prisma.$queryRawUnsafe(`
      WITH ranked AS (
        SELECT
          s."id",
          a."symbol",
          s."createdAt",
          ROW_NUMBER() OVER (PARTITION BY a."symbol" ORDER BY s."createdAt" DESC, s."riskScore" DESC) AS rn
        FROM "Signal" s
        JOIN "Asset"  a ON a."id" = s."assetId"
        WHERE s."window" = $1
      ),
      latest_pairs AS (
        SELECT DISTINCT ON (p."assetId") p.*
        FROM "Pair" p
        ORDER BY p."assetId", p."createdAt" DESC
      )
      SELECT s.*,
             json_build_object('id', a."id", 'symbol', a."symbol", 'name', a."name", 'chain', a."chain") AS asset,
             json_build_object(
               'priceUsd',       p."priceUsd",
               'priceChange1h',  p."priceChange1h",
               'priceChange24h', p."priceChange24h",
               'liquidityUSD',   p."liquidityUSD",
               'chainId',        p."chainId"
             ) AS pair
      FROM ranked r
      JOIN "Signal" s ON s."id" = r."id"
      JOIN "Asset"  a ON a."id" = s."assetId"
      LEFT JOIN latest_pairs p ON p."assetId" = a."id"
      WHERE r.rn = 1
      ORDER BY s."createdAt" DESC, s."riskScore" DESC
      LIMIT $2 OFFSET $3
    `, window, limit, offset)

    const data = rows.map((r: any) => ({
      ...r,
      summary: lang === 'en'
        ? (r.summaryEn ?? r.aiSummary ?? null)
        : (r.summaryZh ?? r.aiSummary ?? null)
    }))

    const total = await prisma.signal.count({ where: { window } })

    return NextResponse.json({
      success: true,
      data,
      meta: { 
        limit, 
        offset, 
        total, 
        hasMore: offset + limit < total,
        window, 
        generatedAt: new Date().toISOString() 
      }
    })
  } catch (err: any) {
    console.error('[signals API error]', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', detail: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
