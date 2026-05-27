import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// ── Capture install prompt at module level ────────────────────────────────────
// Must live outside React — beforeinstallprompt fires during page load,
// before any component mounts. If we only listen inside useEffect we miss it.
let _deferredPrompt: any = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferredPrompt = e
  })
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  name: string
  title: string
  company: string
  email: string
  phone: string
  website: string
  slug: string
  bookableAccount: boolean
}

const EMPTY_PROFILE: Profile = {
  name: '', title: '', company: '', email: '',
  phone: '', website: '', slug: '', bookableAccount: false,
}

const STORAGE_KEY = 'qrcard_profile'
const VISITS_KEY  = 'qrcard_visits'
const PROMPT_KEY  = 'qrcard_install_dismissed'

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveProfile(p: Profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

function incrementVisits(): number {
  const n = parseInt(localStorage.getItem(VISITS_KEY) ?? '0', 10) + 1
  localStorage.setItem(VISITS_KEY, String(n))
  return n
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
}

function buildVCard(p: Profile): string {
  const lines = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `FN:${p.name}`,
    `N:${p.name.split(' ').slice(1).join(' ')};${p.name.split(' ')[0]};;;`,
  ]
  if (p.title && p.company) lines.push(`ORG:${p.company}`, `TITLE:${p.title}`)
  else if (p.company)        lines.push(`ORG:${p.company}`)
  if (p.phone)   lines.push(`TEL;TYPE=CELL:${p.phone}`)
  if (p.email)   lines.push(`EMAIL;TYPE=INTERNET:${p.email}`)
  if (p.website) lines.push(`URL:${p.website}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

function buildQRValue(p: Profile): string {
  if (p.slug) return `https://bookable.online/${p.slug}`
  return buildVCard(p)
}

function isComplete(p: Profile): boolean {
  return !!(p.name && (p.email || p.phone))
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 text-sm py-1 border-b border-white/5 last:border-0">
      <span className="text-white/30 shrink-0 w-16">{label}</span>
      <span className="text-white/70 text-right break-all">{value}</span>
    </div>
  )
}

// ── Install Instructions Modal (iOS + Android fallback) ───────────────────────

