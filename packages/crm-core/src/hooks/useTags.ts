import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContactTag } from '@/types'

export function useTags(tenantId: string | null) {
  const [tags, setTags] = useState<ContactTag[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!tenantId) { setTags([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('contact_tags')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name')
    setTags((data as ContactTag[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function addTag(name: string, color: string): Promise<ContactTag | null> {
    if (!tenantId) return null
    const { data } = await supabase
      .from('contact_tags')
      .insert({ tenant_id: tenantId, name, color })
      .select()
      .single()
    if (data) {
      const tag = data as ContactTag
      setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
      return tag
    }
    return null
  }

  async function updateTag(id: string, values: { name?: string; color?: string }) {
    await supabase.from('contact_tags').update(values).eq('id', id)
    setTags(prev => prev.map(t => t.id === id ? { ...t, ...values } : t))
  }

  async function deleteTag(id: string) {
    await supabase.from('contact_tags').delete().eq('id', id)
    setTags(prev => prev.filter(t => t.id !== id))
  }

  return { tags, loading, refetch: fetch, addTag, updateTag, deleteTag }
}

/** Fetch tag IDs linked to a specific contact */
export function useContactTags(contactId: string | null) {
  const [tagIds, setTagIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!contactId) { setTagIds([]); setLoading(false); return }
    const { data } = await supabase
      .from('contact_tag_links')
      .select('tag_id')
      .eq('contact_id', contactId)
    setTagIds((data ?? []).map(d => (d as { tag_id: string }).tag_id))
    setLoading(false)
  }, [contactId])

  useEffect(() => { fetch() }, [fetch])

  async function linkTag(tagId: string) {
    if (!contactId) return
    await supabase.from('contact_tag_links').insert({ contact_id: contactId, tag_id: tagId })
    setTagIds(prev => [...prev, tagId])
  }

  async function unlinkTag(tagId: string) {
    if (!contactId) return
    await supabase.from('contact_tag_links').delete().eq('contact_id', contactId).eq('tag_id', tagId)
    setTagIds(prev => prev.filter(id => id !== tagId))
  }

  return { tagIds, loading, refetch: fetch, linkTag, unlinkTag }
}
