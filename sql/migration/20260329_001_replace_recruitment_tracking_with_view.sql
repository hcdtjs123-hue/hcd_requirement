begin;

drop view if exists public.recruitment_queue_view;
drop table if exists public.recruitment_tracking;

create view public.recruitment_queue_view as
with latest_chains as (
  select distinct on (ac.employee_request_form_id)
    ac.id as chain_id,
    ac.employee_request_form_id,
    ac.status,
    ac.created_at,
    ac.updated_at
  from public.approval_chains ac
  order by
    ac.employee_request_form_id,
    ac.updated_at desc,
    ac.created_at desc,
    ac.id desc
)
select
  lc.chain_id as id,
  lc.chain_id,
  lc.employee_request_form_id,
  lc.created_at,
  lc.updated_at,
  pt.name as employee_request_form_pt_pembebanan,
  dept.name as employee_request_form_department,
  lvl.name as employee_request_form_job_level,
  erf.main_position as employee_request_form_main_position,
  erf.site as employee_request_form_site,
  erf.working_location as employee_request_form_working_location,
  erf.employment_status::text as employee_request_form_employment_status,
  erf.position_status::text as employee_request_form_position_status,
  erf.required_date as employee_request_form_required_date,
  erf.status as employee_request_form_status,
  erf.closed_date as employee_request_form_closed_date,
  cg1.name as employee_request_form_custom_grup_1,
  cg2.name as employee_request_form_custom_grup_2,
  cg3.name as employee_request_form_custom_grup_3,
  cg4.name as employee_request_form_custom_grup_4,
  cg5.name as employee_request_form_custom_grup_5,
  cg6.name as employee_request_form_custom_grup_6,
  erf.approval_director_bu as employee_request_form_approval_director_bu,
  erf.approval_director_bu_date as employee_request_form_approval_director_bu_date,
  erf.approval_gm_hrd as employee_request_form_approval_gm_hrd,
  erf.approval_gm_hrd_date as employee_request_form_approval_gm_hrd_date,
  erf.approval_director_hrd as employee_request_form_approval_director_hrd,
  erf.approval_director_hrd_date as employee_request_form_approval_director_hrd_date
from latest_chains lc
join public.employee_request_form erf
  on erf.id = lc.employee_request_form_id
left join public.master_pt pt
  on pt.id = erf.pt_id
left join public.master_department dept
  on dept.id = erf.department_id
left join public.master_job_level lvl
  on lvl.id = erf.job_level_id
left join public.master_custom_grup_1 cg1
  on cg1.id = erf.custom_grup_1_id
left join public.master_custom_grup_2 cg2
  on cg2.id = erf.custom_grup_2_id
left join public.master_custom_grup_3 cg3
  on cg3.id = erf.custom_grup_3_id
left join public.master_custom_grup_4 cg4
  on cg4.id = erf.custom_grup_4_id
left join public.master_custom_grup_5 cg5
  on cg5.id = erf.custom_grup_5_id
left join public.master_custom_grup_6 cg6
  on cg6.id = erf.custom_grup_6_id
where lc.status = 'approved';

commit;
