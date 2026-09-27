# TechMHA — Portfolio & Team Site

A premium, dark-themed portfolio site for **TechMHA**, founded by Muhammad Hassan Ajmal Hashmi — AI Researcher & Instructor and AI Automation Consultant. Built as a dependency-free static site (plain HTML, CSS and vanilla JS — no build step, no npm install required) with a Supabase-backed Team page and admin panel.

**👉 First time here? Start with [`README-SETUP.md`](./README-SETUP.md)** — it walks through the one-time Supabase setup needed for the Team page and the admin panel (`/admin.html`) to work with live data.

## Pages

- `index.html` — Home (hero, marquee, about preview, stats, services, process, selected projects, institutions, CTA)
- `about.html` — Full background, professional experience timeline, education
- `team.html` — CEO spotlight + team grid (managed from the admin panel)
- `services.html` — All services in detail + process
- `projects.html` — Selected AI projects
- `contact.html` — Contact info + working contact form
- `admin.html` — Password-protected admin panel to manage team members, services and site content (see README-SETUP.md)

## Running locally

No install needed — just serve the folder:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## Deploying to Vercel

This is a static site, so Vercel needs **zero configuration** — it auto-detects it. Two options:

### Option A — Drag & drop (fastest, no GitHub needed)

1. Go to [vercel.com/new](https://vercel.com/new).
2. Choose "Deploy" → drag this whole project folder onto the page (or upload it as a `.zip` and Vercel will unpack it).
3. Leave Framework Preset as "Other" and Build Command empty — there's nothing to build.
4. Click **Deploy**. You'll have a live URL in under a minute.

### Option B — GitHub + Vercel (recommended if you'll keep editing it)

```bash
cd techmha-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then in Vercel: **Add New → Project → Import** the GitHub repo. No build settings needed — deploy as-is.

## The contact form

There's no backend, so the form (`contact.html`) currently opens the visitor's email client with a pre-filled message to `hassan.ajmal123@gmail.com` — this means messages are never silently lost, even with zero infrastructure. If you'd like real inline form submission instead (no email client popup), the two easiest upgrades once this is on Vercel:

- **Hosted form service** (fastest): sign up for something like Formspree or Web3Forms, then change the `<form>` in `contact.html` to POST to their endpoint instead of using the JS `mailto:` handler in `js/main.js`.
- **Vercel serverless function**: add an `api/contact.js` route that sends email via a provider like Resend, and point the form's `fetch()` at `/api/contact`.

## Notes on content

- All copy (bio, experience, education, skills, project names) is drawn directly from the attached resume — nothing was fabricated. TechMHA Pakistan and Tech Solutions Pakistan are mentioned as companies he founded, as facts in his bio/experience — the site itself is branded as his personal portfolio, not a company site.
- His resume PDF is included at `assets/Muhammad-Hassan-Ajmal-Hashmi-Resume.pdf` and is linked from the hero, the About page, and the Contact page as a direct download.
- The "moving testimonials" section was replaced with a marquee of the real institutions/organizations worked with (TechMHA Pakistan, Tech Solutions Pakistan, GCUF, KIPS College, Hussain Group of Academies, KHR Council of AI Research, Superior University Lahore, The University of Lahore), since no real client testimonials were provided — this avoids inventing fake reviews while keeping the same premium social-proof motion. Swap in real testimonials on `index.html` (search for `TRUSTED IN`) whenever you have them.
- Stats shown (9+ years, 2 companies, 6 institutions) are all directly countable from the resume — no invented numbers.
- There's no photography — the visual language uses abstract gradients, a grid pattern, and initials ("MH") instead of stock photos, matching the "no random stock images" brief. Swap in a real headshot by replacing the `.profile-avatar` / `.about-visual` markup with an `<img>`.

## Design system

All tokens (colors, spacing, radius, shadows, motion timing) live at the top of `css/style.css` under `:root`. Change the accent color, surfaces, or type scale there and it propagates everywhere. Font is **Plus Jakarta Sans**, loaded from Google Fonts.

## Accessibility

- Skip-to-content link, semantic landmarks, visible focus states throughout.
- All text colors verified at ≥4.5:1 contrast against every surface they appear on.
- `prefers-reduced-motion` disables marquees, scroll-reveal transitions and counters.
- Mobile menu is keyboard-operable (Escape closes it) and uses `aria-expanded`.
