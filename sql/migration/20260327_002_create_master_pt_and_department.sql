create table if not exists public.master_pt (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz null
);

create table if not exists public.master_department (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz null
);
