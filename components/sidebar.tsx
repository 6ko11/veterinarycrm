"use client"
import Link from 'next/link'
import { Home, Users, Calendar, DollarSign, Settings, Package, BarChart2, FileText, MessageSquare, Activity, User, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Session } from '@/lib/types'
import { Button } from './ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function Sidebar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Clients & Pets', href: '/clients' },
    { icon: Calendar, label: 'Appointments', href: '/appointments' },
    { icon: FileText, label: 'Medical Records', href: '/medical-records' },
    { icon: MessageSquare, label: 'Communication', href: '/communication' },
    { icon: DollarSign, label: 'Billing', href: '/billing' },
    { icon: Package, label: 'Inventory', href: '/inventory' },
    { icon: BarChart2, label: 'Analytics', href: '/analytics' },
    { icon: Activity, label: 'Patient Flow', href: '/patient-flow' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

    const handleSignOut = async () => {
    const supabase = createClientComponentClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-8">Advanced Vet CRM</h1>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.href} className="mb-4">
              <Link href={item.href} className={`flex items-center hover:text-gray-300 ${pathname === item.href ? 'text-gray-300' : ''}`} aria-current={pathname === item.href ? "page" : undefined}>
                <item.icon className="mr-2" size={20} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col items-center">
        {session?.user ? (
          <>
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full mb-2"
              />
            ) : (
              <User className="mb-2" size={40} />
            )}
             <Button onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2" size={20} />
              Sign Out
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
