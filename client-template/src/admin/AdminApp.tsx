import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PostList from './PostList'
import PostEditor from './PostEditor'

type View =
  | { type: 'list' }
  | { type: 'new' }
  | { type: 'edit'; postId: string }

export default function AdminApp() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ type: 'list' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
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

  if (!session) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-900">Bookable Admin</span>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setView({ type: 'list' })}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Posts
          </button>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {view.type === 'list' && (
          <PostList
            onNew={() => setView({ type: 'new' })}
            onEdit={(id) => setView({ type: 'edit', postId: id })}
          />
        )}
        {(view.type === 'new' || view.type === 'edit') && (
          <PostEditor
            postId={view.type === 'edit' ? view.postId : undefined}
            onSaved={() => setView({ type: 'list' })}
            onCancel={() => setView({ type: 'list' })}
          />
        )}
      </main>
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
