/**
 * 候选筛选测试
 */

import { describe, it, expect } from 'vitest'
import {
  checkPriceVolatility,
  checkVolumeAnomaly,
  checkLiquidityGrowth,
  checkWalletActivity,
  filterCandidate,
  calculateWalletPercentiles,
} from '@/lib/quant/candidate-filter'
import type { CandidateInput } from '@/lib/quant/types'

describe('候选筛选 - 价格波动', () => {
  it('应该识别5分钟大幅波动', () => {
    const input: Partial<CandidateInput> = {
      priceChange5m: 18,
      priceChange15m: 5,
    }
    const result = checkPriceVolatility(input as CandidateInput)
    expect(result.passed).toBe(true)
    expect(result.value).toBe(18)
  })

  it('应该识别15分钟大幅波动', () => {
    const input: Partial<CandidateInput> = {
      priceChange5m: 5,
      priceChange15m: 20,
    }
    const result = checkPriceVolatility(input as CandidateInput)
    expect(result.passed).toBe(true)
    expect(result.value).toBe(20)
  })

  it('应该处理负数（绝对值）', () => {
    const input: Partial<CandidateInput> = {
      priceChange5m: -16,
      priceChange15m: 5,
    }
    const result = checkPriceVolatility(input as CandidateInput)
    expect(result.passed).toBe(true)
    expect(result.value).toBe(16)
  })

  it('边界测试 - 恰好15%', () => {
    const input: Partial<CandidateInput> = {
      priceChange5m: 15,
      priceChange15m: 0,
    }
    const result = checkPriceVolatility(input as CandidateInput)
    expect(result.passed).toBe(true)
    expect(result.value).toBe(15)
  })

  it('边界测试 - 14.9%不通过', () => {
    const input: Partial<CandidateInput> = {
      priceChange5m: 14.9,
      priceChange15m: 0,
    }
    const result = checkPriceVolatility(input as CandidateInput)
    expect(result.passed).toBe(false)
  })

  it('应该处理缺失数据', () => {
    const input: Partial<CandidateInput> = {}
    const result = checkPriceVolatility(input as CandidateInput)
    expect(result.passed).toBe(false)
    expect(result.value).toBe(null)
  })
})

describe('候选筛选 - 成交量异常', () => {
  it('应该识别3σ以上的成交量', () => {
    const input: Partial<CandidateInput> = {
      volume1h: 1000,
      volume24hMean: 400,
      volume24hStdDev: 100,
    }
    const result = checkVolumeAnomaly(input as CandidateInput)
    // Z-Score = (1000 - 400) / 100 = 6
    expect(result.passed).toBe(true)
    expect(result.zScore).toBe(6)
  })

  it('边界测试 - 恰好3σ', () => {
    const input: Partial<CandidateInput> = {
      volume1h: 700,
      volume24hMean: 400,
      volume24hStdDev: 100,
    }
    const result = checkVolumeAnomaly(input as CandidateInput)
    // Z-Score = (700 - 400) / 100 = 3
    expect(result.passed).toBe(true)
    expect(result.zScore).toBe(3)
  })

  it('边界测试 - 2.9σ不通过', () => {
    const input: Partial<CandidateInput> = {
      volume1h: 690,
      volume24hMean: 400,
      volume24hStdDev: 100,
    }
    const result = checkVolumeAnomaly(input as CandidateInput)
    // Z-Score = (690 - 400) / 100 = 2.9
    expect(result.passed).toBe(false)
    expect(result.zScore).toBe(2.9)
  })

  it('应该处理标准差为0的情况', () => {
    const input: Partial<CandidateInput> = {
      volume1h: 1000,
      volume24hMean: 400,
      volume24hStdDev: 0,
    }
    const result = checkVolumeAnomaly(input as CandidateInput)
    expect(result.passed).toBe(false)
    expect(result.zScore).toBe(0)
  })
})

describe('候选筛选 - 流动性增长', () => {
  it('应该识别20%以上的增长', () => {
    const input: Partial<CandidateInput> = {
      liquidityNow: 1200,
      liquidity1hAgo: 1000,
    }
    const result = checkLiquidityGrowth(input as CandidateInput)
    // 增长 = (1200 - 1000) / 1000 * 100 = 20%
    expect(result.passed).toBe(true)
    expect(result.growthPct).toBe(20)
  })

  it('边界测试 - 恰好20%', () => {
    const input: Partial<CandidateInput> = {
      liquidityNow: 600,
      liquidity1hAgo: 500,
    }
    const result = checkLiquidityGrowth(input as CandidateInput)
    expect(result.passed).toBe(true)
    expect(result.growthPct).toBe(20)
  })

  it('边界测试 - 19.9%不通过', () => {
    const input: Partial<CandidateInput> = {
      liquidityNow: 599.5,
      liquidity1hAgo: 500,
    }
    const result = checkLiquidityGrowth(input as CandidateInput)
    expect(result.passed).toBe(false)
    expect(result.growthPct).toBe(19.9)
  })

  it('应该处理1小时前流动性为0', () => {
    const input: Partial<CandidateInput> = {
      liquidityNow: 1000,
      liquidity1hAgo: 0,
    }
    const result = checkLiquidityGrowth(input as CandidateInput)
    expect(result.passed).toBe(false)
    expect(result.growthPct).toBe(0)
  })
})

