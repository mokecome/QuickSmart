import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'QuickSmart 智能記帳',
  description: 'AI-powered expense tracking made simple',
  manifest: '/manifest.json',
  themeColor: '#4A90E2',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
