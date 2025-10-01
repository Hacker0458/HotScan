/**
 * AI 摘要生成器
 * 
 * 基于结构化指标客观描述，不给投资建议
 */

import type { Asset, Signal } from '@prisma/client'

export interface SummaryOutput {
  cn: string  // 中文摘要 ≤120字
  en: string  // 英文摘要 ≤15词
}

/**
 * 生成AI摘要
 * 
 * @param signal - 信号数据
 * @param asset - 资产数据
 * @returns 中英文摘要
 */
export function makeAiSummary(
  signal: Signal,
  asset: Pick<Asset, 'name' | 'symbol'>
): SummaryOutput {
  // 构建中文摘要
  const cn = buildChineseSummary(signal, asset)
  
  // 构建英文摘要
  const en = buildEnglishSummary(signal, asset)
  
  return { cn, en }
}

/**
 * 构建中文摘要
 */
function buildChineseSummary(
  signal: Signal,
  asset: Pick<Asset, 'name' | 'symbol'>
): string {
  const parts: string[] = []
  
  // 1. 名称和基本信息
  const name = asset.name || asset.symbol
  parts.push(`「${name}」`)
  
  // 2. 窗口和涨跌幅
  const windowText = formatWindow(signal.window)
  const priceChangeText = formatPriceChange(signal.priceChangePct)
  parts.push(`${windowText}${priceChangeText}`)
  
  // 3. 成交量等级
  const volumeText = formatVolumeLevel(signal.volZScore)
  parts.push(`成交量${volumeText}`)
  
  // 4. 流动性变化
  const liquidityText = formatLiquidityChange(signal.liqDeltaPct)
  parts.push(`流动性${liquidityText}`)
  
  // 5. 合约年龄和持仓集中度
  const contractText = `合约${signal.contractAgeDays || 0}天`
  const holdingText = `前5钱包${(signal.top5HoldPct || 0).toFixed(1)}%`
  parts.push(`${contractText}，${holdingText}`)
  
  // 6. 新钱包活动
  const walletText = formatWalletActivity(signal.newWalletNetBuy, signal.newWalletCount)
  parts.push(walletText)
  
  // 7. 风险评分和关键风险点
  const riskText = formatRiskInfo(signal.riskScore)
  parts.push(riskText)
  
  // 组合成完整摘要
  let summary = parts.join('，') + '。'
  
  // 8. 添加风险警告（如果需要）
  const warningText = getRiskWarning(signal.riskScore)
  if (warningText) {
    summary += warningText
  }
  
  // 9. 确保长度 ≤120字
  if (summary.length > 120) {
    summary = summary.substring(0, 117) + '...'
  }
  
  return summary
}

/**
 * 构建英文摘要
 */
function buildEnglishSummary(
  signal: Signal,
  asset: Pick<Asset, 'name' | 'symbol'>
): string {
  const parts: string[] = []
  
  // 1. 资产名称
  parts.push(asset.symbol)
  
  // 2. 价格变化
  const priceChange = signal.priceChangePct || 0
  if (priceChange >= 0) {
    parts.push(`+${priceChange.toFixed(1)}%`)
  } else {
    parts.push(`${priceChange.toFixed(1)}%`)
  }
  
  // 3. 成交量描述
  const volLevel = getVolumeLevelEn(signal.volZScore)
  parts.push(volLevel)
  
  // 4. 风险等级
  const riskLevel = getRiskLevelEn(signal.riskScore)
  parts.push(`Risk: ${riskLevel}`)
  
  // 组合成完整摘要
  let summary = parts.join(', ')
  
  // 确保 ≤15词
  const words = summary.split(/\s+/)
  if (words.length > 15) {
    summary = words.slice(0, 15).join(' ')
  }
  
  return summary
}

/**
 * 格式化时间窗口
 */
function formatWindow(window: string): string {
  const windowMap: Record<string, string> = {
    '5m': '5分钟',
    '15m': '15分钟',
    '30m': '30分钟',
    '1h': '1小时',
    '4h': '4小时',
    '1d': '24小时',
  }
  return windowMap[window] || window
}

/**
 * 格式化价格变化
 */
function formatPriceChange(priceChangePct: number): string {
  const absChange = Math.abs(priceChangePct || 0)
  
  if ((priceChangePct || 0) > 0) {
    return `涨${absChange.toFixed(1)}%`
  } else if ((priceChangePct || 0) < 0) {
    return `跌${absChange.toFixed(1)}%`
  } else {
    return '持平'
  }
}

/**
 * 格式化成交量等级
 */
function formatVolumeLevel(volZScore: number): string {
  if (volZScore >= 5) return '极高（5σ+）'
  if (volZScore >= 3) return '异常（3σ+）'
  if (volZScore >= 2) return '偏高（2σ+）'
  if (volZScore >= 1) return '正常偏高'
  if (volZScore >= 0) return '正常'
  if (volZScore >= -1) return '正常偏低'
  if (volZScore >= -2) return '偏低'
  return '低迷'
}

/**
 * 格式化流动性变化
 */
function formatLiquidityChange(liqDeltaPct: number): string {
  const absChange = Math.abs(liqDeltaPct)
  
  if (absChange >= 50) {
    return liqDeltaPct > 0 ? '大幅增加' : '大幅减少'
  }
  if (absChange >= 20) {
    return liqDeltaPct > 0 ? '显著增加' : '显著减少'
  }
  if (absChange >= 10) {
    return liqDeltaPct > 0 ? '增加' : '减少'
  }
  if (absChange >= 5) {
    return liqDeltaPct > 0 ? '小幅增加' : '小幅减少'
  }
  return '基本稳定'
}

