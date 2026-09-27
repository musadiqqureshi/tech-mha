-- ============================================================================
-- TechMHA — Full Supabase setup: tables + admin login, in one script.
-- Run this ONCE in your Supabase project's SQL Editor
-- (Project -> SQL Editor -> New query -> paste this whole file -> Run).
--
-- Admin login for /admin.html is set below: hashmi@techmha.com / hashmi786
-- ============================================================================

-- ---------------------------------------------------------------------------
-- team_members: the CEO spotlight + team grid on team.html
-- ---------------------------------------------------------------------------
create table if not exists team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  headline     text,
  bio          text,
  photo_url    text,
  is_ceo       boolean not null default false,
  linkedin_url text,
  email        text,
  tags         text[] default '{}',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- services: the service cards on the homepage + services page
-- ---------------------------------------------------------------------------
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  tags_label   text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_content: simple key/value store for small editable text blocks
-- ---------------------------------------------------------------------------
create table if not exists site_content (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — public can read, only a signed-in user can write.
-- ============================================================================
alter table team_members enable row level security;
alter table services      enable row level security;
alter table site_content  enable row level security;

drop policy if exists "public can read team_members" on team_members;
create policy "public can read team_members" on team_members for select using (true);
drop policy if exists "authenticated can write team_members" on team_members;
create policy "authenticated can write team_members" on team_members for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public can read services" on services;
create policy "public can read services" on services for select using (true);
drop policy if exists "authenticated can write services" on services;
create policy "authenticated can write services" on services for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public can read site_content" on site_content;
create policy "public can read site_content" on site_content for select using (true);
drop policy if exists "authenticated can write site_content" on site_content;
create policy "authenticated can write site_content" on site_content for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- Seed data — pre-fills the CEO card and the six existing services.
-- ============================================================================
insert into team_members (name, role, headline, bio, is_ceo, linkedin_url, email, tags, sort_order)
values (
  'Muhammad Hassan Ajmal Hashmi',
  'Founder & CEO',
  'Building AI systems by day, teaching the people who''ll build the next ones by evening.',
  'AI Engineer, AI Automation Consultant, entrepreneur, and Computer Science educator with 9 years of experience across industry and academia. Founder & CEO of TechMHA Pakistan and Tech Solutions Pakistan, delivering enterprise AI solutions, workflow automation, and AI agents using n8n, Make, Zapier, OpenAI APIs and LLMs.',
  true,
  'https://www.linkedin.com/in/muhammadhasaan-ajmal-hashmi-a7602b396',
  'hassan.ajmal123@gmail.com',
  array['Agentic AI', 'Prompt Engineering', 'AI Automation', 'Enterprise AI'],
  0
)
on conflict do nothing;

insert into services (title, description, tags_label, sort_order) values
  ('AI Workflow Automation', 'End-to-end automation design using n8n, Make and Zapier to connect your tools and remove manual, repetitive work.', 'n8n · Make · Zapier', 1),
  ('AI Agents & LLM Chatbots', 'Custom AI agents and LLM-powered chatbots — including local, private deployments — for support, sales and internal operations.', 'OpenAI API · Local LLMs', 2),
  ('Enterprise AI Consulting', 'AI strategy, digital transformation roadmaps, and hands-on delivery for startups, SMEs and universities.', 'Strategy · Delivery', 3),
  ('Intelligent Document Processing', 'Automated extraction, classification and processing of documents using AI — cutting manual data entry down to minutes.', 'IDP · Data Pipelines', 4),
  ('AI Customer Support Systems', '24/7 AI-driven support systems that resolve common requests instantly and route complex cases to your team.', 'Chatzy · Support AI', 5),
  ('Training & Upskilling', 'Professional training in Prompt Engineering, Agentic AI, AI Automation and LLM applications for teams and institutions.', 'Workshops · Cohorts', 6)
on conflict do nothing;

-- ============================================================================
-- Admin user — creates the login for /admin.html directly via SQL:
--   email:    hashmi@techmha.com
--   password: hashmi786
-- This writes straight into Supabase's internal auth.users table, which is
-- how the Supabase docs' own "seed an admin user" recipes do it — it's
-- equivalent to using the dashboard's "Add user" button, just scriptable.
-- ============================================================================
do $$
declare
  new_user_id uuid := gen_random_uuid();
  admin_email text := 'hashmi@techmha.com';    -- <-- your login email
  admin_password text := 'hashmi786';          -- <-- your login password
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    '',
    ''
  )
  on conflict (email) do nothing;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  select
    gen_random_uuid(), u.id, u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email),
    'email', now(), now(), now()
  from auth.users u
  where u.email = admin_email
  on conflict do nothing;
end $$;

-- Done. Sign into /admin.html with the email/password you set above.
