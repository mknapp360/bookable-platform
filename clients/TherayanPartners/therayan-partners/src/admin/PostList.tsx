import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  published_at: string | null
  updated_at: string
}

type Props = {
  onNew: () => void
  onEdit: (id: string) => void
}

export default function PostList({ onNew, onEdit }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, status, published_at, updated_at')
      .order('updated_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  async function deletePost(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          New post
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-3">No posts yet.</p>
          <button onClick={onNew} className="text-blue-600 hover:underline text-sm">
            Create your first post →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{post.title}</p>
                <p className="text-sm text-gray-400 truncate">/{post.slug}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {post.status}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">
                {new Date(post.updated_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(post.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-sm text-red-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
