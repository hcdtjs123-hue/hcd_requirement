-- Refactor approver_master to use employee reference
begin;

-- Ensure employees table HAS an email column (crucial for notifications)
alter table if exists public.employees
  add column if not exists email text;

-- Add employee_id column to approver_master
alter table if exists public.approver_master
  add column if not exists employee_id uuid references public.employees(id) on delete set null;

-- Drop old columns from approver_master
alter table if exists public.approver_master
  drop column if exists name,
  drop column if exists email,
  drop column if exists is_active,
  drop column if exists phone;

commit;
