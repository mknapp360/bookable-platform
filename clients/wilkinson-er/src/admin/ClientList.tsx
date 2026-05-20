import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTenant } from '../hooks/useTenant'

type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  created_at: string
}

type Props = {
  onOpenFactFind: (contactId: string, contactName: string) => void
}

export default function ClientList({ onOpenFactFind }: Props) {
  const { tenant } = useTenant()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function loadContacts() {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email, phone, created_at')
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setContacts((data as Contact[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { loadContacts() }, [])

  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault()
    if (!tenant) { setCreateError('Tenant not loaded — please refresh.'); return }
    setCreating(true)
    setCreateError(null)
    const { data, error: insertError } = await supabase
      .from('contacts')
      .insert({
        tenant_id: tenant.id,
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
      })
      .select()
      .single()
    if (insertError) {
      setCreateError(insertError.message)
      setCreating(false)
      return
    }
    const contact = data as Contact
    setNewFirstName('')
    setNewLastName('')
    setNewEmail('')
    setNewPhone('')
    setShowNewForm(false)
    setCreating(false)
    // Open fact find immediately for the new contact
    onOpenFactFind(contact.id, `${contact.first_name} ${contact.last_name}`.trim())
  }

  function handleCancelNew() {
    setShowNewForm(false)
    setNewFirstName('')
    setNewLastName('')
    setNewEmail('')
    setNewPhone('')
    setCreateError(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          New Client
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">New Client</h3>
          <form onSubmit={handleCreateContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={newFirstName}
                  onChange={e => setNewFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={newLastName}
                  onChange={e => setNewLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !tenant}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating…' : 'Create & Open Fact Find'}
              </button>
              <button
                type="button"
                onClick={handleCancelNew}
                className="border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-400">Loading clients…</div>
      )}

      {error && (
        <div className="text-sm text-red-600 mb-4">{error}</div>
      )}

      {!loading && contacts.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          No clients yet. Click "New Client" to add one.
        </div>
      )}

      {!loading && contacts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {contact.email ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {contact.phone ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(contact.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onOpenFactFind(contact.id, `${contact.first_name} ${contact.last_name}`.trim())}
                      className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Open Fact Find
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
