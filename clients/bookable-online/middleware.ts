import { next } from '@vercel/edge'

const BLOCKED_UA_PATTERNS = [
  /python-requests/i,
  /python-urllib/i,
  /python-httpx/i,
  /aiohttp/i,
  /scrapy/i,
  /httpclient/i,
  /java\//i,
  /libwww-perl/i,
  /wget/i,
  /curl/i,
  /php\//i,
  /go-http-client/i,
]

// Simple in-memory rate limiter (per isolate — not global, but good enough for burst protection)
const hits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60 // requests per window
const RATE_WINDOW = 60_000 // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT
}

export default function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? ''

  // Block requests with no user agent
  if (!ua) {
    return new Response('Forbidden', { status: 403 })
  }

  // Block known bot/script user agents
  if (BLOCKED_UA_PATTERNS.some((pattern) => pattern.test(ua))) {
    return new Response('Forbidden', { status: 403 })
  }

  // Rate limit by IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  return next()
}

export const config = {
  matcher: ['/api/ssr'],
}
