import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../../src/context/AuthContext'
import { TenantProvider } from '../../src/context/TenantContext'
import { CrmConfigProvider } from '../../src/context/CrmConfigContext'
import { AdminLayout } from '../../src/components/layout/AdminLayout'
import { LoginPage } from '../../src/pages/auth/LoginPage'
import { SignupPage } from '../../src/pages/auth/SignupPage'
import { AuthCallback } from '../../src/pages/auth/AuthCallback'
import { ForgotPasswordPage } from '../../src/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../../src/pages/auth/ResetPasswordPage'
import { DashboardPage } from '../../src/pages/admin/dashboard/DashboardPage'
import { ContactsPage } from '../../src/pages/admin/contacts/ContactsPage'
import { ContactDetailPage } from '../../src/pages/admin/contacts/ContactDetailPage'
import { CasesPage } from '../../src/pages/admin/cases/CasesPage'
import { CaseDetailPage } from '../../src/pages/admin/cases/CaseDetailPage'
import { PipelinePage } from '../../src/pages/admin/pipeline/PipelinePage'
import { EnquiryDetailPage } from '../../src/pages/admin/enquiries/EnquiryDetailPage'
import { TasksPage } from '../../src/pages/admin/tasks/TasksPage'
import { CalendarPage } from '../../src/pages/admin/calendar/CalendarPage'
import { DocumentsPage } from '../../src/pages/admin/documents/DocumentsPage'
import { SettingsPage } from '../../src/pages/admin/settings/SettingsPage'
import { useAuth } from '../../src/hooks/useAuth'
import { useTenant } from '../../src/hooks/useTenant'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()

  if (authLoading || (user && tenantLoading)) {
    return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>
  }

  if (!user) return <Navigate to="/login" replace />

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 text-slate-400">
        <div className="text-slate-600 font-medium">Setting up your account...</div>
        <div className="text-sm">This usually takes just a moment. Try refreshing if it does not load.</div>
      </div>
    )
  }

  return <>{children}</>
}

export default function CrmSpa() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <CrmConfigProvider config={{}}>
            <Routes>
              <Route path="/login"            element={<LoginPage />} />
              <Route path="/signup"           element={<SignupPage />} />
              <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
              <Route path="/reset-password"   element={<ResetPasswordPage />} />
              <Route path="/auth/callback"    element={<AuthCallback />} />

              <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
                <Route path="/dashboard"         element={<DashboardPage />} />
                <Route path="/contacts"          element={<ContactsPage />} />
                <Route path="/contacts/:id"      element={<ContactDetailPage />} />
                <Route path="/cases"             element={<CasesPage />} />
                <Route path="/cases/:id"         element={<CaseDetailPage />} />
                <Route path="/pipeline"          element={<PipelinePage />} />
                <Route path="/enquiries/:id"     element={<EnquiryDetailPage />} />
                <Route path="/tasks"             element={<TasksPage />} />
                <Route path="/calendar"          element={<CalendarPage />} />
                <Route path="/documents"         element={<DocumentsPage />} />
                <Route path="/settings"          element={<SettingsPage />} />
              </Route>
            </Routes>
          </CrmConfigProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
