import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhatWeBuild from './components/WhatWeBuild'
import HowItWorks from './components/HowItWorks'
import BookingModal from './components/BookingModal'
import Quiz from './components/Quiz'
import Footer from './components/Footer'

export interface UserDetails {
  name: string
  email: string
  company: string
}

function ContactWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  const loadedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || loadedRef.current) return
    loadedRef.current = true

    const script = document.createElement('script')
    script.src =
      'https://lltuofjbxvhsrmndwolm.supabase.co/functions/v1/widget-embed?key=47ac6f35-e2eb-48ce-b243-811d4c7d45e9'
    script.async = true
    container.appendChild(script)
  }, [])

  return (
    <section id="contact" className="py-20 px-6 bg-gray-50">
      <div className="max-w-xl mx-auto" ref={containerRef} />
    </section>
  )
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', email: '', company: '' })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero onQuiz={() => setQuizOpen(true)} />
      <WhatWeBuild />
      <HowItWorks onQuiz={() => setQuizOpen(true)} />
      <ContactWidget />
      <Footer />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} prefill={userDetails} />
      <Quiz open={quizOpen} onClose={() => setQuizOpen(false)} onBook={() => setBookingOpen(true)} onCaptureDetails={setUserDetails} />
    </div>
  )
}

export default App
