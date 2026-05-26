import { NavLink } from 'react-router-dom'
import { FileText, Handshake, LogOut } from 'lucide-react'
import { useAuth } from './AuthContext'

const navItems = [
  { to: '/documents', icon: FileText,   label: 'Documents' },
  { to: '/deals',     icon: Handshake,  label: 'Available Deals' },
]

export function PortalSidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0">

      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="flex items-center gap-3 px-5 py-4">
          <img src="/logo.png" alt="Thérayan Partners" className="h-8 w-auto" />
          <span className="text-white font-semibold text-sm leading-tight truncate">
            Client Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-white/80 hover:bg-slate-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 py-4 border-t border-slate-700">
        {user?.email && (
          <p className="px-3 mb-2 text-xs text-slate-400 truncate">{user.email}</p>
        )}
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
