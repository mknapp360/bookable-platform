import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  User,
  Users,
  Settings,
  AlertCircle,
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useCalendarEvents, type CalendarEvent } from '@/hooks/useCalendarEvents'
import { cn } from '@/lib/cn'

type ViewMode = 'month' | 'week'

// ─── Helpers ────────────────────────────────────────────────────────────────

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getMonthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const start = startOfWeek(first)
  const weeks: Date[][] = []
  const cursor = new Date(start)
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor.getMonth() !== month && w >= 3) break
  }
  return weeks
}

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

// ─── Event color by source ──────────────────────────────────────────────────

function eventColors(ev: CalendarEvent) {
  if (ev.cancelled) return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-400' }
  if (ev.source === 'google') return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' }
  return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' }
}

function eventPillColors(ev: CalendarEvent) {
  if (ev.cancelled) return 'bg-slate-100 text-slate-400 line-through'
  if (ev.source === 'google') return 'bg-emerald-50 text-emerald-700'
  return 'bg-blue-50 text-blue-700'
}

// ─── Month cell ──────────────────────────────────────────────────────────────

function MonthCell({ date, events, isCurrentMonth, isToday, onSelectDay }: {
  date: Date
  events: CalendarEvent[]
  isCurrentMonth: boolean
  isToday: boolean
  onSelectDay: (d: Date) => void
}) {
  return (
    <button
      onClick={() => onSelectDay(date)}
      className={cn(
        'min-h-[90px] p-1.5 border-b border-r border-slate-100 text-left transition-colors hover:bg-slate-50',
        !isCurrentMonth && 'bg-slate-50/50',
      )}
    >
      <span className={cn(
        'inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-0.5',
        isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
      )}>
        {date.getDate()}
      </span>
      <div className="space-y-0.5">
        {events.slice(0, 3).map(ev => (
          <div key={ev.id} className={cn('text-[10px] leading-tight px-1.5 py-0.5 rounded truncate', eventPillColors(ev))}>
            {ev.allDay ? 'All day' : formatTime(ev.start)} {ev.title}
          </div>
        ))}
        {events.length > 3 && (
          <p className="text-[10px] text-slate-400 px-1">+{events.length - 3} more</p>
        )}
      </div>
    </button>
  )
}

// ─── Week time slot ──────────────────────────────────────────────────────────

