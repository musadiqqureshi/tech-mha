# TechMHA — Setup Guide

This site is still a plain static site (HTML/CSS/JS, deploys to Vercel exactly
like before), but the **Team**, **Services**, and admin panel now run on a
free Supabase database. Follow these steps once to wire it up — after that,
anything you add/edit in the admin panel appears on the live site instantly,
for every visitor, with no redeploy needed.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is enough).
2. Click **New Project**. Pick any name/region, set a database password (save
   it somewhere — you won't need it day-to-day, but keep it safe), and wait
   ~1-2 minutes for it to provision.

## 2. Run the database schema

1. In your new project, open the **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase-schema.sql` from this project, copy its entire contents,
   paste into the SQL editor, and click **Run**.
4. This creates the `team_members`, `services` and `site_content` tables,
   sets up the security rules (public can read, only a signed-in admin can
   write), and pre-fills your CEO profile and the six existing services so
   the site isn't empty.

## 3. Create your admin login

1. In the left sidebar, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter the email and password you want to use to log into `/admin.html`.
   Tick **Auto Confirm User** so you don't need to click an email link.
4. That's your one admin account — this project doesn't have public sign-up,
   so nobody else can create an account.

## 4. Get your API keys

1. Go to **Project Settings → API** (gear icon, bottom of the left sidebar).
2. Copy the **Project URL** and the **anon / public** key.
   ⚠️ Do **not** copy the `service_role` key — that one must stay secret and
   should never go into a static site.

## 5. Paste the keys into the site

Open `js/supabase-config.js` and replace the two placeholder values:

```js
window.SUPABASE_URL = "https://xxxxxxxx.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOi..."; // the long anon key
```

Save the file.

## 6. Deploy

Deploy exactly like before — nothing else about hosting changed:

- **Drag & drop**: go to [vercel.com/new](https://vercel.com/new) and drag
  this whole folder (or a zip of it) onto the page.
- **GitHub**: push this folder to a repo and import it in Vercel.

Once live, go to `https://your-site.vercel.app/admin.html`, sign in with the
account from step 3, and start adding team members and services. Changes
show up on the public site (`team.html`, the homepage, `services.html`)
within a second or two — no redeploy required.

## What's editable from the admin panel

- **Team** — add/edit/remove people. Check "Feature as CEO spotlight" for
  the one person who should appear in the large spotlight card at the top
  of the Team page; everyone else shows in the grid below it.
- **Services** — add/edit/remove the service cards shown on the homepage
  and the Services page.
- **Site Content** — a few common text fields (hero heading/paragraph,
  contact email/phone, location) are stored in the `site_content` table for
  future use. The current page templates still show their own built-in
  text by default; if you want a specific page to pull one of these values
  live, that's a small follow-up change to that page's script.

## If you skip this setup

The site still works and looks complete without doing any of the above —
every page ships with real, hand-written fallback content. You'll just see:

- The Team page's CEO spotlight and team grid keep showing their built-in
  placeholder content instead of live data.
- `/admin.html` shows a message that Supabase isn't configured yet and the
  sign-in form is disabled.

## Notes on security

- The `anon` key is meant to be public — it's safe to ship in client-side
  code. What keeps the database safe is the Row Level Security policies in
  `supabase-schema.sql`: anyone can *read* team members/services, but only
  a signed-in user can *write*. Since this project has no public sign-up,
  "signed in" always means you.
- Never publish the `service_role` key anywhere in this project.
- `admin.html` is excluded from search engines (`robots.txt` + a `noindex`
  tag) but isn't otherwise hidden — anyone who finds the URL sees the login
  screen, which is normal and fine; they still need your Supabase
  credentials to get past it.
