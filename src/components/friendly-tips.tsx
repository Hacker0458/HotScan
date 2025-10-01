/**
 * 友好提示组件
 * 
 * 用于AI摘要区、详情页等位置显示友好提示
 */

import { AlertTriangle, Info, Clock, Users, Flame } from 'lucide-react'

interface FriendlyTipsProps {
  type: 'default' | 'high-risk' | 'new-contract' | 'concentrated' | 'data-delay'
  riskScore?: number
  riskFactors?: string[]
  contractAgeDays?: number
  top5HoldPct?: number
  updateTime?: Date
  language?: 'cn' | 'en'
}

export function FriendlyTips({
  type,
  riskScore,
  riskFactors = [],
  contractAgeDays,
  top5HoldPct,
  updateTime,
  language = 'cn',
}: FriendlyTipsProps) {
  // 默认提示
  if (type === 'default') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-blue-300">
              {language === 'cn' ? (
                <>
                  本摘要基于链上数据和算法分析生成，<strong>仅供参考</strong>，
                  不构成任何投资建议。
                </>
              ) : (
                <>
                  This summary is generated from on-chain data and algorithms.{' '}
                  <strong>For reference only</strong>, not financial advice.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 高风险警告
  if (type === 'high-risk' && riskScore) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-red-300 font-semibold mb-2">
              {language === 'cn' ? '⚠️ 极高风险资产' : '⚠️ Very High Risk Asset'}
            </p>
            <p className="text-red-200 mb-2">
              {language === 'cn'
                ? `该资产风险分数为 ${riskScore}/100，存在以下高风险因素：`
                : `Risk score: ${riskScore}/100. High-risk factors include:`}
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-200 ml-2">
              {riskFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
            <p className="text-red-300 font-medium mt-3">
              {language === 'cn'
                ? '请谨慎对待，切勿投入超出承受能力的资金。'
                : 'Exercise extreme caution. Never invest more than you can afford to lose.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 新合约警告
  if (type === 'new-contract' && contractAgeDays !== undefined) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-orange-300 font-semibold mb-2">
              {language === 'cn'
                ? `🆕 新上线合约（${contractAgeDays}天）`
                : `🆕 New Contract (${contractAgeDays} days old)`}
            </p>
            <p className="text-orange-200">
              {language === 'cn'
                ? '该代币刚上线不久，历史数据有限，存在较高不确定性。'
                : 'Recently launched with limited history. Higher uncertainty.'}
            </p>
            <p className="text-orange-300 font-medium mt-2">
              {language === 'cn' ? '⚠️ 警惕 Rug Pull 风险' : '⚠️ Beware of Rug Pull risk'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 持币集中度警告
  if (type === 'concentrated' && top5HoldPct !== undefined) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-yellow-300 font-semibold mb-2">
              {language === 'cn'
                ? `👥 持币高度集中（前5持有 ${top5HoldPct.toFixed(1)}%）`
                : `👥 Highly Concentrated (${top5HoldPct.toFixed(1)}% held by top 5)`}
            </p>
            <p className="text-yellow-200 mb-2">
              {language === 'cn'
                ? '少数大户可能操纵价格，存在"砸盘"风险。'
                : 'Few whales can manipulate price. Risk of dump.'}
            </p>
            <p className="text-yellow-300">
              {language === 'cn'
                ? '💡 建议：小额试探，设置止损'
                : '💡 Tip: Small position, set stop-loss'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 数据延迟提示
  if (type === 'data-delay' && updateTime) {
    const formattedTime = updateTime.toLocaleString(language === 'cn' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="text-slate-300">
              {language === 'cn' ? (
                <>
                  <strong>数据更新时间：</strong>
                  {formattedTime}
                  <br />
                  链上数据可能存在 5-15 分钟延迟，请结合实时行情判断。
                </>
              ) : (
                <>
                  <strong>Data updated:</strong> {formattedTime}
                  <br />
                  On-chain data may have 5-15 min delay. Cross-check with real-time prices.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * 使用示例：
 * 
 * // 默认提示
 * <FriendlyTips type="default" />
 * 
 * // 高风险警告
 * <FriendlyTips 
 *   type="high-risk" 
 *   riskScore={85}
 *   riskFactors={['合约上线仅3天', '前5钱包持有72%', '流动性未锁仓']}
 * />
 * 
 * // 新合约警告
 * <FriendlyTips 
 *   type="new-contract" 
 *   contractAgeDays={3}
 * />
 * 
 * // 持币集中度警告
 * <FriendlyTips 
 *   type="concentrated" 
 *   top5HoldPct={72.5}
 * />
 * 
 * // 数据延迟提示
 * <FriendlyTips 
 *   type="data-delay" 
 *   updateTime={new Date()}
 * />
 */

