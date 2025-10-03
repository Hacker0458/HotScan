import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充数据库...')

  // 清空现有数据（可选）
  console.log('🗑️  清理现有数据...')
  await prisma.signal.deleteMany()
  await prisma.pair.deleteMany()
  await prisma.share.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.term.deleteMany()

  // ============================================
  // 创建 Assets（加密资产）
  // ============================================
  console.log('📊 创建资产数据...')

  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        symbol: 'BTC',
        name: 'Bitcoin',
        chain: 'bitcoin',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        decimals: 8,
      },
    }),
    prisma.asset.create({
      data: {
        symbol: 'ETH',
        name: 'Ethereum',
        chain: 'ethereum',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        decimals: 18,
      },
    }),
    prisma.asset.create({
      data: {
        symbol: 'PEPE',
        name: 'Pepe',
        chain: 'ethereum',
        logo: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
        decimals: 18,
      },
    }),
    prisma.asset.create({
      data: {
        symbol: 'SOL',
        name: 'Solana',
        chain: 'solana',
        logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
        decimals: 9,
      },
    }),
    prisma.asset.create({
      data: {
        symbol: 'DOGE',
        name: 'Dogecoin',
        chain: 'dogecoin',
        logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
        decimals: 8,
      },
    }),
  ])

  console.log(`✅ 创建了 ${assets.length} 个资产`)

  // ============================================
  // 创建 Pairs（交易对）
  // ============================================
  console.log('💱 创建交易对数据...')

  const pairs = await Promise.all([
    prisma.pair.create({
      data: {
        assetId: assets[1].id, // ETH
        dexId: 'uniswap-v3',
        dex: 'uniswap-v3',
        pairAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        chainId: 'ethereum',
        liquidityUSD: 125000000,
        baseToken: 'USDC',
        fee: 0.05,
      },
    }),
    prisma.pair.create({
      data: {
        assetId: assets[2].id, // PEPE
        dexId: 'uniswap-v2',
        dex: 'uniswap-v2',
        pairAddress: '0xa43fe16908251ee70ef74718545e4fe6c5ccec9f',
        address: '0xa43fe16908251ee70ef74718545e4fe6c5ccec9f',
        chainId: 'ethereum',
        liquidityUSD: 28500000,
        baseToken: 'WETH',
        fee: 0.3,
      },
    }),
    prisma.pair.create({
      data: {
        assetId: assets[3].id, // SOL
        dexId: 'raydium',
        dex: 'raydium',
        pairAddress: 'EGZ7tiLeH62TPV1gL8WwbXGzEPa9zmcpVnnkPKKnrE2U',
        address: 'EGZ7tiLeH62TPV1gL8WwbXGzEPa9zmcpVnnkPKKnrE2U',
        chainId: 'solana',
        liquidityUSD: 45000000,
        baseToken: 'USDC',
        fee: 0.25,
      },
    }),
  ])

  console.log(`✅ 创建了 ${pairs.length} 个交易对`)

  // ============================================
  // 创建 Signals（交易信号）
  // ============================================
  console.log('📡 创建交易信号数据...')

  const signals = await Promise.all([
    // ETH 5分钟信号
    prisma.signal.create({
      data: {
        assetId: assets[1].id,
        window: '5m',
        priceChangePct: 2.34,
        currentPrice: 3245.67,
        volZScore: 2.8,
        volumeUSD: 1250000,
        liqDeltaPct: 1.2,
        totalLiquidityUSD: 125000000,
        top5HoldPct: 15.6,
        holderCount: 1234567,
        newWalletNetBuy: 45000,
        newWalletCount: 234,
        riskScore: 35.5,
        contractAgeDays: 2920,
        sentiment: 'bullish',
        aiSummary: 'ETH显示强劲的买入压力，成交量异常放大，新钱包净买入增加',
        alertLevel: 'medium',
      },
    }),
    // PEPE 15分钟信号
    prisma.signal.create({
      data: {
        assetId: assets[2].id,
        window: '15m',
        priceChangePct: 8.95,
        currentPrice: 0.000001234,
        volZScore: 4.2,
        volumeUSD: 5800000,
        liqDeltaPct: 3.8,
        totalLiquidityUSD: 28500000,
        top5HoldPct: 42.3,
        holderCount: 89456,
        newWalletNetBuy: 128000,
        newWalletCount: 567,
        riskScore: 68.5,
        contractAgeDays: 365,
        sentiment: 'bullish',
        aiSummary: 'PEPE出现暴涨信号，成交量激增，但需注意高风险和集中持仓',
        alertLevel: 'high',
      },
    }),
    // SOL 1小时信号
    prisma.signal.create({
      data: {
        assetId: assets[3].id,
        window: '1h',
        priceChangePct: -1.23,
        currentPrice: 98.45,
        volZScore: 0.8,
        volumeUSD: 890000,
        liqDeltaPct: -0.5,
        totalLiquidityUSD: 45000000,
        top5HoldPct: 28.9,
        holderCount: 567890,
        newWalletNetBuy: -12000,
        newWalletCount: 89,
        riskScore: 42.0,
        contractAgeDays: 1460,
        sentiment: 'neutral',
        aiSummary: 'SOL小幅回调，成交量正常，流动性略有下降',
        alertLevel: 'low',
      },
    }),
    // BTC 4小时信号
    prisma.signal.create({
      data: {
        assetId: assets[0].id,
        window: '4h',
        priceChangePct: 1.56,
        currentPrice: 67234.50,
        volZScore: 1.2,
        volumeUSD: 2340000000,
        liqDeltaPct: 0.8,
        totalLiquidityUSD: 850000000,
        top5HoldPct: 8.5,
        holderCount: 45678901,
        newWalletNetBuy: 340000,
        newWalletCount: 1234,
        riskScore: 25.0,
        contractAgeDays: 5475,
        sentiment: 'bullish',
        aiSummary: 'BTC稳健上涨，机构资金持续流入，风险较低',
        alertLevel: 'low',
      },
    }),
    // DOGE 1天信号
    prisma.signal.create({
      data: {
        assetId: assets[4].id,
        window: '1d',
        priceChangePct: -3.45,
        currentPrice: 0.0876,
        volZScore: -0.5,
        volumeUSD: 450000000,
        liqDeltaPct: -1.2,
        totalLiquidityUSD: 320000000,
        top5HoldPct: 35.6,
        holderCount: 5678901,
        newWalletNetBuy: -78000,
        newWalletCount: 234,
        riskScore: 55.5,
        contractAgeDays: 3650,
        sentiment: 'bearish',
        aiSummary: 'DOGE下跌，成交量萎缩，新钱包净卖出',
        alertLevel: 'medium',
      },
    }),
  ])

  console.log(`✅ 创建了 ${signals.length} 个交易信号`)

  // ============================================
  // 创建 Terms（金融术语）
  // ============================================
  console.log('📚 创建术语数据...')

  const terms = await Promise.all([
    prisma.term.create({
      data: {
        term: 'Liquidity Pool',
        definition:
          '流动性池是 DeFi 中的智能合约，包含锁定的代币对，用于促进去中心化交易。用户可以将资产存入池中成为流动性提供者（LP），并赚取交易手续费。',
        category: 'defi',
        example:
          '例如，在 Uniswap 的 ETH/USDC 池中，用户存入等值的 ETH 和 USDC，其他用户可以在该池中进行代币交换，LP 获得 0.3% 的手续费分成。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Impermanent Loss',
        definition:
          '无常损失是指流动性提供者在向 AMM 池提供流动性时，相比简单持有代币可能产生的损失。当池中代币价格发生变化时会产生这种损失。',
        category: 'defi',
        example:
          '假设你在 1 ETH = 2000 USDC 时提供了流动性。如果 ETH 涨到 4000 USDC，你从池中提取的资产价值会少于直接持有的价值，这就是无常损失。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Slippage',
        definition:
          '滑点是指预期交易价格与实际执行价格之间的差异。在流动性不足或大额交易时，滑点会更明显。',
        category: 'trading',
        example:
          '你想以 2000 USDC 买入 1 ETH，但由于流动性有限，实际成交价可能是 2010 USDC，这 10 USDC 的差异就是滑点。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Gas Fee',
        definition:
          'Gas 费是在区块链上执行交易或智能合约所需支付的费用，用于激励矿工/验证者处理和验证交易。',
        category: 'blockchain',
        example:
          '在以太坊上进行一笔 Uniswap 交易，你可能需要支付 5-50 美元的 Gas 费，具体取决于网络拥堵程度。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Smart Contract',
        definition:
          '智能合约是存储在区块链上的自动执行程序，当预定条件满足时自动执行协议条款，无需中介。',
        category: 'blockchain',
        example:
          'Uniswap 的交易池就是一个智能合约，当用户发起交易时，合约自动计算汇率并执行代币交换。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'AMM',
        definition:
          '自动做市商（Automated Market Maker）是一种去中心化交易协议，使用数学公式（如恒定乘积公式 x*y=k）来定价资产，而不是传统的订单簿。',
        category: 'defi',
        example:
          'Uniswap 使用 AMM 模型，通过 x*y=k 公式自动计算交易价格，无需中心化的订单撮合。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'TVL',
        definition:
          '总锁仓价值（Total Value Locked）是衡量 DeFi 协议规模的指标，表示锁定在协议中的所有资产的总美元价值。',
        category: 'defi',
        example:
          '如果一个借贷协议中锁定了价值 10 亿美元的各种代币，那么它的 TVL 就是 10 亿美元。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Whale',
        definition:
          '鲸鱼是指持有大量加密货币的个人或实体，他们的交易行为可能对市场价格产生重大影响。',
        category: 'trading',
        example:
          '一个持有 10,000 BTC 的地址被认为是 BTC 鲸鱼，当他们进行大额买卖时，可能引起市场波动。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Rug Pull',
        definition: 'Rug Pull 是一种骗局，项目方在募集资金后突然撤走流动性，导致投资者无法卖出代币。',
        category: 'defi',
        example: '某新代币在上线后吸引大量买入，突然开发者撤走所有流动性池资金消失，投资者损失惨重。',
      },
    }),
    prisma.term.create({
      data: {
        term: '流动性锁仓',
        definition: '流动性锁仓是指将 DEX 的流动性池代币锁定在智能合约中一段时间，防止项目方随意撤走流动性。',
        category: 'defi',
        example: '项目方将 Uniswap LP 代币锁仓 6 个月，增加投资者信心。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'DEX',
        definition: '去中心化交易所（Decentralized Exchange），通过智能合约实现点对点交易，用户保持资产托管权。',
        category: 'defi',
        example: 'Uniswap、PancakeSwap 是典型的 DEX，用户可以直接从钱包交易，无需 KYC。',
      },
    }),
    prisma.term.create({
      data: {
        term: '持币集中度',
        definition: '持币集中度衡量代币持有的分散程度，集中度高意味着少数地址控制大部分供应量。',
        category: 'trading',
        example: '如果前 10 个地址持有 80% 的代币，说明持币集中度很高，存在操纵风险。',
      },
    }),
    prisma.term.create({
      data: {
        term: '做市商',
        definition: '做市商提供买卖报价以提高市场流动性，在传统金融和加密市场中都扮演重要角色。',
        category: 'trading',
        example: '某交易所的做市商在 BTC/USDT 市场持续挂单买卖，缩小价差，提高交易效率。',
      },
    }),
    prisma.term.create({
      data: {
        term: '质押',
        definition: '质押（Staking）是指锁定代币以支持区块链网络运行或参与 DeFi 协议，获得奖励。',
        category: 'defi',
        example: '在以太坊 2.0 中质押 32 ETH 成为验证者，每年可获得约 4-5% 的质押奖励。',
      },
    }),
    prisma.term.create({
      data: {
        term: '闪电贷',
        definition: '闪电贷是一种无需抵押的 DeFi 借贷，要求在一笔交易内完成借款和还款。',
        category: 'defi',
        example: '用户通过闪电贷借入 100 万 USDT 进行套利，在同一交易中还款并赚取差价。',
      },
    }),
    prisma.term.create({
      data: {
        term: '蜜罐合约',
        definition: '蜜罐合约是恶意智能合约，表面正常但实际限制用户卖出代币，导致只能买不能卖。',
        category: 'defi',
        example: '某代币合约隐藏了只有创建者可以卖出的逻辑，普通用户买入后无法卖出。',
      },
    }),
    prisma.term.create({
      data: {
        term: '抢跑交易',
        definition: '抢跑交易（Front-running）是指监测待确认交易并提交更高 Gas 的交易抢先成交获利。',
        category: 'trading',
        example: '机器人发现有人要大额买入某代币，立即用更高 Gas 抢先买入，待价格上涨后卖出获利。',
      },
    }),
    prisma.term.create({
      data: {
        term: '代币经济学',
        definition: '代币经济学（Tokenomics）研究代币的供应、分配、激励机制等经济模型设计。',
        category: 'blockchain',
        example: 'BTC 总量 2100 万枚，每 4 年减半，这种通缩模型是其代币经济学的核心。',
      },
    }),
    prisma.term.create({
      data: {
        term: '通缩代币',
        definition: '通缩代币在每笔交易中销毁部分代币，减少总供应量以推动价格上涨。',
        category: 'blockchain',
        example: '某代币每笔交易销毁 2%，随着交易增加，流通供应持续减少。',
      },
    }),
    prisma.term.create({
      data: {
        term: '空投',
        definition: '空投是项目方向用户免费发放代币的营销方式，用于提高认知度和用户参与度。',
        category: 'blockchain',
        example: 'Uniswap 向早期用户空投 400 UNI 代币，价值数千美元。',
      },
    }),
    prisma.term.create({
      data: {
        term: 'Dev地址',
        definition: 'Dev 地址是项目开发者控制的钱包地址，其交易行为是重要的风险信号。',
        category: 'defi',
        example: '如果 Dev 地址频繁转移大量代币到交易所，可能是准备抛售的信号。',
      },
    }),
    prisma.term.create({
      data: {
        term: '新钱包',
        definition: '新钱包是指近期创建的区块链地址，其交易行为可用于分析市场情绪和资金流向。',
        category: 'trading',
        example: '大量新钱包在 24 小时内买入某代币，可能预示新一轮炒作开始。',
      },
    }),
    prisma.term.create({
      data: {
        term: '女巫攻击',
        definition: '女巫攻击是指单一实体创建多个虚假身份以获取不当利益，常见于空投和治理投票。',
        category: 'blockchain',
        example: '某用户创建 100 个钱包地址参与空投，试图获取 100 份奖励。',
      },
    }),
    prisma.term.create({
      data: {
        term: '套利',
        definition: '套利是利用不同市场或交易所的价格差异进行低买高卖以获取无风险利润。',
        category: 'trading',
        example: 'ETH 在交易所 A 价格 2000 USDT，在交易所 B 价格 2010 USDT，套利者买低卖高赚取差价。',
      },
    }),
    prisma.term.create({
      data: {
        term: '增发',
        definition: '增发是指增加代币供应量，可能通过挖矿奖励、质押奖励或直接铸造实现。',
        category: 'blockchain',
        example: '某项目每年增发 5% 代币作为质押奖励，导致总供应量逐年增加。',
      },
    }),
    prisma.term.create({
      data: {
        term: '拉高出货',
        definition: '拉高出货是指庄家或大户通过拉升价格吸引散户买入，然后在高位大量卖出获利。',
        category: 'trading',
        example: '某小币种在 1 小时内暴涨 200%，吸引散户追涨，随后庄家大量抛售，价格暴跌。',
      },
    }),
    prisma.term.create({
      data: {
        term: '预言机',
        definition: '预言机是连接区块链与外部世界的桥梁，为智能合约提供链外数据。',
        category: 'blockchain',
        example: 'Chainlink 预言机为 DeFi 协议提供实时价格数据，确保清算等操作的准确性。',
      },
    }),
  ])

  console.log(`✅ 创建了 ${terms.length} 个术语`)

  // ============================================
  // 创建 Shares（分享示例）
  // ============================================
  console.log('📱 创建分享数据...')

  const shares = await Promise.all([
    prisma.share.create({
      data: {
        assetId: assets[2].id, // PEPE
        title: 'PEPE 15分钟暴涨 8.95%',
        description: '成交量异常放大，新钱包净买入 $128K',
        shareType: 'signal',
        viewCount: 1234,
      },
    }),
    prisma.share.create({
      data: {
        assetId: assets[0].id, // BTC
        title: 'BTC 突破 $67K 关键阻力',
        description: '机构资金持续流入，风险评分低',
        shareType: 'analysis',
        viewCount: 5678,
      },
    }),
  ])

  console.log(`✅ 创建了 ${shares.length} 个分享`)

  // ============================================
  // 统计
  // ============================================
  console.log('\n📊 数据统计：')
  console.log(`   - 资产: ${assets.length}`)
  console.log(`   - 交易对: ${pairs.length}`)
  console.log(`   - 信号: ${signals.length}`)
  console.log(`   - 术语: ${terms.length}`)
  console.log(`   - 分享: ${shares.length}`)
  console.log('\n✨ 数据填充完成！')
}

main()
  .catch((e) => {
    console.error('❌ 数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })