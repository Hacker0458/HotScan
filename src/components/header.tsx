'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Settings, Info } from '@/components/icons'
import LangSwitch from './LangSwitch'
import { useI18n } from './LangProvider'

export default function Header() {
  const pathname = usePathname()
  const { t } = useI18n()
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="HotScan Home">
          <Activity className="h-6 w-6" />
          <span className="font-bold text-xl hidden sm:inline-block">HotScan</span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-1 text-sm font-medium flex-1" aria-label="Main navigation">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive('/')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            }`}
            aria-current={isActive('/') ? 'page' : undefined}
          >
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('home')}
            </span>
          </Link>
          <Link
            href="/learn"
            className={`px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive('/learn')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            }`}
            aria-current={isActive('/learn') ? 'page' : undefined}
          >
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t('learn')}
            </span>
          </Link>
        </nav>
        
        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            aria-label="About"
          >
            About
          </Link>
          <LangSwitch />
          <button
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Settings"
            onClick={() => {
              // Placeholder for settings
              alert('Settings coming soon!')
            }}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
