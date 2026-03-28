-- Money Mentor v2 — Supabase Schema
-- Run in: Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- User profiles (linked to Firebase UID)
create table if not exists user_profiles (
  id            uuid primary key default uuid_generate_v4(),
  firebase_uid  text unique not null,
  email         text,
  name          text,
  age           integer,
  monthly_income      numeric(14,2) default 0,
  monthly_expenses    numeric(14,2) default 0,
  city                text default 'metro',
  risk_profile        text default 'moderate',
  existing_investments numeric(16,2) default 0,
  emergency_fund      numeric(14,2) default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Chat sessions
create table if not exists chat_sessions (
  id          uuid primary key default uuid_generate_v4(),
  firebase_uid text not null,
  messages    jsonb default '[]',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- FIRE plans
create table if not exists fire_plans (
  id           uuid primary key default uuid_generate_v4(),
  firebase_uid text not null,
  fire_corpus  numeric(18,2),
  monthly_sip  numeric(12,2),
  on_track     boolean,
  plan_data    jsonb,
  created_at   timestamptz default now()
);

-- Tax records
create table if not exists tax_records (
  id           uuid primary key default uuid_generate_v4(),
  firebase_uid text not null,
  fiscal_year  text default 'FY2024-25',
  gross_income numeric(14,2),
  recommendation text,
  saving       numeric(12,2),
  full_analysis jsonb,
  created_at   timestamptz default now()
);

-- Health score history
create table if not exists health_scores (
  id           uuid primary key default uuid_generate_v4(),
  firebase_uid text not null,
  overall      integer,
  grade        text,
  dimensions   jsonb,
  created_at   timestamptz default now()
);

-- RLS: users can only access their own rows
alter table user_profiles  enable row level security;
alter table chat_sessions  enable row level security;
alter table fire_plans     enable row level security;
alter table tax_records    enable row level security;
alter table health_scores  enable row level security;

-- Policies use firebase_uid stored in JWT claims
-- For Firebase + Supabase integration, pass Firebase UID via custom claim
-- or use service key on the backend to bypass RLS

create policy "own_profile"  on user_profiles  for all using (firebase_uid = current_setting('app.firebase_uid', true));
create policy "own_sessions" on chat_sessions  for all using (firebase_uid = current_setting('app.firebase_uid', true));
create policy "own_fire"     on fire_plans     for all using (firebase_uid = current_setting('app.firebase_uid', true));
create policy "own_tax"      on tax_records    for all using (firebase_uid = current_setting('app.firebase_uid', true));
create policy "own_health"   on health_scores  for all using (firebase_uid = current_setting('app.firebase_uid', true));
