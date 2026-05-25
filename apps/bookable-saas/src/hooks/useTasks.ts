import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'

/** In-progress tasks float to the top, everything else keeps its sort_order. */
function sortWithInProgressFirst(tasks: Task[]): Task[] {
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const rest = tasks.filter(t => t.status !== 'in_progress')
  return [...inProgress, ...rest]
}

export function useTasks(tenantId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!tenantId) { setTasks([]); setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email),
        case:cases(id, title),
        pipeline_stage:pipeline_stages(id, name, color, order, phase)
      `)
      .eq('tenant_id', tenantId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTasks(sortWithInProgressFirst((data as Task[]) ?? []))
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  async function addTask(values: Partial<Task>): Promise<{ error: string | null }> {
    if (!tenantId) return { error: 'No tenant' }
    // New tasks get sort_order 0 (top of list) and push others down
    const { error } = await supabase.from('tasks').insert({
      title: values.title ?? '',
      ...values,
      tenant_id: tenantId,
      sort_order: 0,
    } as never)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function updateTask(
    id: string,
    values: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'contact_id' | 'case_id' | 'pipeline_stage_id' | 'assigned_to'>>
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('tasks').update(values as never).eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function deleteTask(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  /** Persist a new ordering after drag-and-drop. Accepts the full reordered task id list. */
  async function reorderTasks(orderedIds: string[]): Promise<{ error: string | null }> {
    // Optimistic: update local state immediately
    const reordered = orderedIds
      .map((id, i) => {
        const t = tasks.find(t => t.id === id)
        return t ? { ...t, sort_order: i } : null
      })
      .filter(Boolean) as Task[]
    setTasks(sortWithInProgressFirst(reordered))

    // Persist to DB — batch update each task's sort_order
    const updates = orderedIds.map((id, i) =>
      supabase.from('tasks').update({ sort_order: i } as never).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    if (failed?.error) {
      await fetch() // rollback to server state
      return { error: failed.error.message }
    }
    return { error: null }
  }

  return { tasks, loading, error, refetch: fetch, addTask, updateTask, deleteTask, reorderTasks }
}
