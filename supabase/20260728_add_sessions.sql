-- Run this small follow-up migration in Supabase SQL Editor.
-- schema.sql was already run, so this only adds secure Mini Program sessions.

create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists app_sessions_token_idx on public.app_sessions(token_hash);
alter table public.app_sessions enable row level security;
