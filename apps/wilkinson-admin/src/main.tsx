import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ClipboardList, FileText, ExternalLink } from 'lucide-react'
import { createCrmApp } from '@bookable/crm-core'
import { FactFindPage } from './pages/FactFindPage'
import './index.css'

// ─── Client Documents sidebar card ───────────────────────────────────────────
// Injected into CaseDetailPage below the Contact card — Viva-specific documents.
function ClientDocumentsSidebar(caseId: string) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <FileText size={12} />
        Client Documents
      </h3>
      <div className="space-y-2">
        <Link
          to={`/fact-find/${caseId}`}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors group"
        >
          <span className="flex items-center gap-2 text-sm text-slate-700 group-hover:text-violet-700">
            <ClipboardList size={14} className="text-slate-400 group-hover:text-violet-500" />
            Fact Find
          </span>
          <ExternalLink size={11} className="text-slate-300 group-hover:text-violet-400" />
        </Link>
      </div>
    </div>
  )
}

// AuthProvider and TenantProvider are included inside createCrmApp.
// All wilkinson-admin needs to supply is its extra nav items and routes.
const App = createCrmApp({
  extraNavItems: [
    { to: '/fact-find', icon: ClipboardList, label: 'Fact Find' },
  ],
  extraRoutes: [
    { path: 'fact-find',         element: <FactFindPage /> },
    { path: 'fact-find/:caseId', element: <FactFindPage /> },
  ],
  caseDetailSidebar: ClientDocumentsSidebar,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
