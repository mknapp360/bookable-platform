import { useState, useEffect } from 'react'
import { X, Calendar, CheckCircle, Loader2 } from 'lucide-react'

interface BookingModalProps {
  open: boolean
  onClose: () => void
  prefill?: { name: string; email: string; company: string }
}

interface Slot {
  date: string
  display: string
  times: string[]
}

export default function BookingModal({ open, onClose, prefill }: BookingModalProps) {
  const [step, setStep] = useState<'loading' | 'date' | 'details' | 'confirmed' | 'error'>('loading')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [form, setForm] = useState({ name: '', email: '', company: '', notes: '' })
  const [sending, setSending] = useState(false)

  // Pre-fill form when prefill data changes (e.g. from quiz)
  useEffect(() => {
    if (prefill) {
      setForm((prev) => ({
        ...prev,
        name: prefill.name || prev.name,
        email: prefill.email || prev.email,
        company: prefill.company || prev.company,
      }))
    }
  }, [prefill])

  // Fetch live availability from Google Calendar when modal opens
  useEffect(() => {
    if (!open) return

    setStep('loading')

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-availability`, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load availability')
        return res.json()
      })
      .then((data) => {
        setSlots(data.slots || [])
        setStep('date')
      })
      .catch((err) => {
        console.error('Availability error:', err)
        setStep('error')
      })
  }, [open])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            company: form.company,
            notes: form.notes,
            booking_date: selectedDate,
            booking_time: selectedTime,
          }),
        }
      )

      if (!res.ok) throw new Error('Booking failed')
      setStep('confirmed')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setStep('loading')
    setSlots([])
    setSelectedDate('')
    setSelectedTime('')
    setForm({ name: '', email: '', company: '', notes: '' })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-brand-green" />
            <h2 className="text-xl font-bold text-gray-900">Book a conversation</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Loading availability */}
          {step === 'loading' && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-brand-green animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Checking availability...</p>
            </div>
          )}

          {/* Error loading */}
          {step === 'error' && (
            <div className="text-center py-12">
              <p className="text-gray-900 font-semibold mb-2">Could not load availability</p>
              <p className="text-gray-500 text-sm mb-6">
                Please try again, or get in touch directly.
              </p>
              <button
                onClick={() => {
                  setStep('loading')
                  // Re-trigger the fetch
                  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-availability`, {
                    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setSlots(data.slots || [])
                      setStep('date')
                    })
                    .catch(() => setStep('error'))
                }}
                className="bg-brand-green text-white font-medium px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Confirmed */}
          {step === 'confirmed' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You are booked</h3>
              <p className="text-gray-600 mb-1">
                {slots.find((s) => s.date === selectedDate)?.display} at {selectedTime}
              </p>
              <p className="text-gray-500 text-sm mt-4">
                A calendar invite is on its way to your inbox. We will send a reminder the day before.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 bg-brand-green text-white font-medium px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Date selection — live availability */}
          {step === 'date' && (
            <div>
              <p className="text-gray-600 mb-6">Pick a day and time that works for you. These are live — only showing when we are actually free.</p>
              {slots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-900 font-semibold mb-2">No slots available right now</p>
                  <p className="text-gray-500 text-sm">
                    We are fully booked for the next two weeks. Use the contact form below and we will find a time that works.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {slots.map((slot) => (
                    <div key={slot.date}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{slot.display}</p>
                      <div className="flex flex-wrap gap-2">
                        {slot.times.map((time) => (
                          <button
                            key={`${slot.date}-${time}`}
                            onClick={() => {
                              setSelectedDate(slot.date)
                              setSelectedTime(time)
                              setStep('details')
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              selectedDate === slot.date && selectedTime === time
                                ? 'bg-brand-green text-white border-brand-green'
                                : 'border-gray-200 text-gray-700 hover:border-brand-green hover:text-brand-green'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details form */}
          {step === 'details' && (
            <form onSubmit={handleBook} className="space-y-4">
              <div className="bg-brand-green/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-brand-green font-medium">
                  {slots.find((s) => s.date === selectedDate)?.display} at {selectedTime}
                  <button
                    type="button"
                    onClick={() => setStep('date')}
                    className="ml-2 underline text-brand-green/70 hover:text-brand-green"
                  >
                    Change
                  </button>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
                  placeholder="Your business name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anything we should know?
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all resize-none"
                  placeholder="Brief overview of your business and what you are looking to automate..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-brand-green text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {sending ? 'Booking...' : 'Confirm booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
