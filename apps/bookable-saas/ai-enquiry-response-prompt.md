# BookableCRM — AI Enquiry Response Drafting

## What you're building

When a new enquiry arrives in BookableCRM (via the embed widget or manually), the system automatically drafts a reply using AI. The draft appears in the enquiry panel, ready for the owner to review and send with one click. Nothing sends automatically — the human is always in the loop.

There are two parts:
1. A **Business Profile** section in the account settings page — where the owner describes their business once, giving the AI its brief.
2. An **Edge Function** that drafts the response when a new enquiry is created, storing it against the enquiry record.

---

## Codebase context

Read the existing codebase carefully before implementing. Key files to understand first:

- `src/types/index.ts` — all data types including `Enquiry`, `Tenant`, `Activity`
- `supabase/functions/send-email/index.ts` — the established Edge Function pattern (Deno, service role client, CORS headers, env vars)
- `supabase/functions/submit-enquiry/index.ts` — the enquiry submission function (recently added; this is the trigger point)
- `src/components/crm/EnquiryPanel.tsx` — the UI panel where enquiry details are shown; the draft will surface here
- `supabase/migrations/` — read the latest migration to understand the current schema before adding to it
- `src/context/CrmConfigContext.tsx` — how tenant settings are accessed in the React app
- Any existing settings page — follow the same layout and component patterns

---

## Part 1 — Business Profile (Settings UI)

Add a **"Business Profile"** section to the account settings page. This is the context the AI uses every time it drafts a response.

**Fields:**

| Field | Type | Description |
|---|---|---|
| Business description | Textarea | 2–4 sentences. What the business does, who it serves. e.g. "We're a financial planning practice based in Manchester, working with professionals and small business owners on pensions, protection, and investment." |
| Tone | Select | Options: `Professional`, `Friendly`, `Formal`. Default: `Professional`. |
| Typical response time | Text (short) | e.g. "within a few hours", "same day". Used in the draft so the prospect knows what to expect. |
| Sign-off name | Text | The name the email should sign off with. e.g. "Sarah" or "The team at Acme Ltd". |

Save these to `tenants.settings.business_profile` as a JSONB object:
```json
{
  "description": "...",
  "tone": "professional",
  "response_time": "within a few hours",
  "signoff_name": "..."
}
```

**UI guidance:**
- Place this as a clearly labelled section within the existing account/settings page — not a new page.
- Add a short explainer above the fields: *"This is used by BookableCRM's AI to draft replies to new enquiries. The more specific you are, the better the drafts."*
- Save button updates `tenants.settings` via the Supabase client.
- Show a success toast on save.

---

## Part 2 — DB Migration (`015_enquiry_ai_draft.sql`)

Add a column to store the AI-drafted response against each enquiry:

```sql
alter table public.enquiries
  add column if not exists ai_draft text;

alter table public.enquiries
  add column if not exists ai_draft_status text
    not null default 'none'
    check (ai_draft_status in ('none', 'generating', 'ready', 'sent'));

comment on column public.enquiries.ai_draft is
  'AI-drafted email response, ready for the owner to review and send.';

comment on column public.enquiries.ai_draft_status is
  'none = not yet generated, generating = in progress, ready = draft available, sent = owner sent it.';
```

Also update `src/types/index.ts` — add `ai_draft?: string | null` and `ai_draft_status?: 'none' | 'generating' | 'ready' | 'sent'` to the `Enquiry` interface.

---

## Part 3 — Edge Function (`supabase/functions/draft-enquiry-response/index.ts`)

Called by `submit-enquiry` immediately after a successful enquiry insert.

**Inputs (POST body):**
```json
{
  "enquiry_id": "uuid",
  "tenant_id": "uuid"
}
```

