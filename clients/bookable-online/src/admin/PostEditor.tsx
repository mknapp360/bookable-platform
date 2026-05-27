import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { supabase } from '../lib/supabase'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, Minus, Link2, Unlink2, Undo2, Redo2, ArrowLeft,
} from 'lucide-react'

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

// ── Toolbar button ─────────────────────────────────────────────────────────

function ToolBtn({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`flex items-center justify-center w-7 h-7 rounded text-sm font-medium transition-colors disabled:opacity-30 ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PostEditor({ postId, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState<null | 'draft' | 'published'>(null)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loading, setLoading] = useState(!!postId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-gray prose-lg max-w-none focus:outline-none min-h-[360px] px-6 py-5',
      },
    },
  })

  // Load existing post
  useEffect(() => {
    if (!postId || !editor) return
    supabase
      .from('posts')
      .select('title, slug, excerpt, status, content, cover_image_url')
      .eq('id', postId)
      .single()
      .then(({ data }) => {
        if (!data) return
        setTitle(data.title)
        setSlug(data.slug)
        setExcerpt(data.excerpt ?? '')
        setStatus(data.status)
        setCoverImageUrl(data.cover_image_url ?? '')
        editor.commands.setContent(data.content ?? '')
        setSlugManuallyEdited(true)
        setLoading(false)
      })
  }, [postId, editor])

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (!postId && !slugManuallyEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, postId, slugManuallyEdited])

  const handleSave = useCallback(async (saveStatus: 'draft' | 'published') => {
    if (!title.trim()) { setError('Title is required.'); return }
    if (!slug.trim())  { setError('Slug is required.');  return }

    setSaving(saveStatus)
    setError('')

    const content = editor?.getHTML() ?? ''
    const payload: Record<string, unknown> = {
      title:           title.trim(),
      slug:            slug.trim(),
      excerpt:         excerpt.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      content,
      status:          saveStatus,
    }
    if (saveStatus === 'published' && !postId) {
      payload.published_at = new Date().toISOString()
    }

    const result = postId
      ? await supabase.from('posts').update(payload).eq('id', postId)
      : await supabase.from('posts').insert(payload)

    setSaving(null)
    if (result.error) setError(result.error.message)
    else onSaved()
  }, [title, slug, excerpt, coverImageUrl, status, editor, postId, onSaved])

  // Link toggle
  function handleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = window.prompt('Enter URL:')
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-sm py-8">Loading post…</div>
  }

  const isSaving = saving !== null

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Sub-header ── */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={15} />
          Back to posts
        </button>

        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Cover image URL (optional)"
          className="flex-1 max-w-sm border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="border border-gray-300 text-gray-700 rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {saving === 'draft' ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving === 'published' ? 'Publishing…' : postId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ── Editor card ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add Title"
          className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 px-6 pt-6 pb-3 outline-none border-none bg-transparent"
        />

        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-0.5 px-4 py-2 border-t border-b border-gray-100 bg-gray-50/60">
          <ToolBtn title="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold size={14} />
          </ToolBtn>
          <ToolBtn title="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic size={14} />
          </ToolBtn>
          <ToolBtn title="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={14} />
          </ToolBtn>

          <Divider />

          <ToolBtn title="Heading 1" active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
            <span className="text-xs font-bold">H1</span>
          </ToolBtn>
          <ToolBtn title="Heading 2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            <span className="text-xs font-bold">H2</span>
          </ToolBtn>

          <Divider />

          <ToolBtn title="Bullet list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List size={14} />
          </ToolBtn>
          <ToolBtn title="Numbered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={14} />
          </ToolBtn>
          <ToolBtn title="Blockquote" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote size={14} />
          </ToolBtn>
          <ToolBtn title="Horizontal rule" active={false} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus size={14} />
          </ToolBtn>

          <Divider />

          <ToolBtn title={editor?.isActive('link') ? 'Remove link' : 'Add link'} active={editor?.isActive('link')} onClick={handleLink}>
            {editor?.isActive('link') ? <Unlink2 size={14} /> : <Link2 size={14} />}
          </ToolBtn>

          <Divider />

          <ToolBtn title="Undo" active={false} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
            <Undo2 size={14} />
          </ToolBtn>
          <ToolBtn title="Redo" active={false} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
            <Redo2 size={14} />
          </ToolBtn>
        </div>

        {/* Content */}
        <EditorContent editor={editor} />
      </div>

      {/* ── SEO & settings ── */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">SEO & Settings</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL slug</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="text-sm text-gray-400 px-3 bg-gray-50 border-r border-gray-300 py-2 flex-shrink-0">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
                placeholder="post-slug"
                className="flex-1 px-3 py-2 text-sm outline-none bg-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Excerpt */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt <span className="text-gray-400 font-normal">— shown in blog list and used as meta description</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="A short summary of this post…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
