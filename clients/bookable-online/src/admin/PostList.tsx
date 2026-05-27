import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: 'draft' | 'published'
  published_at: string | null
  updated_at: string
}

type Props = {
  onEdit: (id: string) => void
}

export default function PostList({ onEdit }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, status, published_at, updated_at')
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

  async function toggleStatus(post: Post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const update: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'published' && !post.published_at) {
      update.published_at = new Date().toISOString()
    }
    await supabase.from('posts').update(update).eq('id', post.id)
    fetchPosts()
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-2 text-base">No posts yet.</p>
        <p className="text-sm">Use the New Post button above to create your first one.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start gap-4"
        >
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{post.title}</p>
            {post.excerpt && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                {post.excerpt}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              Last updated:{' '}
              {new Date(post.updated_at).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
            <button
              onClick={() => toggleStatus(post)}
              title={post.status === 'published' ? 'Unpublish' : 'Publish'}
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={() => onEdit(post.id)}
              title="Edit"
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => deletePost(post.id)}
              title="Delete"
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
