-- Resource Manager — Full Schema (run in Supabase SQL Editor)
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  title text,
  company_name text,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  client_type text not null default 'Direct Client',
  contact_person text not null,
  email text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  role text not null,
  cloud text not null,
  experience_required numeric(4,1) not null default 0,
  budget numeric(12,2) not null default 0,
  currency_code text not null default 'INR' check (currency_code in ('INR', 'USD')),
  status text not null check (status in ('Open', 'In Progress', 'Closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  skills text[] not null default '{}',
  experience numeric(4,1) not null default 0,
  rate numeric(12,2) not null default 0,
  currency_code text not null default 'INR' check (currency_code in ('INR', 'USD')),
  rate_type text not null check (rate_type in ('Hourly', 'Monthly')),
  availability text not null check (availability in ('Available', 'Busy')),
  -- New fields
  email text,
  phone text,
  linkedin text,
  notes text,
  resume_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  developer_id uuid not null references public.developers(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  start_date date not null,
  end_date date,
  client_billing_amount numeric(12,2) not null default 0,
  developer_cost numeric(12,2) not null default 0,
  currency_code text not null default 'INR' check (currency_code in ('INR', 'USD')),
  profit numeric(12,2) generated always as (client_billing_amount - developer_cost) stored,
  created_at timestamptz not null default timezone('utc', now())
);

-- Add new developer columns (safe to run on existing DB)
alter table public.developers add column if not exists email text;
alter table public.developers add column if not exists phone text;
alter table public.developers add column if not exists linkedin text;
alter table public.developers add column if not exists notes text;
alter table public.developers add column if not exists resume_url text;

-- Trigger to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.requirements enable row level security;
alter table public.developers enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can manage own clients" on public.clients;
drop policy if exists "Users can manage own requirements" on public.requirements;
drop policy if exists "Users can manage own developers" on public.developers;
drop policy if exists "Users can manage own assignments" on public.assignments;

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can manage own clients" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own requirements" on public.requirements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own developers" on public.developers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own assignments" on public.assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================
-- STORAGE: Resume Bucket (run separately if
-- the bucket doesn't exist yet)
-- =============================================
-- 1. Go to Storage → New bucket
-- 2. Name: developer-resumes
-- 3. Toggle Public: ON
-- Then run this policy:
-- insert into storage.policies (bucket_id, name, definition, action)
-- values ('developer-resumes', 'Authenticated upload', '(auth.role() = ''authenticated'')', 'INSERT');

-- =============================================
-- MIGRATION: Add status and notes to assignments
-- Run these if upgrading from a previous version
-- =============================================
alter table public.assignments add column if not exists status text not null default 'Active';
alter table public.assignments add column if not exists notes text;

-- Also add contact_name and notes to clients for richer data
alter table public.clients add column if not exists contact_name text;
alter table public.clients add column if not exists contact_email text;
alter table public.clients add column if not exists notes text;
