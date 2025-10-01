/**
 * 综合信号分析
 * 
 * 将候选筛选和风险评分整合，生成完整的交易信号
 */

import type { CandidateInput, RiskInput, SignalAnalysis } from './types'
import { filterCandidate } from './candidate-filter'
import { scoreRisk, getRecommendation } from './risk-scorer'

/**
 * 分析资产并生成交易信号
 * 
 * @param candidateInput - 候选筛选输入
 * @param riskInput - 风险评分输入
 * @param window - 时间窗口
 * @returns 完整的信号分析结果
 */
export function analyzeSignal(
  candidateInput: CandidateInput,
  riskInput: RiskInput,
  window: string = '1h'
): SignalAnalysis {
  // 候选筛选
  const candidate = filterCandidate(candidateInput)
  
  // 风险评分
  const risk = scoreRisk(riskInput)
  
  // 生成投资建议
  const recommendation = getRecommendation(candidate.qualified, risk.totalScore)
  
  return {
    symbol: candidateInput.symbol,
    assetId: candidateInput.assetId,
    window,
    candidate,
    risk,
    recommendation,
    analyzedAt: new Date(),
  }
}

/**
 * 批量分析多个资产
 * 
 * @param inputs - 输入数据数组
 * @returns 信号分析结果数组
 */
export function analyzeBatch(
  inputs: Array<{
    candidate: CandidateInput
    risk: RiskInput
    window?: string
  }>
): SignalAnalysis[] {
  return inputs.map((input) =>
    analyzeSignal(input.candidate, input.risk, input.window)
  )
}

/**
 * 过滤出合格的信号（通过候选筛选且风险可接受）
 * 
 * @param signals - 信号分析结果数组
 * @param maxRiskScore - 最大可接受的风险分数
 * @returns 过滤后的信号数组
 */
export function filterQualifiedSignals(
  signals: SignalAnalysis[],
  maxRiskScore: number = 50
): SignalAnalysis[] {
  return signals.filter(
    (signal) =>
      signal.candidate.qualified &&
      signal.risk.totalScore <= maxRiskScore
  )
}

/**
 * 按推荐度排序信号
 * 
 * @param signals - 信号分析结果数组
 * @returns 排序后的信号数组（最佳信号在前）
 */
export function sortSignalsByRecommendation(
  signals: SignalAnalysis[]
): SignalAnalysis[] {
  const recommendationOrder = {
    strong_buy: 0,
    buy: 1,
    hold: 2,
    avoid: 3,
    danger: 4,
  }
  
  return [...signals].sort((a, b) => {
    const orderA = recommendationOrder[a.recommendation]
    const orderB = recommendationOrder[b.recommendation]
    
    // 如果推荐度相同，按风险分数排序（低风险优先）
    if (orderA === orderB) {
      return a.risk.totalScore - b.risk.totalScore
    }
    
    return orderA - orderB
  })
}
