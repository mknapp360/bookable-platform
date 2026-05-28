import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Document } from '@/types'

export function useDocuments(tenantId: string | null) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!tenantId) { setDocuments([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        case:cases(id, title)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    setDocuments((data as Document[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function uploadDocument(
    file: File,
    values: { name: string; type: string; contactId?: string | null; caseId?: string | null }
  ): Promise<{ error: string | null }> {
    if (!tenantId) return { error: 'No tenant' }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Upload file to storage
    const ext = file.name.split('.').pop()
    const storagePath = `${tenantId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { contentType: file.type })

    if (uploadError) return { error: uploadError.message }

    // Insert document record
    const { error: insertError } = await supabase.from('documents').insert({
      tenant_id: tenantId,
      name: values.name,
      type: values.type,
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      contact_id: values.contactId ?? null,
      case_id: values.caseId ?? null,
      uploaded_by: user?.id ?? null,
    })

    if (insertError) return { error: insertError.message }

    await fetch()
    return { error: null }
  }

  async function deleteDocument(doc: Document): Promise<{ error: string | null }> {
    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])
    if (storageError) return { error: storageError.message }

    // Then delete the record
    const { error: dbError } = await supabase.from('documents').delete().eq('id', doc.id)
    if (dbError) return { error: dbError.message }

    setDocuments(prev => prev.filter(d => d.id !== doc.id))
    return { error: null }
  }

  async function getSignedUrl(filePath: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600) // 1 hour
    if (error) return null
    return data.signedUrl
  }

  return { documents, loading, refetch: fetch, uploadDocument, deleteDocument, getSignedUrl }
}
