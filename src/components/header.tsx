'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { TrendingUp, User, LogOut, Settings, Bookmark } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">HotScan｜热点雷达</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            首页
          </Link>
          <Link href="/learn" className="text-sm font-medium hover:text-primary transition-colors">
            术语百科
          </Link>
          <Link href="/analytics" className="text-sm font-medium hover:text-primary transition-colors">
            数据分析
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">
                  <User className="h-4 w-4 mr-2" />
                  登录
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
