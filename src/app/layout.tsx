import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'QuickSmart 智能記帳',
  description: 'AI-powered expense tracking made simple',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4A90E2',
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
