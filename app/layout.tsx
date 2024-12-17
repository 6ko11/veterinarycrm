import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'react-datepicker/dist/react-datepicker.css'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { RootLayoutContent } from '@/components/layout/root-layout-content'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vet Clinic',
  description: 'Vet Clinic Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <RootLayoutContent>
            {children}
          </RootLayoutContent>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
