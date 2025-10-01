/**
 * 量化分析类型定义
 */

// ============================================
// 候选筛选输入
// ============================================

export interface CandidateInput {
  symbol: string
  assetId: string
  
  // 价格数据
  priceChange5m?: number    // 5分钟价格变化百分比
  priceChange15m?: number   // 15分钟价格变化百分比
  currentPrice: number
  
  // 成交量数据
  volume1h: number          // 1小时成交量
  volume24hMean: number     // 24小时平均成交量
  volume24hStdDev: number   // 24小时成交量标准差
  
  // 流动性数据
  liquidityNow: number      // 当前流动性
  liquidity1hAgo: number    // 1小时前流动性
  
  // 钱包活动
  newWalletNetBuy: number   // 新钱包净买入（USD）
  newWalletNetBuyPercentile?: number  // 在所有资产中的百分位
}

// ============================================
// 风险评分输入
// ============================================

export interface RiskInput {
  symbol: string
  
  // 合约信息
  contractAgeDays: number   // 合约年龄（天）
  
  // 持仓集中度
  top5HoldingPct: number    // 前5钱包持仓百分比
  
  // 流动性风险
  hasLiquidity: boolean     // 是否有流动性
  isLiquidityLocked: boolean // 流动性是否锁仓
  canRemoveLiquidity: boolean // 是否可撤池
  
  // 社媒和链上数据
  socialMentionSpike: boolean // 社媒提及突刺
  netInflowNegative: boolean  // 链上净流入为负
  
  // Dev 活动
  devAddressTrading: boolean  // Dev 地址参与交易
}

// ============================================
// 筛选结果
// ============================================

export interface CandidateResult {
  qualified: boolean
  score: number           // 0-4，满足的条件数量
  conditions: {
    priceVolatility: boolean    // 条件1
    volumeAnomaly: boolean      // 条件2
    liquidityGrowth: boolean    // 条件3
    walletActivity: boolean     // 条件4
  }
  details: {
    priceChange: number | null
    volumeZScore: number
    liquidityGrowthPct: number
    walletPercentile: number | null
  }
}

// ============================================
// 风险评分结果
// ============================================

export interface RiskResult {
  totalScore: number      // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  breakdown: {
    youngContract: number     // 0 or 20
    concentratedHolding: number // 0 or 25
    rugPullRisk: number       // 0 or 20
    fakePump: number          // 0 or 15
    insiderTrading: number    // 0 or 20
  }
  flags: string[]           // 风险标志列表
}

// ============================================
// 综合分析结果
// ============================================

export interface SignalAnalysis {
  symbol: string
  assetId: string
  window: string
  
  // 候选筛选
  candidate: CandidateResult
  
  // 风险评分
  risk: RiskResult
  
  // 综合判断
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'danger'
  
  // 元数据
  analyzedAt: Date
}
