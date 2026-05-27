export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="bookable" className="h-8 w-auto" />
        </a>
        <div className="flex items-center gap-8">
          <a href="/products" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Products
          </a>
          <a href="/resources" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Free tools
          </a>
          <a href="/#what-we-build" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            What we build
          </a>
          <a href="/#how-it-works" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            How it works
          </a>
          <a href="/#contact" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Get in touch
          </a>
          <span className="hidden sm:block text-gray-300">|</span>
          <a href="tel:07562080026" className="hidden sm:block text-base font-bold text-gray-700 hover:text-bookable-green transition-colors">
            07562 080026
          </a>
        </div>
      </div>
    </nav>
  )
}
