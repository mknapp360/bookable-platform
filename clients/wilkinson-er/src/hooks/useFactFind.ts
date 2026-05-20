/**
 * useFactFind — queries fact_finds by case_id (crm-core pattern).
 * tenant_id is required for the initial insert (supplied by useTenant).
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type FactFindRecord = {
  id: string
  tenant_id: string
  contact_id: string
  case_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  status: 'draft' | 'complete'
  client_details: Record<string, unknown>
  personal_details: Record<string, unknown>
  medical: Record<string, unknown>
  occupation_income: Record<string, unknown>
  post_retirement: Record<string, unknown>
  benefits: Record<string, unknown>
  mortgages: Record<string, unknown>
  unsecured_debts: Record<string, unknown>
  expenditure: Record<string, unknown>
  savings_investments: Record<string, unknown>
  protection: Record<string, unknown>
  objectives: Record<string, unknown>
  property_details: Record<string, unknown>
  vulnerability: Record<string, unknown>
  marketing_prefs: Record<string, unknown>
  equity_release_1: Record<string, unknown>
  equity_release_2: Record<string, unknown>
  equity_release_3: Record<string, unknown>
  id_requirements: Record<string, unknown>
  admin_details: Record<string, unknown>
  erc_checklist: Record<string, unknown>
  application_docs: Record<string, unknown>
}

export function useFactFind(caseId: string | undefined, tenantId: string | undefined) {
  const [factFind, setFactFind] = useState<FactFindRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!caseId) { setLoading(false); return }
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('fact_finds')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle()
    if (fetchError) setError(fetchError.message)
    else setFactFind(data as FactFindRecord | null)
    setLoading(false)
  }, [caseId])

  useEffect(() => { fetch() }, [fetch])

  const saveSection = useCallback(async (
    sectionName: string,
    data: Record<string, unknown>
  ): Promise<void> => {
    if (!caseId || !tenantId) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!factFind) {
      // Look up contact_id from the case
      const { data: caseRow } = await supabase
        .from('cases')
        .select('contact_id')
        .eq('id', caseId)
        .single()

      const { data: inserted, error: insertError } = await supabase
        .from('fact_finds')
        .insert({
          tenant_id:  tenantId,
          contact_id: caseRow?.contact_id,
          case_id:    caseId,
          status:     'draft',
          created_by: user?.id ?? null,
          [sectionName]: data,
        })
        .select()
        .single()
      if (insertError) setError(insertError.message)
      else setFactFind(inserted as FactFindRecord)
    } else {
      const { data: updated, error: updateError } = await supabase
        .from('fact_finds')
        .update({ [sectionName]: data, updated_at: new Date().toISOString() })
        .eq('id', factFind.id)
        .select()
        .single()
      if (updateError) setError(updateError.message)
      else setFactFind(updated as FactFindRecord)
    }
    setSaving(false)
  }, [caseId, tenantId, factFind])

  const markComplete = useCallback(async (): Promise<void> => {
    if (!factFind) return
    setSaving(true)
    const { data: updated, error: updateError } = await supabase
      .from('fact_finds')
      .update({ status: 'complete', updated_at: new Date().toISOString() })
      .eq('id', factFind.id)
      .select()
      .single()
    if (updateError) setError(updateError.message)
    else setFactFind(updated as FactFindRecord)
    setSaving(false)
  }, [factFind])

  return { factFind, loading, saving, error, saveSection, markComplete, refetch: fetch }
}
