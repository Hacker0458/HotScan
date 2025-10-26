export type Lang = 'zh' | 'en';

export const dict = {
  zh: {
    home: '首页',
    learn: '术语百科',
    dataFrom: '数据来源',
    filters: '筛选',
    updated: '刚刚更新',
    signals: '条信号',
    liquidity: '流动性',
    risk: '风险',
    low: '低风险',
    mid: '中风险',
    high: '高风险',
    priceChange: '价格变化',
    summaryNA: '暂无AI解读',
    hour: '1h',
    day: '24h',
    neutral: '中性',
  },
  en: {
    home: 'Home',
    learn: 'Learn',
    dataFrom: 'Data from',
    filters: 'Filters',
    updated: 'Updated just now',
    signals: 'signals',
    liquidity: 'Liquidity',
    risk: 'Risk',
    low: 'Low',
    mid: 'Medium',
    high: 'High',
    priceChange: 'Price change',
    summaryNA: 'No AI summary available',
    hour: '1h',
    day: '24h',
    neutral: 'neutral',
  }
} as const;

export function pickLang(input?: string | null): Lang {
  if (!input) return 'zh';
  const s = input.toLowerCase();
  if (s.startsWith('en')) return 'en';
  if (s.startsWith('zh')) return 'zh';
  return s === 'en' ? 'en' : 'zh';
}
