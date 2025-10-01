/**
 * 术语向量化作业
 * 
 * 批量向量化金融/DeFi术语，存储到pgvector
 * 
 * 运行方式:
 * - pnpm jobs:embed
 * - Vercel Cron
 * - GitHub Actions
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

// 50条专业术语及定义
const TERMS = [
  // DeFi 基础
  {
    term: 'DeFi',
    definition: '去中心化金融（Decentralized Finance）的缩写，是指建立在区块链上的金融服务和应用，无需传统金融中介机构。用户可以通过智能合约直接进行借贷、交易、投资等金融活动。',
  },
  {
    term: 'AMM',
    definition: '自动做市商（Automated Market Maker）是一种去中心化交易协议，使用数学公式（如x*y=k）自动定价和提供流动性，无需传统订单簿。用户可以直接与流动性池进行交易。',
  },
  {
    term: '流动性池',
    definition: '流动性池是DeFi中的智能合约，包含两种或多种代币储备。用户将代币存入池中成为流动性提供者（LP），为交易者提供交易对，并从交易手续费中获得收益。',
  },
  {
    term: '流动性锁仓',
    definition: '项目方将流动性池代币（LP Token）锁定在智能合约中，在指定时间内无法撤出。这是为了防止项目方突然撤出流动性导致投资者无法交易，是项目可信度的重要指标。',
  },
  {
    term: '滑点',
    definition: '滑点是指实际成交价格与预期价格之间的差异。在流动性较低或交易量较大时，滑点会增加。例如，你想以100美元买入代币，但实际成交价可能是102美元。',
  },
  
  // 持仓与地址
  {
    term: '持币集中度',
    definition: '持币集中度是指少数地址持有代币总量的比例。如果前10个地址持有超过50%的代币，说明集中度高，存在价格操纵风险。健康的项目通常持币分布较为分散。',
  },
  {
    term: '鲸鱼地址',
    definition: '鲸鱼地址是指持有大量某种代币的钱包地址，其交易行为可能对市场价格产生显著影响。监控鲸鱼地址的动向可以帮助预测价格走势。',
  },
  {
    term: 'Dev地址',
    definition: 'Dev地址是指项目开发者控制的钱包地址。如果Dev地址频繁交易或转移大量代币，可能暗示项目方准备套现离场，是重要的风险信号。',
  },
  {
    term: '新钱包',
    definition: '新钱包是指首次与某个代币合约交互的地址。大量新钱包买入可能表明项目正在吸引新用户，而新钱包卖出可能是项目方用小额地址分散卖出。',
  },
  
  // 风险与欺诈
  {
    term: '拉高出货',
    definition: '拉高出货（Pump and Dump）是一种操纵手法。操纵者先大量买入推高价格，吸引散户跟风，然后在高位大量卖出获利，导致价格暴跌，散户遭受损失。',
  },
  {
    term: 'Rug Pull',
    definition: 'Rug Pull（地毯式拉走）是指项目方突然撤出流动性或卷款跑路，导致代币价值归零。常见于未锁仓流动性或开发者保留后门权限的项目。',
  },
  {
    term: '蜜罐合约',
    definition: '蜜罐合约是一种恶意智能合约，允许用户买入但无法卖出。合约代码中隐藏了限制，导致投资者的资金被困住，这是常见的骗局手段。',
  },
  {
    term: '女巫攻击',
    definition: '女巫攻击是指攻击者创建大量虚假账户或地址，伪装成多个真实用户来获取空投、投票权或其他利益，从而操纵项目或市场。',
  },
  {
    term: '闪电贷攻击',
    definition: '闪电贷攻击利用DeFi协议的闪电贷功能（单笔交易内借贷无需抵押）进行套利或攻击。攻击者借入大量资金操纵价格，在同一交易中完成攻击并归还贷款。',
  },
  
  // 交易与策略
  {
    term: '做市',
    definition: '做市是指在交易市场中同时提供买入和卖出报价，赚取买卖价差。在DeFi中，自动做市商（AMM）通过算法自动完成这一过程。',
  },
  {
    term: '套利',
    definition: '套利是指利用不同市场或时间的价格差异获利。例如，在A交易所以100美元买入，在B交易所以105美元卖出，赚取5美元差价。',
  },
  {
    term: '无常损失',
    definition: '无常损失是流动性提供者面临的风险。当池中代币价格变化时，相比单纯持有代币，提供流动性可能获得更少的价值。只有在价格恢复时，损失才会消失。',
  },
  {
    term: 'Gas费',
    definition: 'Gas费是在区块链上执行交易或智能合约所需支付的手续费，用于奖励矿工或验证者。Gas费根据网络拥堵程度波动，繁忙时可能非常高。',
  },
  {
    term: '抢跑交易',
    definition: '抢跑交易（Front-running）是指机器人监测到待处理的大额交易后，通过支付更高Gas费抢先执行，从价格变动中获利。这在MEV（矿工可提取价值）中常见。',
  },
  
  // 代币经济
  {
    term: '代币经济学',
    definition: '代币经济学（Tokenomics）是指代币的供应、分配、销毁、激励机制等经济设计。良好的代币经济学可以平衡供需，激励长期持有和参与。',
  },
  {
    term: '通缩代币',
    definition: '通缩代币通过销毁机制减少总供应量。例如，每笔交易销毁一定比例的代币，使流通量逐渐减少，理论上推动价格上涨。',
  },
  {
    term: '增发',
    definition: '增发是指项目方铸造新代币增加总供应量。过度增发会稀释现有持有者权益，导致代币贬值。健康的项目会在白皮书中明确增发计划。',
  },
  {
    term: '空投',
    definition: '空投是项目方向符合条件的地址免费发放代币，用于奖励早期用户、扩大社区或营销推广。空投可能吸引真实用户，但也容易被女巫攻击滥用。',
  },
  {
    term: '质押',
    definition: '质押（Staking）是指锁定代币以支持网络运行或获取收益。在PoS区块链中，质押帮助验证交易；在DeFi中，质押可获得利息或治理权。',
  },
  
  // 技术指标
  {
    term: 'TVL',
    definition: 'TVL（Total Value Locked，总锁定价值）是衡量DeFi协议规模的指标，表示存入协议的资产总价值。TVL越高，通常表明项目越受信任。',
  },
  {
    term: '市值',
    definition: '市值（Market Cap）是代币价格乘以流通量。市值反映项目的总价值和市场地位，但需注意虚假流通量和锁定代币的影响。',
  },
  {
    term: '成交量',
    definition: '成交量是指一定时间内的交易金额或数量。高成交量表明市场活跃，低成交量可能导致价格易被操纵和高滑点。',
  },
  {
    term: 'FDV',
    definition: 'FDV（Fully Diluted Valuation，完全稀释估值）是指如果所有代币都流通时的市值。当前流通量远低于总量时，FDV远高于市值，存在未来抛压风险。',
  },
  {
    term: '深度',
    definition: '市场深度是指订单簿中买卖订单的数量和价格分布。深度好意味着可以在价格变动较小的情况下完成大额交易，反映流动性充足。',
  },
  
  // 智能合约
  {
    term: '智能合约',
    definition: '智能合约是运行在区块链上的自动执行程序，按预设规则执行，无需中介。代码即法律，一旦部署通常无法修改，因此安全性至关重要。',
  },
  {
    term: '合约审计',
    definition: '合约审计是由专业安全团队检查智能合约代码，发现漏洞和安全隐患。通过审计的项目相对更安全，但不代表绝对无风险。',
  },
  {
    term: '可升级合约',
    definition: '可升级合约允许开发者在部署后修改合约逻辑。虽然方便修复漏洞，但也给了项目方修改规则甚至作恶的能力，是双刃剑。',
  },
  {
    term: '多签钱包',
    definition: '多签钱包（Multi-sig）需要多个私钥共同签名才能执行交易。例如5个管理员中3个同意才能动用资金，提高安全性和去中心化程度。',
  },
  {
    term: '时间锁',
    definition: '时间锁是一种机制，要求操作在提交后等待一段时间才能执行。这给社区时间审查和反应，防止项目方突然作恶。',
  },
  
  // 链与网络
  {
    term: '跨链桥',
    definition: '跨链桥允许资产在不同区块链之间转移。例如，将以太坊上的ETH转到BSC链。跨链桥是黑客攻击的热点目标，使用时需谨慎。',
  },
  {
    term: 'Layer 2',
    definition: 'Layer 2是建立在主链（Layer 1）之上的扩容解决方案，处理交易后将结果提交到主链。可以大幅降低Gas费和提高速度，如Arbitrum、Optimism。',
  },
  {
    term: '侧链',
    definition: '侧链是独立的区块链，通过桥接与主链连接。侧链有自己的共识机制，可以实现不同功能和性能优化，如Polygon。',
  },
  {
    term: 'EVM兼容',
    definition: 'EVM兼容是指区块链支持以太坊虚拟机，可以直接运行以太坊的智能合约和DApp。BSC、Polygon等都是EVM兼容链，便于项目迁移。',
  },
  
  // 治理与社区
  {
    term: 'DAO',
    definition: 'DAO（去中心化自治组织）是由智能合约管理的组织，成员通过投票共同决策。持有治理代币可参与投票，影响项目发展方向。',
  },
  {
    term: '治理代币',
    definition: '治理代币赋予持有者对项目的投票权。可以投票决定协议升级、参数调整、资金使用等。但要警惕"治理攻击"，鲸鱼可能操纵投票结果。',
  },
  {
    term: '提案',
    definition: '提案是社区成员提出的项目改进或决策建议，需要治理代币持有者投票。提案通过后将通过智能合约自动执行。',
  },
  {
    term: '快照投票',
    definition: '快照投票在特定区块高度记录代币持有量，基于快照时的持仓进行投票。这防止用户在投票期间转移代币重复投票。',
  },
  
  // 安全与隐私
  {
    term: '私钥',
    definition: '私钥是控制钱包和资产的密码，类似银行账户密码但无法找回。泄露私钥等于失去资产控制权，务必安全保管，不要在线存储。',
  },
  {
    term: '助记词',
    definition: '助记词是12或24个单词组成的私钥备份方式，便于记忆和抄写。丢失助记词等于永久失去钱包，不要拍照或在线保存。',
  },
  {
    term: '冷钱包',
    definition: '冷钱包是离线存储私钥的硬件设备或纸质备份，不联网使用。相比热钱包（联网钱包），冷钱包极大提高安全性，适合长期持有大额资产。',
  },
  {
    term: '白名单',
    definition: '白名单是指预先登记的地址列表，只有在白名单中的地址才能参与特定活动（如预售、空投）。用于奖励早期支持者或限制参与人数。',
  },
  {
    term: '授权',
    definition: '授权（Approve）是指允许智能合约操作你的代币。使用DApp前通常需要授权，但过度授权可能让恶意合约盗走你的资产，要定期检查和撤销。',
  },
  
  // 市场与交易
  {
    term: 'CEX',
    definition: 'CEX（Centralized Exchange，中心化交易所）如Binance、Coinbase，由公司运营，用户需要注册账户并将资产托管。相对安全但需要信任交易所。',
  },
  {
    term: 'DEX',
    definition: 'DEX（Decentralized Exchange，去中心化交易所）如Uniswap、PancakeSwap，通过智能合约直接交易，用户控制私钥。无需注册但需承担Gas费和合约风险。',
  },
  {
    term: '挂单',
    definition: '挂单（Limit Order）是指设定买入或卖出价格，等待市场价格达到时自动成交。相比市价单，挂单可以获得更好的价格，但可能不成交。',
  },
  {
    term: '止损',
    definition: '止损是指设定价格下限，跌破时自动卖出以限制损失。是风险管理的重要工具，可以避免因贪心或犹豫导致更大损失。',
  },
]

/**
 * 生成OpenAI嵌入向量
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    throw error
  }
}

/**
 * 向量化并存储术语
 */
