-- Refactor Custom Groups to Master Tables
begin;

-- Create master tables for Custom Grup 1-6
create table if not exists public.master_custom_grup_1 (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.master_custom_grup_2 (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.master_custom_grup_3 (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.master_custom_grup_4 (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.master_custom_grup_5 (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.master_custom_grup_6 (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Update new_employee_application_form
-- Remove old text columns and add UUID FK columns
alter table if exists public.new_employee_application_form
    drop column if exists custom_grup_1,
    drop column if exists custom_grup_2,
    drop column if exists custom_grup_3,
    drop column if exists custom_grup_4,
    drop column if exists custom_grup_5,
    drop column if exists custom_grup_6,
    add column if not exists custom_grup_1_id uuid references public.master_custom_grup_1(id) on delete set null,
    add column if not exists custom_grup_2_id uuid references public.master_custom_grup_2(id) on delete set null,
    add column if not exists custom_grup_3_id uuid references public.master_custom_grup_3(id) on delete set null,
    add column if not exists custom_grup_4_id uuid references public.master_custom_grup_4(id) on delete set null,
    add column if not exists custom_grup_5_id uuid references public.master_custom_grup_5(id) on delete set null,
    add column if not exists custom_grup_6_id uuid references public.master_custom_grup_6(id) on delete set null;

-- Update employees
alter table if exists public.employees
    add column if not exists custom_grup_1_id uuid references public.master_custom_grup_1(id) on delete set null,
    add column if not exists custom_grup_2_id uuid references public.master_custom_grup_2(id) on delete set null,
    add column if not exists custom_grup_3_id uuid references public.master_custom_grup_3(id) on delete set null,
    add column if not exists custom_grup_4_id uuid references public.master_custom_grup_4(id) on delete set null,
    add column if not exists custom_grup_5_id uuid references public.master_custom_grup_5(id) on delete set null,
    add column if not exists custom_grup_6_id uuid references public.master_custom_grup_6(id) on delete set null;

commit;
