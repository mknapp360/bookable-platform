export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100" aria-label="Site footer">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <div className="mb-2">
              <img src="/logo.png" alt="bookable" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              Automated software consultancy and developer for small business owners and regulated professionals.
            </p>
            <address className="mt-4 not-italic text-sm text-gray-400 space-y-1">
              <span className="block">United Kingdom</span>
            </address>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <p className="font-medium text-gray-500">Sectors we serve</p>
            <ul className="space-y-1">
              <li>Mortgage Brokers</li>
              <li>Property Investors &amp; Dealpackagers</li>
              <li>Equity Release Advisers</li>
              <li>Solicitors &amp; Conveyancers</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Bookable. Building automated business systems since 2019.
          </p>
        </div>
      </div>
    </footer>
  )
}
