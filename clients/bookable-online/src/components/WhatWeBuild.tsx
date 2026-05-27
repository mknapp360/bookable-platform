import { Users, CalendarCheck, CreditCard, FileText, MessageSquare, ShieldCheck } from 'lucide-react'
import { UserCheck, Filter, FolderOpen, CheckCircle } from 'lucide-react'

const pipeline = [
  { icon: Users,       label: 'Lead\nCaptured' },
  { icon: Filter,      label: 'Lead\nQualified' },
  { icon: UserCheck,   label: 'Client\nOnboarded' },
  { icon: FolderOpen,  label: 'Case\nManaged' },
  { icon: CreditCard,  label: 'Payment\nReceived' },
  { icon: CheckCircle, label: 'Work\nCompleted' },
]

const capabilities = [
  {
    icon: Users,
    title: 'Every lead captured and tracked automatically',
    description: 'From first contact to qualified deal — no spreadsheets, no missed opportunities.',
  },
  {
    icon: UserCheck,
    title: 'Clients onboard\nthemselves',
    description: 'Forms, contracts and data collection handled automatically — no chasing, no admin.',
  },
  {
    icon: CalendarCheck,
    title: 'Your calendar runs your workflow',
    description: 'Appointments trigger actions, tasks and follow-ups — built around how you actually work.',
  },
  {
    icon: CreditCard,
    title: "You always know who's paid (and who isn't)",
    description: 'Invoicing, tracking and reminders built into your pipeline.',
  },
  {
    icon: FileText,
    title: 'Every case organised automatically',
    description: 'Documents, compliance and client records generated and stored without manual work.',
  },
  {
    icon: MessageSquare,
    title: 'No more\nchasing clients',
    description: 'Emails, reminders and updates sent automatically at the right time.',
  },
]

export default function WhatWeBuild() {
  return (
    <section id="what-we-build" className="py-20 bg-white" aria-label="What we build">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-bookable-green uppercase tracking-widest mb-4">What we build</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            A complete operating system<br />
            <span className="text-bookable-green">for your business.</span>
          </h2>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            We don't install software.<br />We build your business a system, from lead to completion,<br />that runs automatically.
          </p>
        </div>

        {/* Pipeline flow */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 mb-6">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {pipeline.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-bookable-green" />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-pre-line leading-tight font-medium">{step.label}</span>
                  </div>
                  {i < pipeline.length - 1 && (
                    <span className="text-gray-300 text-lg mx-1 flex-shrink-0">›</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Connected line */}
        <p className="text-center text-sm mb-12">
          <span className="font-semibold text-bookable-green">Everything is connected.</span>
          <span className="text-gray-500"> When one thing happens, the rest follows automatically.</span>
        </p>

        {/* Capability cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <div key={cap.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-bookable-green" />
                  </div>
                  <h3 className="font-bold text-gray-900 leading-snug whitespace-pre-line">{cap.title}</h3>
                </div>
                <div className="w-8 h-0.5 bg-bookable-green mb-3 rounded-full ml-[52px]" />
                <p className="text-sm text-gray-500 leading-relaxed">{cap.description}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom banner */}
        <div className="mt-10 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-bookable-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Built for regulated professionals who need{' '}
                <span className="text-bookable-green">systems that just work.</span>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                FCA-compliant document storage, automated client communication records, and case tracking that meets Consumer Duty requirements — without manual input.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
