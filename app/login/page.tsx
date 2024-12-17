'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/') // Redirect to home if already logged in
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  )
}
