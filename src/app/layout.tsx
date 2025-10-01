import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HotScan｜热点雷达 - AI驱动的热点新闻聚合分析平台',
  description: '实时追踪全球热点话题，AI智能分析，为您提供最有价值的信息洞察。',
  keywords: '热点新闻,趋势分析,AI分析,新闻聚合,实时热点',
  authors: [{ name: 'HotScan Team' }],
  openGraph: {
    title: 'HotScan｜热点雷达',
    description: '实时追踪全球热点话题，AI智能分析',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
