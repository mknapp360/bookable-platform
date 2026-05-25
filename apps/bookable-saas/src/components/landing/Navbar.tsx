export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img src="/crmLogo2.png" alt="bookable" className="h-8 w-auto" />
        </a>
        <div className="flex items-center gap-8">
          <a href="/#what-is-bookable-crm" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            What is Bookable CRM
          </a>
          <a href="/#pricing" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </a>
          <a href="/#contact" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Get in touch
          </a>
          <a
            href="/login"
            className="bg-bookable-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  )
}
