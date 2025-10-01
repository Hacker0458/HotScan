/**
 * 风险评分测试
 */

import { describe, it, expect } from 'vitest'
import {
  scoreYoungContract,
  scoreConcentratedHolding,
  scoreRugPullRisk,
  scoreFakePump,
  scoreInsiderTrading,
  scoreRisk,
  getRiskLevel,
  getRecommendation,
} from '@/lib/quant/risk-scorer'
import type { RiskInput } from '@/lib/quant/types'

describe('风险评分 - 年轻合约', () => {
  it('≤7天应该标记风险', () => {
    expect(scoreYoungContract(7).score).toBe(20)
    expect(scoreYoungContract(7).flagged).toBe(true)
  })

  it('>7天应该无风险', () => {
    expect(scoreYoungContract(8).score).toBe(0)
    expect(scoreYoungContract(8).flagged).toBe(false)
  })

  it('边界测试', () => {
    expect(scoreYoungContract(0).score).toBe(20)
    expect(scoreYoungContract(1).score).toBe(20)
    expect(scoreYoungContract(7).score).toBe(20)
    expect(scoreYoungContract(7.1).score).toBe(0)
  })
})

describe('风险评分 - 持仓集中度', () => {
  it('≥60%应该标记风险', () => {
    expect(scoreConcentratedHolding(60).score).toBe(25)
    expect(scoreConcentratedHolding(60).flagged).toBe(true)
  })

  it('<60%应该无风险', () => {
    expect(scoreConcentratedHolding(59.9).score).toBe(0)
    expect(scoreConcentratedHolding(59.9).flagged).toBe(false)
  })

  it('边界测试', () => {
    expect(scoreConcentratedHolding(100).score).toBe(25)
    expect(scoreConcentratedHolding(60).score).toBe(25)
    expect(scoreConcentratedHolding(59.9).score).toBe(0)
    expect(scoreConcentratedHolding(0).score).toBe(0)
  })
})

describe('风险评分 - 跑路风险', () => {
  it('无流动性应该标记风险', () => {
    const input = {
      hasLiquidity: false,
      isLiquidityLocked: true,
      canRemoveLiquidity: false,
    }
    const result = scoreRugPullRisk(input)
    expect(result.score).toBe(20)
    expect(result.flagged).toBe(true)
  })

  it('流动性未锁仓应该标记风险', () => {
    const input = {
      hasLiquidity: true,
      isLiquidityLocked: false,
      canRemoveLiquidity: false,
    }
    const result = scoreRugPullRisk(input)
    expect(result.score).toBe(20)
    expect(result.flagged).toBe(true)
  })

  it('可撤池应该标记风险', () => {
    const input = {
      hasLiquidity: true,
      isLiquidityLocked: true,
      canRemoveLiquidity: true,
    }
    const result = scoreRugPullRisk(input)
    expect(result.score).toBe(20)
    expect(result.flagged).toBe(true)
  })

  it('流动性锁仓且不可撤池应该无风险', () => {
    const input = {
      hasLiquidity: true,
      isLiquidityLocked: true,
      canRemoveLiquidity: false,
    }
    const result = scoreRugPullRisk(input)
    expect(result.score).toBe(0)
    expect(result.flagged).toBe(false)
  })
})

describe('风险评分 - 虚假拉盘', () => {
  it('社媒突刺且净流入为负应该标记', () => {
    const input = {
      socialMentionSpike: true,
      netInflowNegative: true,
    }
    const result = scoreFakePump(input)
    expect(result.score).toBe(15)
    expect(result.flagged).toBe(true)
  })

  it('只有社媒突刺不应该标记', () => {
    const input = {
      socialMentionSpike: true,
      netInflowNegative: false,
    }
    const result = scoreFakePump(input)
    expect(result.score).toBe(0)
    expect(result.flagged).toBe(false)
  })

  it('只有净流入为负不应该标记', () => {
    const input = {
      socialMentionSpike: false,
      netInflowNegative: true,
    }
    const result = scoreFakePump(input)
    expect(result.score).toBe(0)
    expect(result.flagged).toBe(false)
  })
})

describe('风险评分 - 内部交易', () => {
  it('Dev地址交易应该标记', () => {
    const result = scoreInsiderTrading(true)
    expect(result.score).toBe(20)
    expect(result.flagged).toBe(true)
  })

  it('无Dev地址交易应该无风险', () => {
    const result = scoreInsiderTrading(false)
    expect(result.score).toBe(0)
    expect(result.flagged).toBe(false)
  })
})

describe('风险评分 - 综合评分', () => {
  const createMockInput = (): RiskInput => ({
    symbol: 'TEST',
    contractAgeDays: 30,
    top5HoldingPct: 30,
    hasLiquidity: true,
    isLiquidityLocked: true,
    canRemoveLiquidity: false,
    socialMentionSpike: false,
    netInflowNegative: false,
    devAddressTrading: false,
  })

  it('无风险应该得0分', () => {
    const input = createMockInput()
    const result = scoreRisk(input)
    
    expect(result.totalScore).toBe(0)
    expect(result.riskLevel).toBe('low')
    expect(result.flags).toHaveLength(0)
  })

  it('所有风险应该得100分', () => {
    const input: RiskInput = {
      symbol: 'SCAM',
      contractAgeDays: 1,          // +20
      top5HoldingPct: 80,          // +25
      hasLiquidity: false,         // +20
      isLiquidityLocked: false,
      canRemoveLiquidity: true,
      socialMentionSpike: true,    // +15
      netInflowNegative: true,
      devAddressTrading: true,     // +20
    }
    const result = scoreRisk(input)
    
    expect(result.totalScore).toBe(100)
    expect(result.riskLevel).toBe('critical')
    expect(result.flags).toHaveLength(5)
  })

  it('边界测试 - 低风险(24分)', () => {
    const input = createMockInput()
    input.contractAgeDays = 5  // +20
    const result = scoreRisk(input)
    
    expect(result.totalScore).toBe(20)
    expect(result.riskLevel).toBe('low')
  })

  it('边界测试 - 中等风险(25分)', () => {
    const input = createMockInput()
    input.contractAgeDays = 5     // +20
    input.contractAgeDays = 3
    input.isLiquidityLocked = false // +20
    const result = scoreRisk(input)
    
    expect(result.totalScore).toBe(40)
    expect(result.riskLevel).toBe('medium')
  })

  it('边界测试 - 高风险(50分)', () => {
    const input = createMockInput()
    input.contractAgeDays = 3        // +20
    input.isLiquidityLocked = false  // +20
    input.devAddressTrading = true   // +20
    const result = scoreRisk(input)
    
    expect(result.totalScore).toBe(60)
    expect(result.riskLevel).toBe('high')
  })

  it('边界测试 - 极高风险(75分)', () => {
    const input: RiskInput = {
      symbol: 'RISKY',
      contractAgeDays: 1,          // +20
      top5HoldingPct: 70,          // +25
      hasLiquidity: false,         // +20
      isLiquidityLocked: false,
      canRemoveLiquidity: true,
      socialMentionSpike: true,    // +15
      netInflowNegative: true,
      devAddressTrading: false,
    }
    const result = scoreRisk(input)
    
    expect(result.totalScore).toBe(80)
    expect(result.riskLevel).toBe('critical')
  })
})

describe('风险等级', () => {
  it('应该正确分类风险等级', () => {
    expect(getRiskLevel(0)).toBe('low')
    expect(getRiskLevel(24)).toBe('low')
    expect(getRiskLevel(25)).toBe('medium')
    expect(getRiskLevel(49)).toBe('medium')
    expect(getRiskLevel(50)).toBe('high')
    expect(getRiskLevel(74)).toBe('high')
    expect(getRiskLevel(75)).toBe('critical')
    expect(getRiskLevel(100)).toBe('critical')
  })
})

describe('投资建议', () => {
  it('未通过筛选应该避免', () => {
    expect(getRecommendation(false, 0)).toBe('avoid')
    expect(getRecommendation(false, 50)).toBe('avoid')
  })

  it('极高风险应该标记危险', () => {
    expect(getRecommendation(true, 75)).toBe('danger')
    expect(getRecommendation(true, 100)).toBe('danger')
  })

  it('高风险应该避免', () => {
    expect(getRecommendation(true, 50)).toBe('avoid')
    expect(getRecommendation(true, 74)).toBe('avoid')
  })

  it('中等风险应该观望', () => {
    expect(getRecommendation(true, 25)).toBe('hold')
    expect(getRecommendation(true, 49)).toBe('hold')
  })

  it('低风险应该买入', () => {
    expect(getRecommendation(true, 15)).toBe('buy')
    expect(getRecommendation(true, 24)).toBe('buy')
  })

  it('极低风险应该强烈推荐', () => {
    expect(getRecommendation(true, 0)).toBe('strong_buy')
    expect(getRecommendation(true, 14)).toBe('strong_buy')
  })
})

describe('随机测试', () => {
  it('应该处理随机输入', () => {
    for (let i = 0; i < 100; i++) {
      const input: RiskInput = {
        symbol: `TEST${i}`,
        contractAgeDays: Math.floor(Math.random() * 365),
        top5HoldingPct: Math.random() * 100,
        hasLiquidity: Math.random() > 0.3,
        isLiquidityLocked: Math.random() > 0.5,
        canRemoveLiquidity: Math.random() > 0.7,
        socialMentionSpike: Math.random() > 0.8,
        netInflowNegative: Math.random() > 0.6,
        devAddressTrading: Math.random() > 0.9,
      }
      
      const result = scoreRisk(input)
      
      // 验证输出格式
      expect(result).toHaveProperty('totalScore')
      expect(result).toHaveProperty('riskLevel')
      expect(result).toHaveProperty('breakdown')
      expect(result).toHaveProperty('flags')
      
      // 验证分数范围
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.totalScore).toBeLessThanOrEqual(100)
      
      // 验证风险等级一致性
      if (result.totalScore >= 75) {
        expect(result.riskLevel).toBe('critical')
      } else if (result.totalScore >= 50) {
        expect(result.riskLevel).toBe('high')
      } else if (result.totalScore >= 25) {
        expect(result.riskLevel).toBe('medium')
      } else {
        expect(result.riskLevel).toBe('low')
      }
      
      // 验证分数组成
      const sumBreakdown = Object.values(result.breakdown).reduce((a, b) => a + b, 0)
      expect(sumBreakdown).toBe(result.totalScore)
    }
  })
})
