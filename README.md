# Bookable Platform

Monorepo for Bookable client sites and the shared CRM core library.

```
platform/
  packages/
    crm-core/             @bookable/crm-core — shared CRM library
  clients/
    wilkinson-er/         Wilkinson Equity Release site
    therayan-partners/    (future)
  apps/
    wilkinson-admin/      Standalone CRM admin (dev tool)
  client-template/        Starting point for new clients
```

## How it works

- **packages/crm-core** builds as a Vite library (ES module + compiled Tailwind 4 CSS + TypeScript declarations)
- **Each client site** is a Vike SSR app with its own public marketing pages + the CRM embedded at `/admin`
- **Turbo** ensures crm-core builds before any client that depends on it
- **Each client** has its own Vercel project, Supabase project, domain, and env vars

## Local development

```bash
cd platform
npm install
npm run dev:wilkinson    # starts wilkinson-er dev server (builds crm-core first)
```

## Adding a new client

### 1. Copy the client template

```bash
cp -r client-template clients/new-client-name
```

Or copy an existing client like `wilkinson-er` and strip out the client-specific content.

### 2. Update `package.json`

In `clients/new-client-name/package.json`:

- Set `"name"` to something unique (e.g. `"new-client-name"`)
- Ensure `"@bookable/crm-core": "*"` is in dependencies
- Keep the build script structure:
  ```json
  "build": "node scripts/generate-sitemap.mjs && node scripts/copy-crm-styles.mjs && tsc -b && vite build && cp server-entry.js dist/server/index.js"
  ```

### 3. Update `vercel.json`

In `clients/new-client-name/vercel.json`, update the build command filter:

```json
{
  "framework": null,
  "buildCommand": "cd ../.. && npx turbo build --filter=new-client-name",
  "installCommand": "cd ../.. && npm install",
  "outputDirectory": "dist/client",
  "functions": {
    "api/ssr.ts": { "includeFiles": "dist/server/**" },
    "api/sitemap.ts": { "includeFiles": "src/data/**" }
  },
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/api/sitemap" },
    { "source": "/(.*)", "destination": "/api/ssr" }
  ]
}
```

### 4. Set up the CRM admin

Create `src/admin/AdminApp.tsx`. This is where you configure the CRM for this client:

```tsx
import { useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { createCrmApp } from '@bookable/crm-core'

const CrmApp = createCrmApp({
  // Optional: add client-specific nav items
  extraNavItems: [],
  // Optional: add client-specific routes
  extraRoutes: [],
  // Optional: inject a sidebar into the case detail page
  caseDetailSidebar: undefined,
})

export default function AdminApp() {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/crm-core.css'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  return (
    <div onClick={(e) => {
      // Prevent Vike's client-side router from intercepting CRM link clicks
      const anchor = (e.target as HTMLElement).closest('a')
      if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
        e.stopPropagation()
      }
    }}>
      <MemoryRouter>
        <CrmApp />
      </MemoryRouter>
    </div>
  )
}
```

### 5. Ensure the copy-crm-styles script exists

Create `scripts/copy-crm-styles.mjs`:

```js
import { copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../../packages/crm-core/dist/index.css')
mkdirSync(resolve(__dirname, '../public'), { recursive: true })
copyFileSync(src, resolve(__dirname, '../public/crm-core.css'))
console.log('Copied crm-core styles to public/crm-core.css')
```

### 6. Wire up the admin page in Vike

Create `pages/admin/+Page.tsx`:
```tsx
export { default } from '../../src/admin/AdminApp'
```

Create `pages/admin/+ssr.ts`:
```ts
export const ssr = false
```

### 7. Add the logo double-click to access admin

In your Navbar component, add a double-click handler on the logo:

```tsx
onDoubleClick={(e) => {
  e.preventDefault()
  window.location.href = '/admin'
}}
```

### 8. Create a Supabase project

Each client gets their own Supabase project. Run the shared migrations from `packages/crm-core/supabase/migrations/` against the new project.

### 9. Add root scripts (optional)

In the root `package.json`, add convenience scripts:

```json
"dev:newclient": "turbo dev --filter=new-client-name",
"build:newclient": "turbo build --filter=new-client-name"
```

### 10. Create the Vercel project

1. Go to vercel.com/new
2. Import the `mknapp360/bookable-platform` repo
3. Set **Root Directory** to `clients/new-client-name`
4. Leave Build Command, Install Command, and Output Directory as defaults (vercel.json handles it)
5. Add environment variables:
   - `VITE_SUPABASE_URL` — from the client's Supabase project
   - `VITE_SUPABASE_ANON_KEY` — from the client's Supabase project
6. Deploy and verify on the preview URL
7. Add the client's production domain

### 11. Install and build

```bash
cd platform
npm install
npx turbo build --filter=new-client-name   # verify it builds
```

Push to `main` and Vercel will auto-deploy.

## Key things to know

- **crm-core uses Vite 8 + Tailwind 4**, client sites use **Vite 6 + Tailwind 3**. They don't conflict because crm-core's CSS is pre-compiled and copied as a static asset (`public/crm-core.css`).
- The CRM runs inside a **MemoryRouter** so its internal navigation (`/dashboard`, `/cases`, etc.) doesn't interfere with Vike's URL-based routing.
- The `onClick` wrapper on the AdminApp div prevents Vike's client-side router from intercepting clicks on CRM links.
- Updating `packages/crm-core` and pushing to `main` automatically rebuilds **all** client sites on Vercel.
