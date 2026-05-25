export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100" aria-label="Site footer">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <div className="mb-2">
            <img src="/logo.png" alt="bookable" className="h-8 w-auto mx-auto" />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Bookable. Automated CRM &amp; AI business platforms
          </p>
        </div>
      </div>
    </footer>
  )
}
