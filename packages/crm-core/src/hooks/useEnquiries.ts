import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Enquiry } from '@/types'

export function useEnquiries(tenantId: string | null) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!tenantId) { setEnquiries([]); setLoading(false); return }
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('enquiries')
      .select(`
        *,
        pipeline_stage:pipeline_stages(id, name, color, order, phase, description, tenant_id, created_at)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setEnquiries((data as unknown as Enquiry[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function updateEnquiry(id: string, values: Partial<Enquiry>): Promise<{ error: string | null }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('enquiries').update(values).eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function updatePipelineStage(
    enquiryId: string,
    stageId: string | null
  ): Promise<{ error: string | null }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('enquiries')
      .update({ pipeline_stage_id: stageId })
      .eq('id', enquiryId)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  return { enquiries, loading, error, refetch: fetch, updateEnquiry, updatePipelineStage }
}
