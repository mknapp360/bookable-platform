import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PipelineStage } from '@/types'

export function usePipelineStages(tenantId: string | null) {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) { setStages([]); setLoading(false); return }
    setLoading(true)
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('order', { ascending: true })
      .then(({ data }) => {
        setStages((data as PipelineStage[]) ?? [])
        setLoading(false)
      })
  }, [tenantId])

  return { stages, loading }
}
