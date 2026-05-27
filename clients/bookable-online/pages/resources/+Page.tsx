import Navbar from '../../src/components/Navbar'
import Footer from '../../src/components/Footer'

const tools = [
  {
    name: 'AI Search Audit',
    description: 'Is your site AI-ready for search?',
    href: '/resources/ai-search-audit',
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-bookable-green uppercase tracking-widest mb-4">
              Free tools
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Free tools for small businesses
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
              Practical, no-signup tools to help you run your business better. More coming soon.
            </p>
          </div>

          {/* Tool cards */}
          {tools.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.description}</p>
                  {tool.comingSoon ? (
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Coming soon</span>
                  ) : tool.href ? (
                    <a
                      href={tool.href}
                      className="text-sm font-semibold text-bookable-green hover:text-green-700 transition-colors"
                    >
                      Try it free &rarr;
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-lg">Tools are on the way. Check back soon.</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
