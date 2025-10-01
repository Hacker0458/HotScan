/**
 * 候选筛选纯函数
 * 
 * 筛选条件（满足≥2个）：
 * 1. 5-15分钟价格变化 ≥ 15%
 * 2. 1小时成交量相对24h均值 ≥ 3σ
 * 3. 流动性1h增加 ≥ 20%
 * 4. 新钱包净买入位列前10%
 */

import type { CandidateInput, CandidateResult } from './types'

/**
 * 检查价格波动条件
 * 条件1: 5-15分钟价格变化 ≥ 15%
 */
export function checkPriceVolatility(input: CandidateInput): {
  passed: boolean
  value: number | null
} {
  const priceChange5m = input.priceChange5m ? Math.abs(input.priceChange5m) : 0
  const priceChange15m = input.priceChange15m ? Math.abs(input.priceChange15m) : 0
  
  const maxChange = Math.max(priceChange5m, priceChange15m)
  
  return {
    passed: maxChange >= 15,
    value: maxChange > 0 ? maxChange : null,
  }
}

/**
 * 检查成交量异常条件
 * 条件2: 1小时成交量相对24h均值 ≥ 3σ (Z-Score ≥ 3)
 */
export function checkVolumeAnomaly(input: CandidateInput): {
  passed: boolean
  zScore: number
} {
  const { volume1h, volume24hMean, volume24hStdDev } = input
  
  // 避免除以0
  if (volume24hStdDev === 0) {
    return { passed: false, zScore: 0 }
  }
  
  // 计算 Z-Score
  const zScore = (volume1h - volume24hMean) / volume24hStdDev
  
  return {
    passed: zScore >= 3,
    zScore,
  }
}

/**
 * 检查流动性增长条件
 * 条件3: 流动性1h增加 ≥ 20%
 */
export function checkLiquidityGrowth(input: CandidateInput): {
  passed: boolean
  growthPct: number
} {
  const { liquidityNow, liquidity1hAgo } = input
  
  // 避免除以0
  if (liquidity1hAgo === 0) {
    return { passed: false, growthPct: 0 }
  }
  
  // 计算增长百分比
  const growthPct = ((liquidityNow - liquidity1hAgo) / liquidity1hAgo) * 100
  
  return {
    passed: growthPct >= 20,
    growthPct,
  }
}

/**
 * 检查钱包活动条件
 * 条件4: 新钱包净买入位列前10%
 */
export function checkWalletActivity(input: CandidateInput): {
  passed: boolean
  percentile: number | null
} {
  const { newWalletNetBuyPercentile } = input
  
  if (newWalletNetBuyPercentile === undefined || newWalletNetBuyPercentile === null) {
    return { passed: false, percentile: null }
  }
  
  // 百分位 ≥ 90 表示位列前10%
  return {
    passed: newWalletNetBuyPercentile >= 90,
    percentile: newWalletNetBuyPercentile,
  }
}

/**
 * 综合候选筛选
 * 
 * @param input - 候选筛选输入数据
 * @returns 筛选结果
 */
export function filterCandidate(input: CandidateInput): CandidateResult {
  // 检查各个条件
  const priceCheck = checkPriceVolatility(input)
  const volumeCheck = checkVolumeAnomaly(input)
  const liquidityCheck = checkLiquidityGrowth(input)
  const walletCheck = checkWalletActivity(input)
  
  // 计算满足的条件数量
  const conditions = {
    priceVolatility: priceCheck.passed,
    volumeAnomaly: volumeCheck.passed,
    liquidityGrowth: liquidityCheck.passed,
    walletActivity: walletCheck.passed,
  }
  
  const score = Object.values(conditions).filter(Boolean).length
  
  // 是否合格（满足≥2个条件）
  const qualified = score >= 2
  
  return {
    qualified,
    score,
    conditions,
    details: {
      priceChange: priceCheck.value,
      volumeZScore: volumeCheck.zScore,
      liquidityGrowthPct: liquidityCheck.growthPct,
      walletPercentile: walletCheck.percentile,
    },
  }
}

/**
 * 计算所有资产的钱包活动百分位
 * 
 * @param assets - 所有资产的钱包净买入数据
 * @returns 每个资产的百分位映射
 */
export function calculateWalletPercentiles(
  assets: Array<{ symbol: string; newWalletNetBuy: number }>
): Record<string, number> {
  if (assets.length === 0) return {}
  
  // 按净买入排序
  const sorted = [...assets].sort((a, b) => a.newWalletNetBuy - b.newWalletNetBuy)
  
  // 计算每个资产的百分位
  const percentiles: Record<string, number> = {}
  
  sorted.forEach((asset, index) => {
    // 百分位 = (排名 / 总数) * 100
    percentiles[asset.symbol] = (index / (sorted.length - 1)) * 100
  })
  
  return percentiles
}