**Logic:**
1. Use the service-role client to fetch the enquiry row and the tenant's `settings.business_profile`.
2. If `business_profile` is empty or missing, exit gracefully — don't draft. Log a warning.
3. Set `ai_draft_status = 'generating'` on the enquiry row immediately, so the UI can show a loading state.
4. Build the AI prompt (see below).
5. Call the Anthropic API (`claude-haiku-3-5` for speed and cost efficiency). The API key comes from `Deno.env.get('ANTHROPIC_API_KEY')`.
6. On success: update the enquiry row with `ai_draft = <response>` and `ai_draft_status = 'ready'`.
7. On failure: set `ai_draft_status = 'none'` and log the error. Do not surface the error to the prospect — the enquiry is already saved regardless.

**Anthropic API call:**

Use the messages API. Model: `claude-haiku-4-5-20251001`. Import via `https://esm.sh/@anthropic-ai/sdk`.

**System prompt:**
```
You are drafting a reply on behalf of a business to a new enquiry they have received through their website contact form.

Write a short, natural email response — 3 to 5 sentences. Do not use a subject line. Do not use placeholder text. Do not use bullet points. Just write the body of the email.

The email should:
- Acknowledge the enquiry warmly but briefly
- Confirm they will follow up properly (within the stated response time if provided)
- Sign off with the provided name

Match the tone specified. Do not mention AI, CRM software, or automated systems.
```

**User prompt (assembled from business profile + enquiry):**
```
Business description: {business_profile.description}
Tone: {business_profile.tone}
Response time: {business_profile.response_time}
Sign-off name: {business_profile.signoff_name}

Enquiry from: {enquiry.name}
Their message: {enquiry.message}

Draft the reply.
```

---

## Part 4 — Call draft-enquiry-response from submit-enquiry

In `supabase/functions/submit-enquiry/index.ts`, after the successful insert, fire a call to `draft-enquiry-response`. This should be a **fire-and-forget** — do not await it in a way that delays the 200 response back to the form submitter. The form submission must feel instant regardless of how long the AI takes.

Pattern:
```ts
// Fire and forget — don't await, don't let failure affect the response
EdgeRuntime.waitUntil(
  fetch(`${SUPABASE_URL}/functions/v1/draft-enquiry-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ enquiry_id: insertedRow.id, tenant_id }),
  }).catch(err => console.error('draft-response fire-and-forget failed:', err))
)
```

If `EdgeRuntime.waitUntil` is not available in the Supabase Deno environment, use a plain `fetch(...).catch(...)` without await instead.

---

## Part 5 — Enquiry Panel UI

Update `src/components/crm/EnquiryPanel.tsx` to surface the draft when it's ready.

**States to handle:**

- `ai_draft_status === 'none'` and `business_profile` is empty → show a subtle prompt: *"Add a business profile in Settings to enable AI-drafted replies."* (link to settings)
- `ai_draft_status === 'none'` and profile exists → nothing to show yet (enquiry may have been created before this feature)
- `ai_draft_status === 'generating'` → show a subtle loading indicator: *"Drafting reply…"*
- `ai_draft_status === 'ready'` → show the draft in a clearly labelled section: **"AI Draft Reply"**. Display the text in an editable textarea so the owner can tweak it before sending. Include a **"Send"** button that calls the existing `send-email` edge function and then updates `ai_draft_status = 'sent'` on the enquiry.
- `ai_draft_status === 'sent'` → show a muted label: *"Draft sent"* with the sent text below it (read-only).

The draft section should sit below the enquiry details and above the activity feed. Keep it visually distinct but not dominant — the owner should feel like they're reviewing something helpful, not being handed over to a robot.

Use real-time subscription (`supabase.channel`) on the enquiry row so the UI updates automatically when `ai_draft_status` changes from `generating` to `ready` — no manual refresh needed.

---

## What done looks like

- Business Profile fields save correctly to `tenants.settings.business_profile`.
- A new enquiry submitted via the widget triggers a draft within a few seconds.
- The draft appears in the enquiry panel without a page refresh.
- The owner can edit the draft text and send it with one click.
- If no business profile is set, the system skips drafting gracefully — no errors, no broken states.
- `ai_draft_status` transitions correctly through `none → generating → ready → sent`.
- The form submission response time is not affected by the AI call.
- No existing functionality is broken.
