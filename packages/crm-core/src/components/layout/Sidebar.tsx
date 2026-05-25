import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Kanban,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { useCrmConfig } from '@/context/CrmConfigContext'
import { cn } from '@/lib/cn'

const coreNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts',  icon: Users,           label: 'Contacts'  },
  { to: '/cases',     icon: FolderOpen,      label: 'Cases'     },
  { to: '/pipeline',  icon: Kanban,          label: 'Pipeline'  },
  { to: '/tasks',     icon: ClipboardList,   label: 'Tasks'     },
  { to: '/calendar',  icon: Calendar,        label: 'Calendar'  },
  { to: '/documents', icon: FileText,        label: 'Documents' },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
]

export function Sidebar() {
  const { signOut } = useAuth()
  const { tenant, memberships, switchTenant } = useTenant()
  const { extraNavItems } = useCrmConfig()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const showSwitcher = memberships.length > 1
  const navItems = [...coreNavItems, ...extraNavItems]

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0">

      {/* Tenant selector */}
      <div className="relative border-b border-slate-700">
        <button
          onClick={() => showSwitcher && setSwitcherOpen((o) => !o)}
          className={cn(
            'flex items-center gap-3 w-full px-5 py-4 text-left',
            showSwitcher && 'hover:bg-slate-800 transition-colors'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
            {tenant?.name?.charAt(0) ?? 'B'}
          </div>
          <span className="text-white font-semibold text-sm leading-tight truncate flex-1">
            {tenant?.branding?.companyName ?? tenant?.name ?? 'Loading...'}
          </span>
          {showSwitcher && (
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          )}
        </button>

        {switcherOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-700 rounded-b-lg z-10 shadow-lg">
            {memberships.map(({ tenant: t }) => (
              <button
                key={t.id}
                onClick={() => { switchTenant(t.id); setSwitcherOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.name.charAt(0)}
                </div>
                <span className="truncate flex-1 text-left">{t.name}</span>
                {t.id === tenant?.id && (
                  <Check size={14} className="text-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-white/80 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
