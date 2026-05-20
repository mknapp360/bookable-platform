# Client Site Template

A production-ready SSR marketing site template. Built with Vike + React + TypeScript + Tailwind CSS + Supabase, deployed to Vercel.

## Stack

- **Vike 0.4** — SSR framework (file-based routing via `pages/`)
- **React 19 + TypeScript 6**
- **Tailwind CSS 3** — brand colours via `brand.*` tokens
- **Supabase** — blog posts + enquiry form
- **Vercel** — SSR via `api/ssr.ts`

## First things to change for each new client

### 1. Brand colour — `tailwind.config.js`
Replace the three `YOUR_*_COLOR` placeholders with the client's hex values.
Everything in the codebase uses `brand-green`, `brand-dark`, `brand-grey` — change once, updates everywhere.

### 2. Domain — find and replace `YOUR_DOMAIN.com`
Appears in:
- `public/robots.txt`
- `public/llms.txt`
- `scripts/generate-sitemap.mjs`
- `pages/index/+Head.tsx`

### 3. GA Tracking ID — `pages/+Head.tsx`
Replace `YOUR_GA_MEASUREMENT_ID` with the client's GA4 measurement ID (format: `G-XXXXXXXXXX`).

### 4. Homepage SEO — `pages/index/+Head.tsx`
Fill in all `YOUR_*` placeholders: title tag, meta description, keywords, JSON-LD organisation details, FAQs.

### 5. Brand assets — `public/`
Replace:
- `logo.png` — client logo (any reasonable size, displayed at `h-8`)
- `og-image.png` — 1200×630px social share image
- `favicon.svg` — browser tab icon

### 6. Navbar & Footer — `src/components/Navbar.tsx`, `src/components/Footer.tsx`
Replace phone number, email, brand name, footer copy.

### 7. Page content — `src/components/`
`Hero.tsx`, `WhatWeBuild.tsx`, `HowItWorks.tsx` contain the homepage copy.
Rewrite for each client — the layout and structure stays, just swap the words.

### 8. Location/sector pages — `src/data/seo-locations.ts` + `scripts/generate-sitemap.mjs`
Update sectors and locations to match the client's geography and target market.
Each `sector/location` combination generates a dedicated SEO landing page.

### 9. Supabase — `.env`
Copy `.env.example` to `.env` and fill in the client's Supabase project URL and anon key.

### 10. AI crawler file — `public/llms.txt`
Fill in the `YOUR_*` placeholders with the client's actual business description.
This is what AI systems (Perplexity, ChatGPT, Claude) read to understand the business.

---

## Local development

```bash
cp .env.example .env
# fill in Supabase credentials

npm install
npm run dev
```

## Deploy

Push to GitHub → connect repo in Vercel → add env vars → deploy.
The `api/ssr.ts` file handles SSR on Vercel automatically.

## Architecture notes

- `pages/+Head.tsx` — global head tags (GA script). Injected on every page.
- `pages/index/+Head.tsx` — homepage SEO (title, meta, OG, Twitter Card, JSON-LD).
- `pages/@sector/@location/` — dynamic local SEO landing pages.
- `pages/blog/` — blog index and individual post pages (data from Supabase).
- `public/llms.txt` — AI crawler manifest (emerging standard, indexed by Perplexity et al).
- Package versions for `@vitejs/plugin-react` and `vite` are pinned — do not auto-upgrade these.
