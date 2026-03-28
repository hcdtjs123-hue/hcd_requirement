-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public.approval_chains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_request_form_id uuid NOT NULL,
  created_by uuid,
  status text NOT NULL DEFAULT 'draft' :: text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT approval_chains_pkey PRIMARY KEY (id),
  CONSTRAINT approval_chains_employee_request_form_id_fkey FOREIGN KEY (employee_request_form_id) REFERENCES public.employee_request_form(id),
  CONSTRAINT approval_chains_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

CREATE TABLE public.approval_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chain_id uuid NOT NULL,
  step_order integer NOT NULL,
  approver_email text NOT NULL,
  approver_name text,
  token uuid DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' :: text,
  approved_at timestamp without time zone,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT approval_steps_pkey PRIMARY KEY (id),
  CONSTRAINT approval_steps_chain_id_fkey FOREIGN KEY (chain_id) REFERENCES public.approval_chains(id)
);

CREATE TABLE public.approver_master (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  step_order integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamp without time zone DEFAULT now(),
  profile_id uuid,
  CONSTRAINT approver_master_pkey PRIMARY KEY (id),
  CONSTRAINT approver_master_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT approver_master_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

CREATE TABLE public.candidate_form (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_request_form_id uuid,
  candidate_id uuid,
  date_candidate_form date,
  notice_period text,
  first_name text,
  middle_name text,
  last_name text,
  hire_location text,
  date_of_birth date,
  place_of_birth text,
  nationality text,
  marital_status USER - DEFINED,
  religion text,
  gender USER - DEFINED,
  ethnic text,
  blood_type USER - DEFINED,
  id_card_address text,
  residential_address text,
  personal_email text,
  instagram text,
  linkedin text,
  phone_number text,
  id_type text,
  id_no text,
  reference_name text,
  reference_no text,
  reference_relationship text,
  reference_position text,
  reference_transportation text,
  reference_ownership text,
  reference_residence text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  hr_screening_status text NOT NULL DEFAULT 'pending' :: text CHECK (
    hr_screening_status = ANY (
      ARRAY ['pending'::text, 'hr_approved'::text, 'hr_rejected'::text]
    )
  ),
  CONSTRAINT candidate_form_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_form_employee_request_form_id_fkey FOREIGN KEY (employee_request_form_id) REFERENCES public.employee_request_form(id),
  CONSTRAINT candidate_form_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.candidate_hr_approval_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_form_id uuid NOT NULL,
  approve_token text NOT NULL UNIQUE,
  reject_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  outcome text NOT NULL DEFAULT 'pending' :: text CHECK (
    outcome = ANY (
      ARRAY ['pending'::text, 'approved'::text, 'rejected'::text]
    )
  ),
  decided_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_hr_approval_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_hr_approval_tokens_candidate_form_id_fkey FOREIGN KEY (candidate_form_id) REFERENCES public.candidate_form(id)
);

CREATE TABLE public.education (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_form_id uuid,
  level USER - DEFINED,
  institution text,
  city text,
  major text,
  from_year integer,
  to_year integer,
  category text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT education_pkey PRIMARY KEY (id),
  CONSTRAINT education_candidate_form_id_fkey FOREIGN KEY (candidate_form_id) REFERENCES public.candidate_form(id)
);

CREATE TABLE public.employee_request_form (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employment_status USER - DEFINED,
  direct_manager text,
  designation text,
  site text,
  working_location text,
  required_date date,
  position_status USER - DEFINED,
  periode_probation integer,
  main_position text,
  created_by uuid,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  approval_director_bu text,
  approval_director_bu_date date,
  approval_gm_hrd text,
  approval_gm_hrd_date date,
  approval_director_hrd text,
  approval_director_hrd_date date,
  custom_grup_1_id uuid,
  custom_grup_2_id uuid,
  custom_grup_3_id uuid,
  custom_grup_4_id uuid,
  custom_grup_5_id uuid,
  custom_grup_6_id uuid,
  status text DEFAULT 'open' :: text CHECK (
    status = ANY (ARRAY ['open'::text, 'closed'::text])
  ),
  closed_date timestamp with time zone,
  closed_category text CHECK (
    (
      closed_category = ANY (ARRAY ['employee hired'::text, 'canceled'::text])
    )
    OR closed_category IS NULL
  ),
  reason text,
  approval_director_bu_id uuid,
  pt_id uuid,
  department_id uuid,
  job_level_id uuid,
  CONSTRAINT employee_request_form_pkey PRIMARY KEY (id),
  CONSTRAINT employee_request_form_job_level_id_fkey FOREIGN KEY (job_level_id) REFERENCES public.master_job_level(id),
  CONSTRAINT new_employee_application_form_approval_director_bu_id_fkey FOREIGN KEY (approval_director_bu_id) REFERENCES public.profiles(id),
  CONSTRAINT new_employee_application_form_custom_grup_1_id_fkey FOREIGN KEY (custom_grup_1_id) REFERENCES public.master_custom_grup_1(id),
  CONSTRAINT new_employee_application_form_custom_grup_2_id_fkey FOREIGN KEY (custom_grup_2_id) REFERENCES public.master_custom_grup_2(id),
  CONSTRAINT new_employee_application_form_custom_grup_3_id_fkey FOREIGN KEY (custom_grup_3_id) REFERENCES public.master_custom_grup_3(id),
  CONSTRAINT new_employee_application_form_custom_grup_4_id_fkey FOREIGN KEY (custom_grup_4_id) REFERENCES public.master_custom_grup_4(id),
  CONSTRAINT new_employee_application_form_custom_grup_5_id_fkey FOREIGN KEY (custom_grup_5_id) REFERENCES public.master_custom_grup_5(id),
  CONSTRAINT new_employee_application_form_custom_grup_6_id_fkey FOREIGN KEY (custom_grup_6_id) REFERENCES public.master_custom_grup_6(id),
  CONSTRAINT new_employee_application_form_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT employee_request_form_pt_id_fkey FOREIGN KEY (pt_id) REFERENCES public.master_pt(id),
  CONSTRAINT employee_request_form_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.master_department(id)
);

CREATE TABLE public.family_and_emergency (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_form_id uuid,
  name text,
  relationship text,
  gender USER - DEFINED,
  place_and_date_of_birth text,
  education text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT family_and_emergency_pkey PRIMARY KEY (id),
  CONSTRAINT family_and_emergency_candidate_form_id_fkey FOREIGN KEY (candidate_form_id) REFERENCES public.candidate_form(id)
);

CREATE TABLE public.master_custom_grup_1 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_custom_grup_1_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_custom_grup_2 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_custom_grup_2_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_custom_grup_3 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_custom_grup_3_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_custom_grup_4 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_custom_grup_4_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_custom_grup_5 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_custom_grup_5_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_custom_grup_6 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_custom_grup_6_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_department (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT master_department_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_job_level (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT master_job_level_pkey PRIMARY KEY (id)
);

CREATE TABLE public.master_pt (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT master_pt_pkey PRIMARY KEY (id)
);

CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.personal_statement (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_form_id uuid UNIQUE,
  contract boolean,
  contract_period text,
  legal_issues text,
  reference_check_reason text,
  family_details text,
  detailed_care text,
  serious_accident text,
  psychological_test_details text,
  business_trip boolean,
  expected_salary numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT personal_statement_pkey PRIMARY KEY (id),
  CONSTRAINT personal_statement_candidate_form_id_fkey FOREIGN KEY (candidate_form_id) REFERENCES public.candidate_form(id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  phone text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  email text,
  full_name text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE VIEW public.recruitment_queue_view AS
WITH latest_chains AS (
  SELECT DISTINCT ON (ac.employee_request_form_id)
    ac.id AS chain_id,
    ac.employee_request_form_id,
    ac.status,
    ac.created_at,
    ac.updated_at
  FROM public.approval_chains ac
  ORDER BY ac.employee_request_form_id, ac.updated_at DESC, ac.created_at DESC, ac.id DESC
)
SELECT
  lc.chain_id AS id,
  lc.chain_id,
  lc.employee_request_form_id,
  lc.created_at,
  lc.updated_at,
  pt.name AS employee_request_form_pt_pembebanan,
  dept.name AS employee_request_form_department,
  lvl.name AS employee_request_form_job_level,
  erf.main_position AS employee_request_form_main_position,
  erf.site AS employee_request_form_site,
  erf.working_location AS employee_request_form_working_location,
  erf.employment_status::text AS employee_request_form_employment_status,
  erf.position_status::text AS employee_request_form_position_status,
  erf.required_date AS employee_request_form_required_date,
  erf.status AS employee_request_form_status,
  erf.closed_date AS employee_request_form_closed_date,
  cg1.name AS employee_request_form_custom_grup_1,
  cg2.name AS employee_request_form_custom_grup_2,
  cg3.name AS employee_request_form_custom_grup_3,
  cg4.name AS employee_request_form_custom_grup_4,
  cg5.name AS employee_request_form_custom_grup_5,
  cg6.name AS employee_request_form_custom_grup_6,
  erf.approval_director_bu AS employee_request_form_approval_director_bu,
  erf.approval_director_bu_date AS employee_request_form_approval_director_bu_date,
  erf.approval_gm_hrd AS employee_request_form_approval_gm_hrd,
  erf.approval_gm_hrd_date AS employee_request_form_approval_gm_hrd_date,
  erf.approval_director_hrd AS employee_request_form_approval_director_hrd,
  erf.approval_director_hrd_date AS employee_request_form_approval_director_hrd_date
FROM latest_chains lc
JOIN public.employee_request_form erf
  ON erf.id = lc.employee_request_form_id
LEFT JOIN public.master_pt pt
  ON pt.id = erf.pt_id
LEFT JOIN public.master_department dept
  ON dept.id = erf.department_id
LEFT JOIN public.master_job_level lvl
  ON lvl.id = erf.job_level_id
LEFT JOIN public.master_custom_grup_1 cg1
  ON cg1.id = erf.custom_grup_1_id
LEFT JOIN public.master_custom_grup_2 cg2
  ON cg2.id = erf.custom_grup_2_id
LEFT JOIN public.master_custom_grup_3 cg3
  ON cg3.id = erf.custom_grup_3_id
LEFT JOIN public.master_custom_grup_4 cg4
  ON cg4.id = erf.custom_grup_4_id
LEFT JOIN public.master_custom_grup_5 cg5
  ON cg5.id = erf.custom_grup_5_id
LEFT JOIN public.master_custom_grup_6 cg6
  ON cg6.id = erf.custom_grup_6_id
WHERE lc.status = 'approved';

CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);

CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_at timestamp without time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);

CREATE TABLE public.work_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_form_id uuid,
  company text,
  position text,
  from_year integer,
  to_year integer,
  reason_to_quitting text,
  last_salary numeric,
  benefit text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT work_history_pkey PRIMARY KEY (id),
  CONSTRAINT work_history_candidate_form_id_fkey FOREIGN KEY (candidate_form_id) REFERENCES public.candidate_form(id)
);
