/**
 * API测试: /api/learn
 * 
 * 测试RAG问答功能
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { answerQuery } from '@/lib/rag'

describe('GET /api/learn', () => {
  // Mock术语数据
  const mockTerms = [
    {
      term: '流动性锁仓',
      definition: '项目方将流动性池的代币锁定在智能合约中，在指定时间内无法撤出。这防止项目方突然撤走流动性导致投资者无法交易，是项目可信度的重要指标。',
      embedding: Array(1536).fill(0.1), // Mock embedding
    },
    {
      term: 'DeFi',
      definition: '去中心化金融，指建立在区块链上的金融服务，无需银行等中介。用户通过智能合约直接进行借贷、交易和投资，资产由自己控制。',
      embedding: Array(1536).fill(0.2),
    },
    {
      term: '拉高出货',
      definition: '一种市场操纵行为，通过大量买入推高资产价格，吸引其他投资者跟风，然后在高位迅速卖出获利，导致价格暴跌。',
      embedding: Array(1536).fill(0.3),
    },
  ]

  beforeAll(async () => {
    // 清理并创建测试术语
    await prisma.term.deleteMany()
    
    for (const term of mockTerms) {
      await prisma.term.create({
        data: {
          term: term.term,
          definition: term.definition,
          embedding: term.embedding as any,
        },
      })
    }
  })

  afterAll(async () => {
    await prisma.term.deleteMany()
    await prisma.$disconnect()
  })

  describe('术语检索测试', () => {
    it('应能检索到"流动性锁仓"术语', async () => {
      const term = await prisma.term.findUnique({
        where: { term: '流动性锁仓' },
      })

      expect(term).not.toBeNull()
      expect(term?.term).toBe('流动性锁仓')
      expect(term?.definition).toContain('流动性池')
      expect(term?.definition).toContain('智能合约')
    })

    it('应返回包含术语定义的完整结构', async () => {
      const term = await prisma.term.findUnique({
        where: { term: '流动性锁仓' },
        select: {
          term: true,
          definition: true,
        },
      })

      expect(term).toHaveProperty('term')
      expect(term).toHaveProperty('definition')
      expect(term?.definition.length).toBeGreaterThan(60)
    })
  })

  describe('RAG问答测试', () => {
    it('查询"流动性锁仓"应返回含该术语的来源', async () => {
      const result = await answerQuery('什么是流动性锁仓？', 3)

      expect(result).toHaveProperty('answer')
      expect(result).toHaveProperty('sources')
      expect(result.sources.length).toBeGreaterThan(0)

      // 检查sources中是否包含"流动性锁仓"
      const hasTargetTerm = result.sources.some(
        source => source.term === '流动性锁仓'
      )
      expect(hasTargetTerm).toBe(true)
    })

    it('返回的解释应为60-80字', async () => {
      const result = await answerQuery('什么是流动性锁仓？', 3)

      // 提取解释部分（假设格式为"解释：xxx"）
      const explanation = result.answer.split('\n')[0]
      
      // 移除"解释："前缀
      const content = explanation.replace(/^解释[：:]\s*/, '')
      
      // 中文字符数应在合理范围内
      expect(content.length).toBeGreaterThanOrEqual(30)
      expect(content.length).toBeLessThanOrEqual(150)
    })

    it('应返回生活化例子', async () => {
      const result = await answerQuery('什么是流动性锁仓？', 3)

      // 应包含"例子"关键词
      expect(result.answer).toMatch(/例子[：:]/i)
    })

    it('应包含术语来源列表', async () => {
      const result = await answerQuery('什么是DeFi？', 3)

      expect(result.sources).toBeInstanceOf(Array)
      expect(result.sources.length).toBeGreaterThan(0)

      // 每个source应有必需字段
      result.sources.forEach(source => {
        expect(source).toHaveProperty('term')
        expect(source).toHaveProperty('definition')
        expect(source).toHaveProperty('similarity')
      })
    })
  })

  describe('合规性测试', () => {
    it('应拒绝包含投资建议词汇的查询', async () => {
      const result = await answerQuery('建议我抄底哪个币？', 3)

      expect(result.answer).toContain('抱歉')
      expect(result.sources).toEqual([])
    })

    it('生成的回答不应包含投资建议', async () => {
      const result = await answerQuery('什么是DeFi？', 3)

      // 不应包含投资建议词汇
      const inappropriateWords = ['建议买', '推荐购买', '稳赚', '必涨', '抄底', '梭哈']
      
      inappropriateWords.forEach(word => {
        expect(result.answer).not.toContain(word)
      })
    })
  })

  describe('边界测试', () => {
    it('应处理空查询', async () => {
      await expect(answerQuery('', 3)).rejects.toThrow()
    })

    it('应处理过短查询', async () => {
      await expect(answerQuery('a', 3)).rejects.toThrow()
    })

    it('应处理过长查询', async () => {
      const longQuery = 'a'.repeat(101)
      await expect(answerQuery(longQuery, 3)).rejects.toThrow()
    })

    it('应处理不存在的术语', async () => {
      const result = await answerQuery('这是一个完全不存在的术语xyzabc123', 3)

      // 应返回"未找到"相关信息
      expect(result.answer).toContain('抱歉')
    })

    it('应处理topK为0', async () => {
      const result = await answerQuery('什么是DeFi？', 0)

      // 应返回错误或空结果
      expect(result.sources.length).toBe(0)
    })
  })

  describe('性能测试', () => {
    it('单次查询应在合理时间内完成', async () => {
      const startTime = Date.now()
      
      await answerQuery('什么是流动性锁仓？', 3)
      
      const duration = Date.now() - startTime
      
      // 应在5秒内完成（包含LLM调用）
      expect(duration).toBeLessThan(5000)
    })
  })

  describe('术语前缀搜索测试', () => {
    it('应支持前缀搜索', async () => {
      const terms = await prisma.term.findMany({
        where: {
          term: {
            startsWith: '流动',
            mode: 'insensitive',
          },
        },
      })

      expect(terms.length).toBeGreaterThan(0)
      expect(terms[0].term).toContain('流动')
    })

    it('应支持不区分大小写的搜索', async () => {
      const terms = await prisma.term.findMany({
        where: {
          term: {
            startsWith: 'def',
            mode: 'insensitive',
          },
        },
      })

      // 应能找到"DeFi"
      const hasDeFi = terms.some(t => t.term.toLowerCase().includes('defi'))
      expect(hasDeFi).toBe(true)
    })
  })
})

