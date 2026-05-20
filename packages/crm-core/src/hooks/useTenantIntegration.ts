import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface TenantIntegration {
  id: string
  tenant_id: string
  provider: string
  connected_email: string | null
  calendar_id: string | null
  created_at: string
  updated_at: string
}

export function useTenantIntegration(tenantId: string | null, provider: string) {
  const [integration, setIntegration] = useState<TenantIntegration | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tenantId) { setLoading(false); return }
    const { data } = await (supabase as any)
      .from('tenant_integrations')
      .select('id, tenant_id, provider, connected_email, calendar_id, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .eq('provider', provider)
      .maybeSingle()
    setIntegration(data as TenantIntegration | null)
    setLoading(false)
  }, [tenantId, provider])

  useEffect(() => { load() }, [load])

  async function disconnect() {
    if (!tenantId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('tenant_integrations')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('provider', provider)
    setIntegration(null)
  }

  return { integration, loading, refetch: load, disconnect }
}
