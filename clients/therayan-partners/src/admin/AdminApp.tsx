import { useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { createCrmApp } from '@bookable/crm-core'

// Inject Supabase config so crm-core uses this project's instance
;(window as any).__SUPABASE_URL__ = import.meta.env.VITE_SUPABASE_URL
;(window as any).__SUPABASE_ANON_KEY__ = import.meta.env.VITE_SUPABASE_ANON_KEY
import { Search, Kanban, Trophy } from 'lucide-react'
import { PropertySearchPage } from './deals/PropertySearchPage'
import { DealAnalysisPage } from './deals/DealAnalysisPage'
import { DealsPipelinePage } from './deals/DealsPipelinePage'
import { DealPackagePage } from './deals/DealPackagePage'
import { BestDealsPage } from './deals/BestDealsPage'

const CrmApp = createCrmApp({
  extraNavItems: [
    { to: '/best-deals',      icon: Trophy,  label: 'Best Deals' },
    { to: '/property-search', icon: Search,  label: 'Property Search' },
    { to: '/deals-pipeline',  icon: Kanban,  label: 'Deals Pipeline' },
  ],
  extraRoutes: [
    { path: 'best-deals',                    element: <BestDealsPage /> },
    { path: 'property-search',                element: <PropertySearchPage /> },
    { path: 'property-analysis/:propertyId',  element: <DealAnalysisPage /> },
    { path: 'deals-pipeline',                 element: <DealsPipelinePage /> },
    { path: 'deal-package/:propertyId',       element: <DealPackagePage /> },
  ],
  caseDetailSidebar: undefined,
})

export default function AdminApp() {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/crm-core.css'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  return (
    <div onClick={(e) => {
      // Prevent Vike's client-side router from intercepting CRM link clicks
      const anchor = (e.target as HTMLElement).closest('a')
      if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
        e.stopPropagation()
      }
    }}>
      <MemoryRouter>
        <CrmApp />
      </MemoryRouter>
    </div>
  )
}
