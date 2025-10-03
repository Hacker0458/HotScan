import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-background">
      <div className="container max-w-screen-2xl py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">HotScan</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Real-time cryptocurrency market signal monitoring system.
            </p>
            <p className="text-xs text-muted-foreground italic">
              ⚠️ Not financial advice. DYOR before investing.
            </p>
          </div>
          
          {/* Data Source */}
          <div>
            <h3 className="font-semibold mb-3">Data Source</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Market data powered by{' '}
              <a
                href="https://dexscreener.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                DexScreener
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              Updates every 30 minutes via automated jobs.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/feedback" className="text-muted-foreground hover:text-primary transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Hacker0458/HotScan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} HotScan. All rights reserved.</p>
          <p className="mt-1 text-xs">
            This tool is for informational purposes only. Always do your own research.
          </p>
        </div>
      </div>
    </footer>
  )
}
