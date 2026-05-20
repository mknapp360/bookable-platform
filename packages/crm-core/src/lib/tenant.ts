import { supabase } from './supabase'
import type { Tenant, TenantUser } from '@/types'

export interface TenantMembership {
  tenant: Tenant
  role: TenantUser['role']
}

export async function getTenantsForUser(userId: string): Promise<TenantMembership[]> {
  const { data, error } = await supabase
    .from('tenant_users')
    .select('role, tenants(*)')
    .eq('user_id', userId)

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    tenant: row.tenants as Tenant,
    role: row.role as TenantUser['role'],
  }))
}
