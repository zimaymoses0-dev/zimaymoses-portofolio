-- MZ Creative Room — adapt the existing Supabase schema for Supabase Auth
-- (the tables already exist in the project; this script does NOT create them).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: uses IF EXISTS / DROP POLICY IF EXISTS guards throughout.

-- ============================================================
-- 1. Adapt `profiles` for Supabase Auth (was designed for Clerk)
-- ============================================================
alter table public.profiles drop constraint if exists profiles_clerk_id_key;
alter table public.profiles drop column if exists clerk_id;

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade;

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prevent duplicate category assignments (needed for the seed's ON CONFLICT below).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'portfolio_project_categories_unique'
  ) then
    alter table public.portfolio_project_categories
      add constraint portfolio_project_categories_unique unique (project_id, category_id);
  end if;
end $$;

-- Auto-generate a human-readable reference number for project requests.
alter table public.project_requests
  alter column reference_number
  set default ('REQ-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6)));

-- ============================================================
-- 2. Row Level Security — enable on every table
-- ============================================================
alter table public.profiles enable row level security;
alter table public.project_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_project_categories enable row level security;
alter table public.project_media enable row level security;
alter table public.services enable row level security;
alter table public.service_deliverables enable row level security;
alter table public.clients enable row level security;
alter table public.portfolio_project_clients enable row level security;
alter table public.testimonials enable row level security;
alter table public.saved_projects enable row level security;
alter table public.project_requests enable row level security;
alter table public.project_request_services enable row level security;
alter table public.project_request_inspirations enable row level security;
alter table public.project_request_attachments enable row level security;
alter table public.client_projects enable row level security;
alter table public.client_project_files enable row level security;
alter table public.project_milestones enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_submissions enable row level security;

-- ---- profiles ----
drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- ---- public marketing content: read-only for everyone ----
drop policy if exists "project_categories: public read active" on public.project_categories;
create policy "project_categories: public read active" on public.project_categories
  for select using (is_active = true);

drop policy if exists "portfolio_projects: public read public" on public.portfolio_projects;
create policy "portfolio_projects: public read public" on public.portfolio_projects
  for select using (is_public = true);

drop policy if exists "portfolio_project_categories: public read" on public.portfolio_project_categories;
create policy "portfolio_project_categories: public read" on public.portfolio_project_categories
  for select using (true);

drop policy if exists "project_media: public read" on public.project_media;
create policy "project_media: public read" on public.project_media
  for select using (
    exists (
      select 1 from public.portfolio_projects p
      where p.id = project_media.project_id and p.is_public = true
    )
  );

drop policy if exists "services: public read active" on public.services;
create policy "services: public read active" on public.services
  for select using (is_active = true);

drop policy if exists "service_deliverables: public read" on public.service_deliverables;
create policy "service_deliverables: public read" on public.service_deliverables
  for select using (
    exists (select 1 from public.services s where s.id = service_deliverables.service_id and s.is_active = true)
  );

drop policy if exists "clients: public read" on public.clients;
create policy "clients: public read" on public.clients
  for select using (true);

drop policy if exists "portfolio_project_clients: public read" on public.portfolio_project_clients;
create policy "portfolio_project_clients: public read" on public.portfolio_project_clients
  for select using (true);

drop policy if exists "testimonials: public read published" on public.testimonials;
create policy "testimonials: public read published" on public.testimonials
  for select using (is_published = true);

drop policy if exists "blog_categories: public read" on public.blog_categories;
create policy "blog_categories: public read" on public.blog_categories
  for select using (true);

drop policy if exists "blog_posts: public read published" on public.blog_posts;
create policy "blog_posts: public read published" on public.blog_posts
  for select using (is_published = true);

drop policy if exists "site_settings: public read" on public.site_settings;
create policy "site_settings: public read" on public.site_settings
  for select using (true);

-- No public insert/update/delete policy on any of the above: managed only
-- via the backend's admin (secret key) client, which bypasses RLS entirely.

-- ---- saved_projects: prospects bookmarking portfolio work ----
drop policy if exists "saved_projects: manage own" on public.saved_projects;
create policy "saved_projects: manage own" on public.saved_projects
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ---- project_requests: the "Start a Project" brief ----
drop policy if exists "project_requests: select own" on public.project_requests;
create policy "project_requests: select own" on public.project_requests
  for select using (auth.uid() = profile_id);

drop policy if exists "project_requests: insert own" on public.project_requests;
create policy "project_requests: insert own" on public.project_requests
  for insert with check (auth.uid() = profile_id);

drop policy if exists "project_request_services: manage via own request" on public.project_request_services;
create policy "project_request_services: manage via own request" on public.project_request_services
  for all using (
    exists (select 1 from public.project_requests r where r.id = project_request_services.project_request_id and r.profile_id = auth.uid())
  );

drop policy if exists "project_request_inspirations: manage via own request" on public.project_request_inspirations;
create policy "project_request_inspirations: manage via own request" on public.project_request_inspirations
  for all using (
    exists (select 1 from public.project_requests r where r.id = project_request_inspirations.project_request_id and r.profile_id = auth.uid())
  );

drop policy if exists "project_request_attachments: manage via own request" on public.project_request_attachments;
create policy "project_request_attachments: manage via own request" on public.project_request_attachments
  for all using (
    exists (select 1 from public.project_requests r where r.id = project_request_attachments.project_request_id and r.profile_id = auth.uid())
  );

-- ---- client_projects: work in progress once a request is accepted ----
drop policy if exists "client_projects: select own" on public.client_projects;
create policy "client_projects: select own" on public.client_projects
  for select using (auth.uid() = profile_id);

drop policy if exists "client_project_files: select visible via own project" on public.client_project_files;
create policy "client_project_files: select visible via own project" on public.client_project_files
  for select using (
    is_visible_to_client = true
    and exists (select 1 from public.client_projects c where c.id = client_project_files.client_project_id and c.profile_id = auth.uid())
  );

drop policy if exists "project_milestones: select via own project" on public.project_milestones;
create policy "project_milestones: select via own project" on public.project_milestones
  for select using (
    exists (select 1 from public.client_projects c where c.id = project_milestones.client_project_id and c.profile_id = auth.uid())
  );

-- ---- conversations & messages ----
drop policy if exists "conversations: manage own" on public.conversations;
create policy "conversations: manage own" on public.conversations
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "messages: manage via own conversation" on public.messages;
create policy "messages: manage via own conversation" on public.messages
  for all using (
    exists (select 1 from public.conversations c where c.id = messages.conversation_id and c.profile_id = auth.uid())
  );

drop policy if exists "message_attachments: manage via own conversation" on public.message_attachments;
create policy "message_attachments: manage via own conversation" on public.message_attachments
  for all using (
    exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_attachments.message_id and c.profile_id = auth.uid()
    )
  );

