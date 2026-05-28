// ─── Tenant ────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string
  name: string
  slug: string
  settings: Record<string, unknown>
  branding: {
    primaryColor?: string
    logoUrl?: string
    companyName?: string
  }
  case_conversion_stage_id: string | null
  created_at: string
}

// ─── Users ─────────────────────────────────────────────────────────────────
export type TenantRole = 'admin' | 'staff'

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: TenantRole
  created_at: string
}

// ─── Pipeline ──────────────────────────────────────────────────────────────
export interface PipelineStage {
  id: string
  tenant_id: string
  name: string
  order: number
  phase: number
  color: string
  description: string | null
  created_at: string
}

// ─── Form Builder ─────────────────────────────────────────────────────────
export type FormFieldType = 'text' | 'date' | 'message'

export interface FormField {
  id: string
  label: string
  type: FormFieldType
  required: boolean
  order: number
  placeholder?: string
}

export interface FormPage {
  id: string
  title: string
  order: number
  fields: FormField[]
}

export interface FormSchema {
  pages: FormPage[]
}

export interface FormTemplate {
  id: string
  tenant_id: string
  name: string
  schema: FormSchema
  status: 'draft' | 'published'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FormSubmission {
  id: string
  tenant_id: string
  form_template_id: string
  contact_id: string | null
  token: string
  status: 'pending' | 'completed'
  responses: Record<string, string>
  sent_at: string | null
  completed_at: string | null
  created_at: string
  // joined
  contact?: Contact
  form_template?: FormTemplate
}

// ─── Document Types ─────────────────────────────────────────────────────────
export interface DocumentType {
  id: string
  tenant_id: string
  name: string
  required: boolean
  stage_id: string | null
  description: string | null
  created_at: string
}

// ─── Contacts ──────────────────────────────────────────────────────────────
export type ContactStatus = 'lead' | 'active' | 'inactive' | 'closed'
export type ContactSource = 'website' | 'referral' | 'manual' | 'phone' | 'email' | 'other'

export interface Contact {
  id: string
  tenant_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  source: ContactSource
  status: ContactStatus
  assigned_to: string | null
  notes: string | null
  metadata: Record<string, unknown>
  pipeline_stage_id: string | null
  created_at: string
  updated_at: string
  // joined
  pipeline_stage?: PipelineStage
}

// ─── Emails ───────────────────────────────────────────────────────────────
export interface Email {
  id: string
  tenant_id: string
  contact_id: string | null
  direction: 'inbound' | 'outbound'
  from_email: string
  from_name: string | null
  to_email: string
  to_name: string | null
  subject: string | null
  body_text: string | null
  body_html: string | null
  message_id: string | null
  in_reply_to: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ─── Cases ─────────────────────────────────────────────────────────────────
export interface Case {
  id: string
  tenant_id: string
  contact_id: string
  title: string
  stage_id: string | null
  opened_at: string
  closed_at: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // joined
  contact?: Contact
  stage?: PipelineStage
}

// ─── Documents ─────────────────────────────────────────────────────────────
export interface CaseDocument {
  id: string
  case_id: string
  document_type_id: string | null
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  uploaded_at: string
  notes: string | null
  // joined
  document_type?: DocumentType
}

// ─── Activities ─────────────────────────────────────────────────────────────
export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'meeting'
  | 'status_change'
  | 'document_uploaded'
  | 'case_created'
  | 'contact_created'

export interface Activity {
  id: string
  tenant_id: string
  contact_id: string | null
  case_id: string | null
  type: ActivityType
  body: string | null
  created_by: string | null
  created_at: string
  metadata?: {
    event_id?:       string
    html_link?:      string
    meet_link?:      string | null
    cancelled?:      boolean
    // stored on create/update for edit pre-fill
    title?:          string
    start_datetime?: string
    end_datetime?:   string
    location?:       string | null
  } | null
}

// ─── Enquiries ─────────────────────────────────────────────────────────────
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'dismissed'

export interface Enquiry {
  id: string
  tenant_id: string | null
  name: string
  email: string
  phone?: string | null
  message: string
  source: string
  status: EnquiryStatus
  notes: string | null
  pipeline_stage_id: string | null
  ai_draft?: string | null
  ai_draft_status?: 'none' | 'generating' | 'ready' | 'sent'
  created_at: string
  // joined
  pipeline_stage?: PipelineStage
}

// ─── Tasks ─────────────────────────────────────────────────────────────────
export type TaskStatus   = 'open' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  tenant_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  contact_id: string | null
  case_id: string | null
  pipeline_stage_id: string | null
  assigned_to: string | null
  created_by: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // joined
  contact?: Contact
  case?: Case
  pipeline_stage?: PipelineStage
}

// ─── Documents ────────────────────────────────────────────────────────────
export type DocumentCategory = 'brochure'

export interface Document {
  id: string
  tenant_id: string
  name: string
  type: DocumentCategory
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  contact_id: string | null
  case_id: string | null
  uploaded_by: string | null
  created_at: string
  // joined
  contact?: Contact
  case?: Case
}

// ─── Contact Tags ─────────────────────────────────────────────────────────
export interface ContactTag {
  id: string
  tenant_id: string
  name: string
  color: string
  created_at: string
}

export interface ContactTagLink {
  id: string
  contact_id: string
  tag_id: string
  created_at: string
  // joined
  tag?: ContactTag
}

// ─── Utility ────────────────────────────────────────────────────────────────
export type DatabaseRow<T> = T & { id: string; created_at: string }
