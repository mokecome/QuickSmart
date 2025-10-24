'use client'

/**
 * Application Providers
 * Wraps the app with necessary context providers
 */

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/shared/config/queryClient'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E74C3C',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}
