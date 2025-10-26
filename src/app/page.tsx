'use client'

import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/components/LangProvider'
import { TrendingUp, TrendingDown } from '@/components/icons'
import Link from 'next/link'

type Signal = {
  id: string
  asset?: { id?: string; symbol?: string; name?: string; chain?: string }
  pair?: { priceUsd?: number; priceChange1h?: number; priceChange24h?: number; liquidityUSD?: number; chainId?: string }
  riskScore?: number
  createdAt?: string
  summary?: string | null
}

function formatMoney(n?: number | null) {
  if (n == null || !isFinite(n)) return '—'
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`
  return `$${n.toFixed(4)}`
}

function formatPct(n?: number | null) {
  if (n == null || !isFinite(n)) return '—'
  const v = n
  const s = (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
  return s
}

async function apiGet(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function Home() {
  const { t, lang } = useI18n()
  const sp = useSearchParams()
  const langParam = sp.get('lang') || lang
  
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Signal[] }>(
    `/api/signals?limit=60&window=1h&lang=${langParam}`,
    apiGet,
    { refreshInterval: 15000 }
  )

  const list = data?.data ?? []

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('updated')} · {list.length} {t('signals')}
        </div>
        <button onClick={()=>mutate()} className="text-sm text-blue-600 hover:underline">
          {lang === 'zh' ? '刷新' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {String(error.message)}
        </div>
      )}

      {isLoading && list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {lang === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('summaryNA')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((it) => {
            const sym = it.asset?.symbol ?? '—'
            const name = it.asset?.name ?? sym
            const p1h = it.pair?.priceChange1h
            const p24 = it.pair?.priceChange24h
            const liq = it.pair?.liquidityUSD
            const price = it.pair?.priceUsd
            const up = (p1h ?? 0) >= 0
            const riskLevel = (it.riskScore ?? 0) >= 60 ? t.high : (it.riskScore ?? 0) >= 40 ? t.mid : t.low

            return (
              <Link 
                key={it.id} 
                href={`/asset/${it.asset?.id}?lang=${langParam}`}
                className="block rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{sym}</div>
                    <div className="text-xs text-muted-foreground">{formatMoney(price)}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {up ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                    {formatPct(p1h)}
                  </div>
                </div>
                
                <div className="mb-3 text-xs text-muted-foreground">
                  {name} · {it.asset?.chain ?? it.pair?.chainId ?? ''}
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">{t.hour}</div>
                    <div className={up ? 'text-emerald-600' : 'text-rose-600'}>{formatPct(p1h)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">24h</div>
                    <div>{formatPct(p24)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t.liquidity}</div>
                    <div>{formatMoney(liq)}</div>
                  </div>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${
                    (it.riskScore ?? 0) >= 60 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                    (it.riskScore ?? 0) >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {t.risk}: {riskLevel}
                  </span>
                </div>

                <div className="line-clamp-2 text-sm text-muted-foreground">
                  {it.summary ?? t.summaryNA}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
