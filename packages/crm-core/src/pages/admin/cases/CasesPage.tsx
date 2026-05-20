import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus, Search } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useCases } from '@/hooks/useCases'
import { useContacts } from '@/hooks/useContacts'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { CaseForm } from '@/components/crm/CaseForm'
import { cn } from '@/lib/cn'

export function CasesPage() {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { cases, loading, addCase } = useCases(tenantId)
  const { contacts } = useContacts(tenantId)
  const { stages } = usePipelineStages(tenantId)

  const [search, setSearch]       = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [showForm, setShowForm]   = useState(false)

  const filtered = cases.filter(c => {
    const contact = c.contact
    const fullName = contact ? `${contact.first_name} ${contact.last_name}` : ''
    const matchSearch = search === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      fullName.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === 'all'
      ? true
      : stageFilter === 'none'
        ? !c.stage_id
        : c.stage_id === stageFilter
    return matchSearch && matchStage
  })

  const openCount   = cases.filter(c => !c.closed_at).length
  const closedCount = cases.filter(c => !!c.closed_at).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {openCount} open · {closedCount} closed — {tenant?.name}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FolderPlus size={16} />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases or contacts…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Stage filter pills */}
        {[{ id: 'all', name: 'All stages' }, { id: 'none', name: 'No stage' }, ...stages].map(s => (
          <button
            key={s.id}
            onClick={() => setStageFilter(s.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              stageFilter === s.id
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading cases…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {cases.length === 0 ? 'No cases yet. Create your first one.' : 'No cases match your search.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Case</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Stage</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const isOpen = !c.closed_at
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-900 text-sm">{c.title}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {c.contact
                        ? `${c.contact.first_name} ${c.contact.last_name}`
                        : <span className="text-slate-400 italic">Unknown</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.stage ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${c.stage.color}20`,
                            color: c.stage.color,
                          }}
                        >
                          {c.stage.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        isOpen
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      )}>
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(c.opened_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <CaseForm
          contacts={contacts}
          stages={stages}
          onSubmit={addCase}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
