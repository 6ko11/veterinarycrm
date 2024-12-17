'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { Home, Users, Calendar, DollarSign, Settings, Package, BarChart2, FileText, MessageSquare, Activity, LogOut } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const routes = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/appointments',
      label: 'Appointments',
      icon: Calendar,
      active: pathname === '/appointments',
    },
    {
      href: '/clients',
      label: 'Clients',
      icon: Users,
      active: pathname === '/clients',
    },
    {
      href: '/medical-records',
      label: 'Medical Records',
      icon: FileText,
      active: pathname === '/medical-records',
    },
    {
      href: '/communication',
      label: 'Communication',
      icon: MessageSquare,
      active: pathname === '/communication',
    },
    {
      href: '/billing',
      label: 'Billing',
      icon: DollarSign,
      active: pathname === '/billing',
    },
    {
      href: '/inventory',
      label: 'Inventory',
      icon: Package,
      active: pathname === '/inventory',
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart2,
      active: pathname === '/analytics',
    },
    {
      href: '/patient-flow',
      label: 'Patient Flow',
      icon: Activity,
      active: pathname === '/patient-flow',
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ]

  if (!user) {
    return null
  }

  return (
    <div className="flex h-full w-56 flex-col border-r bg-gray-100/40 px-2">
      <div className="flex h-14 items-center border-b px-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-xl">🐾</span>
          Zvieracia klinika
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
            >
              <Button
                variant={route.active ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t py-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
