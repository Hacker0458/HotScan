import { prisma } from '@/lib/prisma'
import { pickLang, dict } from '@/lib/i18n'
import Link from 'next/link'

function formatPct(n?: number | null) {
  if (n == null || !isFinite(n)) return '—'
  const v = n
  return (v>=0?'+':'') + v.toFixed(2) + '%'
}

function formatMoney(n?: number | null) {
  if (n == null || !isFinite(n)) return '—'
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`
  return `$${n.toFixed(4)}`
}

async function getSignals(assetId: string, window = '1h', take = 10) {
  // 取该资产最近 N 条，时间升序用于画图
  const rows = await prisma.signal.findMany({
    where: { assetId, window },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      asset: true
    }
  })
  return rows.reverse()
}

async function getLatestPair(assetId: string) {
  return await prisma.pair.findFirst({
    where: { assetId },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AssetDetailPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }
  searchParams: { lang?: string } 
}) {
  const lang = pickLang(searchParams.lang)
  const t = dict[lang]
  const id = params.id
  
  const [rows, pair] = await Promise.all([
    getSignals(id, '1h', 10),
    getLatestPair(id)
  ])

  // 构建图表数据：价格变化%（来自信号保存的 pair.priceChange1h 兜底）与 riskScore
  const series = rows.map((r, idx) => ({
    idx: idx + 1,
    priceChangePct: pair?.priceChange1h ?? 0,
    risk: r.riskScore ?? 0,
    at: r.createdAt
  }))

  const asset = rows[rows.length - 1]?.asset

  if (!asset) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Link href={`/?lang=${lang}`} className="text-sm text-blue-600 hover:underline">
          ← {t.home}
        </Link>
        <div className="mt-6 text-center py-12 text-muted-foreground">
          {lang === 'zh' ? '资产未找到' : 'Asset not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Link href={`/?lang=${lang}`} className="text-sm text-blue-600 hover:underline">
        ← {t.home}
      </Link>
      
      <div className="mt-4">
        <h1 className="text-3xl font-bold">{asset?.symbol ?? '—'}</h1>
        <div className="text-lg text-muted-foreground">{asset?.name ?? ''}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {asset?.chain ?? ''}
        </div>
      </div>

      {/* 当前价格和关键指标 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">{lang === 'zh' ? '当前价格' : 'Current Price'}</div>
          <div className="text-2xl font-bold">{formatMoney(pair?.priceUsd)}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">{t.priceChange} ({t.hour})</div>
          <div className={`text-2xl font-bold ${(pair?.priceChange1h ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatPct(pair?.priceChange1h)}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">{t.liquidity}</div>
          <div className="text-2xl font-bold">{formatMoney(pair?.liquidityUSD)}</div>
        </div>
      </div>

      {/* 简化版图表：显示最近点的数值 */}
      <div className="mt-6 rounded-xl border bg-card p-4">
        <div className="mb-4 text-lg font-semibold">
          {lang === 'zh' ? '价格趋势与风险' : 'Price Trend & Risk'}
        </div>
        {series.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t.summaryNA}</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">{t.priceChange} ({t.hour})</div>
              <div className="text-3xl font-bold">{formatPct(series.at(-1)?.priceChangePct)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">{t.risk}</div>
              <div className="text-3xl font-bold">{series.at(-1)?.risk ?? 0}<span className="text-lg text-muted-foreground">/100</span></div>
            </div>
          </div>
        )}
      </div>

      {/* 最近信号列表 */}
      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">
          {lang==='zh' ? '最近信号' : 'Recent Signals'}
        </h2>
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t.summaryNA}</div>
          ) : (
            rows.map(r => (
              <div key={r.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.window}</div>
                </div>
                <div className="text-sm mb-2">
                  {lang==='en'
                    ? (r.summaryEn ?? r.aiSummary ?? dict.en.summaryNA)
                    : (r.summaryZh ?? r.aiSummary ?? dict.zh.summaryNA)
                  }
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{t.priceChange} ({t.hour}): <span className={(pair?.priceChange1h ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatPct(pair?.priceChange1h)}</span></span>
                  <span>{t.risk}: {r.riskScore ?? 0}/100</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