function WeekEventBlock({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  if (event.allDay) return null

  const startMin = event.start.getHours() * 60 + event.start.getMinutes()
  const endMin = event.end.getHours() * 60 + event.end.getMinutes()
  const durationMin = Math.max(endMin - startMin, 20)
  const topOffset = startMin - 7 * 60

  const colors = eventColors(event)

  return (
    <button
      onClick={onClick}
      style={{ top: `${(topOffset / 60) * 64}px`, height: `${(durationMin / 60) * 64}px` }}
      className={cn(
        'absolute left-0.5 right-0.5 rounded-lg px-2 py-1 text-left overflow-hidden transition-colors z-10',
        colors.bg, `border ${colors.border}`, colors.text,
        !event.cancelled && 'hover:brightness-95',
      )}
    >
      <p className={cn('text-[10px] font-semibold truncate', event.cancelled && 'line-through')}>
        {event.title}
      </p>
      <p className="text-[9px] opacity-70">
        {formatTime(event.start)} – {formatTime(event.end)}
      </p>
    </button>
  )
}

// ─── All-day events bar ──────────────────────────────────────────────────────

function AllDayRow({ weekDays, eventsForDay }: { weekDays: Date[]; eventsForDay: (d: Date) => CalendarEvent[] }) {
  const hasAny = weekDays.some(d => eventsForDay(d).some(e => e.allDay))
  if (!hasAny) return null

  return (
    <div className="flex border-b border-slate-200 bg-slate-50/50">
      <div className="w-16 shrink-0 flex items-center justify-end pr-2">
        <span className="text-[10px] text-slate-400">All day</span>
      </div>
      {weekDays.map(date => {
        const allDayEvents = eventsForDay(date).filter(e => e.allDay)
        return (
          <div key={date.toISOString()} className="flex-1 border-l border-slate-100 px-0.5 py-1 space-y-0.5">
            {allDayEvents.map(ev => (
              <div key={ev.id} className={cn('text-[10px] leading-tight px-1.5 py-0.5 rounded truncate', eventPillColors(ev))}>
                {ev.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ─── Event detail panel ──────────────────────────────────────────────────────

function EventDetail({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 w-80">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className={cn('text-sm font-semibold text-slate-900', event.cancelled && 'line-through')}>
              {event.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {event.cancelled && (
              <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Cancelled</span>
            )}
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
              event.source === 'google' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50',
            )}>
              {event.source === 'google' ? 'Google Calendar' : 'CRM Meeting'}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-slate-400 shrink-0" />
          <span>
            {event.allDay ? 'All day' : (
              <>
                {event.start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {formatTime(event.start)} – {formatTime(event.end)}
              </>
            )}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.meetLink && (
          <a href={event.meetLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
            <Video size={12} className="shrink-0" />
            Join Google Meet
          </a>
        )}

        {event.htmlLink && (
          <a href={event.htmlLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ExternalLink size={12} className="shrink-0" />
            Open in Google Calendar
          </a>
        )}

        {event.contactId && (
          <button
            onClick={() => navigate(`/contacts/${event.contactId}`)}
            className="flex items-center gap-2 text-violet-600 hover:text-violet-700"
          >
            <User size={12} className="shrink-0" />
            View contact
          </button>
        )}

        {/* Attendees (Google events) */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              <Users size={10} /> Attendees
            </div>
            <div className="space-y-1">
              {event.attendees.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                    {(a.name ?? a.email)[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-600 truncate">{a.name ?? a.email}</span>
                  {a.status && (
                    <span className={cn('text-[9px] shrink-0', {
                      'text-green-600': a.status === 'accepted',
                      'text-red-500': a.status === 'declined',
                      'text-amber-500': a.status === 'tentative',
                      'text-slate-400': a.status === 'needsAction',
                    })}>
                      {a.status === 'needsAction' ? 'pending' : a.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { events, loading, googleConnected, googleEmail, googleError } = useCalendarEvents(tenantId)

  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  function eventsForDay(date: Date) {
    return events.filter(ev => isSameDay(ev.start, date))
  }

  const today = new Date()

  function goNext() {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + 1)
    else d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }
  function goPrev() {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() - 1)
    else d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }
  function goToday() { setCurrentDate(new Date()) }

  function selectDay(date: Date) {
    setCurrentDate(date)
    setView('week')
  }

  const monthLabel = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const weekDays = getWeekDays(currentDate)
  const weekLabel = `${weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <button onClick={goToday} className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
              Today
            </button>
            <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
          <span className="text-sm font-medium text-slate-700">
            {view === 'month' ? monthLabel : weekLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Google Calendar status */}
          {googleConnected ? (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Synced with {googleEmail}
            </span>
          ) : (
            <button
              onClick={() => navigate('/settings?tab=integrations')}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
            >
              <Settings size={11} />
              Connect Google Calendar
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Google error banner */}
      {googleError && (
        <div className="mx-8 mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700 shrink-0">
          <AlertCircle size={13} className="shrink-0" />
          {googleError}
          <button onClick={() => navigate('/settings?tab=integrations')} className="ml-auto font-medium underline shrink-0">Settings</button>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-8 py-2 text-[10px] text-slate-500 border-b border-slate-100 bg-white shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-200" /> CRM meetings
        </span>
        {googleConnected && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200" /> Google Calendar
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
      ) : view === 'month' ? (
        /* ── Month view ── */
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">
                {d}
              </div>
            ))}
          </div>
          <div>
            {getMonthGrid(currentDate.getFullYear(), currentDate.getMonth()).map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map(date => (
                  <MonthCell
                    key={date.toISOString()}
                    date={date}
                    events={eventsForDay(date)}
                    isCurrentMonth={date.getMonth() === currentDate.getMonth()}
                    isToday={isSameDay(date, today)}
                    onSelectDay={selectDay}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Week view ── */
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Event detail popover */}
          {selectedEvent && (
            <div className="absolute top-4 right-4 z-30">
              <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            </div>
          )}

          <div className="flex-1 overflow-auto">
            {/* Day headers */}
            <div className="flex sticky top-0 z-20 bg-white border-b border-slate-200">
              <div className="w-16 shrink-0" />
              {weekDays.map(date => (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'flex-1 text-center py-2 border-l border-slate-100',
                    isSameDay(date, today) && 'bg-blue-50',
                  )}
                >
                  <p className="text-[10px] font-medium text-slate-500 uppercase">
                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  <p className={cn(
                    'text-sm font-semibold',
                    isSameDay(date, today) ? 'text-blue-600' : 'text-slate-700',
                  )}>
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* All-day events */}
            <AllDayRow weekDays={weekDays} eventsForDay={eventsForDay} />

            {/* Time grid */}
            <div className="flex">
              <div className="w-16 shrink-0">
                {HOURS.map(h => (
                  <div key={h} className="h-16 flex items-start justify-end pr-2 pt-0">
                    <span className="text-[10px] text-slate-400 -mt-1.5">
                      {String(h).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {weekDays.map(date => {
                const dayEvents = eventsForDay(date).filter(e => !e.allDay)
                return (
                  <div key={date.toISOString()} className="flex-1 border-l border-slate-100 relative">
                    {HOURS.map(h => (
                      <div key={h} className="h-16 border-b border-slate-50" />
                    ))}
                    {dayEvents.map(ev => (
                      <WeekEventBlock
                        key={ev.id}
                        event={ev}
                        onClick={() => setSelectedEvent(ev)}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