async function embedTerm(term: string, definition: string) {
  console.log(`  Processing: ${term}`)
  
  // 组合术语和定义作为嵌入文本
  const textToEmbed = `${term}: ${definition}`
  
  try {
    // 生成嵌入向量
    const embedding = await generateEmbedding(textToEmbed)
    
    // 存储到数据库（使用pgvector）
    await prisma.$executeRaw`
      INSERT INTO "Term" (id, term, definition, category, embedding, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${term},
        ${definition},
        'defi',
        ${JSON.stringify(embedding)}::vector(1536),
        NOW(),
        NOW()
      )
      ON CONFLICT (term) 
      DO UPDATE SET
        definition = EXCLUDED.definition,
        category = EXCLUDED.category,
        embedding = EXCLUDED.embedding,
        "updatedAt" = NOW()
    `
    
    console.log(`  ✓ ${term} embedded successfully`)
  } catch (error) {
    console.error(`  ✗ Failed to embed ${term}:`, error)
    throw error
  }
}

/**
 * 批量处理术语
 */
async function main() {
  console.log('🚀 Starting term embedding job...')
  console.log(`📊 Total terms to process: ${TERMS.length}`)
  
  const startTime = Date.now()
  let successCount = 0
  let failCount = 0
  
  try {
    // 确保pgvector扩展已启用
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`
    console.log('✓ pgvector extension enabled')
    
    // 批量处理（限制并发避免API限流）
    const batchSize = 5 // 每批5个
    
    for (let i = 0; i < TERMS.length; i += batchSize) {
      const batch = TERMS.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(TERMS.length / batchSize)}`)
      
      await Promise.all(
        batch.map(async ({ term, definition }) => {
          try {
            await embedTerm(term, definition)
            successCount++
          } catch (error) {
            failCount++
            console.error(`Failed to process ${term}`)
          }
        })
      )
      
      // 延迟避免API限流
      if (i + batchSize < TERMS.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // 统计
    const duration = Date.now() - startTime
    console.log(`\n✨ Term embedding completed!`)
    console.log(`  Total: ${TERMS.length}`)
    console.log(`  Success: ${successCount}`)
    console.log(`  Failed: ${failCount}`)
    console.log(`  Duration: ${duration}ms`)
    
    // 记录任务
    await prisma.jobRun.create({
      data: {
        jobName: 'embed-terms',
        status: failCount === 0 ? 'success' : 'partial',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration,
        processed: TERMS.length,
        succeeded: successCount,
        failed: failCount,
      },
    })
  } catch (error) {
    console.error('❌ Term embedding failed:', error)
    
    await prisma.jobRun.create({
      data: {
        jobName: 'embed-terms',
        status: 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        processed: TERMS.length,
        succeeded: successCount,
        failed: failCount,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })
    
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
