import { useEffect } from 'react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { RequireAuth } from './RequireAuth'
import { PortalLayout } from './PortalLayout'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { DealsPage } from './pages/DealsPage'

export default function PortalApp() {
  useEffect(() => {
    // Load Tailwind styles (already in the page from the main site)
    // but ensure portal-specific styles don't conflict
    document.body.classList.add('portal-active')
    return () => { document.body.classList.remove('portal-active') }
  }, [])

  return (
    <div onClick={(e) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
        e.stopPropagation()
      }
    }}>
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<PortalLayout />}>
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="*" element={<Navigate to="/documents" replace />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </div>
  )
}
