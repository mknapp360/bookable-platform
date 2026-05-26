import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Property, PropertyStatus } from '../types'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

export function useProperties(statusFilter?: PropertyStatus | PropertyStatus[]) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })

    if (statusFilter) {
      if (Array.isArray(statusFilter)) {
        q = q.in('status', statusFilter)
      } else {
        q = q.eq('status', statusFilter)
      }
    }

    const { data } = await q
    setProperties((data ?? []) as Property[])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetch() }, [fetch])

  const updateStatus = async (id: string, status: PropertyStatus) => {
    await supabase.from('properties').update({ status }).eq('id', id)
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    )
  }

  return { properties, loading, refetch: fetch, updateStatus, tenantId: TENANT_ID }
}
