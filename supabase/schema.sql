-- Sage Manual schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.

create table if not exists public.articles (
  id          text primary key,
  slug        text not null unique,
  position    integer not null default 0,
  title       text not null,
  subtitle    text not null default '',
  author      text not null default '',
  publisher   text not null default '',
  year        integer,
  pages       integer,
  summary     text not null default '',
  category    text not null default '',
  cover       text not null default '',   -- public image URL
  file        text not null default '',   -- object key in the private "articles" bucket
  size_mb     real not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists articles_position_idx on public.articles (position);

create table if not exists public.readers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null unique,
  email         text not null unique,
  district      text not null,
  thana         text not null,
  dob           date not null,
  gender        text not null check (gender in ('male', 'female')),
  created_at    timestamptz not null default now(),
  last_sign_in  timestamptz not null default now(),
  sign_ins      integer not null default 1
);

-- Written by the keep-alive job so the free project never looks idle.
create table if not exists public.heartbeat (
  id         integer primary key,
  pinged_at  timestamptz not null default now(),
  source     text
);

-- Lock the tables: no public policies, so only the server (secret key) can use them.
alter table public.articles  enable row level security;
alter table public.readers   enable row level security;
alter table public.heartbeat enable row level security;

-- Storage: public covers, private article PDFs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers',   'covers',   true,  10485760, array['image/webp','image/png','image/jpeg','image/avif']),
  ('articles', 'articles', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
