import { useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { createCrmApp } from '@bookable/crm-core'

const CrmApp = createCrmApp({
  extraNavItems: [],
  extraRoutes: [],
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
