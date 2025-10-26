/**
 * Alert Checker
 * 
 * 定期检查用户设置的价格提醒并触发通知
 */

import { prisma } from './prisma'

export interface AlertCheckResult {
  alertId: string
  triggered: boolean
  message: string
  currentValue: number
  targetValue: number
}

/**
 * 检查所有活跃的提醒
 */
export async function checkAllAlerts(): Promise<AlertCheckResult[]> {
  console.log('[Alert Checker] Starting alert check...')
  
  // 获取所有启用的提醒
  const alerts = await prisma.alert.findMany({
    where: {
      enabled: true,
      triggered: false // 只检查未触发的
    },
    include: {
      asset: {
        include: {
          pairs: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  })
  
  const results: AlertCheckResult[] = []
  
  for (const alert of alerts) {
    try {
      const result = await checkSingleAlert(alert)
      results.push(result)
      
      // 如果触发了，更新提醒状态
      if (result.triggered) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            triggered: true,
            lastTriggered: new Date(),
            triggerCount: { increment: 1 }
          }
        })
        
        // 发送通知
        await sendNotification(alert, result)
      }
    } catch (error) {
      console.error(`[Alert Checker] Error checking alert ${alert.id}:`, error)
    }
  }
  
  console.log(`[Alert Checker] Checked ${alerts.length} alerts, ${results.filter(r => r.triggered).length} triggered`)
  
  return results
}

/**
 * 检查单个提醒
 */
async function checkSingleAlert(alert: any): Promise<AlertCheckResult> {
  const asset = alert.asset
  const latestPair = asset.pairs[0]
  
  if (!latestPair) {
    return {
      alertId: alert.id,
      triggered: false,
      message: 'No price data available',
      currentValue: 0,
      targetValue: alert.targetValue || 0
    }
  }
  
  const currentPrice = latestPair.priceUsd || 0
  const change1h = latestPair.priceChange1h || 0
  const change24h = latestPair.priceChange24h || 0
  
  let triggered = false
  let message = ''
  let currentValue = 0
  
  switch (alert.alertType) {
    case 'price_above':
      currentValue = currentPrice
      triggered = currentPrice >= (alert.targetValue || Infinity)
      message = triggered 
        ? `${asset.symbol} price reached $${currentPrice.toFixed(6)} (target: $${alert.targetValue?.toFixed(6)})`
        : 'Not triggered'
      break
      
    case 'price_below':
      currentValue = currentPrice
      triggered = currentPrice <= (alert.targetValue || 0)
      message = triggered
        ? `${asset.symbol} price dropped to $${currentPrice.toFixed(6)} (target: $${alert.targetValue?.toFixed(6)})`
        : 'Not triggered'
      break
      
    case 'change_pct_up':
      const changeUp = alert.timeWindow === '24h' ? change24h : change1h
      currentValue = changeUp
      triggered = changeUp >= (alert.targetValue || Infinity)
      message = triggered
        ? `${asset.symbol} ${alert.timeWindow || '1h'} gain: +${changeUp.toFixed(2)}% (target: +${alert.targetValue?.toFixed(2)}%)`
        : 'Not triggered'
      break
      
    case 'change_pct_down':
      const changeDown = alert.timeWindow === '24h' ? change24h : change1h
      currentValue = changeDown
      triggered = changeDown <= -(alert.targetValue || 0)
      message = triggered
        ? `${asset.symbol} ${alert.timeWindow || '1h'} drop: ${changeDown.toFixed(2)}% (target: -${alert.targetValue?.toFixed(2)}%)`
        : 'Not triggered'
      break
      
    case 'risk_level_change':
      // 获取最新的信号风险评分
      const latestSignal = await prisma.signal.findFirst({
        where: { assetId: asset.id },
        orderBy: { createdAt: 'desc' }
      })
      
      const riskScore = latestSignal?.riskScore || 0
      currentValue = riskScore
      
      // 风险等级变化检测（从低到高，或从高到低）
      const oldLevel = getRiskLevel(alert.targetValue || 40)
      const newLevel = getRiskLevel(riskScore)
      triggered = oldLevel !== newLevel
      message = triggered
        ? `${asset.symbol} risk level changed: ${oldLevel} → ${newLevel} (score: ${riskScore})`
        : 'Not triggered'
      break
      
    default:
      message = 'Unknown alert type'
  }
  
  return {
    alertId: alert.id,
    triggered,
    message,
    currentValue,
    targetValue: alert.targetValue || 0
  }
}

/**
 * 获取风险等级
 */
function getRiskLevel(score: number): string {
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

/**
 * 发送通知
 */
async function sendNotification(alert: any, result: AlertCheckResult): Promise<void> {
  console.log(`[Alert Notification] Sending notification for alert ${alert.id}`)
  console.log(`  User: ${alert.user.email}`)
  console.log(`  Message: ${result.message}`)
  
  // 浏览器推送通知（需要前端实现Web Push API）
  if (alert.notifyBrowser) {
    // TODO: 实现浏览器推送通知
    // 这需要前端注册Service Worker和Push Subscription
    console.log('  [Browser Push] Not yet implemented')
  }
  
  // 邮件通知
  if (alert.notifyEmail && alert.user.email) {
    try {
      // TODO: 集成邮件服务（如Resend、SendGrid）
      // await sendEmail({
      //   to: alert.user.email,
      //   subject: `Alert: ${alert.asset.symbol}`,
      //   text: result.message
      // })
      console.log(`  [Email] Would send to ${alert.user.email}`)
    } catch (error) {
      console.error('[Alert Notification] Email send error:', error)
    }
  }
}

/**
 * 重置所有已触发的提醒（使其可以再次触发）
 */
export async function resetTriggeredAlerts(olderThan: Date): Promise<number> {
  const result = await prisma.alert.updateMany({
    where: {
      triggered: true,
      lastTriggered: {
        lt: olderThan
      }
    },
    data: {
      triggered: false
    }
  })
  
  console.log(`[Alert Reset] Reset ${result.count} alerts`)
  return result.count
}

/**
 * 清理过期提醒（超过30天未触发的禁用提醒）
 */
export async function cleanupOldAlerts(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const result = await prisma.alert.deleteMany({
    where: {
      enabled: false,
      updatedAt: {
        lt: thirtyDaysAgo
      }
    }
  })
  
  console.log(`[Alert Cleanup] Deleted ${result.count} old alerts`)
  return result.count
}

