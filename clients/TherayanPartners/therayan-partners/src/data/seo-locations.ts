export type Sector = {
  slug: string
  name: string
  namePlural: string
  headline: string
  metaTitle: string
  intro: string
  problems: string[]
  solutions: { title: string; body: string }[]
  faqs: { q: string; a: string }[]
  keywords: string[]
}

export type Location = {
  slug: string
  name: string
  county?: string
  region: string
  type: 'county' | 'city'
}

export const sectors: Sector[] = [
  {
    slug: 'mortgage-brokers',
    name: 'Mortgage Broker',
    namePlural: 'Mortgage Brokers',
    headline: 'CRM & Automation for Mortgage Brokers',
    metaTitle: 'Mortgage Broker CRM',
    intro:
      'From the moment a lead lands to the moment your client completes — every step automated, every document generated, every follow-up sent without lifting a finger.',
    problems: [
      'Leads slipping through the cracks between enquiry and fact-find',
      'Manually chasing clients for payslips, bank statements and ID',
      'Hours lost re-entering the same client data across multiple systems',
      'No clear visibility of where each case actually stands',
    ],
    solutions: [
      {
        title: 'Lead capture & instant qualification',
        body: 'Every enquiry — web form, referral, social — lands in your CRM automatically, pre-qualified and routed to the right adviser.',
      },
      {
        title: 'Automated document requests',
        body: 'The system sends the right document checklist to each client at the right stage. No chasing. No forgetting.',
      },
      {
        title: 'Compliance-ready case files',
        body: 'Every interaction, document and decision recorded automatically. Audit trail built in.',
      },
      {
        title: 'Pipeline visibility at a glance',
        body: 'See every case, every stage, every pending action on one screen. Know exactly what needs attention today.',
      },
    ],
    faqs: [
      {
        q: 'How long does setup take for a mortgage broker?',
        a: 'Most mortgage broker CRM setups are live within 2–3 weeks. We configure your pipeline stages, document types and intake forms to match how you actually work.',
      },
      {
        q: 'Can it integrate with sourcing tools like Trigold or Criteria Hub?',
        a: 'Yes — Bookable integrates with third-party APIs. We build the integration to your specification.',
      },
      {
        q: 'Is it suitable for a sole trader mortgage broker?',
        a: 'Absolutely. Many of our mortgage broker clients are sole traders or small teams. There are no per-user fees, so cost stays fixed as you grow.',
      },
    ],
    keywords: ['mortgage broker CRM', 'mortgage broker software', 'mortgage broker automation', 'CRM for mortgage advisers'],
  },
  {
    slug: 'property-investors',
    name: 'Property Investor',
    namePlural: 'Property Investors & Dealpackagers',
    headline: 'CRM & Deal Management for Property Investors',
    metaTitle: 'Property Investor CRM',
    intro:
      'Manage your deal pipeline, vendor relationships and buyer lists in one place — from sourcing to completion, fully automated.',
    problems: [
      'Deals falling through because follow-up was manual and got missed',
      'Buyer and vendor details scattered across spreadsheets and email',
      'No automated way to update buyers when a deal matches their criteria',
      'Time wasted on admin that should be on finding the next deal',
    ],
    solutions: [
      {
        title: 'Deal pipeline management',
        body: 'Track every deal from sourcing through due diligence to completion. Configurable stages that match your actual buying process.',
      },
      {
        title: 'Automated buyer matching',
        body: 'When a deal lands, the system automatically identifies matching buyers from your list and sends them the details.',
      },
      {
        title: 'Vendor relationship tracking',
        body: 'Every vendor touchpoint recorded. Automated follow-up sequences keep you front of mind without manual effort.',
      },
      {
        title: 'Document & contract automation',
        body: 'NDAs, HoTs, deal packs — generated and sent automatically at the right stage.',
      },
    ],
    faqs: [
      {
        q: 'Does it work for dealpackagers as well as buy-to-let investors?',
        a: 'Yes — the pipeline stages and document types are fully configurable. Whether you are packaging deals for investors or buying yourself, the system adapts.',
      },
      {
        q: 'Can I manage multiple strategies — HMO, flips, serviced accommodation — in one system?',
        a: 'Yes. You can have separate pipelines for each strategy, each with their own stages, documents and automations.',
      },
      {
        q: 'How does the buyer list automation work?',
        a: 'You define buyer criteria — location, price range, property type, yield requirements — and when a deal is added that matches, the system automatically alerts the right buyers.',
      },
    ],
    keywords: ['property investor CRM', 'dealpackager software', 'property investment automation', 'deal sourcing software UK'],
  },
  {
    slug: 'equity-release',
    name: 'Equity Release Adviser',
    namePlural: 'Equity Release Advisers',
    headline: 'CRM & Compliance Automation for Equity Release Advisers',
    metaTitle: 'Equity Release Adviser CRM',
    intro:
      'Handle the compliance burden of equity release advice without the manual overhead — every client journey tracked, every document generated, every suitability check recorded.',
    problems: [
      'Lengthy suitability assessments creating admin bottlenecks',
      'Manual tracking of client vulnerabilities and best interest outcomes',
      'Document generation taking hours instead of minutes',
      'Difficulty demonstrating compliant advice processes to the FCA',
    ],
    solutions: [
      {
        title: 'Suitability workflow automation',
        body: 'Guided fact-find and suitability assessment built into the client journey. Every answer captured and recorded automatically.',
      },
      {
        title: 'Vulnerability flagging',
        body: 'The system identifies and flags vulnerable client indicators, ensuring the right care and documentation at every step.',
      },
      {
        title: 'Best interest outcome documentation',
        body: 'Automatically generates the documentation demonstrating why your recommendation is in the client\'s best interest.',
      },
      {
        title: 'FCA-ready audit trail',
        body: 'Every interaction, decision and document timestamped and stored. Compliance reporting at the click of a button.',
      },
    ],
    faqs: [
      {
        q: 'Is Bookable suitable for directly authorised equity release advisers?',
        a: 'Yes. The system is built around the compliance requirements of directly authorised advisers, including Equity Release Council membership requirements.',
      },
      {
        q: 'Can it handle both lifetime mortgages and home reversion plans?',
        a: 'Yes — the pipeline and document types can be configured for any equity release product type.',
      },
      {
        q: 'Does it integrate with providers like Legal & General or Pure Retirement?',
        a: 'We build integrations to your specification. If there is an API available, we can connect to it.',
      },
    ],
    keywords: ['equity release CRM', 'equity release adviser software', 'equity release compliance software', 'lifetime mortgage CRM'],
  },
  {
    slug: 'solicitors',
    name: 'Solicitor & Conveyancer',
    namePlural: 'Solicitors & Conveyancers',
    headline: 'Case Management & Automation for Solicitors',
    metaTitle: 'Legal Case Management Software',
    intro:
      'From client onboarding to matter completion — every case managed, every document generated, every deadline tracked. Without the manual overhead.',
    problems: [
      'Client onboarding taking days when it should take minutes',
      'Fee earners spending billable time on admin and chasing',
      'Case documents generated manually and prone to errors',
      'No clear view of matter progress across the whole firm',
    ],
    solutions: [
      {
        title: 'Digital client onboarding',
        body: 'Client care letters, terms of business, ID verification and AML checks — all handled automatically before the matter even opens.',
      },
      {
        title: 'Document automation',
        body: 'Standard letters, contracts and court forms generated from matter data. No copy-pasting. No errors.',
      },
      {
        title: 'Matter pipeline management',
        body: 'Every matter at every stage visible at a glance. Automated reminders when deadlines approach or actions are overdue.',
      },
      {
        title: 'Billing integration',
        body: 'Time recording, invoice generation and payment tracking built into the workflow. Know exactly what has been billed and what is outstanding.',
      },
    ],
    faqs: [
      {
        q: 'Which practice areas does Bookable support?',
        a: 'The system is configurable for any practice area. Current clients include conveyancers, family law solicitors, probate practitioners and commercial property teams.',
      },
      {
        q: 'Is it SRA compliant?',
        a: 'Bookable is built to support SRA compliance requirements including client care obligations, AML checks and file management. We work with your compliance officer during setup.',
      },
      {
        q: 'Can it handle both residential and commercial conveyancing?',
        a: 'Yes — you can have separate matter types with different pipeline stages, document sets and workflows for residential and commercial work.',
      },
    ],
    keywords: ['legal case management software', 'conveyancing software UK', 'solicitor CRM', 'law firm automation software'],
  },
]

