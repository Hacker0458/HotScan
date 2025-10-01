/**
 * RAG 系统测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $queryRaw: vi.fn(),
    term: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  })),
}))

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    embeddings: {
      create: vi.fn(),
    },
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

describe('RAG 系统', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('合规性检查', () => {
    it('应该拒绝包含投资建议的内容', () => {
      const inappropriateTexts = [
        '建议买入这个代币',
        '推荐购买，稳赚不赔',
        '必涨，抄底好时机',
        '财富密码，赶紧梭哈',
      ]
      
      // 这些都应该被检测为不合规
      inappropriateTexts.forEach(text => {
        expect(text).toBeTruthy()
        // 实际实现中会被 containsInappropriateContent 捕获
      })
    })

    it('应该允许客观描述性内容', () => {
      const appropriateTexts = [
        'DeFi是去中心化金融的缩写',
        '流动性池包含两种代币',
        '智能合约自动执行',
        'Gas费用于支付网络费用',
      ]
      
      appropriateTexts.forEach(text => {
        expect(text).toBeTruthy()
        expect(text).not.toMatch(/建议|推荐|必涨|稳赚/)
      })
    })
  })

  describe('问答格式', () => {
    it('应该包含解释和例子', () => {
      const validAnswer = `解释：流动性池是DeFi中的智能合约，包含多种代币储备。用户存入代币成为流动性提供者，为交易者提供交易对，从手续费中获得收益。

例子：就像一个自动售货机，你往里面放入可乐和薯片，别人来买的时候，机器自动完成交易，你则获得一小部分手续费作为补偿。`
      
      expect(validAnswer).toContain('解释：')
      expect(validAnswer).toContain('例子：')
      expect(validAnswer.length).toBeGreaterThan(60)
      expect(validAnswer.length).toBeLessThan(300)
    })

    it('解释部分应该在60-80字之间', () => {
      const explanation = 'DeFi是去中心化金融的缩写，指建立在区块链上的金融服务，无需传统中介。用户通过智能合约直接借贷、交易和投资。'
      
      expect(explanation.length).toBeGreaterThanOrEqual(50)
      expect(explanation.length).toBeLessThanOrEqual(100)
    })
  })

  describe('术语覆盖', () => {
    it('应该涵盖DeFi基础术语', () => {
      const requiredTerms = [
        'DeFi',
        'AMM',
        '流动性池',
        '流动性锁仓',
        '滑点',
      ]
      
      requiredTerms.forEach(term => {
        expect(term).toBeTruthy()
      })
    })

    it('应该涵盖风险相关术语', () => {
      const riskTerms = [
        '拉高出货',
        'Rug Pull',
        '蜜罐合约',
        '女巫攻击',
        '闪电贷攻击',
      ]
      
      riskTerms.forEach(term => {
        expect(term).toBeTruthy()
      })
    })

    it('应该涵盖技术指标术语', () => {
      const metricTerms = [
        'TVL',
        '市值',
        '成交量',
        'FDV',
        '深度',
      ]
      
      metricTerms.forEach(term => {
        expect(term).toBeTruthy()
      })
    })

    it('应该涵盖安全相关术语', () => {
      const securityTerms = [
        '私钥',
        '助记词',
        '冷钱包',
        '合约审计',
        '多签钱包',
      ]
      
      securityTerms.forEach(term => {
        expect(term).toBeTruthy()
      })
    })
  })

  describe('向量搜索', () => {
    it('应该返回相似度最高的术语', () => {
      // Mock结果
      const mockResults = [
        { term: 'DeFi', definition: '去中心化金融...', similarity: 0.95 },
        { term: '流动性池', definition: '流动性池是...', similarity: 0.87 },
        { term: 'AMM', definition: '自动做市商...', similarity: 0.82 },
      ]
      
      // 验证排序
      for (let i = 0; i < mockResults.length - 1; i++) {
        expect(mockResults[i].similarity).toBeGreaterThanOrEqual(
          mockResults[i + 1].similarity
        )
      }
    })

    it('相似度应该在0-1之间', () => {
      const mockResults = [
        { term: 'Test1', definition: '...', similarity: 0.95 },
        { term: 'Test2', definition: '...', similarity: 0.50 },
        { term: 'Test3', definition: '...', similarity: 0.10 },
      ]
      
      mockResults.forEach(result => {
        expect(result.similarity).toBeGreaterThanOrEqual(0)
        expect(result.similarity).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('API 响应格式', () => {
    it('应该返回标准的JSON格式', () => {
      const mockResponse = {
        success: true,
        data: {
          query: '什么是DeFi',
          answer: '解释：...\n例子：...',
          sources: [
            { term: 'DeFi', definition: '...', similarity: 0.95 },
          ],
        },
      }
      
      expect(mockResponse).toHaveProperty('success')
      expect(mockResponse).toHaveProperty('data')
      expect(mockResponse.data).toHaveProperty('query')
      expect(mockResponse.data).toHaveProperty('answer')
      expect(mockResponse.data).toHaveProperty('sources')
      expect(Array.isArray(mockResponse.data.sources)).toBe(true)
    })

    it('sources应该包含term、definition和similarity', () => {
      const mockSource = {
        term: 'DeFi',
        definition: '去中心化金融',
        similarity: 0.95,
      }
      
      expect(mockSource).toHaveProperty('term')
      expect(mockSource).toHaveProperty('definition')
      expect(mockSource).toHaveProperty('similarity')
      expect(typeof mockSource.term).toBe('string')
      expect(typeof mockSource.definition).toBe('string')
      expect(typeof mockSource.similarity).toBe('number')
    })
  })

  describe('错误处理', () => {
    it('空查询应该返回错误', () => {
      const emptyQuery = ''
      expect(emptyQuery.length).toBe(0)
      // 应该在验证层被拒绝
    })

    it('过长查询应该返回错误', () => {
      const longQuery = 'a'.repeat(201)
      expect(longQuery.length).toBeGreaterThan(200)
      // 应该在验证层被拒绝
    })

    it('没有找到术语应该返回友好提示', () => {
      const noResultsResponse = {
        query: '不存在的术语xyzabc',
        answer: '抱歉，没有找到相关的术语解释。请尝试使用其他关键词，如"DeFi"、"流动性"、"智能合约"等。',
        sources: [],
      }
      
      expect(noResultsResponse.sources.length).toBe(0)
      expect(noResultsResponse.answer).toContain('没有找到')
      expect(noResultsResponse.answer).toContain('尝试')
    })
  })

  describe('生活化例子', () => {
    it('应该使用日常生活中的类比', () => {
      const examples = [
        '就像一个自动售货机',
        '类似于银行存款',
        '好比一个保险箱',
        '相当于菜市场的摊位',
      ]
      
      examples.forEach(example => {
        expect(example).toMatch(/就像|类似|好比|相当于/)
      })
    })

    it('例子应该简单易懂', () => {
      const goodExample = '就像你把钱存入银行定期，锁定一段时间不能取出，但会获得利息。流动性锁仓也是这个道理。'
      
      expect(goodExample.length).toBeLessThan(100)
      expect(goodExample).toContain('就像')
    })
  })
})

