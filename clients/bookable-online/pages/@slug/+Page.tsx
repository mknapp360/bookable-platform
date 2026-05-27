import { QRCodeSVG } from 'qrcode.react'
import { usePageContext } from 'vike-react/usePageContext'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PublicProfile {
  slug: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  bookableAccount: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildVCard(p: PublicProfile): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
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

function downloadVCard(p: PublicProfile) {
  const blob = new Blob([buildVCard(p)], { type: 'text/vcard' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${p.name.replace(/\s+/g, '_')}.vcf`
  a.click()
  URL.revokeObjectURL(url)
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 text-sm py-2 border-b border-white/5 last:border-0">
      <span className="text-white/30 shrink-0 w-16">{label}</span>
      <span className="text-white/70 text-right break-all">{value}</span>
    </div>
  )
}

// ── Placeholder data (replace with Supabase fetch) ────────────────────────────

function getPlaceholderProfile(slug: string): PublicProfile {
  return {
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    bookableAccount: false,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SlugPage() {
  const ctx   = usePageContext()
  const slug  = (ctx.routeParams as { slug: string }).slug
  const pageUrl = `https://bookable.online/${slug}`

  // TODO: replace with Supabase lookup
  // const profile = await supabase.from('profiles').select('*').eq('slug', slug).single()
  const profile = getPlaceholderProfile(slug)

  const isNotFound = !profile.name || !profile.email

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 w-full max-w-xs">

        {isNotFound ? (
          /* ── Profile not found ─────────────────────────────────── */
          <div
            className="w-full rounded-3xl p-8 flex flex-col items-center gap-4 border border-white/10 text-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <p className="text-white/50 text-sm">This card hasn't been set up yet.</p>
            <a
              href="/card"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Create your free card →
            </a>
          </div>
        ) : (
          /* ── Profile card ──────────────────────────────────────── */
          <>
            <div
              className="w-full rounded-3xl p-8 flex flex-col items-center gap-6 border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              {/* Identity */}
              <div className="text-center space-y-1">
                <h1 className="text-white font-semibold text-xl tracking-tight">{profile.name}</h1>
                {(profile.title || profile.company) && (
                  <p className="text-white/50 text-sm">
                    {[profile.title, profile.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {/* QR pointing back to this page */}
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={pageUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0f0c29"
                  level="M"
                />
              </div>

              {/* Contact details */}
              <div className="w-full">
                <Field label="Email"   value={profile.email} />
                <Field label="Phone"   value={profile.phone} />
                <Field label="Website" value={profile.website} />
              </div>

              {/* Save contact */}
              <button
                onClick={() => downloadVCard(profile)}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 3 7 8 15 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Save Contact
              </button>
            </div>

            {/* Get your own CTA — acquisition hook */}
            {!profile.bookableAccount && (
              <a
                href="/card"
                className="w-full rounded-2xl p-4 flex items-center gap-3 border border-white/10 transition-colors hover:border-violet-500/30 group"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-xl">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors">
                    Get your own free card
                  </p>
                  <p className="text-white/25 text-xs">Powered by Bookable</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors shrink-0"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}
