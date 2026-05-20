import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '../lib/supabase'

type Props = {
  postId?: string
  onSaved: () => void
  onCancel: () => void
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function PostEditor({ postId, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loading, setLoading] = useState(!!postId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your post content here…' }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  })

  // Load existing post when editing
  useEffect(() => {
    if (!postId || !editor) return
    supabase
      .from('posts')
      .select('title, slug, excerpt, status, content')
      .eq('id', postId)
      .single()
      .then(({ data }) => {
        if (!data) return
        setTitle(data.title)
        setSlug(data.slug)
        setExcerpt(data.excerpt ?? '')
        setStatus(data.status)
        editor.commands.setContent(data.content ?? '')
        setSlugManuallyEdited(true) // don't auto-overwrite on edit
        setLoading(false)
      })
  }, [postId, editor])

  // Auto-generate slug from title (only for new posts, unless user has manually edited slug)
  useEffect(() => {
    if (!postId && !slugManuallyEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, postId, slugManuallyEdited])

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!slug.trim()) {
      setError('Slug is required.')
      return
    }
    setSaving(true)
    setError('')

    const content = editor?.getHTML() ?? ''
    const publishedAt = status === 'published' ? new Date().toISOString() : null

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      status,
      ...(status === 'published' && !postId ? { published_at: publishedAt } : {}),
    }

    let result
    if (postId) {
      result = await supabase.from('posts').update(payload).eq('id', postId)
    } else {
      result = await supabase.from('posts').insert(payload)
    }

    setSaving(false)

    if (result.error) {
      setError(result.error.message)
    } else {
      onSaved()
    }
  }, [title, slug, excerpt, status, editor, postId, onSaved])

  if (loading) {
    return (
      <div className="text-gray-400 text-sm py-8">Loading post…</div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {postId ? 'Edit post' : 'New post'}
        </h2>
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to posts
        </button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              placeholder="post-slug"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt <span className="text-gray-400 font-normal">(shown in blog list + meta description)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Short description of this post…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Content — Tiptap editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>

          {/* Toolbar */}
          <div className="border border-gray-300 rounded-t-lg bg-gray-50 px-3 py-2 flex flex-wrap gap-1">
            {[
              { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), isActive: () => editor?.isActive('bold') },
              { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), isActive: () => editor?.isActive('italic') },
              { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor?.isActive('heading', { level: 2 }) },
              { label: 'H3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor?.isActive('heading', { level: 3 }) },
              { label: '• List', action: () => editor?.chain().focus().toggleBulletList().run(), isActive: () => editor?.isActive('bulletList') },
              { label: '1. List', action: () => editor?.chain().focus().toggleOrderedList().run(), isActive: () => editor?.isActive('orderedList') },
              { label: '"', action: () => editor?.chain().focus().toggleBlockquote().run(), isActive: () => editor?.isActive('blockquote') },
              { label: '—', action: () => editor?.chain().focus().setHorizontalRule().run(), isActive: () => false },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); btn.action() }}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  btn.isActive()
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Editor body */}
          <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Status + Save */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : postId ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
