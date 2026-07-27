-- AFTERFRAME / 余帧
-- Run this whole file once in Supabase: SQL Editor → New query → Run.
-- The Mini Program never receives the service-role key. All access is through
-- a small server API, which verifies a WeChat login then talks to these tables.

create extension if not exists pgcrypto;

-- A person is identified by the stable openid returned by the WeChat login API.
-- It is deliberately separate from auth.users: this app uses WeChat login, not email/password.
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  wechat_openid text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.archives (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  location_name text,
  location_address text,
  latitude numeric,
  longitude numeric,
  date_start date,
  date_end date,
  description text not null default '',
  cover_photo_id uuid,
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archive_dates_in_order check (date_end is null or date_start is null or date_end >= date_start)
);

-- This is the future sharing mechanism. Version 1 uses only the owner row.
create table if not exists public.archive_members (
  archive_id uuid not null references public.archives(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (archive_id, user_id)
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  author_id uuid not null references public.app_users(id) on delete cascade,
  body text not null default '',
  mood text,
  mood_note text,
  tags text[] not null default '{}',
  is_mood_saved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  storage_path text not null unique,
  mime_type text,
  width integer,
  height integer,
  position integer not null default 0,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.archives
  drop constraint if exists archives_cover_photo_id_fkey,
  add constraint archives_cover_photo_id_fkey
  foreign key (cover_photo_id) references public.photos(id) on delete set null;

create index if not exists archives_owner_position_idx on public.archives(owner_id, position);
create index if not exists entries_archive_created_idx on public.entries(archive_id, created_at desc);
create index if not exists photos_entry_position_idx on public.photos(entry_id, position);
create index if not exists app_sessions_token_idx on public.app_sessions(token_hash);

-- Nothing is exposed directly to the anonymous public API. The server uses its
-- service-role key and enforces ownership/membership before every action.
alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.archives enable row level security;
alter table public.archive_members enable row level security;
alter table public.entries enable row level security;
alter table public.photos enable row level security;

-- Private original-photo bucket. There are intentionally no public storage policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('afterframe-media', 'afterframe-media', false, 26214400, array['image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
