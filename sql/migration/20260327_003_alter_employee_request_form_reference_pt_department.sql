alter table public.employee_request_form
  add column if not exists pt_id uuid null,
  add column if not exists department_id uuid null;

update public.employee_request_form erf
set pt_id = pt.id
from public.master_pt pt
where erf.pt_id is null
  and erf.pt_pembebanan is not null
  and lower(btrim(erf.pt_pembebanan)) = lower(btrim(pt.name));

update public.employee_request_form erf
set department_id = dept.id
from public.master_department dept
where erf.department_id is null
  and erf.department is not null
  and lower(btrim(erf.department)) = lower(btrim(dept.name));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'employee_request_form_pt_id_fkey'
  ) then
    alter table public.employee_request_form
      add constraint employee_request_form_pt_id_fkey
      foreign key (pt_id) references public.master_pt(id)
      on update cascade
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'employee_request_form_department_id_fkey'
  ) then
    alter table public.employee_request_form
      add constraint employee_request_form_department_id_fkey
      foreign key (department_id) references public.master_department(id)
      on update cascade
      on delete set null;
  end if;
end $$;

create index if not exists employee_request_form_pt_id_idx
  on public.employee_request_form (pt_id);

create index if not exists employee_request_form_department_id_idx
  on public.employee_request_form (department_id);
