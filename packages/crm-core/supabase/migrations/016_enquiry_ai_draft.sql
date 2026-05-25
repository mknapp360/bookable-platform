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
