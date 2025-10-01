/**
 * 统计函数
 */

import { prisma } from '@/lib/prisma'

export async function getAnalytics() {
  const [signals, assets, terms, shares, subs] = await Promise.all([
    prisma.signal.count().catch(() => 0),
    prisma.asset.count().catch(() => 0),
    prisma.term.count().catch(() => 0),
    prisma.share.count().catch(() => 0),
    prisma.subscription.count().catch(() => 0),
  ])
  
  return {
    signals,
    assets,
    terms,
    shares,
    subscriptions: subs,
  }
}

