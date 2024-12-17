'use client'

import { useAuth } from '@/lib/auth-context'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If not logged in and not on login page, show nothing (will redirect)
  if (!user && pathname !== '/login') {
    return null
  }

  return (
    <div className="flex h-screen">
      {user && <Sidebar />}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