function InstallInstructionsModal({
  platform,
  onClose,
}: {
  platform: 'ios' | 'android'
  onClose: () => void
}) {
  const steps = platform === 'ios'
    ? [
        { icon: '⬆️', title: 'Tap the Share button', sub: 'The box with the arrow at the bottom of Safari' },
        { icon: '➕', title: 'Tap "Add to Home Screen"', sub: 'Scroll down in the share sheet to find it' },
      ]
    : [
        { icon: '⋮',  title: 'Tap the menu in Chrome', sub: 'The three dots in the top-right corner' },
        { icon: '➕', title: 'Tap "Add to Home screen"', sub: 'Then tap "Add" to confirm' },
      ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-3xl p-6 flex flex-col gap-5 border border-white/10"
        style={{ background: 'rgba(15,12,41,0.97)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-1">
          <h3 className="text-white font-semibold text-lg">Add to Home Screen</h3>
          <p className="text-white/40 text-sm">Two taps and it's on your phone</p>
        </div>

        {steps.map((step, i) => (
          <div key={i}>
            {i > 0 && <div className="w-full h-px bg-white/5 mb-5" />}
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                {step.icon}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">{step.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{step.sub}</p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

// ── Claim Link Banner ─────────────────────────────────────────────────────────

function ClaimLinkBanner({ onClaim }: { onClaim: () => void }) {
  return (
    <div className="w-full rounded-2xl p-4 flex items-center gap-3 border border-white/10"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <span className="text-xl">🔗</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm font-medium leading-tight">Get a shareable link</p>
        <p className="text-white/40 text-xs mt-0.5">Free · bookable.online/<span className="text-violet-400">yourname</span></p>
      </div>
      <button
        onClick={onClaim}
        className="shrink-0 border border-violet-500/50 hover:border-violet-400 text-violet-400 hover:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        Claim
      </button>
    </div>
  )
}

// ── Profile Form ──────────────────────────────────────────────────────────────

function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Profile
  onSave: (p: Profile) => void
  onCancel?: () => void
}) {
  const [form, setForm] = useState<Profile>(initial)
  const isSetup = !onCancel  // true = first-time setup, false = edit

  function set(key: keyof Profile, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-colors'

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h2 className="text-white font-semibold text-lg tracking-tight">
          {isSetup ? 'Create your card' : 'Edit profile'}
        </h2>
        <p className="text-white/40 text-sm">
          {isSetup
            ? 'Stays on this device — no account needed'
            : 'Changes are saved locally on this device'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input className={inputCls} placeholder="Full name *"
          value={form.name} onChange={(e) => set('name', e.target.value)} />
        <input className={inputCls} placeholder="Job title"
          value={form.title} onChange={(e) => set('title', e.target.value)} />
        <input className={inputCls} placeholder="Company"
          value={form.company} onChange={(e) => set('company', e.target.value)} />
        <input className={inputCls} type="email" placeholder="Email *"
          value={form.email} onChange={(e) => set('email', e.target.value)} />
        <input className={inputCls} type="tel" placeholder="Phone"
          value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <input className={inputCls} placeholder="Website"
          value={form.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => { if (isComplete(form)) onSave(form) }}
          disabled={!isComplete(form)}
          className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/20 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isSetup ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save to device
            </>
          ) : 'Save changes'}
        </button>
      </div>

      <p className="text-white/20 text-xs text-center">* Required. Everything else is optional.</p>
    </div>
  )
}

// ── Claim Slug Modal ──────────────────────────────────────────────────────────

function ClaimSlugModal({
  profile, onClaimed, onClose,
}: {
  profile: Profile
  onClaimed: (slug: string) => void
  onClose: () => void
}) {
  const suggested = profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const [slug, setSlug]   = useState(suggested)
  const [email, setEmail] = useState(profile.email)

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-colors'

  function handleClaim() {
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!clean || !email) return
    // TODO: POST to Supabase to register free profile
    onClaimed(clean)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-xs rounded-3xl p-6 flex flex-col gap-4 border border-white/10"
        style={{ background: 'rgba(15,12,41,0.95)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="text-center space-y-1">
          <h3 className="text-white font-semibold text-lg">Claim your free link</h3>
          <p className="text-white/40 text-sm">Free forever · no credit card</p>
        </div>

        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <span className="text-white/30 text-sm pl-4 pr-1 shrink-0">bookable.online/</span>
          <input
            className="flex-1 bg-transparent py-3 pr-4 text-white text-sm placeholder-white/20 focus:outline-none"
            placeholder="yourname"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>

        <input className={inputCls} type="email"
          placeholder="Your email (to send you the link)"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <p className="text-white/30 text-xs text-center leading-relaxed">
          Your hosted page goes live instantly. Upgrade to Bookable anytime to unlock the full CRM.
        </p>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
          >
            Not now
          </button>
          <button onClick={handleClaim} disabled={!slug || !email}
            className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/20 text-white text-sm font-semibold transition-colors"
          >
            Claim link
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type InstallPlatform = 'ios' | 'android' | null

export default function CardPage() {
  const [profile, setProfile]               = useState<Profile | null>(null)
  const [editing, setEditing]               = useState(false)
  const [showClaim, setShowClaim]           = useState(false)
  const [installGuide, setInstallGuide]     = useState<InstallPlatform>(null)
  const [showInstall, setShowInstall]       = useState(false)
  const [loaded, setLoaded]                 = useState(false)

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    setLoaded(true)

    const visits = incrementVisits()

    // Re-check if prompt arrived after mount (covers late-firing cases)
    const handler = (e: Event) => {
      e.preventDefault()
      _deferredPrompt = e
      if (visits >= 2 && p && !isInStandaloneMode() && !localStorage.getItem(PROMPT_KEY)) {
        setShowInstall(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  function triggerInstall() {
    if (isInStandaloneMode()) return

    if (_deferredPrompt) {
      // Native Chrome prompt available — fire it
      _deferredPrompt.prompt()
      _deferredPrompt.userChoice.then(() => {
        _deferredPrompt = null
        setShowInstall(false)
      })
    } else if (isIOS()) {
      setInstallGuide('ios')
    } else {
      // Android but prompt not available — show manual steps
      setInstallGuide('android')
    }
  }

  function handleSave(p: Profile, isFirstSave: boolean) {
    saveProfile(p)
    setProfile(p)
    setEditing(false)
    if (isFirstSave) triggerInstall()
  }

  function handleClaimed(slug: string) {
    if (!profile) return
    const updated = { ...profile, slug }
    saveProfile(updated)
    setProfile(updated)
    setShowClaim(false)
  }

  if (!loaded) return null

  const cardStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4 w-full max-w-xs">

        {/* ── Setup (no profile yet) ──────────────────────────────── */}
        {!profile && !editing && (
          <div className="w-full rounded-3xl p-8 border border-white/10" style={cardStyle}>
            <ProfileForm
              initial={EMPTY_PROFILE}
              onSave={(p) => handleSave(p, true)}
            />
          </div>
        )}

        {/* ── Edit ────────────────────────────────────────────────── */}
        {editing && profile && (
          <div className="w-full rounded-3xl p-8 border border-white/10" style={cardStyle}>
            <ProfileForm
              initial={profile}
              onSave={(p) => handleSave(p, false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}

        {/* ── Card view ───────────────────────────────────────────── */}
        {profile && !editing && (
          <>
            <div className="w-full rounded-3xl p-8 flex flex-col items-center gap-6 border border-white/10" style={cardStyle}>
              <div className="text-center space-y-1">
                <h1 className="text-white font-semibold text-xl tracking-tight">{profile.name}</h1>
                {(profile.title || profile.company) && (
                  <p className="text-white/50 text-sm">
                    {[profile.title, profile.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={buildQRValue(profile)}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0f0c29"
                  level="M"
                />
              </div>

              <div className="w-full">
                <Field label="Email"   value={profile.email} />
                <Field label="Phone"   value={profile.phone} />
                <Field label="Website" value={profile.website} />
                {profile.slug && (
                  <Field label="Link" value={`bookable.online/${profile.slug}`} />
                )}
              </div>
            </div>

            {/* Repeat-visit install banner (Android only, already dismissed once) */}
            {showInstall && (
              <div className="w-full rounded-2xl p-4 flex items-center gap-3 border border-violet-500/30"
                style={{ background: 'rgba(134,59,255,0.12)', backdropFilter: 'blur(12px)' }}
              >
                <span className="text-2xl">📲</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium leading-tight">Add to Home Screen</p>
                  <p className="text-white/40 text-xs mt-0.5">Open your card instantly, anytime</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { localStorage.setItem(PROMPT_KEY, '1'); setShowInstall(false) }}
                    className="text-white/30 hover:text-white/60 text-xs px-2 py-1 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={triggerInstall}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Install
                  </button>
                </div>
              </div>
            )}

            {/* Claim link */}
            {!profile.slug && <ClaimLinkBanner onClaim={() => setShowClaim(true)} />}

            <button
              onClick={() => setEditing(true)}
              className="text-white/30 hover:text-white/60 text-xs transition-colors py-1"
            >
              Edit profile
            </button>

            <p className="text-white/15 text-xs">
              Powered by{' '}
              <a href="https://bookable.online" target="_blank" rel="noopener noreferrer"
                className="text-violet-400/50 hover:text-violet-400 transition-colors"
              >
                Bookable
              </a>
            </p>
          </>
        )}
      </div>

      {/* Install instructions (iOS or Android manual fallback) */}
      {installGuide && (
        <InstallInstructionsModal
          platform={installGuide}
          onClose={() => setInstallGuide(null)}
        />
      )}

      {/* Claim slug modal */}
      {showClaim && profile && (
        <ClaimSlugModal
          profile={profile}
          onClaimed={handleClaimed}
          onClose={() => setShowClaim(false)}
        />
      )}
    </div>
  )
}
