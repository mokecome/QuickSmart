/**
 * Header Component
 * Top navigation bar with user menu
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { cn } from '@/shared/lib/utils/cn'

export function Header() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    if (confirm('確定要登出嗎？')) {
      logoutMutation.mutate()
    }
  }

  const navItems = [
    { href: '/', label: '首頁', icon: '🏠' },
    { href: '/subscriptions', label: '訂閱管理', icon: '📱' },
    { href: '/insights', label: '智能分析', icon: '📊' },
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-bold text-gray-900">QuickSmart</h1>
              <p className="text-xs text-gray-500">智能記帳</p>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  登出
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
