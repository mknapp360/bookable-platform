import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhatWeBuild from './components/WhatWeBuild'
import HowItWorks from './components/HowItWorks'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <WhatWeBuild />
      <HowItWorks />
      <ContactForm />
      <Footer />
    </div>
  )
}

export default App
