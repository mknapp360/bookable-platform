import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { DealPackage } from '../types'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

export function useDealPackages(propertyId?: string) {
  const [packages, setPackages] = useState<DealPackage[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!propertyId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('deal_packages')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    setPackages((data ?? []) as DealPackage[])
    setLoading(false)
  }, [propertyId])

  useEffect(() => { fetch() }, [fetch])

  const savePackage = async (pkg: Omit<DealPackage, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('deal_packages')
      .upsert({ ...pkg, tenant_id: TENANT_ID }, { onConflict: 'property_id' })
      .select()
      .single()
    if (!error && data) {
      setPackages(prev => {
        const existing = prev.findIndex(p => p.id === (data as DealPackage).id)
        if (existing >= 0) {
          const next = [...prev]
          next[existing] = data as DealPackage
          return next
        }
        return [data as DealPackage, ...prev]
      })
    }
    return { data, error }
  }

  return { packages, loading, refetch: fetch, savePackage, tenantId: TENANT_ID }
}
