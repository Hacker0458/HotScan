import type { Metadata } from 'next'
import { Activity, Database, Zap, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about HotScan - real-time crypto market signal monitoring.',
}

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">About HotScan</h1>
          <p className="text-xl text-muted-foreground">
            Real-time cryptocurrency market signal monitoring powered by AI and DexScreener data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <Activity className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Track cryptocurrency market signals with 30-second refresh intervals and instant updates.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <Database className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">DexScreener Data</h3>
            <p className="text-sm text-muted-foreground">
              Powered by DexScreener's comprehensive DEX market data across multiple blockchains.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <Zap className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered risk scoring and market sentiment analysis to help you make informed decisions.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <Shield className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive risk scoring based on liquidity, volatility, and market indicators.
            </p>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              ⚠️ <strong>Not Financial Advice:</strong> HotScan is a research and informational tool only.
              All data and analysis provided are for educational purposes and should not be considered
              as financial advice or investment recommendations.
            </p>
            <p className="mt-3">
              Cryptocurrency trading involves substantial risk of loss. Always do your own research (DYOR)
              and consult with qualified financial advisors before making investment decisions.
            </p>
            <p className="mt-3">
              Data is sourced from third-party providers and may contain errors or delays. We do not
              guarantee the accuracy, completeness, or timeliness of any information.
            </p>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Open Source</h2>
          <p className="text-muted-foreground mb-4">
            HotScan is open source and available on GitHub. Contributions are welcome!
          </p>
          <a
            href="https://github.com/Hacker0458/HotScan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  )
}

