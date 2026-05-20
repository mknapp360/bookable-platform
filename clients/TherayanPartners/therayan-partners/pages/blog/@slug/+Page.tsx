import { useData } from 'vike-react/useData'
import type { Data } from './+data'

export default function BlogPostPage() {
  const { post } = useData<Data>()

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-900">Bookable</a>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
            <a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a>
          </nav>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          ← Back to blog
        </a>

        <article>
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
            {post.excerpt && (
              <p className="text-xl text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
            )}
            {formattedDate && (
              <time className="text-sm text-gray-400">{formattedDate}</time>
            )}
          </header>

          {/* Rendered HTML from Tiptap / rich text */}
          {post.content && (
            <div
              className="prose prose-lg prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </article>
      </main>
    </div>
  )
}
