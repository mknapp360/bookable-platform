import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────

type Metric = {
  value: number
  previous: number
  change: number // percentage
}

type DayData = {
  date: string
  sessions: number
  pageViews: number
}

type AnalyticsData = {
  sessions: Metric
  pageViews: Metric
  uniqueVisitors: Metric
  avgDuration: Metric  // seconds
  bounceRate: Metric   // 0–100
  topPages: { path: string; views: number }[]
  timeSeries: DayData[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────

function LineChart({
  data,
  valueKey,
  color,
}: {
  data: DayData[]
  valueKey: 'sessions' | 'pageViews'
  color: string
}) {
  if (data.length < 2) return null

  const W = 500
  const H = 120
  const pad = { top: 8, bottom: 22, left: 8, right: 8 }
  const cW = W - pad.left - pad.right
  const cH = H - pad.top - pad.bottom

  const values = data.map((d) => d[valueKey])
  const max = Math.max(...values, 1)

  const x = (i: number) => pad.left + (i / (data.length - 1)) * cW
  const y = (v: number) => pad.top + cH - (v / max) * cH

  const linePts = data.map((d, i) => `${x(i)},${y(d[valueKey])}`).join(' ')
  const areaPts = [
    `${x(0)},${pad.top + cH}`,
    ...data.map((d, i) => `${x(i)},${y(d[valueKey])}`),
    `${x(data.length - 1)},${pad.top + cH}`,
  ].join(' ')

  // X-axis: show label every other point, capped at 7
  const labelStep = Math.ceil(data.length / 7)
  const labels = data
    .map((d, i) => {
      if (i % labelStep !== 0 && i !== data.length - 1) return null
      const dt = new Date(d.date)
      return {
        x: x(i),
        label: dt.toLocaleDateString('en-GB', { weekday: 'short' }),
      }
    })
    .filter(Boolean) as { x: number; label: string }[]

  const gradId = `grad-${valueKey}-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradId})`} />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {labels.map((l) => (
        <text
          key={l.x}
          x={l.x}
          y={H - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
        >
          {l.label}
        </text>
      ))}
    </svg>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────

const CARD_COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f97316']

function StatCard({
  label,
  value,
  metric,
  color,
}: {
  label: string
  value: string
  metric: Metric
  color: string
}) {
  const up = metric.change >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '22' }}
        >
          <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: color }} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
        <span
          className={`text-xs font-semibold pb-1 ${up ? 'text-green-600' : 'text-red-500'}`}
        >
          {up ? '↑' : '↓'} {Math.abs(metric.change).toFixed(0)}%
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {typeof metric.previous === 'number'
          ? metric.previous % 1 === 0
            ? metric.previous.toLocaleString()
            : metric.previous.toFixed(1)
          : metric.previous}{' '}
        previous period
      </p>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-32" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 h-52" />
        <div className="bg-white rounded-xl border border-gray-200 h-52" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 h-40" />
        <div className="bg-white rounded-xl border border-gray-200 h-40" />
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ga4-analytics`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!res.ok) throw new Error(await res.text())
        setData(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl">
        <p className="text-red-700 font-semibold mb-1">Could not load analytics</p>
        <p className="text-red-500 text-sm font-mono break-all mb-3">{error}</p>
        <p className="text-red-400 text-xs">
          Make sure the <code className="bg-red-100 px-1 rounded">ga4-analytics</code> edge
          function is deployed and your Supabase secrets are set (
          <code className="bg-red-100 px-1 rounded">GA4_PROPERTY_ID</code>,{' '}
          <code className="bg-red-100 px-1 rounded">GA4_CLIENT_EMAIL</code>,{' '}
          <code className="bg-red-100 px-1 rounded">GA4_PRIVATE_KEY</code>).
        </p>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: 'Sessions',        value: data.sessions.value.toLocaleString(),      metric: data.sessions },
    { label: 'Page Views',      value: data.pageViews.value.toLocaleString(),     metric: data.pageViews },
    { label: 'Unique Visitors', value: data.uniqueVisitors.value.toLocaleString(), metric: data.uniqueVisitors },
    { label: 'Avg. Duration',   value: formatDuration(data.avgDuration.value),    metric: data.avgDuration },
  ]

  const maxPageViews = data.topPages[0]?.views || 1
  const barColors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} color={CARD_COLORS[i]} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-0.5">Sessions Over Time</p>
          <p className="text-xs text-gray-400 mb-4">Daily traffic patterns</p>
          <LineChart data={data.timeSeries} valueKey="sessions" color="#818cf8" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-0.5">Page Views Over Time</p>
          <p className="text-xs text-gray-400 mb-4">Content engagement trends</p>
          <LineChart data={data.timeSeries} valueKey="pageViews" color="#a855f7" />
        </div>
      </div>

      {/* Bounce Rate + Top Pages */}
      <div className="grid grid-cols-2 gap-4">
        {/* Bounce Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-3">Bounce Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900 tabular-nums">
              {data.bounceRate.value.toFixed(0)}%
            </p>
            {/* Lower bounce = better, so invert arrow colour */}
            <span
              className={`text-xs font-semibold pb-1 ${
                data.bounceRate.change <= 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {data.bounceRate.change <= 0 ? '↓' : '↑'}{' '}
              {Math.abs(data.bounceRate.change).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {data.bounceRate.previous.toFixed(0)}% previous period
          </p>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(data.bounceRate.value, 100)}%` }}
            />
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-1">Top Pages</p>
          <p className="text-xs text-gray-400 mb-4">Most visited pages</p>
          <div className="space-y-3">
            {data.topPages.slice(0, 5).map((page, i) => (
              <div key={page.path}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 w-4 flex-shrink-0">#{i + 1}</span>
                    <span className="text-sm text-gray-700 font-medium truncate">
                      {page.path === '/' ? 'Home' : page.path}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium ml-2 flex-shrink-0">
                    {page.views}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(page.views / maxPageViews) * 100}%`,
                      backgroundColor: barColors[i] ?? '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
