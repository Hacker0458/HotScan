/**
 * Job: Fetch Tickers
 * 
 * 功能：从 DexScreener 获取加密货币交易对数据
 * 运行频率：每 30 分钟
 * 
 * 数据源：DexScreener API
 */

import { prisma } from '@/lib/prisma'
import { getDataSource } from '@/lib/datasources/dexscreener'

// 主流代币列表（可配置）
const TRACKED_SYMBOLS = [
  'BTC',   // Bitcoin
  'ETH',   // Ethereum
  'SOL',   // Solana
  'BNB',   // Binance Coin
  'DOGE',  // Dogecoin
  'PEPE',  // Pepe
  'SHIB',  // Shiba Inu
  'MATIC', // Polygon
  'AVAX',  // Avalanche
  'LINK',  // Chainlink
]

/**
 * Main job function
 */
export async function fetchTickers() {
  const startTime = Date.now()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Fetch Tickers Job Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Tracking ${TRACKED_SYMBOLS.length} symbols:`, TRACKED_SYMBOLS.join(', '))

  try {
    // 获取数据源
    const dataSource = getDataSource()
    
    // 拉取数据
    console.log('\n📡 Fetching data from DexScreener...')
    const tokenData = await dataSource.fetchRecent(TRACKED_SYMBOLS)
    
    console.log(`\n✅ Fetched ${tokenData.length}/${TRACKED_SYMBOLS.length} tokens`)
    
    // 更新数据库
    let assetsCreated = 0
    let assetsUpdated = 0
    let pairsCreated = 0
    
    for (const token of tokenData) {
      try {
        // 1. 创建或更新 Asset
        const asset = await prisma.asset.upsert({
          where: { symbol: token.symbol },
          create: {
            symbol: token.symbol,
            name: token.name,
            chain: token.chain,
            decimals: 18, // 默认
          },
          update: {
            name: token.name,
            chain: token.chain,
          },
        })
        
        if (asset.createdAt.getTime() === asset.updatedAt.getTime()) {
          assetsCreated++
        } else {
          assetsUpdated++
        }
        
        // 2. 创建或更新 Pair（存储流动性数据）
        const pairAddress = `${token.chain}:${token.symbol.toLowerCase()}`
        
        await prisma.pair.upsert({
          where: { 
            assetId_dex_address: {
              assetId: asset.id,
              dex: 'DexScreener',
              address: pairAddress,
            },
          },
          create: {
            assetId: asset.id,
            dex: 'DexScreener',
            address: pairAddress,
            liquidityUSD: token.liquidity,
          },
          update: {
            liquidityUSD: token.liquidity,
          },
        })
        
        pairsCreated++
        
        console.log(
          `  ✓ ${token.symbol}: $${token.price.toFixed(6)}, ` +
          `Liq: $${token.liquidity.toLocaleString()}, ` +
          `Vol(24h): $${token.volume.h24.toLocaleString()}`
        )
      } catch (error) {
        console.error(`  ✗ Error processing ${token.symbol}:`, error)
      }
    }
    
    const duration = Date.now() - startTime
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Fetch Tickers Job Completed')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Assets: ${assetsCreated} created, ${assetsUpdated} updated`)
    console.log(`💱 Pairs: ${pairsCreated} created/updated`)
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log('')

    return {
      success: true,
      assetsCreated,
      assetsUpdated,
      pairsCreated,
      duration,
    }
  } catch (error: any) {
    console.error('\n❌ Fetch Tickers Job Failed:', error.message)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  fetchTickers()
    .then(() => {
      console.log('✨ Job finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Job failed with error:', error)
      process.exit(1)
    })
}
