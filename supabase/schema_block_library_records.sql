-- Block library records table
create table if not exists public.block_library_records (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  asset_type text not null,
  source_tier text not null check (source_tier in ('canonical', 'curated', 'legacy', 'fallback')),
  canonical boolean not null default false,
  provenance text not null default '',
  source_url text,
  asset_url text,
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft', 'imported', 'verified', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists block_library_records_status_idx on public.block_library_records (status);
create index if not exists block_library_records_category_idx on public.block_library_records (category);
create index if not exists block_library_records_source_tier_idx on public.block_library_records (source_tier);
create index if not exists block_library_records_updated_at_idx on public.block_library_records (updated_at desc);

alter table public.block_library_records enable row level security;

create policy if not exists "read block library records"
  on public.block_library_records
  for select
  using (true);

create policy if not exists "insert block library records"
  on public.block_library_records
  for insert
  with check (true);

create policy if not exists "update block library records"
  on public.block_library_records
  for update
  using (true)
  with check (true);
