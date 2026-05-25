import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import type { ReactNode } from 'react'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { AuthCallback } from '@/pages/auth/AuthCallback'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/admin/dashboard/DashboardPage'
import { ContactsPage } from '@/pages/admin/contacts/ContactsPage'
import { ContactDetailPage } from '@/pages/admin/contacts/ContactDetailPage'
import { CasesPage } from '@/pages/admin/cases/CasesPage'
import { CaseDetailPage } from '@/pages/admin/cases/CaseDetailPage'
import { PipelinePage } from '@/pages/admin/pipeline/PipelinePage'
import { EnquiryDetailPage } from '@/pages/admin/enquiries/EnquiryDetailPage'
import { TasksPage } from '@/pages/admin/tasks/TasksPage'
import { CalendarPage } from '@/pages/admin/calendar/CalendarPage'
import { DocumentsPage } from '@/pages/admin/documents/DocumentsPage'
import { SettingsPage } from '@/pages/admin/settings/SettingsPage'
import { CrmConfigProvider } from '@/context/CrmConfigContext'
import type { CrmConfig, ExtraRoute } from '@/context/CrmConfigContext'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'

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

export function createCrmApp(config: Partial<CrmConfig> = {}) {
  return function CrmApp() {
    return (
      <AuthProvider>
        <TenantProvider>
          <CrmConfigProvider config={config}>
            <Routes>
              <Route path="/login"            element={<LoginPage />} />
              <Route path="/signup"           element={<SignupPage />} />
              <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
              <Route path="/reset-password"   element={<ResetPasswordPage />} />
              <Route path="/auth/callback"    element={<AuthCallback />} />

              <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"          element={<DashboardPage />} />
                <Route path="contacts"           element={<ContactsPage />} />
                <Route path="contacts/:id"       element={<ContactDetailPage />} />
                <Route path="cases"              element={<CasesPage />} />
                <Route path="cases/:id"          element={<CaseDetailPage />} />
                <Route path="pipeline"           element={<PipelinePage />} />
                <Route path="enquiries/:id"      element={<EnquiryDetailPage />} />
                <Route path="tasks"              element={<TasksPage />} />
                <Route path="calendar"           element={<CalendarPage />} />
                <Route path="documents"          element={<DocumentsPage />} />
                <Route path="settings"           element={<SettingsPage />} />
                {(config.extraRoutes ?? []).map((r: ExtraRoute) => (
                  <Route key={r.path} path={r.path} element={r.element} />
                ))}
              </Route>
            </Routes>
          </CrmConfigProvider>
        </TenantProvider>
      </AuthProvider>
    )
  }
}
