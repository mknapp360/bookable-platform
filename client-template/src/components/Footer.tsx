export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100" aria-label="Site footer">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <div className="mb-2">
              <img src="/logo.png" alt="YOUR_BRAND_NAME" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              YOUR_FOOTER_TAGLINE — one or two sentences describing what you do.
            </p>
            <address className="mt-4 not-italic text-sm text-gray-400 space-y-1">
              <a href="mailto:YOUR_EMAIL" className="block hover:text-brand-green transition-colors">
                YOUR_EMAIL
              </a>
              <span className="block">YOUR_LOCATION</span>
            </address>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <p className="font-medium text-gray-500">YOUR_LIST_HEADING</p>
            <ul className="space-y-1">
              <li>YOUR_ITEM_1</li>
              <li>YOUR_ITEM_2</li>
              <li>YOUR_ITEM_3</li>
              <li>YOUR_ITEM_4</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} YOUR_BRAND_NAME. YOUR_COPYRIGHT_TAGLINE
          </p>
        </div>
      </div>
    </footer>
  )
}
