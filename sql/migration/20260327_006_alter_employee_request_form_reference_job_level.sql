alter table public.employee_request_form
  add column if not exists job_level_id uuid null,
  add column if not exists job_level text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'employee_request_form_job_level_id_fkey'
  ) then
    alter table public.employee_request_form
      add constraint employee_request_form_job_level_id_fkey
      foreign key (job_level_id) references public.master_job_level(id)
      on update cascade
      on delete set null;
  end if;
end $$;

create index if not exists employee_request_form_job_level_id_idx
  on public.employee_request_form (job_level_id);
