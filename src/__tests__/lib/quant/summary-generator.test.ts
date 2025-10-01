/**
 * AI 摘要生成器测试
 */

import { describe, it, expect } from 'vitest'
import {
  makeAiSummary,
  makeSafeSummary,
  containsSubjectiveWords,
  sanitizeSummary,
} from '@/lib/quant/summary-generator'
import type { Asset, Signal } from '@prisma/client'

// Mock 数据
const mockAsset: Pick<Asset, 'name' | 'symbol'> = {
  name: 'Bitcoin',
  symbol: 'BTC',
}

const createMockSignal = (overrides?: Partial<Signal>): Signal => ({
  id: 'signal-123',
  assetId: 'asset-123',
  window: '1h',
  priceChangePct: new Prisma.Decimal(5.0),
  currentPrice: new Prisma.Decimal(65000),
  volZScore: new Prisma.Decimal(2.5),
  volumeUSD: new Prisma.Decimal(1000000),
  liqDeltaPct: new Prisma.Decimal(15.0),
  totalLiquidityUSD: new Prisma.Decimal(5000000),
  top5HoldPct: new Prisma.Decimal(35.5),
  holderCount: 50000,
  newWalletNetBuy: new Prisma.Decimal(250000),
  newWalletCount: 120,
  riskScore: 25,
  contractAgeDays: 180,
  sentiment: 'bullish',
  confidence: new Prisma.Decimal(0.8),
  aiSummary: null,
  alertLevel: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('AI 摘要生成 - 基础功能', () => {
  it('应该生成中英文摘要', () => {
    const signal = createMockSignal()
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary).toHaveProperty('cn')
    expect(summary).toHaveProperty('en')
    expect(typeof summary.cn).toBe('string')
    expect(typeof summary.en).toBe('string')
  })

  it('中文摘要应该 ≤120字', () => {
    const signal = createMockSignal()
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn.length).toBeLessThanOrEqual(120)
  })

  it('英文摘要应该 ≤15词', () => {
    const signal = createMockSignal()
    const summary = makeAiSummary(signal, mockAsset)
    
    const words = summary.en.split(/\s+/)
    expect(words.length).toBeLessThanOrEqual(15)
  })

  it('应该包含资产名称', () => {
    const signal = createMockSignal()
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('Bitcoin')
    expect(summary.en).toContain('BTC')
  })
})

