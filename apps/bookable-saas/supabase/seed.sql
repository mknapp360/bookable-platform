-- ============================================================
-- bookable-crm  |  Seed Data
-- ============================================================

-- ─── TENANTS ────────────────────────────────────────────────
insert into tenants (id, name, slug, branding) values
  (
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    'Thérayan Partners Ltd',
    'therayan-partners',
    '{"primaryColor": "#1d4ed8", "companyName": "Thérayan Partners Ltd"}'
  ),
  (
    'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
    'Viva Equity Release Sussex',
    'viva-equity-release',
    '{"primaryColor": "#059669", "companyName": "Viva Equity Release Sussex"}'
  ),
  (
    'cccccccc-0003-0003-0003-cccccccccccc',
    'Bookable',
    'bookable',
    '{"primaryColor": "#2563eb", "companyName": "Bookable"}'
  );
    

-- ─── PIPELINE STAGES: Bookable (lead qualification) ─────────
insert into pipeline_stages (tenant_id, name, "order", color, description) values
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Quiz Lead',   1, '#6366f1', 'Came in via website quiz'),
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Contacted',   2, '#f59e0b', 'Initial outreach made'),
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Qualified',   3, '#3b82f6', 'Confirmed fit for a client tenant'),
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Onboarded',   4, '#10b981', 'Moved to their own tenant');

-- ─── PIPELINE STAGES: Thérayan Partners (property investment)
insert into pipeline_stages (tenant_id, name, "order", color, description) values
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Enquiry',    1, '#6366f1', 'Initial contact or lead capture'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Qualified',  2, '#f59e0b', 'Needs confirmed, financially viable'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Viewing',    3, '#3b82f6', 'Property viewings / survey arranged'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Offer',      4, '#8b5cf6', 'Offer made or accepted'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Legal',      5, '#ec4899', 'Solicitors instructed, exchange pending'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Completed',  6, '#10b981', 'Transaction completed');

-- ─── PIPELINE STAGES: Viva Equity Release ───────────────────
insert into pipeline_stages (tenant_id, name, "order", color, description) values
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Enquiry',     1, '#6366f1', 'Initial enquiry or referral'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Fact Find',   2, '#f59e0b', 'Fact find completed, needs assessed'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Valuation',   3, '#3b82f6', 'Property valuation instructed'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Application', 4, '#8b5cf6', 'Application submitted to lender'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Offer',       5, '#ec4899', 'Formal offer received from lender'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Completion',  6, '#10b981', 'Funds released, case complete');

-- ─── DOCUMENT TYPES: Thérayan Partners ──────────────────────
insert into document_types (tenant_id, name, required, description) values
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Proof of ID',            true,  'Passport or driving licence'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Proof of Address',       true,  'Utility bill or bank statement (3 months)'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Proof of Funds',         true,  'Bank statement or mortgage AIP'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Memorandum of Sale',     false, 'Issued once offer accepted'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Survey Report',          false, 'RICS survey or homebuyer report'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Solicitor Confirmation', false, 'Confirmation solicitors are instructed'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Completion Statement',   false, 'Final financial statement from solicitor');

-- ─── DOCUMENT TYPES: Viva Equity Release ────────────────────
insert into document_types (tenant_id, name, required, description) values
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Proof of ID',                  true,  'Passport or driving licence'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Proof of Address',             true,  'Utility bill or bank statement (3 months)'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Title Deeds / Land Registry',  true,  'Proof of property ownership'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Fact Find Document',           true,  'Completed fact find from initial meeting'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Key Facts Illustration (KFI)', true,  'Lender KFI document'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Suitability Letter',           true,  'Adviser suitability report (FCA required)'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Valuation Report',             false, 'Independent property valuation'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Formal Offer Letter',          false, 'Lender formal offer'),
  ('cccccccc-0003-0003-0003-cccccccccccc', 'Completion Pack',              false, 'Final documents from solicitor');
