import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FormSubmission } from '@/types'

export function useFormSubmissions(tenantId: string | null, formTemplateId?: string) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!tenantId) { setSubmissions([]); setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from('form_submissions')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (formTemplateId) {
      query = query.eq('form_template_id', formTemplateId)
    }
    const { data } = await query
    setSubmissions((data as FormSubmission[]) ?? [])
    setLoading(false)
  }, [tenantId, formTemplateId])

  useEffect(() => { fetch() }, [fetch])

  async function sendToContact(
    formTemplateId: string,
    contactId: string
  ): Promise<{ submission: FormSubmission | null; error: string | null }> {
    if (!tenantId) return { submission: null, error: 'No tenant' }
    const token = crypto.randomUUID()
    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        tenant_id: tenantId,
        form_template_id: formTemplateId,
        contact_id: contactId,
        token,
        status: 'pending',
        sent_at: new Date().toISOString(),
      })
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email)
      `)
      .single()
    if (error) return { submission: null, error: error.message }
    const submission = data as FormSubmission
    setSubmissions(prev => [submission, ...prev])
    return { submission, error: null }
  }

  return { submissions, loading, refetch: fetch, sendToContact }
}
