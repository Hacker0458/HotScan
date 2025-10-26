'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import LangProvider from '@/components/LangProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LangProvider>
          {children}
        </LangProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
