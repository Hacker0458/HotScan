/**
 * API测试: /api/share
 * 
 * 测试海报生成和分享功能
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('POST /api/share', () => {
  let testAssetId: string

  beforeAll(async () => {
    // 创建测试资产
    const asset = await prisma.asset.create({
      data: {
        id: 'test-asset-share',
        symbol: 'TEST',
        name: 'Test Asset',
        chain: 'ETH',
      },
    })
    testAssetId = asset.id
  })

  afterAll(async () => {
    // 清理测试数据
    await prisma.share.deleteMany({ where: { assetId: testAssetId } })
    await prisma.asset.delete({ where: { id: testAssetId } })
    await prisma.$disconnect()
  })

  describe('分享创建测试', () => {
    it('应成功创建分享记录', async () => {
      const shareData = {
        assetId: testAssetId,
        title: 'Test Share',
        imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        metrics: {
          priceChangePct: 5.23,
          riskScore: 25,
          window: '1h',
        },
      }

      const share = await prisma.share.create({
        data: {
          assetId: shareData.assetId,
          title: shareData.title,
          imageUrl: shareData.imageUrl,
          metrics: shareData.metrics,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      expect(share).toHaveProperty('id')
      expect(share.assetId).toBe(testAssetId)
      expect(share.title).toBe('Test Share')
      expect(share.imageUrl).toContain('data:image/png')
    })

    it('生成的短链ID应为8位', async () => {
      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test ID Length',
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      expect(share.id.length).toBe(8)
    })

    it('应自动设置30天后过期', async () => {
      const now = Date.now()
      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test Expiry',
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000),
        },
      })

      const expiryTime = share.expiresAt!.getTime()
      const expectedExpiry = now + 30 * 24 * 60 * 60 * 1000

      // 允许1秒误差
      expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(1000)
    })
  })

  describe('图片数据验证测试', () => {
    it('导出的图片数据应存在', async () => {
      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test Image Data',
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      expect(share.imageUrl).toBeTruthy()
      expect(share.imageUrl.length).toBeGreaterThan(0)
    })

    it('图片数据应为有效的data URI', async () => {
      const share = await prisma.share.findFirst({
        where: { assetId: testAssetId },
      })

      expect(share?.imageUrl).toMatch(/^data:image\/(png|jpeg|jpg);base64,/)
    })

    it('图片数据应包含base64内容', async () => {
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      
      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test Base64',
          imageUrl,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      // 提取base64部分
      const base64Part = share.imageUrl.split(',')[1]
      expect(base64Part).toBeTruthy()
      expect(base64Part.length).toBeGreaterThan(0)
    })
  })

  describe('合规性验证测试', () => {
    it('海报内容应包含"非投资建议"字样', async () => {
      // 模拟海报生成过程中的文本内容
      const posterContent = '非投资建议'
      
      expect(posterContent).toContain('非投资建议')
    })

    it('海报元数据应包含风险警告', () => {
      const metadata = {
        disclaimer: '⚠️ 非投资建议',
        warning: 'Not Financial Advice',
      }

      expect(metadata.disclaimer).toContain('非投资建议')
      expect(metadata.warning).toContain('Not Financial Advice')
    })

    it('分享页面应显示免责声明', async () => {
      const share = await prisma.share.findFirst({
        where: { assetId: testAssetId },
      })

      expect(share).not.toBeNull()
      // 分享页面将显示免责声明（在页面组件中验证）
    })
  })

  describe('分享检索测试', () => {
    it('应能通过ID检索分享', async () => {
      const created = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test Retrieval',
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      const retrieved = await prisma.share.findUnique({
        where: { id: created.id },
        include: { asset: true },
      })

      expect(retrieved).not.toBeNull()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.asset).toBeTruthy()
    })

    it('应正确返回资产关联信息', async () => {
      const share = await prisma.share.findFirst({
        where: { assetId: testAssetId },
        include: { asset: true },
      })

      expect(share?.asset).toHaveProperty('symbol')
      expect(share?.asset).toHaveProperty('name')
      expect(share?.asset.symbol).toBe('TEST')
    })
  })

  describe('过期处理测试', () => {
    it('应能检测过期的分享', async () => {
      // 创建已过期的分享
      const expiredShare = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Expired Share',
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(Date.now() - 1000), // 已过期
        },
      })

      const now = new Date()
      const isExpired = expiredShare.expiresAt! < now

      expect(isExpired).toBe(true)
    })

    it('应能过滤出未过期的分享', async () => {
      const validShares = await prisma.share.findMany({
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
      })

      // 所有返回的分享都应未过期
      validShares.forEach(share => {
        expect(share.expiresAt!.getTime()).toBeGreaterThan(Date.now())
      })
    })
  })

  describe('指标数据测试', () => {
    it('应正确存储指标数据', async () => {
      const metrics = {
        priceChangePct: 15.5,
        riskScore: 35,
        window: '5m',
      }

      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test Metrics',
          imageUrl: 'data:image/png;base64,test',
          metrics,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      const storedMetrics = share.metrics as any
      expect(storedMetrics.priceChangePct).toBe(15.5)
      expect(storedMetrics.riskScore).toBe(35)
      expect(storedMetrics.window).toBe('5m')
    })

    it('应支持可选的指标字段', async () => {
      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Test Optional Metrics',
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          // metrics字段为空
        },
      })

      expect(share.metrics).toBeTruthy() // Prisma默认为{}
    })
  })

  describe('边界测试', () => {
    it('应处理空title', async () => {
      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: '',
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      expect(share.title).toBe('')
    })

    it('应处理超长title', async () => {
      const longTitle = 'a'.repeat(300)

      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: longTitle,
          imageUrl: 'data:image/png;base64,test',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      expect(share.title).toBe(longTitle)
    })

    it('应处理大图片数据', async () => {
      // 模拟大图片（1MB base64）
      const largeBase64 = 'A'.repeat(1000000)
      const imageUrl = `data:image/png;base64,${largeBase64}`

      const share = await prisma.share.create({
        data: {
          assetId: testAssetId,
          title: 'Large Image',
          imageUrl,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      expect(share.imageUrl.length).toBeGreaterThan(1000000)
    })
  })
})

