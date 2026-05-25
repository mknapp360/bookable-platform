import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Case } from '@/types'

export function useCases(tenantId: string | null) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!tenantId) { setCases([]); setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, phone, status, source, metadata, notes, assigned_to, tenant_id, created_at, updated_at),
        stage:pipeline_stages(id, name, color, order, description, tenant_id, created_at)
      `)
      .eq('tenant_id', tenantId)
      .order('opened_at', { ascending: false })
    if (error) setError(error.message)
    else setCases((data as Case[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function addCase(values: {
    title: string
    contact_id: string
    stage_id?: string | null
    notes?: string | null
  }): Promise<{ error: string | null }> {
    const { error } = await supabase.from('cases').insert({
      ...values,
      tenant_id: tenantId!,
      metadata: {},
    })
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function updateCase(
    id: string,
    values: Partial<Pick<Case, 'title' | 'stage_id' | 'notes' | 'closed_at'>>
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('cases').update(values).eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  return { cases, loading, error, refetch: fetch, addCase, updateCase }
}
