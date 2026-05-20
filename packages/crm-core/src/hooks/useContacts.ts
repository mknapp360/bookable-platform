import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/types'

export function useContacts(tenantId: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!tenantId) { setContacts([]); setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        pipeline_stage:pipeline_stages(id, name, color, order, phase, description, tenant_id, created_at)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setContacts((data as Contact[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function addContact(values: Partial<Contact>): Promise<{ error: string | null }> {
    if (!tenantId) return { error: 'No tenant' }
    const { error } = await supabase.from('contacts').insert({
      first_name: values.first_name ?? '',
      last_name: values.last_name ?? '',
      ...values,
      tenant_id: tenantId,
    } as never)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function updateContact(id: string, values: Partial<Contact>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('contacts').update(values as never).eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function updatePipelineStage(
    contactId: string,
    stageId: string | null
  ): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('contacts')
      .update({ pipeline_stage_id: stageId })
      .eq('id', contactId)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  return { contacts, loading, error, refetch: fetch, addContact, updateContact, updatePipelineStage }
}
