import { lazy, Suspense, useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Benefits from './components/Benefits'
import WhyKatie from './components/WhyKatie'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import CtaBanner from './components/CtaBanner'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

// Lazy-loaded so TipTap / ProseMirror (DOM-only) never enter the SSR bundle
const AdminApp = lazy(() => import('./admin/AdminApp'))

function App() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(new URLSearchParams(window.location.search).has('admin'))
  }, [])

  if (isAdmin) return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 text-sm">Loading…</div></div>}>
      <AdminApp />
    </Suspense>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Benefits />
      <WhyKatie />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
      <ContactForm />
      <Footer />
    </div>
  )
}

export default App
