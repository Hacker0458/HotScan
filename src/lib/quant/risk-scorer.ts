/**
 * 风险评分纯函数
 * 
 * 风险评分（0-100，越高越危险）：
 * +20 合约 ≤7 天
 * +25 前5钱包 ≥60%
 * +20 无锁仓/可撤池
 * +15 社媒热度突刺但链上净流入为负
 * +20 Dev地址参与交易
 */

import type { RiskInput, RiskResult } from './types'

/**
 * 检查年轻合约风险
 * +20 if 合约年龄 ≤7天
 */
export function scoreYoungContract(contractAgeDays: number): {
  score: number
  flagged: boolean
} {
  const flagged = contractAgeDays <= 7
  return {
    score: flagged ? 20 : 0,
    flagged,
  }
}

/**
 * 检查持仓集中度风险
 * +25 if 前5钱包持仓 ≥60%
 */
export function scoreConcentratedHolding(top5HoldingPct: number): {
  score: number
  flagged: boolean
} {
  const flagged = top5HoldingPct >= 60
  return {
    score: flagged ? 25 : 0,
    flagged,
  }
}

/**
 * 检查跑路风险（无锁仓/可撤池）
 * +20 if 无锁仓 OR 可撤池
 */
export function scoreRugPullRisk(input: {
  hasLiquidity: boolean
  isLiquidityLocked: boolean
  canRemoveLiquidity: boolean
}): {
  score: number
  flagged: boolean
} {
  // 如果没有流动性，风险最高
  if (!input.hasLiquidity) {
    return { score: 20, flagged: true }
  }
  
  // 如果流动性未锁仓或可撤池，存在跑路风险
  const flagged = !input.isLiquidityLocked || input.canRemoveLiquidity
  
  return {
    score: flagged ? 20 : 0,
    flagged,
  }
}

/**
 * 检查虚假拉盘风险
 * +15 if 社媒热度突刺 AND 链上净流入为负
 */
export function scoreFakePump(input: {
  socialMentionSpike: boolean
  netInflowNegative: boolean
}): {
  score: number
  flagged: boolean
} {
  const flagged = input.socialMentionSpike && input.netInflowNegative
  return {
    score: flagged ? 15 : 0,
    flagged,
  }
}

/**
 * 检查内部交易风险
 * +20 if Dev地址参与交易
 */
export function scoreInsiderTrading(devAddressTrading: boolean): {
  score: number
  flagged: boolean
} {
  return {
    score: devAddressTrading ? 20 : 0,
    flagged: devAddressTrading,
  }
}

/**
 * 综合风险评分
 * 
 * @param input - 风险评分输入数据
 * @returns 风险评分结果（0-100）
 */
export function scoreRisk(input: RiskInput): RiskResult {
  // 计算各项风险分数
  const youngContract = scoreYoungContract(input.contractAgeDays)
  const concentratedHolding = scoreConcentratedHolding(input.top5HoldingPct)
  const rugPullRisk = scoreRugPullRisk({
    hasLiquidity: input.hasLiquidity,
    isLiquidityLocked: input.isLiquidityLocked,
    canRemoveLiquidity: input.canRemoveLiquidity,
  })
  const fakePump = scoreFakePump({
    socialMentionSpike: input.socialMentionSpike,
    netInflowNegative: input.netInflowNegative,
  })
  const insiderTrading = scoreInsiderTrading(input.devAddressTrading)
  
  // 计算总分
  const totalScore = 
    youngContract.score +
    concentratedHolding.score +
    rugPullRisk.score +
    fakePump.score +
    insiderTrading.score
  
  // 确保总分在 0-100 范围内
  const clampedScore = Math.min(100, Math.max(0, totalScore))
  
  // 确定风险等级
  const riskLevel = getRiskLevel(clampedScore)
  
  // 收集风险标志
  const flags: string[] = []
  if (youngContract.flagged) flags.push('年轻合约')
  if (concentratedHolding.flagged) flags.push('持仓集中')
  if (rugPullRisk.flagged) flags.push('跑路风险')
  if (fakePump.flagged) flags.push('虚假拉盘')
  if (insiderTrading.flagged) flags.push('内部交易')
  
  return {
    totalScore: clampedScore,
    riskLevel,
    breakdown: {
      youngContract: youngContract.score,
      concentratedHolding: concentratedHolding.score,
      rugPullRisk: rugPullRisk.score,
      fakePump: fakePump.score,
      insiderTrading: insiderTrading.score,
    },
    flags,
  }
}

/**
 * 根据总分确定风险等级
 * 
 * @param score - 风险总分 (0-100)
 * @returns 风险等级
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical'  // 75-100: 极高风险
  if (score >= 50) return 'high'      // 50-74: 高风险
  if (score >= 25) return 'medium'    // 25-49: 中等风险
  return 'low'                         // 0-24: 低风险
}

/**
 * 生成综合投资建议
 * 
 * @param candidateQualified - 是否通过候选筛选
 * @param riskScore - 风险评分 (0-100)
 * @returns 投资建议
 */
export function getRecommendation(
  candidateQualified: boolean,
  riskScore: number
): 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'danger' {
  // 如果未通过候选筛选，不推荐
  if (!candidateQualified) {
    return 'avoid'
  }
  
  // 根据风险等级给出建议
  if (riskScore >= 75) return 'danger'      // 极高风险，危险
  if (riskScore >= 50) return 'avoid'       // 高风险，避免
  if (riskScore >= 25) return 'hold'        // 中等风险，观望
  if (riskScore >= 15) return 'buy'         // 低风险，可买入
  return 'strong_buy'                        // 极低风险，强烈推荐
}
