import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { TurnstileWidget } from '@/components/crm/TurnstileWidget'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    import.meta.env.VITE_TURNSTILE_SITE_KEY ? undefined : 'no-captcha'
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const token = import.meta.env.VITE_TURNSTILE_SITE_KEY ? captchaToken : undefined
    const { error } = await resetPassword(email, token)
    setLoading(false)
    if (error) {
      setError(error.message ?? 'Something went wrong. Please try again.')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <img src="/crmLogo.png" alt="Bookable CRM" className="h-12 w-auto mx-auto mb-6" />
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500">
              We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span>. Click the link in the email to set a new password.
            </p>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            <Link to="/login" className="text-[#29ab00] hover:text-[#218f00] font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/crmLogo.png" alt="Bookable CRM" className="h-12 w-auto mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <TurnstileWidget onToken={setCaptchaToken} />

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full bg-[#29ab00] hover:bg-[#218f00] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/login" className="text-[#29ab00] hover:text-[#218f00] font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
