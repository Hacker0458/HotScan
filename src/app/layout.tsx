import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'HotScan - Real-time Crypto Market Signals',
    template: '%s | HotScan'
  },
  description: 'Real-time cryptocurrency market signal monitoring powered by DexScreener and AI analysis. Track liquidity, price changes, and risk scores.',
  keywords: ['crypto', 'cryptocurrency', 'trading', 'signals', 'DexScreener', 'market analysis', 'defi'],
  authors: [{ name: 'HotScan Team' }],
  openGraph: {
    title: 'HotScan - Real-time Crypto Market Signals',
    description: 'Monitor crypto market signals with AI-powered risk analysis',
    type: 'website',
    siteName: 'HotScan',
  },
  robots: {
    index: process.env.NEXT_PUBLIC_SEO_ENABLED !== 'false',
    follow: process.env.NEXT_PUBLIC_SEO_ENABLED !== 'false',
  }
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