describe('AI 摘要生成 - 价格变化', () => {
  it('应该正确描述上涨', () => {
    const signal = createMockSignal({ priceChangePct: new Prisma.Decimal(15.5) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('涨15.5%')
    expect(summary.en).toContain('+15.5%')
  })

  it('应该正确描述下跌', () => {
    const signal = createMockSignal({ priceChangePct: new Prisma.Decimal(-8.3) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('跌8.3%')
    expect(summary.en).toContain('-8.3%')
  })

  it('应该正确描述持平', () => {
    const signal = createMockSignal({ priceChangePct: new Prisma.Decimal(0) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('持平')
  })
})

describe('AI 摘要生成 - 成交量等级', () => {
  it('应该识别极高成交量（5σ+）', () => {
    const signal = createMockSignal({ volZScore: new Prisma.Decimal(5.5) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('极高')
    expect(summary.en).toContain('extreme')
  })

  it('应该识别异常成交量（3σ+）', () => {
    const signal = createMockSignal({ volZScore: new Prisma.Decimal(3.2) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('异常')
    expect(summary.en).toContain('surge')
  })

  it('应该识别正常成交量', () => {
    const signal = createMockSignal({ volZScore: new Prisma.Decimal(0.5) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('正常')
    expect(summary.en).toContain('normal')
  })

  it('应该识别低迷成交量', () => {
    const signal = createMockSignal({ volZScore: new Prisma.Decimal(-2.5) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('低迷')
    expect(summary.en).toContain('low')
  })
})

describe('AI 摘要生成 - 流动性变化', () => {
  it('应该识别大幅增加（≥50%）', () => {
    const signal = createMockSignal({ liqDeltaPct: new Prisma.Decimal(60) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('大幅增加')
  })

  it('应该识别显著增加（≥20%）', () => {
    const signal = createMockSignal({ liqDeltaPct: new Prisma.Decimal(25) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('显著增加')
  })

  it('应该识别基本稳定（<5%）', () => {
    const signal = createMockSignal({ liqDeltaPct: new Prisma.Decimal(2) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('基本稳定')
  })

  it('应该识别大幅减少', () => {
    const signal = createMockSignal({ liqDeltaPct: new Prisma.Decimal(-55) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('大幅减少')
  })
})

describe('AI 摘要生成 - 钱包活动', () => {
  it('应该格式化百万级金额', () => {
    const signal = createMockSignal({ newWalletNetBuy: new Prisma.Decimal(2500000) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toMatch(/\$2\.5M/)
  })

  it('应该格式化千级金额', () => {
    const signal = createMockSignal({ newWalletNetBuy: new Prisma.Decimal(50000) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toMatch(/\$50\.0K/)
  })

  it('应该区分买入和卖出', () => {
    const buySignal = createMockSignal({ newWalletNetBuy: new Prisma.Decimal(100000) })
    const sellSignal = createMockSignal({ newWalletNetBuy: new Prisma.Decimal(-100000) })
    
    const buySummary = makeAiSummary(buySignal, mockAsset)
    const sellSummary = makeAiSummary(sellSignal, mockAsset)
    
    expect(buySummary.cn).toContain('买入')
    expect(sellSummary.cn).toContain('卖出')
  })

  it('应该包含钱包数量', () => {
    const signal = createMockSignal({ 
      newWalletNetBuy: new Prisma.Decimal(100000),
      newWalletCount: 250,
    })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('250个新钱包')
  })
})

describe('AI 摘要生成 - 风险评分', () => {
  it('应该包含风险分数', () => {
    const signal = createMockSignal({ riskScore: 45 })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('风险分45/100')
  })

  it('低风险应该标注"整体风险可控"', () => {
    const signal = createMockSignal({ riskScore: 15 })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('整体风险可控')
    expect(summary.en).toContain('Low')
  })

  it('中等风险应该标注合理的风险点', () => {
    const signal = createMockSignal({ riskScore: 35 })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toMatch(/合约较新|流动性风险/)
    expect(summary.en).toContain('Medium')
  })

  it('高风险应该添加警告标签', () => {
    const signal = createMockSignal({ riskScore: 65 })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('【高风险】')
    expect(summary.en).toContain('High')
  })

  it('极高风险应该添加极高风险标签', () => {
    const signal = createMockSignal({ riskScore: 85 })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('【极高风险】')
    expect(summary.en).toContain('Critical')
  })
})

describe('AI 摘要生成 - 合约信息', () => {
  it('应该包含合约年龄', () => {
    const signal = createMockSignal({ contractAgeDays: 5 })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('合约5天')
  })

  it('应该包含持仓集中度', () => {
    const signal = createMockSignal({ top5HoldPct: new Prisma.Decimal(65.8) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('前5钱包65.8%')
  })
})

describe('主观词汇检测', () => {
  it('应该检测到主观词汇', () => {
    expect(containsSubjectiveWords('抄底机会')).toBe(true)
    expect(containsSubjectiveWords('立即梭哈')).toBe(true)
    expect(containsSubjectiveWords('强烈推荐买入')).toBe(true)
    expect(containsSubjectiveWords('财富密码')).toBe(true)
  })

  it('应该识别客观描述', () => {
    expect(containsSubjectiveWords('价格上涨15%')).toBe(false)
    expect(containsSubjectiveWords('成交量异常')).toBe(false)
    expect(containsSubjectiveWords('流动性增加')).toBe(false)
  })
})

describe('主观词汇清理', () => {
  it('应该替换主观词汇', () => {
    expect(sanitizeSummary('抄底机会')).toBe('低位机会')
    expect(sanitizeSummary('立即梭哈')).toBe('当前大量买入')
    expect(sanitizeSummary('强烈推荐买入')).toBe('值得关注净流入')
    expect(sanitizeSummary('财富密码')).toBe('机会')
  })

  it('应该保留客观描述', () => {
    const original = '价格上涨15%，成交量异常'
    expect(sanitizeSummary(original)).toBe(original)
  })

  it('应该处理多个主观词汇', () => {
    const input = '抄底机会，立即梭哈，稳赚不赔'
    const output = sanitizeSummary(input)
    
    expect(output).not.toContain('抄底')
    expect(output).not.toContain('梭哈')
    expect(output).not.toContain('稳赚')
  })
})

describe('安全摘要生成', () => {
  it('应该自动清理主观词汇', () => {
    const signal = createMockSignal()
    const summary = makeSafeSummary(signal, mockAsset)
    
    expect(containsSubjectiveWords(summary.cn)).toBe(false)
  })

  it('应该保持摘要质量', () => {
    const signal = createMockSignal()
    const safeSummary = makeSafeSummary(signal, mockAsset)
    
    expect(safeSummary.cn.length).toBeGreaterThan(50)
    expect(safeSummary.cn.length).toBeLessThanOrEqual(120)
  })
})

describe('边界测试', () => {
  it('应该处理极端价格变化', () => {
    const signal = createMockSignal({ priceChangePct: new Prisma.Decimal(999.9) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('涨999.9%')
  })

  it('应该处理极端Z-Score', () => {
    const signal = createMockSignal({ volZScore: new Prisma.Decimal(10) })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('极高')
  })

  it('应该处理零值', () => {
    const signal = createMockSignal({
      priceChangePct: new Prisma.Decimal(0),
      newWalletNetBuy: new Prisma.Decimal(0),
    })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('持平')
    expect(summary.cn).toContain('$0')
  })

  it('应该处理负值', () => {
    const signal = createMockSignal({
      priceChangePct: new Prisma.Decimal(-50),
      liqDeltaPct: new Prisma.Decimal(-80),
      newWalletNetBuy: new Prisma.Decimal(-500000),
    })
    const summary = makeAiSummary(signal, mockAsset)
    
    expect(summary.cn).toContain('跌50.0%')
    expect(summary.cn).toContain('大幅减少')
    expect(summary.cn).toContain('卖出')
  })
})

describe('随机测试', () => {
  it('应该处理随机输入', () => {
    for (let i = 0; i < 50; i++) {
      const signal = createMockSignal({
        priceChangePct: new Prisma.Decimal((Math.random() - 0.5) * 200),
        volZScore: new Prisma.Decimal((Math.random() - 0.5) * 10),
        liqDeltaPct: new Prisma.Decimal((Math.random() - 0.5) * 100),
        newWalletNetBuy: new Prisma.Decimal((Math.random() - 0.5) * 10_000_000),
        riskScore: Math.floor(Math.random() * 101),
        contractAgeDays: Math.floor(Math.random() * 1000),
        top5HoldPct: new Prisma.Decimal(Math.random() * 100),
      })
      
      const summary = makeAiSummary(signal, mockAsset)
      
      // 验证输出格式
      expect(summary.cn.length).toBeLessThanOrEqual(120)
      expect(summary.en.split(/\s+/).length).toBeLessThanOrEqual(15)
      
      // 验证包含关键信息
      expect(summary.cn).toContain('Bitcoin')
      expect(summary.cn).toContain('风险分')
      expect(summary.en).toContain('BTC')
      expect(summary.en).toContain('Risk')
    }
  })
})

// Helper: Mock Prisma.Decimal for tests
const Prisma = {
  Decimal: class {
    constructor(private value: number) {}
    toFixed(decimals: number) {
      return this.value.toFixed(decimals)
    }
    toString() {
      return this.value.toString()
    }
    toNumber() {
      return this.value
    }
  }
}