-- ---- notifications ----
drop policy if exists "notifications: manage own" on public.notifications;
create policy "notifications: manage own" on public.notifications
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ---- contact_submissions: anyone can submit, nobody can read back ----
drop policy if exists "contact_submissions: public insert" on public.contact_submissions;
create policy "contact_submissions: public insert" on public.contact_submissions
  for insert with check (true);

-- ============================================================
-- 3. Seed marketing content (categories, services, site settings,
--    portfolio projects) from the current frontend mock data.
-- ============================================================
insert into public.project_categories (name, slug, display_order) values
  ('Work', 'work', 0),
  ('Digital Lab', 'digital-lab', 1),
  ('Visual Lab', 'visual-lab', 2)
on conflict (slug) do nothing;

insert into public.services (title, slug, short_description, display_order) values
  ('Branding', 'branding', 'Identity systems & guidelines', 0),
  ('UI/UX', 'ui-ux', 'Product & web interfaces', 1),
  ('Art Direction', 'art-direction', 'Visual strategy for campaigns', 2)
on conflict (slug) do nothing;

insert into public.site_settings (site_name, about_short, hero_subtitle)
select 'MZ Creative Room', 'Creative designer & developer.', 'My story, my path, my personality.'
where not exists (select 1 from public.site_settings);

insert into public.portfolio_projects (title, slug, short_description, is_public, display_order)
values
  ('MINDFLOW', 'mindflow', 'Brand identity & product design', true, 0),
  ('OIAC', 'oiac', 'Digital campaign & art direction', true, 1),
  ('NCI WEBSITE', 'nci-website', 'Full website design & build', true, 2),
  ('Campaign 01', 'campaign-01', 'Social ad series', true, 3),
  ('Campaign 02', 'campaign-02', 'Product launch', true, 4),
  ('Series A', 'series-a', 'Poster experiments', true, 5),
  ('Series B', 'series-b', 'Typographic studies', true, 6)
on conflict (slug) do nothing;

insert into public.portfolio_project_categories (project_id, category_id)
select p.id, c.id from public.portfolio_projects p, public.project_categories c
where (p.slug in ('mindflow', 'oiac', 'nci-website') and c.slug = 'work')
   or (p.slug in ('campaign-01', 'campaign-02') and c.slug = 'digital-lab')
   or (p.slug in ('series-a', 'series-b') and c.slug = 'visual-lab')
on conflict (project_id, category_id) do nothing;

-- ============================================================
-- 4. Credentials page — new tables (these do NOT pre-exist in
--    the original schema; created here, not just adapted).
-- ============================================================
create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  credential_type text not null check (
    credential_type in ('degree', 'certificate', 'course', 'award', 'specialization')
  ),
  institution text not null,
  description text not null default '',
  field text not null default '',
  level text not null default '',
  issue_date date,
  expiration_date date,
  credential_id text not null default '',
  verification_url text not null default '',
  certificate_image text not null default '',
  skills jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credential_projects (
  credential_id uuid not null references public.credentials (id) on delete cascade,
  project_id uuid not null references public.portfolio_projects (id) on delete cascade,
  primary key (credential_id, project_id)
);

alter table public.credentials enable row level security;
alter table public.credential_projects enable row level security;

drop policy if exists "credentials: public read published" on public.credentials;
create policy "credentials: public read published" on public.credentials
  for select using (is_published = true);

drop policy if exists "credential_projects: public read" on public.credential_projects;
create policy "credential_projects: public read" on public.credential_projects
  for select using (
    exists (select 1 from public.credentials c where c.id = credential_projects.credential_id and c.is_published = true)
  );

-- No public insert/update/delete policy: managed only via Django Admin /
-- the backend's admin (secret key) client, which bypasses RLS entirely.
-- No seed data here on purpose — real credentials are entered by hand,
-- never fabricated. The frontend shows an elegant empty state until then.
