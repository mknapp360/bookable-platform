import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { DealAnalysis } from '../types'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

export function useDealAnalysis(propertyId?: string) {
  const [analyses, setAnalyses] = useState<DealAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!propertyId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('deal_analysis')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    setAnalyses((data ?? []) as DealAnalysis[])
    setLoading(false)
  }, [propertyId])

  useEffect(() => { fetch() }, [fetch])

  const saveAnalysis = async (analysis: Omit<DealAnalysis, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('deal_analysis')
      .insert({ ...analysis, tenant_id: TENANT_ID })
      .select()
      .single()
    if (!error && data) {
      setAnalyses(prev => [data as DealAnalysis, ...prev])
    }
    return { data, error }
  }

  const updateAnalysis = async (id: string, updates: Partial<DealAnalysis>) => {
    const { error } = await supabase
      .from('deal_analysis')
      .update(updates)
      .eq('id', id)
    if (!error) {
      setAnalyses(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)))
    }
    return { error }
  }

  return { analyses, loading, refetch: fetch, saveAnalysis, updateAnalysis, tenantId: TENANT_ID }
}
