import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, FileText, LogOut } from 'lucide-react'
import PostList from './PostList'
import PostEditor from './PostEditor'
import Dashboard from './Dashboard'

type View =
  | { type: 'dashboard' }
  | { type: 'posts' }
  | { type: 'new' }
  | { type: 'edit'; postId: string }

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'posts',     label: 'Posts',     icon: FileText },
]

function pageInfo(view: View): { title: string; subtitle: string } {
  switch (view.type) {
    case 'dashboard': return { title: 'Analytics Dashboard', subtitle: 'Last 7 days vs. previous 7 days' }
    case 'posts':     return { title: 'Posts',               subtitle: 'Manage your blog posts and articles' }
    case 'new':       return { title: 'New Post',            subtitle: 'Create a new blog post' }
    case 'edit':      return { title: 'Edit Post',           subtitle: 'Update your blog post' }
  }
}

export default function AdminApp() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ type: 'dashboard' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  if (!session) return <LoginForm />

  const activeSection = view.type === 'dashboard' ? 'dashboard' : 'posts'
  const { title, subtitle } = pageInfo(view)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-52 bg-gray-900 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-20">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-700/60">
          <span className="text-white font-semibold text-base tracking-tight">Bookable</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView({ type: id as 'dashboard' | 'posts' })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-700/60">
          <p className="text-xs text-gray-500 mb-0.5">Signed in as</p>
          <p className="text-xs text-gray-300 truncate mb-3">{session.user.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main (offset for fixed sidebar) ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-52">
        {/* Page header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                {title}
                {view.type === 'dashboard' && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                    Live
                  </span>
                )}
              </h1>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {view.type === 'posts' && (
              <button
                onClick={() => setView({ type: 'new' })}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <span className="text-base leading-none">+</span>
                New Post
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-8">
          {view.type === 'dashboard' && <Dashboard />}

          {view.type === 'posts' && (
            <PostList onEdit={(id) => setView({ type: 'edit', postId: id })} />
          )}

          {(view.type === 'new' || view.type === 'edit') && (
            <PostEditor
              postId={view.type === 'edit' ? view.postId : undefined}
              onSaved={() => setView({ type: 'posts' })}
              onCancel={() => setView({ type: 'posts' })}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Admin sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
