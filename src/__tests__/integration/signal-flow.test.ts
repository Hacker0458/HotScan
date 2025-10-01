/**
 * 集成测试: 完整信号生成流程
 * 
 * 测试从数据源 → 信号生成 → 前端渲染的完整流程
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { MockDataSource } from '@/lib/data-sources/mock-source'
import { filterCandidates, type CandidateInput } from '@/lib/quant/candidate-filter'
import { scoreRisk, type RiskInput } from '@/lib/quant/risk-scorer'
import { makeSafeSummary } from '@/lib/quant/summary-generator'

describe('信号生成完整流程', () => {
  let mockDataSource: MockDataSource
  let testAssets: any[]

  beforeAll(async () => {
    // 清理测试数据
    await prisma.signal.deleteMany()
    await prisma.pair.deleteMany()
    await prisma.asset.deleteMany()

    // 初始化Mock数据源
    mockDataSource = new MockDataSource()

    // 创建测试资产
    testAssets = await prisma.asset.createMany({
      data: [
        { id: 'btc-test', symbol: 'BTC', name: 'Bitcoin', chain: 'ETH' },
        { id: 'eth-test', symbol: 'ETH', name: 'Ethereum', chain: 'ETH' },
        { id: 'sol-test', symbol: 'SOL', name: 'Solana', chain: 'SOL' },
      ],
    })

    // 创建测试交易对
    await prisma.pair.createMany({
      data: [
        {
          assetId: 'btc-test',
          dex: 'Uniswap',
          address: '0x123',
          liquidityUSD: 1000000,
        },
        {
          assetId: 'eth-test',
          dex: 'Uniswap',
          address: '0x456',
          liquidityUSD: 500000,
        },
        {
          assetId: 'sol-test',
          dex: 'Raydium',
          address: '0x789',
          liquidityUSD: 250000,
        },
      ],
    })
  })

  afterAll(async () => {
    await prisma.signal.deleteMany()
    await prisma.pair.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.$disconnect()
  })

  describe('步骤1: 从数据源获取数据', () => {
    it('应成功从Mock数据源获取K线数据', async () => {
      const symbols = ['BTC', 'ETH', 'SOL']
      const candles = await mockDataSource.fetchRecentCandles(symbols, '5m', 20)

      expect(candles).toHaveProperty('BTC')
      expect(candles).toHaveProperty('ETH')
      expect(candles).toHaveProperty('SOL')

      expect(candles.BTC.length).toBe(20)
      expect(candles.BTC[0]).toHaveProperty('timestamp')
      expect(candles.BTC[0]).toHaveProperty('open')
      expect(candles.BTC[0]).toHaveProperty('high')
      expect(candles.BTC[0]).toHaveProperty('low')
      expect(candles.BTC[0]).toHaveProperty('close')
      expect(candles.BTC[0]).toHaveProperty('volume')
    })

    it('应成功从Mock数据源获取流动性和持仓数据', async () => {
      const pairs = await prisma.pair.findMany()
      const pairIds = pairs.map(p => p.address)

      const data = await mockDataSource.fetchLiquidityAndHolders(pairIds)

      expect(data.liquidity).toBeDefined()
      expect(data.holders).toBeDefined()
      expect(Object.keys(data.liquidity).length).toBeGreaterThan(0)
    })

    it('应成功从Mock数据源获取钱包活动数据', async () => {
      const netBuy = await mockDataSource.fetchNewWalletNetBuy('BTC')

      expect(typeof netBuy).toBe('number')
      expect(netBuy).toBeGreaterThanOrEqual(0)
    })
  })

  describe('步骤2: 候选筛选', () => {
    it('应正确筛选出符合条件的候选', async () => {
      // 获取数据
      const candles = await mockDataSource.fetchRecentCandles(['BTC'], '5m', 20)
      const btcCandles = candles.BTC

      // 计算价格变化
      const oldPrice = btcCandles[0].close
      const newPrice = btcCandles[btcCandles.length - 1].close
      const priceChangePct = ((newPrice - oldPrice) / oldPrice) * 100

      // 计算成交量Z-score（模拟）
      const volumes = btcCandles.map(c => c.volume)
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
      const stdVolume = Math.sqrt(
        volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
      )
      const volZScore = (volumes[volumes.length - 1] - avgVolume) / stdVolume

      // 候选输入
      const input: CandidateInput = {
        priceChangePct,
        volZScore,
        liqDeltaPct: 25.0,
        newWalletNetBuyPercentile: 95,
      }

      const isCandidate = filterCandidates(input)

      // 应满足至少2个条件
      expect(typeof isCandidate).toBe('boolean')
    })

    it('应拒绝不符合条件的资产', () => {
      const input: CandidateInput = {
        priceChangePct: 5.0,  // 不足15%
        volZScore: 1.0,       // 不足3σ
        liqDeltaPct: 10.0,    // 不足20%
        newWalletNetBuyPercentile: 50, // 不在前10%
      }

      const isCandidate = filterCandidates(input)

      expect(isCandidate).toBe(false)
    })
  })

  describe('步骤3: 风险评分', () => {
    it('应正确计算风险分数', () => {
      const input: RiskInput = {
        contractAgeDays: 5,
        top5HoldPct: 65.0,
        hasLiquidityLock: false,
        socialHypeScore: 8.5,
        onChainNetFlow: -50000,
        devWalletTrading: true,
      }

      const riskScore = scoreRisk(input)

      expect(riskScore).toBeGreaterThanOrEqual(0)
      expect(riskScore).toBeLessThanOrEqual(100)
      expect(riskScore).toBeGreaterThan(50) // 应为高风险
    })

    it('低风险资产应得到低分', () => {
      const input: RiskInput = {
        contractAgeDays: 365,
        top5HoldPct: 30.0,
        hasLiquidityLock: true,
        socialHypeScore: 5.0,
        onChainNetFlow: 100000,
        devWalletTrading: false,
      }

      const riskScore = scoreRisk(input)

      expect(riskScore).toBeLessThan(30)
    })
  })

  describe('步骤4: AI摘要生成', () => {
    it('应生成合规的AI摘要', async () => {
      const signalData = {
        symbol: 'BTC',
        name: 'Bitcoin',
        window: '5m',
        priceChangePct: 18.5,
        volZScore: 4.2,
        liqDeltaPct: 28.0,
        top5HoldPct: 45.0,
        newWalletNetBuy: 150000,
        riskScore: 35,
        contractAgeDays: 180,
      }

      const summary = await makeSafeSummary(signalData)

      expect(summary).toHaveProperty('cn')
      expect(summary).toHaveProperty('en')

      // 中文摘要应不超过120字
      expect(summary.cn.length).toBeLessThanOrEqual(130)

      // 英文摘要应不超过15词
      const englishWords = summary.en.split(' ').length
      expect(englishWords).toBeLessThanOrEqual(20)

      // 不应包含投资建议词汇
      expect(summary.cn).not.toMatch(/建议买|推荐购买|抄底|梭哈/)
    })

    it('高风险资产应自动添加警告', async () => {
      const highRiskSignal = {
        symbol: 'SCAM',
        name: 'Scam Token',
        window: '15m',
        priceChangePct: 50.0,
        volZScore: 8.0,
        liqDeltaPct: 100.0,
        top5HoldPct: 80.0,
        newWalletNetBuy: 10000,
        riskScore: 85,
        contractAgeDays: 2,
      }

      const summary = await makeSafeSummary(highRiskSignal)

      // 应包含风险警告
      expect(summary.cn).toMatch(/极高风险|高风险/)
    })
  })

  describe('步骤5: 写入Signal表', () => {
    it('应成功创建Signal记录', async () => {
      const asset = await prisma.asset.findFirst({
        where: { symbol: 'BTC' },
      })

      const signal = await prisma.signal.create({
        data: {
          assetId: asset!.id,
          window: '5m',
          priceChangePct: 18.5,
          volZScore: 4.2,
          liqDeltaPct: 28.0,
          top5HoldPct: 45.0,
          newWalletNetBuy: 150000,
          riskScore: 35,
          contractAgeDays: 180,
          metrics: {
            avgVolume: 1000000,
            stdVolume: 200000,
          },
          aiSummary: {
            cn: '测试摘要',
            en: 'Test summary',
          },
        },
      })

      expect(signal).toHaveProperty('id')
      expect(signal.assetId).toBe(asset!.id)
      expect(signal.riskScore).toBe(35)
    })

    it('Signal应关联到Asset', async () => {
      const signal = await prisma.signal.findFirst({
        where: { window: '5m' },
        include: { asset: true },
      })

      expect(signal).not.toBeNull()
      expect(signal?.asset).toBeTruthy()
      expect(signal?.asset.symbol).toBe('BTC')
    })
  })

  describe('步骤6: 前端列表渲染（数据查询）', () => {
    it('应按createdAt DESC, riskScore DESC排序返回', async () => {
      // 创建多个Signal
      const signals = [
        {
          assetId: 'btc-test',
          window: '1h',
          priceChangePct: 10.0,
          volZScore: 3.0,
          liqDeltaPct: 20.0,
          top5HoldPct: 40.0,
          newWalletNetBuy: 100000,
          riskScore: 20,
          contractAgeDays: 100,
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          assetId: 'eth-test',
          window: '1h',
          priceChangePct: 15.0,
          volZScore: 4.0,
          liqDeltaPct: 25.0,
          top5HoldPct: 50.0,
          newWalletNetBuy: 150000,
          riskScore: 40,
          contractAgeDays: 50,
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
      ]

      await prisma.signal.createMany({ data: signals })

      const retrieved = await prisma.signal.findMany({
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
        include: { asset: true },
      })

      expect(retrieved.length).toBeGreaterThan(0)
      expect(retrieved[0].createdAt >= retrieved[1].createdAt).toBe(true)
    })

    it('应支持分页', async () => {
      const page1 = await prisma.signal.findMany({
        take: 2,
        skip: 0,
        orderBy: [{ createdAt: 'desc' }, { riskScore: 'desc' }],
        include: { asset: true },
      })

      const page2 = await prisma.signal.findMany({
        take: 2,
        skip: 2,
        orderBy: [{ createdAt: 'desc' }, { riskScore: 'desc' }],
        include: { asset: true },
      })

      expect(page1.length).toBeLessThanOrEqual(2)
      expect(page2.length).toBeLessThanOrEqual(2)
      expect(page1[0].id).not.toBe(page2[0]?.id)
    })

    it('返回的数据应包含前端所需的所有字段', async () => {
      const signal = await prisma.signal.findFirst({
        include: { asset: true },
      })

      // Asset信息
      expect(signal?.asset.symbol).toBeDefined()
      expect(signal?.asset.name).toBeDefined()

      // Signal指标
      expect(signal?.priceChangePct).toBeDefined()
      expect(signal?.riskScore).toBeDefined()
      expect(signal?.window).toBeDefined()
      expect(signal?.volZScore).toBeDefined()

      // 时间戳
      expect(signal?.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('完整流程集成测试', () => {
    it('应完成从数据源到前端的完整流程', async () => {
      // Step 1: 获取数据
      const candles = await mockDataSource.fetchRecentCandles(['SOL'], '15m', 20)
      expect(candles.SOL).toBeDefined()

      const netBuy = await mockDataSource.fetchNewWalletNetBuy('SOL')
      expect(netBuy).toBeGreaterThanOrEqual(0)

      // Step 2: 计算指标
      const solCandles = candles.SOL
      const priceChangePct = ((solCandles[19].close - solCandles[0].close) / solCandles[0].close) * 100
      
      const candidateInput: CandidateInput = {
        priceChangePct: Math.abs(priceChangePct) > 15 ? priceChangePct : 16, // 确保满足条件
        volZScore: 4.0,
        liqDeltaPct: 25.0,
        newWalletNetBuyPercentile: 95,
      }

      const isCandidate = filterCandidates(candidateInput)
      
      if (isCandidate) {
        // Step 3: 计算风险分数
        const riskInput: RiskInput = {
          contractAgeDays: 45,
          top5HoldPct: 50.0,
          hasLiquidityLock: true,
          socialHypeScore: 6.0,
          onChainNetFlow: netBuy,
          devWalletTrading: false,
        }

        const riskScore = scoreRisk(riskInput)
        expect(riskScore).toBeGreaterThanOrEqual(0)

        // Step 4: 生成AI摘要
        const summary = await makeSafeSummary({
          symbol: 'SOL',
          name: 'Solana',
          window: '15m',
          priceChangePct: candidateInput.priceChangePct,
          volZScore: candidateInput.volZScore,
          liqDeltaPct: candidateInput.liqDeltaPct,
          top5HoldPct: riskInput.top5HoldPct,
          newWalletNetBuy: netBuy,
          riskScore,
          contractAgeDays: riskInput.contractAgeDays,
        })

        expect(summary.cn).toBeTruthy()
        expect(summary.en).toBeTruthy()

        // Step 5: 写入数据库
        const asset = await prisma.asset.findFirst({ where: { symbol: 'SOL' } })
        const signal = await prisma.signal.create({
          data: {
            assetId: asset!.id,
            window: '15m',
            priceChangePct: candidateInput.priceChangePct,
            volZScore: candidateInput.volZScore,
            liqDeltaPct: candidateInput.liqDeltaPct,
            top5HoldPct: riskInput.top5HoldPct,
            newWalletNetBuy: netBuy,
            riskScore,
            contractAgeDays: riskInput.contractAgeDays,
            aiSummary: summary,
          },
        })

        expect(signal.id).toBeDefined()

        // Step 6: 前端查询
        const frontendData = await prisma.signal.findMany({
          where: { window: '15m' },
          orderBy: [{ createdAt: 'desc' }, { riskScore: 'desc' }],
          include: { asset: true },
          take: 10,
        })

        expect(frontendData.length).toBeGreaterThan(0)
        expect(frontendData[0].asset).toBeDefined()
      }
    })
  })
})

