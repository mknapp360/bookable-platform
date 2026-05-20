import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Tenant, TenantUser } from '@/types'
import { getTenantsForUser, type TenantMembership } from '@/lib/tenant'
import { useAuth } from '@/hooks/useAuth'

export interface TenantContextValue {
  tenant: Tenant | null
  role: TenantUser['role'] | null
  memberships: TenantMembership[]
  loading: boolean
  switchTenant: (tenantId: string) => void
  refetchTenant: () => Promise<void>
}

export const TenantContext = createContext<TenantContextValue | null>(null)

const ACTIVE_TENANT_KEY = 'bookable_crm_active_tenant'

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState<TenantMembership[]>([])
  const [activeTenantId, setActiveTenantId] = useState<string | null>(
    localStorage.getItem(ACTIVE_TENANT_KEY)
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMemberships([])
      setLoading(false)
      return
    }

    setLoading(true)
    getTenantsForUser(user.id).then((results) => {
      setMemberships(results)
      // If no active tenant stored, or stored one no longer valid, default to first
      const stored = localStorage.getItem(ACTIVE_TENANT_KEY)
      const valid = stored && results.some((m) => m.tenant.id === stored)
      if (!valid && results.length > 0) {
        setActiveTenantId(results[0].tenant.id)
        localStorage.setItem(ACTIVE_TENANT_KEY, results[0].tenant.id)
      }
      setLoading(false)
    })
  }, [user])

  function switchTenant(tenantId: string) {
    setActiveTenantId(tenantId)
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId)
  }

  async function refetchTenant() {
    if (!user) return
    const results = await getTenantsForUser(user.id)
    setMemberships(results)
  }

  const activeMembership = memberships.find((m) => m.tenant.id === activeTenantId) ?? memberships[0] ?? null

  return (
    <TenantContext.Provider value={{
      tenant: activeMembership?.tenant ?? null,
      role: activeMembership?.role ?? null,
      memberships,
      loading,
      switchTenant,
      refetchTenant,
    }}>
      {children}
    </TenantContext.Provider>
  )
}