/**
 * 格式化钱包活动
 */
function formatWalletActivity(netBuy: number, walletCount?: number | null): string {
  const netBuyAbs = Math.abs(netBuy)
  
  // 格式化金额
  let amountText = ''
  if (netBuyAbs >= 1_000_000) {
    amountText = `${(netBuyAbs / 1_000_000).toFixed(1)}M`
  } else if (netBuyAbs >= 1_000) {
    amountText = `${(netBuyAbs / 1_000).toFixed(1)}K`
  } else {
    amountText = `${netBuyAbs.toFixed(0)}`
  }
  
  const direction = netBuy >= 0 ? '买入' : '卖出'
  const walletText = walletCount ? `（${walletCount}个新钱包）` : ''
  
  return `新钱包净${direction}$${amountText}${walletText}`
}

/**
 * 格式化风险信息
 */
function formatRiskInfo(riskScore: number): string {
  // 确定风险等级
  const level = getRiskLevel(riskScore)
  
  // 获取关键风险点
  const keyRisk = getKeyRisk(riskScore)
  
  return `风险分${riskScore}/100，注意${keyRisk}`
}

/**
 * 获取风险等级
 */
function getRiskLevel(riskScore: number): string {
  if (riskScore >= 75) return '极高风险'
  if (riskScore >= 50) return '高风险'
  if (riskScore >= 25) return '中等风险'
  return '低风险'
}

/**
 * 获取关键风险点
 */
function getKeyRisk(riskScore: number): string {
  // 基于风险分数推断主要风险
  if (riskScore >= 75) {
    return '多项高危因素'
  }
  if (riskScore >= 60) {
    return '持仓高度集中'
  }
  if (riskScore >= 45) {
    return '流动性风险'
  }
  if (riskScore >= 25) {
    return '合约较新'
  }
  if (riskScore >= 20) {
    return '存在一定风险'
  }
  return '整体风险可控'
}

/**
 * 获取风险警告文本
 */
function getRiskWarning(riskScore: number): string {
  if (riskScore >= 75) {
    return '【极高风险】'
  }
  if (riskScore >= 50) {
    return '【高风险】'
  }
  return ''
}

/**
 * 获取成交量等级（英文）
 */
function getVolumeLevelEn(volZScore: number): string {
  if (volZScore >= 5) return 'vol extreme'
  if (volZScore >= 3) return 'vol surge'
  if (volZScore >= 2) return 'vol high'
  if (volZScore >= 1) return 'vol above avg'
  if (volZScore >= 0) return 'vol normal'
  return 'vol low'
}

/**
 * 获取风险等级（英文）
 */
function getRiskLevelEn(riskScore: number): string {
  if (riskScore >= 75) return 'Critical'
  if (riskScore >= 50) return 'High'
  if (riskScore >= 25) return 'Medium'
  return 'Low'
}

/**
 * 验证摘要是否包含主观词汇
 * 
 * @param summary - 摘要文本
 * @returns 是否包含主观词汇
 */
export function containsSubjectiveWords(summary: string): boolean {
  const subjectiveWords = [
    '抄底', '梭哈', '冲', '起飞', '登月', '暴富', '财富密码',
    '必涨', '必跌', '稳赚', '推荐', '建议', '买入', '卖出',
    '强烈推荐', '立即', '马上', '赶紧', '错过', '后悔',
    '牛逼', '牛B', '牛市', '熊市', '割肉', '套牢',
    '暴涨', '暴跌', '翻倍', '归零', '跑路',
  ]
  
  return subjectiveWords.some(word => summary.includes(word))
}

/**
 * 清理主观词汇
 * 
 * @param summary - 摘要文本
 * @returns 清理后的摘要
 */
export function sanitizeSummary(summary: string): string {
  const replacements: Record<string, string> = {
    '抄底': '低位',
    '梭哈': '大量买入',
    '冲': '上涨',
    '起飞': '快速上涨',
    '登月': '大幅上涨',
    '暴富': '获利',
    '财富密码': '机会',
    '必涨': '可能上涨',
    '必跌': '可能下跌',
    '稳赚': '存在机会',
    '推荐': '关注',
    '建议': '提示',
    '买入': '净流入',
    '卖出': '净流出',
    '强烈推荐': '值得关注',
    '立即': '当前',
    '马上': '当前',
    '赶紧': '及时',
    '错过': '未参与',
    '后悔': '遗憾',
    '牛逼': '强势',
    '牛B': '强势',
    '牛市': '上涨趋势',
    '熊市': '下跌趋势',
    '割肉': '止损',
    '套牢': '被套',
    '暴涨': '大涨',
    '暴跌': '大跌',
    '翻倍': '涨幅100%',
    '归零': '跌至极低',
    '跑路': '流动性撤出',
  }
  
  let sanitized = summary
  for (const [subjective, objective] of Object.entries(replacements)) {
    sanitized = sanitized.replace(new RegExp(subjective, 'g'), objective)
  }
  
  return sanitized
}

/**
 * 生成安全的AI摘要（自动清理主观词汇）
 * 
 * @param signal - 信号数据
 * @param asset - 资产数据
 * @returns 中英文摘要
 */
export function makeSafeSummary(
  signal: Signal,
  asset: Pick<Asset, 'name' | 'symbol'>
): SummaryOutput {
  const summary = makeAiSummary(signal, asset)
  
  // 清理中文摘要中的主观词汇
  summary.cn = sanitizeSummary(summary.cn)
  
  return summary
}