export const locations: Location[] = [
  { slug: 'surrey', name: 'Surrey', region: 'South East England', type: 'county' },
  { slug: 'kent', name: 'Kent', region: 'South East England', type: 'county' },
  { slug: 'west-sussex', name: 'West Sussex', region: 'South East England', type: 'county' },
  { slug: 'east-sussex', name: 'East Sussex', region: 'South East England', type: 'county' },
  { slug: 'hampshire', name: 'Hampshire', region: 'South East England', type: 'county' },
  { slug: 'berkshire', name: 'Berkshire', region: 'South East England', type: 'county' },
  { slug: 'hertfordshire', name: 'Hertfordshire', region: 'East of England', type: 'county' },
  { slug: 'essex', name: 'Essex', region: 'East of England', type: 'county' },
  { slug: 'buckinghamshire', name: 'Buckinghamshire', region: 'South East England', type: 'county' },
  { slug: 'oxfordshire', name: 'Oxfordshire', region: 'South East England', type: 'county' },
  { slug: 'brighton', name: 'Brighton', county: 'East Sussex', region: 'South East England', type: 'city' },
  { slug: 'southampton', name: 'Southampton', county: 'Hampshire', region: 'South East England', type: 'city' },
  { slug: 'reading', name: 'Reading', county: 'Berkshire', region: 'South East England', type: 'city' },
  { slug: 'guildford', name: 'Guildford', county: 'Surrey', region: 'South East England', type: 'city' },
  { slug: 'maidstone', name: 'Maidstone', county: 'Kent', region: 'South East England', type: 'city' },
  { slug: 'oxford', name: 'Oxford', county: 'Oxfordshire', region: 'South East England', type: 'city' },
  { slug: 'portsmouth', name: 'Portsmouth', county: 'Hampshire', region: 'South East England', type: 'city' },
  { slug: 'crawley', name: 'Crawley', county: 'West Sussex', region: 'South East England', type: 'city' },
  { slug: 'worthing', name: 'Worthing', county: 'West Sussex', region: 'South East England', type: 'city' },
  { slug: 'eastbourne', name: 'Eastbourne', county: 'East Sussex', region: 'South East England', type: 'city' },
  { slug: 'basingstoke', name: 'Basingstoke', county: 'Hampshire', region: 'South East England', type: 'city' },
  { slug: 'slough', name: 'Slough', county: 'Berkshire', region: 'South East England', type: 'city' },
  { slug: 'tunbridge-wells', name: 'Tunbridge Wells', county: 'Kent', region: 'South East England', type: 'city' },
  { slug: 'chelmsford', name: 'Chelmsford', county: 'Essex', region: 'East of England', type: 'city' },
]

export function getSector(slug: string): Sector | undefined {
  return sectors.find(s => s.slug === slug)
}

export function getLocation(slug: string): Location | undefined {
  return locations.find(l => l.slug === slug)
}

// All valid sector/location combinations — used by sitemap + route validation
export function getAllCombinations(): { sector: string; location: string }[] {
  return sectors.flatMap(s => locations.map(l => ({ sector: s.slug, location: l.slug })))
}
