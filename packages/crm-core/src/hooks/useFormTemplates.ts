import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FormTemplate, FormSchema } from '@/types'

export function useFormTemplates(tenantId: string | null) {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!tenantId) { setTemplates([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('form_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    setTemplates((data as unknown as FormTemplate[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function createFormTemplate(
    name: string,
    schema: FormSchema = { pages: [] }
  ): Promise<FormTemplate | null> {
    if (!tenantId) return null
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('form_templates')
      .insert({
        tenant_id: tenantId,
        name,
        schema: JSON.parse(JSON.stringify(schema)),
        created_by: user?.id ?? null,
      })
      .select()
      .single()
    if (data) {
      const template = data as unknown as FormTemplate
      setTemplates(prev => [template, ...prev])
      return template
    }
    return null
  }

  async function updateFormTemplate(
    id: string,
    values: { name?: string; schema?: FormSchema; status?: 'draft' | 'published' }
  ): Promise<{ error: string | null }> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (values.name !== undefined) update.name = values.name
    if (values.schema !== undefined) update.schema = JSON.parse(JSON.stringify(values.schema))
    if (values.status !== undefined) update.status = values.status
    const { error } = await supabase.from('form_templates').update(update as never).eq('id', id)
    if (error) return { error: error.message }
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...values, updated_at: update.updated_at as string } : t))
    return { error: null }
  }

  async function deleteFormTemplate(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('form_templates').delete().eq('id', id)
    if (error) return { error: error.message }
    setTemplates(prev => prev.filter(t => t.id !== id))
    return { error: null }
  }

  return { templates, loading, refetch: fetch, createFormTemplate, updateFormTemplate, deleteFormTemplate }
}
