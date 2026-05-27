import { useData } from 'vike-react/useData'
import type { Data } from './+data'

export default function BlogListPage() {
  const { posts } = useData<Data>()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-900">Bookable</a>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
            <a href="/blog" className="text-gray-900 font-medium">Blog</a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-gray-500 text-lg mb-12">
          Insights on building smarter booking systems and automating your business.
        </p>

        {posts.length === 0 ? (
          <p className="text-gray-400 text-lg">No posts yet — check back soon.</p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-gray-100 pb-10 last:border-0">
                <a href={`/blog/${post.slug}`} className="group block">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-500 text-base leading-relaxed mb-3">{post.excerpt}</p>
                  )}
                  <time className="text-sm text-gray-400">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </time>
                </a>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
