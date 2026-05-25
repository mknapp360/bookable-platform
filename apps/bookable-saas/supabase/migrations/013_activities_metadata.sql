-- ============================================================
-- bookable-crm  |  Add metadata column to activities
-- Stores structured data alongside activity log entries —
-- used by the calendar integration to record event IDs,
-- Meet links, and cancellation state for scheduled meetings.
-- ============================================================

alter table public.activities
  add column if not exists metadata jsonb;
