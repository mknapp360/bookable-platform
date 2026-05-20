import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhatWeBuild from './components/WhatWeBuild'
import HowItWorks from './components/HowItWorks'
import ContactForm from './components/ContactForm'
import BookingModal from './components/BookingModal'
import Quiz from './components/Quiz'
import Footer from './components/Footer'

export interface UserDetails {
  name: string
  email: string
  company: string
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', email: '', company: '' })

  return (
    <div className="min-h-screen bg-white">
      <Navbar onBook={() => setBookingOpen(true)} />
      <Hero onQuiz={() => setQuizOpen(true)} />
      <WhatWeBuild />
      <HowItWorks onQuiz={() => setQuizOpen(true)} />
      <ContactForm />
      <Footer />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} prefill={userDetails} />
      <Quiz open={quizOpen} onClose={() => setQuizOpen(false)} onBook={() => setBookingOpen(true)} onCaptureDetails={setUserDetails} />
    </div>
  )
}

export default App
