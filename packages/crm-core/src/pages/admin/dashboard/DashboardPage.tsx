import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon, FolderOpen, TrendingUp, CheckCircle2, ArrowRight, Calendar, MapPin, Video, Users } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { Activity, Case, Contact } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  totalContacts: number
  activeCases: number
  newContactsThisMonth: number
  closedThisMonth: number
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <span className={`p-2 rounded-lg ${color}`}>
          <Icon size={15} />
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      )}
    </div>
  )
}

// ─── Activity icon ────────────────────────────────────────────────────────────
const activityIcons: Record<string, string> = {
  note: '📝', call: '📞', email: '✉️', meeting: '🤝',
  status_change: '🔄', document_uploaded: '📎',
  case_created: '📁', contact_created: '👤',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate  = useNavigate()
  const { tenant } = useTenant()
  const tenantId  = tenant?.id ?? null
  const { stages } = usePipelineStages(tenantId)

  const [stats, setStats]       = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentCases, setRecentCases]   = useState<(Case & { contact?: Contact })[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [stageCounts, setStageCounts]   = useState<Record<string, number>>({})

  // Calendar events from unified hook (local + Google)
  const { events: calendarEvents, loading: calLoading, googleConnected } = useCalendarEvents(tenantId)

  useEffect(() => {
    if (!tenantId) return

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthStartIso = monthStart.toISOString()

    setStatsLoading(true)

    Promise.all([
      // Total contacts
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),

      // Active (open) cases
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('closed_at', null),

      // New contacts this month
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', monthStartIso),

      // Cases closed this month
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('closed_at', monthStartIso),

      // Recent cases with contact joined
      supabase
        .from('cases')
        .select('*, contact:contacts(id, first_name, last_name, email, status, source, phone, metadata, notes, assigned_to, tenant_id, created_at, updated_at)')
        .eq('tenant_id', tenantId)
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(6),

      // Recent activity
      supabase
        .from('activities')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(8),

      // Cases per stage (open only)
      supabase
        .from('cases')
        .select('stage_id')
        .eq('tenant_id', tenantId)
        .is('closed_at', null),
    ]).then(([contacts, activeCases, newContacts, closedMonth, recent, activity, allOpenCases]) => {
      setStats({
        totalContacts:       contacts.count ?? 0,
        activeCases:         activeCases.count ?? 0,
        newContactsThisMonth: newContacts.count ?? 0,
        closedThisMonth:     closedMonth.count ?? 0,
      })

      setRecentCases((recent.data ?? []) as (Case & { contact?: Contact })[])
      setRecentActivity((activity.data ?? []) as Activity[])

      // Count cases per stage_id
      const counts: Record<string, number> = { __none__: 0 }
      ;(allOpenCases.data ?? []).forEach((c: { stage_id: string | null }) => {
        const key = c.stage_id ?? '__none__'
        counts[key] = (counts[key] ?? 0) + 1
      })
      setStageCounts(counts)
      setStatsLoading(false)
    })
  }, [tenantId])

  const statCards = [
    { label: 'Total Contacts', value: stats?.totalContacts ?? 0, icon: UsersIcon,      color: 'bg-blue-50   text-blue-600'   },
    { label: 'Active Cases',   value: stats?.activeCases ?? 0,   icon: FolderOpen,    color: 'bg-violet-50 text-violet-600' },
    { label: 'New This Month', value: stats?.newContactsThisMonth ?? 0, icon: TrendingUp, color: 'bg-green-50 text-green-600'  },
    { label: 'Completions',    value: stats?.closedThisMonth ?? 0, icon: CheckCircle2, color: 'bg-amber-50  text-amber-600'  },
  ]

  // Today's events from unified calendar (local + Google)
  const todayEvents = useMemo(() => {
    const todayStr = new Date().toDateString()
    return calendarEvents.filter(ev => ev.start.toDateString() === todayStr)
  }, [calendarEvents])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-900 mb-1">{greeting}, {tenant?.branding?.companyName ?? tenant?.name ?? 'there'}</h1>
      <p className="text-slate-500 text-sm mb-6">{tenant?.name ?? 'Loading…'}</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <StatCard key={card.label} {...card} loading={statsLoading} />
        ))}
      </div>

      {/* Today's Meetings — HubSpot-style widget */}
      <div className="bg-white rounded-xl border border-slate-200 mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-700">Today's Meetings</h2>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Full calendar <ArrowRight size={12} />
          </button>
        </div>

        {calLoading ? (
          <div className="px-5 py-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-14 bg-slate-100 rounded animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No meetings scheduled today.</p>
            {!googleConnected && (
              <button
                onClick={() => navigate('/settings?tab=integrations')}
                className="text-xs text-blue-600 hover:text-blue-700 mt-1.5 font-medium"
              >
                Connect your calendar
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todayEvents.map(ev => {
              const now = new Date()
              const isNow = ev.start <= now && ev.end > now
              const isPast = ev.end < now

              return (
                <div
                  key={ev.id}
                  className={cn(
                    'flex items-start gap-4 px-5 py-3.5',
                    ev.cancelled && 'opacity-50',
                  )}
                >
                  {/* Time block */}
                  <div className={cn(
                    'w-14 shrink-0 text-center rounded-lg py-1.5',
                    isNow ? 'bg-blue-600 text-white' : isPast ? 'bg-slate-50 text-slate-400' : ev.source === 'google' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700',
                  )}>
                    <p className="text-xs font-bold">
                      {ev.allDay ? 'All day' : ev.start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {!ev.allDay && (
                      <p className="text-[9px] opacity-70">
                        {ev.end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'text-sm font-medium text-slate-900 truncate',
                        ev.cancelled && 'line-through text-slate-400',
                      )}>
                        {ev.title}
                      </p>
                      {isNow && !ev.cancelled && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          NOW
                        </span>
                      )}
                      {ev.cancelled && (
                        <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">Cancelled</span>
                      )}
                      {ev.source === 'google' && !ev.cancelled && (
                        <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">Google</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {ev.location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin size={10} className="shrink-0" /> {ev.location}
                        </span>
                      )}
                      {ev.contactId && (
                        <button
                          onClick={() => navigate(`/contacts/${ev.contactId}`)}
                          className="text-[11px] text-violet-600 hover:text-violet-700 font-medium"
                        >
                          View contact
                        </button>
                      )}
                      {ev.attendees && ev.attendees.length > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Users size={10} /> {ev.attendees.length} attendee{ev.attendees.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ev.meetLink && !ev.cancelled && (
                      <a
                        href={ev.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Video size={11} /> Join
                      </a>
                    )}
                    {ev.htmlLink && !ev.cancelled && (
                      <a
                        href={ev.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Open in Google Calendar"
                      >
                        <Calendar size={13} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Recent open cases */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Recent Open Cases</h2>
            <button
              onClick={() => navigate('/cases')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              All cases <ArrowRight size={12} />
            </button>
          </div>
          {recentCases.length === 0 && !statsLoading ? (
            <p className="px-5 py-8 text-sm text-slate-400 text-center">No open cases yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {statsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse flex-1" />
                      <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                  ))
                : recentCases.map(c => {
                    const stage = stages.find(s => s.id === c.stage_id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        {/* Stage color bar */}
                        <span
                          className="w-1 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: stage?.color ?? '#e2e8f0' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{c.title}</p>
                          {c.contact && (
                            <p className="text-xs text-slate-500 truncate">
                              {c.contact.first_name} {c.contact.last_name}
                            </p>
                          )}
                        </div>
                        {stage && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                          >
                            {stage.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 shrink-0">
                          {new Date(c.opened_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </button>
                    )
                  })
              }
            </div>
          )}
        </div>

        {/* Right column: pipeline summary + activity */}
        <div className="space-y-6">

          {/* Pipeline breakdown */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Pipeline</h2>
            </div>
            <div className="px-5 py-3 space-y-3">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 bg-slate-100 rounded animate-pulse flex-1" />
                    <div className="h-3 w-6 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))
              ) : stages.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No stages configured.</p>
              ) : (
                <>
                  {stageCounts['__none__'] > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                      <span className="text-xs text-slate-500 flex-1">Unassigned</span>
                      <span className="text-xs font-semibold text-slate-700">{stageCounts['__none__']}</span>
                    </div>
                  )}
                  {stages.map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs text-slate-500 flex-1 truncate">{s.name}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {stageCounts[s.id] ?? 0}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
            </div>
            <div className="px-5 py-3">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-2 py-2">
                    <div className="h-3 w-4 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse flex-1" />
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map(a => (
                    <div key={a.id} className="flex gap-2.5">
                      <span className="text-sm leading-none mt-0.5 shrink-0">
                        {activityIcons[a.type] ?? '•'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 leading-snug line-clamp-2">{a.body}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(a.created_at).toLocaleString('en-GB', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
