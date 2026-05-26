import { Outlet } from 'react-router-dom'
import { PortalSidebar } from './PortalSidebar'

export function PortalLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <PortalSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
