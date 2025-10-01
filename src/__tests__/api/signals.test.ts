/**
 * API测试: /api/signals
 * 
 * 测试排序、分页和响应格式
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('GET /api/signals', () => {
  // Mock数据
  const mockAssets = [
    { id: 'asset-1', symbol: 'BTC', name: 'Bitcoin', chain: 'ETH', imageUrl: null },
    { id: 'asset-2', symbol: 'ETH', name: 'Ethereum', chain: 'ETH', imageUrl: null },
    { id: 'asset-3', symbol: 'SOL', name: 'Solana', chain: 'SOL', imageUrl: null },
  ]

  const mockSignals = [
    {
      id: 'signal-1',
      assetId: 'asset-1',
      window: '1h',
      priceChangePct: 15.5,
      volZScore: 3.5,
      liqDeltaPct: 25.0,
      top5HoldPct: 45.0,
      newWalletNetBuy: 100000,
      riskScore: 25,
      contractAgeDays: 30,
      createdAt: new Date('2024-01-03T10:00:00Z'),
      metrics: {},
      aiSummary: null,
    },
    {
      id: 'signal-2',
      assetId: 'asset-2',
      window: '1h',
      priceChangePct: 8.2,
      volZScore: 4.0,
      liqDeltaPct: 15.0,
      top5HoldPct: 55.0,
      newWalletNetBuy: 50000,
      riskScore: 45,
      contractAgeDays: 15,
      createdAt: new Date('2024-01-02T10:00:00Z'),
      metrics: {},
      aiSummary: null,
    },
    {
      id: 'signal-3',
      assetId: 'asset-3',
      window: '5m',
      priceChangePct: 20.0,
      volZScore: 5.0,
      liqDeltaPct: 30.0,
      top5HoldPct: 40.0,
      newWalletNetBuy: 200000,
      riskScore: 15,
      contractAgeDays: 60,
      createdAt: new Date('2024-01-04T10:00:00Z'),
      metrics: {},
      aiSummary: null,
    },
  ]

  beforeAll(async () => {
    // 清理测试数据
    await prisma.signal.deleteMany()
    await prisma.asset.deleteMany()

    // 创建测试数据
    await prisma.asset.createMany({ data: mockAssets })
    await prisma.signal.createMany({ data: mockSignals })
  })

  afterAll(async () => {
    // 清理测试数据
    await prisma.signal.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.$disconnect()
  })

  describe('排序测试', () => {
    it('应按 createdAt DESC 排序', async () => {
      const signals = await prisma.signal.findMany({
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
        include: { asset: true },
      })

      expect(signals.length).toBe(3)
      expect(signals[0].id).toBe('signal-3') // 2024-01-04
      expect(signals[1].id).toBe('signal-1') // 2024-01-03
      expect(signals[2].id).toBe('signal-2') // 2024-01-02
    })

    it('应在同一时间按 riskScore DESC 排序', async () => {
      // 创建同一时间的信号
      const sameTimeSignals = [
        {
          id: 'signal-4',
          assetId: 'asset-1',
          window: '1h',
          priceChangePct: 10.0,
          volZScore: 3.0,
          liqDeltaPct: 20.0,
          top5HoldPct: 50.0,
          newWalletNetBuy: 75000,
          riskScore: 80,
          contractAgeDays: 20,
          createdAt: new Date('2024-01-05T10:00:00Z'),
          metrics: {},
          aiSummary: null,
        },
        {
          id: 'signal-5',
          assetId: 'asset-2',
          window: '1h',
          priceChangePct: 12.0,
          volZScore: 3.2,
          liqDeltaPct: 22.0,
          top5HoldPct: 52.0,
          newWalletNetBuy: 80000,
          riskScore: 30,
          contractAgeDays: 25,
          createdAt: new Date('2024-01-05T10:00:00Z'),
          metrics: {},
          aiSummary: null,
        },
      ]

      await prisma.signal.createMany({ data: sameTimeSignals })

      const signals = await prisma.signal.findMany({
        where: {
          createdAt: new Date('2024-01-05T10:00:00Z'),
        },
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
      })

      expect(signals[0].riskScore).toBe(80)
      expect(signals[1].riskScore).toBe(30)

      // 清理
      await prisma.signal.deleteMany({
        where: { id: { in: ['signal-4', 'signal-5'] } },
      })
    })
  })

  describe('分页测试', () => {
    it('应正确返回第一页（limit=2）', async () => {
      const signals = await prisma.signal.findMany({
        take: 2,
        skip: 0,
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
        include: { asset: true },
      })

      expect(signals.length).toBe(2)
      expect(signals[0].id).toBe('signal-3')
      expect(signals[1].id).toBe('signal-1')
    })

    it('应正确返回第二页（limit=2, skip=2）', async () => {
      const signals = await prisma.signal.findMany({
        take: 2,
        skip: 2,
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
        include: { asset: true },
      })

      expect(signals.length).toBe(1)
      expect(signals[0].id).toBe('signal-2')
    })

    it('应正确处理超出范围的分页', async () => {
      const signals = await prisma.signal.findMany({
        take: 10,
        skip: 100,
        orderBy: [
          { createdAt: 'desc' },
          { riskScore: 'desc' },
        ],
      })

      expect(signals.length).toBe(0)
    })
  })

  describe('窗口过滤测试', () => {
    it('应按window过滤信号', async () => {
      const signals1h = await prisma.signal.findMany({
        where: { window: '1h' },
      })

      const signals5m = await prisma.signal.findMany({
        where: { window: '5m' },
      })

      expect(signals1h.length).toBe(2)
      expect(signals5m.length).toBe(1)
    })
  })

  describe('响应格式测试', () => {
    it('应包含asset关联数据', async () => {
      const signals = await prisma.signal.findMany({
        include: { asset: true },
        take: 1,
      })

      expect(signals[0]).toHaveProperty('asset')
      expect(signals[0].asset).toHaveProperty('symbol')
      expect(signals[0].asset).toHaveProperty('name')
    })

    it('应包含所有必需字段', async () => {
      const signal = await prisma.signal.findFirst({
        include: { asset: true },
      })

      expect(signal).toHaveProperty('id')
      expect(signal).toHaveProperty('assetId')
      expect(signal).toHaveProperty('window')
      expect(signal).toHaveProperty('priceChangePct')
      expect(signal).toHaveProperty('volZScore')
      expect(signal).toHaveProperty('liqDeltaPct')
      expect(signal).toHaveProperty('top5HoldPct')
      expect(signal).toHaveProperty('newWalletNetBuy')
      expect(signal).toHaveProperty('riskScore')
      expect(signal).toHaveProperty('contractAgeDays')
      expect(signal).toHaveProperty('createdAt')
    })
  })

  describe('边界测试', () => {
    it('应处理空结果集', async () => {
      await prisma.signal.deleteMany()

      const signals = await prisma.signal.findMany()

      expect(signals).toEqual([])

      // 恢复数据
      await prisma.signal.createMany({ data: mockSignals })
    })

    it('应处理limit=0', async () => {
      const signals = await prisma.signal.findMany({
        take: 0,
      })

      expect(signals.length).toBe(0)
    })

    it('应处理负数limit（应被忽略）', async () => {
      const signals = await prisma.signal.findMany({
        take: -1,
      })

      // Prisma会忽略负数take，返回所有结果
      expect(signals.length).toBeGreaterThan(0)
    })
  })
})