describe('候选筛选 - 钱包活动', () => {
  it('应该识别前10%的钱包活动', () => {
    const input: Partial<CandidateInput> = {
      newWalletNetBuyPercentile: 95,
    }
    const result = checkWalletActivity(input as CandidateInput)
    expect(result.passed).toBe(true)
    expect(result.percentile).toBe(95)
  })

  it('边界测试 - 恰好90%', () => {
    const input: Partial<CandidateInput> = {
      newWalletNetBuyPercentile: 90,
    }
    const result = checkWalletActivity(input as CandidateInput)
    expect(result.passed).toBe(true)
  })

  it('边界测试 - 89.9%不通过', () => {
    const input: Partial<CandidateInput> = {
      newWalletNetBuyPercentile: 89.9,
    }
    const result = checkWalletActivity(input as CandidateInput)
    expect(result.passed).toBe(false)
  })

  it('应该处理缺失百分位', () => {
    const input: Partial<CandidateInput> = {}
    const result = checkWalletActivity(input as CandidateInput)
    expect(result.passed).toBe(false)
    expect(result.percentile).toBe(null)
  })
})

describe('候选筛选 - 综合筛选', () => {
  const createMockInput = (): CandidateInput => ({
    symbol: 'TEST',
    assetId: 'test-123',
    currentPrice: 100,
    priceChange5m: 10,
    priceChange15m: 5,
    volume1h: 1000,
    volume24hMean: 500,
    volume24hStdDev: 100,
    liquidityNow: 1000,
    liquidity1hAgo: 500,
    newWalletNetBuy: 50000,
    newWalletNetBuyPercentile: 85,
  })

  it('满足≥2个条件应该合格', () => {
    const input = createMockInput()
    input.priceChange5m = 20  // ✓ 条件1
    input.volume1h = 800       // Z = (800-500)/100 = 3.0 ✓ 条件2
    
    const result = filterCandidate(input)
    expect(result.qualified).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(2)
  })

  it('只满足1个条件应该不合格', () => {
    const input = createMockInput()
    input.priceChange5m = 5    // ✗
    input.volume1h = 600        // Z = (600-500)/100 = 1.0 ✗
    input.liquidityNow = 550    // 增长 = (550-500)/500 = 10% ✗
    input.newWalletNetBuyPercentile = 95 // ✓ 条件4（仅1个）
    
    const result = filterCandidate(input)
    expect(result.qualified).toBe(false)
    expect(result.score).toBe(1)
  })

  it('满足所有4个条件', () => {
    const input = createMockInput()
    input.priceChange5m = 20           // ✓
    input.volume1h = 800               // ✓
    input.liquidityNow = 600           // 增长20% ✓
    input.newWalletNetBuyPercentile = 95 // ✓
    
    const result = filterCandidate(input)
    expect(result.qualified).toBe(true)
    expect(result.score).toBe(4)
    expect(result.conditions.priceVolatility).toBe(true)
    expect(result.conditions.volumeAnomaly).toBe(true)
    expect(result.conditions.liquidityGrowth).toBe(true)
    expect(result.conditions.walletActivity).toBe(true)
  })
})

describe('百分位计算', () => {
  it('应该正确计算百分位', () => {
    const assets = [
      { symbol: 'A', newWalletNetBuy: 100 },
      { symbol: 'B', newWalletNetBuy: 200 },
      { symbol: 'C', newWalletNetBuy: 300 },
      { symbol: 'D', newWalletNetBuy: 400 },
      { symbol: 'E', newWalletNetBuy: 500 },
    ]
    
    const percentiles = calculateWalletPercentiles(assets)
    
    expect(percentiles['A']).toBe(0)    // 最低
    expect(percentiles['E']).toBe(100)  // 最高
    expect(percentiles['C']).toBe(50)   // 中位数
  })

  it('应该处理空数组', () => {
    const percentiles = calculateWalletPercentiles([])
    expect(percentiles).toEqual({})
  })

  it('应该处理单个资产', () => {
    const assets = [{ symbol: 'A', newWalletNetBuy: 100 }]
    const percentiles = calculateWalletPercentiles(assets)
    expect(percentiles['A']).toBe(0)
  })
})

describe('随机测试', () => {
  it('应该处理随机输入', () => {
    for (let i = 0; i < 100; i++) {
      const input: CandidateInput = {
        symbol: `TEST${i}`,
        assetId: `test-${i}`,
        currentPrice: Math.random() * 1000,
        priceChange5m: (Math.random() - 0.5) * 40,
        priceChange15m: (Math.random() - 0.5) * 40,
        volume1h: Math.random() * 10000,
        volume24hMean: Math.random() * 5000,
        volume24hStdDev: Math.random() * 1000,
        liquidityNow: Math.random() * 100000,
        liquidity1hAgo: Math.random() * 100000,
        newWalletNetBuy: Math.random() * 100000,
        newWalletNetBuyPercentile: Math.random() * 100,
      }
      
      const result = filterCandidate(input)
      
      // 验证输出格式
      expect(result).toHaveProperty('qualified')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('conditions')
      expect(result).toHaveProperty('details')
      
      // 验证分数范围
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(4)
      
      // 验证合格逻辑
      if (result.score >= 2) {
        expect(result.qualified).toBe(true)
      } else {
        expect(result.qualified).toBe(false)
      }
    }
  })
})
