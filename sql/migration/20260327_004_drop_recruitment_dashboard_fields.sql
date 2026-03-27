alter table public.recruitment_tracking
  drop column if exists status,
  drop column if exists staff_id,
  drop column if exists staff_approved_at,
  drop column if exists notes;

alter table if exists public.candidate_hr_approval_tokens
  drop constraint if exists candidate_hr_approval_tokens_invitation_id_fkey,
  drop column if exists invitation_id;

drop table if exists public.interview_schedules;
drop table if exists public.candidate_invitations;
drop table if exists public.job_posting_files;
