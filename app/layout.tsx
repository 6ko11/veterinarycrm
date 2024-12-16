import './globals.css'
import { Inter } from 'next/font/google'
import { Sidebar } from '../components/sidebar'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Advanced Veterinary CRM',
  description: 'Comprehensive Veterinary CRM with Advanced Features',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseClient = createServerComponentClient({ cookies })
  const { data: { session } } = await supabaseClient.auth.getSession()

  console.log('Session in layout (createServerComponentClient):', session);

  const { data: session2, error } = await supabase.auth.getSession()
  console.log('Session in layout (supabase.auth.getSession()):', session2, error);


  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar session={session} />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
