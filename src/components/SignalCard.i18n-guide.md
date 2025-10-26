# SignalCard i18n 集成指南

## 1. 导入必要的模块

```tsx
import { useI18n } from '@/components/LangProvider'
import { TrendingUp, TrendingDown, Minus } from '@/components/icons'
```

## 2. 使用 i18n Hook

```tsx
export default function SignalCard({ signal }: { signal: Signal }) {
  const { t, lang } = useI18n()
  
  // ... 其他逻辑
}
```

## 3. 替换硬编码文本

**之前**:
```tsx
<div>流动性: {liq}</div>
<div>风险: {risk}</div>
<div>1h: {p1h} / 24h: {p24}</div>
```

**之后**:
```tsx
<div>{t('liquidity')}: {liq}</div>
<div>{t('risk')}: {risk}</div>
<div>{t('hour')}: {p1h} / {t('day')}: {p24}</div>
```

## 4. 处理摘要

```tsx
// 使用 API 返回的 summary（已根据 lang 参数选择）
const summary = signal.summary ?? t('summaryNA')

<div className="text-sm line-clamp-2">{summary}</div>
```

## 5. 格式化工具函数

```tsx
function formatMoney(n?: number | null): string {
  if (n == null || !isFinite(n)) return '—'
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

function formatPct(n?: number | null): string {
  if (n == null || !isFinite(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}
```

## 6. 完整示例

```tsx
import { useI18n } from '@/components/LangProvider'
import { TrendingUp, TrendingDown } from '@/components/icons'

export default function SignalCard({ signal }: { signal: Signal }) {
  const { t } = useI18n()
  
  // 格式化数据
  const liq = formatMoney(signal.pair?.liquidityUSD)
  const p1h = formatPct(signal.pair?.priceChange1h)
  const p24 = formatPct(signal.pair?.priceChange24h)
  const price = formatMoney(signal.pair?.priceUsd)
  const summary = signal.summary ?? t('summaryNA')
  
  // 风险等级
  const riskLevel = signal.riskScore >= 60 ? t('high') 
                  : signal.riskScore >= 40 ? t('mid') 
                  : t('low')
  
  return (
    <div className="card">
      <div className="flex justify-between">
        <div>
          <h3>{signal.asset.symbol}</h3>
          <p className="text-xs">{price}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            {signal.pair?.priceChange1h >= 0 ? <TrendingUp /> : <TrendingDown />}
            <span>{t('hour')}: {p1h}</span>
          </div>
          <div className="text-xs">{t('day')}: {p24}</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        <div>{t('liquidity')}: {liq}</div>
        <div>{t('risk')}: {riskLevel}</div>
      </div>
      
      <div className="mt-2 text-sm line-clamp-2">
        {summary}
      </div>
    </div>
  )
}

function formatMoney(n?: number | null): string {
  if (n == null || !isFinite(n)) return '—'
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

function formatPct(n?: number | null): string {
  if (n == null || !isFinite(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}
```

## 7. 可用的翻译键

查看 `src/lib/i18n.ts` 中的 `dict` 对象获取完整列表：

- `home`, `learn` - 导航
- `dataFrom`, `filters`, `updated`, `signals` - 通用
- `liquidity`, `risk`, `priceChange` - 数据标签
- `low`, `mid`, `high` - 风险级别
- `hour`, `day` - 时间单位
- `summaryNA`, `neutral` - 默认值
