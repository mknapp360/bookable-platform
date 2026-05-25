import { useEffect } from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import WhatWeBuild from '@/components/landing/WhatWeBuild'
import Pricing from '@/components/landing/Pricing'
import ContactForm from '@/components/landing/ContactForm'
import Footer from '@/components/landing/Footer'

export function LandingPage() {
  // Safety net: if Supabase redirects recovery/auth tokens to the landing page,
  // forward them to /auth/callback so the CRM SPA can handle them
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      if (hash.includes('type=recovery')) {
        sessionStorage.setItem('password_recovery', 'true')
      }
      window.location.replace('/auth/callback' + hash)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white font-[Inter,system-ui,-apple-system,sans-serif]">
      <Navbar />
      <Hero />
      <WhatWeBuild />
      <Pricing />
      <ContactForm />
      <Footer />
    </div>
  )
}
