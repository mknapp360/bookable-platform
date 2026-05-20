import { useState, useRef } from 'react'
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, Search, GripVertical } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useTasks } from '@/hooks/useTasks'
import { useContacts } from '@/hooks/useContacts'
import { useCases } from '@/hooks/useCases'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { TaskForm } from '@/components/crm/TaskForm'
import { cn } from '@/lib/cn'
import type { Task, TaskStatus, TaskPriority } from '@/types'

const STATUS_META: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  open:        { label: 'Open',        icon: Circle,       color: 'text-slate-400' },
  in_progress: { label: 'In Progress', icon: Clock,        color: 'text-blue-500' },
  completed:   { label: 'Completed',   icon: CheckCircle2, color: 'text-green-500' },
}

const PRIORITY_META: Record<TaskPriority, { label: string; cls: string }> = {
  high:   { label: 'High',   cls: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low',    cls: 'bg-slate-50 text-slate-600 border-slate-200' },
}

export function TasksPage() {
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { tasks, loading, addTask, updateTask, deleteTask, reorderTasks } = useTasks(tenantId)
  const { contacts } = useContacts(tenantId)
  const { cases } = useCases(tenantId)
  const { stages } = usePipelineStages(tenantId)

  const [showForm, setShowForm]           = useState(false)
  const [editingTask, setEditingTask]     = useState<Task | null>(null)
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState<TaskStatus | 'all'>('all')
  const [filterStage, setFilterStage]     = useState<string>('all')

  // Drag state
  const [draggedIdx, setDraggedIdx]   = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Are filters active? (disable drag when filtered since order wouldn't map to the full list)
  const isFiltered = search !== '' || filterStatus !== 'all' || filterStage !== 'all'

  // Filtering
  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterStage !== 'all' && t.pipeline_stage_id !== filterStage) return false
    if (search) {
      const q = search.toLowerCase()
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.contact?.first_name?.toLowerCase().includes(q) ||
        t.contact?.last_name?.toLowerCase().includes(q) ||
        t.pipeline_stage?.name?.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const openCount       = tasks.filter(t => t.status === 'open').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const completedCount  = tasks.filter(t => t.status === 'completed').length

  async function handleQuickStatus(task: Task, newStatus: TaskStatus) {
    await updateTask(task.id, { status: newStatus })
  }

  function isOverdue(t: Task) {
    if (!t.due_date || t.status === 'completed') return false
    return new Date(t.due_date) < new Date(new Date().toDateString())
  }

  // ─── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(idx: number) {
    setDraggedIdx(idx)
    setDragOverIdx(null)
  }

  function handleDragEnd() {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  function handleDragOver(idx: number) {
    if (dragLeaveTimer.current) clearTimeout(dragLeaveTimer.current)
    if (draggedIdx === null || idx === draggedIdx) return
    setDragOverIdx(idx)
  }

  function handleDragLeave() {
    dragLeaveTimer.current = setTimeout(() => setDragOverIdx(null), 80)
  }

  function handleDrop(targetIdx: number) {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }

    // When unfiltered, filtered === tasks so indices map directly
    const reordered = [...filtered]
    const [moved] = reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, moved)

    setDraggedIdx(null)
    setDragOverIdx(null)

    reorderTasks(reordered.map(t => t.id))
  }

  const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {openCount} open · {inProgressCount} in progress · {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-8 py-3 border-b border-slate-100 bg-white shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className={`${inputCls} pl-9 w-full`}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')} className={inputCls}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {stages.length > 0 && (
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className={inputCls}>
            <option value="all">All stages</option>
            {stages.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm gap-1">
            <p>No tasks found</p>
            {tasks.length === 0 && <p className="text-xs">Create your first task to get started.</p>}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="pl-3 pr-0 py-3 w-8"></th>
                <th className="px-2 py-3 w-10"></th>
                <th className="px-3 py-3">Task</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Stage</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, idx) => {
                const sm = STATUS_META[task.status]
                const pm = PRIORITY_META[task.priority]
                const StatusIcon = sm.icon
                const overdue = isOverdue(task)
                const isDragged = draggedIdx === idx
                const isOver = dragOverIdx === idx && draggedIdx !== null && draggedIdx !== idx

                return (
                  <tr
                    key={task.id}
                    draggable={!isFiltered}
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = 'move'
                      handleDragStart(idx)
                    }}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => { e.preventDefault(); handleDragOver(idx) }}
                    onDragLeave={handleDragLeave}
                    onDrop={e => { e.preventDefault(); handleDrop(idx) }}
                    className={cn(
                      'border-b border-slate-50 transition-all',
                      task.status === 'completed' && 'opacity-60',
                      isDragged && 'opacity-30 scale-[0.98]',
                      isOver && 'border-t-2 border-t-blue-400',
                      !isDragged && !isOver && 'hover:bg-slate-50/50',
                    )}
                  >
                    {/* Drag handle */}
                    <td className="pl-3 pr-0 py-3">
                      {!isFiltered && (
                        <span className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                          <GripVertical size={14} />
                        </span>
                      )}
                    </td>

                    {/* Status toggle */}
                    <td className="px-2 py-3">
                      <button
                        onClick={() => {
                          const next: TaskStatus = task.status === 'open' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'open'
                          handleQuickStatus(task, next)
                        }}
                        title={`Status: ${sm.label} — click to advance`}
                        className="hover:scale-110 transition-transform"
                      >
                        <StatusIcon size={18} className={sm.color} />
                      </button>
                    </td>

                    {/* Title + description */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => { setEditingTask(task); setShowForm(true) }}
                        className="text-left group"
                      >
                        <p className={cn(
                          'text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors',
                          task.status === 'completed' && 'line-through',
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                        )}
                      </button>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-3">
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', pm.cls)}>
                        {pm.label}
                      </span>
                    </td>

                    {/* Pipeline stage */}
                    <td className="px-3 py-3">
                      {task.pipeline_stage ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.pipeline_stage.color }} />
                          {task.pipeline_stage.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-3 py-3">
                      {task.contact ? (
                        <span className="text-xs text-slate-600">
                          {task.contact.first_name} {task.contact.last_name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Due date */}
                    <td className="px-3 py-3">
                      {task.due_date ? (
                        <span className={cn('text-xs flex items-center gap-1', overdue ? 'text-red-600 font-medium' : 'text-slate-500')}>
                          {overdue && <AlertTriangle size={12} />}
                          {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 text-xs transition-colors"
                        title="Delete task"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <TaskForm
          contacts={contacts}
          cases={cases}
          stages={stages}
          initial={editingTask ?? undefined}
          onSubmit={async values => {
            if (editingTask) return updateTask(editingTask.id, values)
            return addTask(values)
          }}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
