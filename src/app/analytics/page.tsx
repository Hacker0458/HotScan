/**
 * Analytics Dashboard
 * 
 * 显示 HotScan 平台的统计数据
 */

import { getAnalytics } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          HotScan 平台数据统计 | Platform Statistics
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Signals" value={data.signals} description="交易信号" />
        <StatCard title="Assets" value={data.assets} description="追踪资产" />
        <StatCard title="Terms" value={data.terms} description="术语库" />
        <StatCard title="Shares" value={data.shares} description="分享海报" />
        <StatCard title="Subscriptions" value={data.subscriptions} description="用户订阅" />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          ⚠️ 统计数据仅供参考，不构成投资建议。Stats are informational only. Not investment advice.
        </p>
      </div>
    </main>
  )
}

function StatCard({ 
  title, 
  value, 
  description 
}: { 
  title: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}
