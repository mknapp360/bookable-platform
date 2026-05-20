import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Tenant = { id: string; name: string; branding: Record<string, unknown> }

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('tenant_users')
        .select('tenant_id, tenants(id, name, branding)')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      if (data?.tenants) setTenant(data.tenants as unknown as Tenant)
      setLoading(false)
    }
    load()
  }, [])

  return { tenant, loading }
}
