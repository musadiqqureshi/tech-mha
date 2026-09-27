-- ============================================================================
-- TechMHA — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor
-- -> New query -> paste this whole file -> Run). See README-SETUP.md for the
-- full walkthrough, including creating the admin login.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- team_members: the CEO spotlight + team grid on team.html
-- ---------------------------------------------------------------------------
create table if not exists team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,              -- e.g. "Founder & CEO", "Lead AI Engineer"
  headline     text,              -- optional larger headline, used for the CEO card
  bio          text,
  photo_url    text,              -- public image URL (upload to Supabase Storage or paste any URL)
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
  tags_label   text,              -- small text shown at the bottom of the card, e.g. "n8n · Make · Zapier"
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_content: simple key/value store for small editable text blocks
-- (hero heading, hero paragraph, contact email/phone, etc. — extend as needed)
-- ---------------------------------------------------------------------------
create table if not exists site_content (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- Everyone (including anonymous visitors) can READ all three tables — that's
-- how the public site displays them. Only a signed-in user can INSERT,
-- UPDATE or DELETE. Since this project only ever has one admin account
-- (created manually in the dashboard, no public sign-up), "signed in" and
-- "the admin" are the same thing here.
-- ============================================================================

alter table team_members enable row level security;
alter table services      enable row level security;
alter table site_content  enable row level security;

create policy "public can read team_members"
  on team_members for select
  using (true);

create policy "authenticated can write team_members"
  on team_members for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public can read services"
  on services for select
  using (true);

create policy "authenticated can write services"
  on services for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public can read site_content"
  on site_content for select
  using (true);

create policy "authenticated can write site_content"
  on site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- Seed data (optional) — pre-fills the CEO card and the six existing
-- services so the site isn't empty on first load. Safe to edit or delete
-- afterwards from the admin panel.
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
