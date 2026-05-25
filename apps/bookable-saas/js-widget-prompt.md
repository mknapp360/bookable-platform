# BookableCRM — Universal JavaScript Embed Widget

## What you're building

A self-contained JavaScript widget that any website owner can drop into a page with two lines of HTML — no plugin install, no WordPress required. It targets Squarespace, Webflow, Ghost, custom HTML sites, and any platform that accepts a Code Block.

The backend (Edge Functions `submit-enquiry` and `get-widget-config`) already exists. This task is purely frontend delivery.

---

## How it works for the end user

They copy this from their BookableCRM settings page and paste it into any Code Block:

```html
<div id="bcrm-form"></div>
<script src="https://app.bookablecrm.com/widget.js" data-key="THEIR_EMBED_KEY"></script>
```

That's it. No Supabase URL to configure. No plugin to install. One key, one snippet.

---

## Codebase context

**Stack:** React + TypeScript, Vite, Supabase, Vercel.

Files in `public/` are served as-is by Vite/Vercel at the root URL. So `public/widget.js` becomes `https://app.bookablecrm.com/widget.js`. This is where the widget script lives.

The Supabase project URL should be read from the existing Vite env variable (`import.meta.env.VITE_SUPABASE_URL`) — but since `widget.js` is a plain JS file in `public/` (not processed by Vite), you cannot use `import.meta.env` directly.

**Solution:** Create a small Vite plugin or use a build step to generate `public/widget.js` from a template that substitutes `VITE_SUPABASE_URL` at build time. Alternatively, and more simply: create the file as `widget.js.template` and add a Vite plugin (in `vite.config.ts`) that copies it to `public/widget.js` with the env variable substituted during build. Look at how `vite.config.ts` is currently structured before adding to it.

If that feels too complex, an acceptable fallback is to expose a tiny API route at `/api/widget-config?key=xxx` (using the existing `api/ssr.ts` pattern) that the widget calls instead — keeping the Supabase URL server-side entirely. Use whichever approach fits the existing project structure better.

**Existing edge functions:**
- `GET /functions/v1/get-widget-config?embed_key=<uuid>` — returns `{ title, fields: { name, email, phone, message }, submit_label, success_message }`
- `POST /functions/v1/submit-enquiry` — body: `{ embed_key, name, email, phone?, message? }`

---

## Part 1 — `public/widget.js`

A single plain JavaScript file. No build tools, no frameworks, no dependencies. Must work in any modern browser.

**Behaviour:**
1. Find the script tag via `document.currentScript` and read `data-key`.
2. Find `<div id="bcrm-form">` on the page (if missing, log a warning and exit gracefully).
3. Fetch widget config from the BookableCRM endpoint (Supabase URL baked in at build time).
4. Render the form based on the config. Fields to conditionally show: name, phone, message. Email always shown.
5. Inject a `<style>` block scoped to `.bcrm-form` — clean, minimal, neutral styling that doesn't fight with host site themes. Use CSS custom properties with fallbacks so site owners can override easily:
   ```css
   .bcrm-form { --bcrm-primary: #1a1a1a; --bcrm-radius: 6px; --bcrm-font: inherit; }
   ```
6. On submit: show a loading state on the button, POST to `submit-enquiry`, show the success message or a generic error. Disable double-submit.
7. On success: replace the form with the success message.
8. Handle network errors gracefully — show "Something went wrong. Please try again." rather than a blank state.

**Form field markup pattern:**
```html
<form class="bcrm-form" novalidate>
  <h2 class="bcrm-form__title"><!-- from config --></h2>
  <div class="bcrm-form__field">
    <label class="bcrm-form__label" for="bcrm-name">Full name</label>
    <input class="bcrm-form__input" type="text" id="bcrm-name" name="name" required>
  </div>
  <!-- etc -->
  <button class="bcrm-form__submit" type="submit"><!-- from config --></button>
</form>
```

All class names prefixed with `bcrm-` to avoid collision with host site styles.

**Do not use:** jQuery, fetch polyfills, any external scripts. Target browsers that support `fetch` and `Promise` natively (all modern browsers).

---

## Part 2 — Update the CRM settings page

The settings page built in the WordPress widget task shows the WordPress shortcode. Add a second "Embed snippet" section below it showing the universal JS snippet:

```html
<div id="bcrm-form"></div>
<script src="https://app.bookablecrm.com/widget.js" data-key="[EMBED_KEY]"></script>
```

With a copy-to-clipboard button. Label it clearly: **"All other sites (Squarespace, Webflow, custom HTML)"**.

Update the instructions text to present both options — WordPress plugin first, JS snippet second.

---

## Part 3 — Vite build config

Update `vite.config.ts` to substitute the Supabase URL into `widget.js` at build time. The template file should live at `src/widget.js.template` (so it's version-controlled but not served directly). The Vite plugin writes the substituted output to `public/widget.js` as part of the build.

Add `public/widget.js` to `.gitignore` since it's a build artefact. Add `src/widget.js.template` to version control.

For local dev, the Vite plugin should also run in `serve` mode so the widget works during development.

---

## What done looks like

- `src/widget.js.template` exists with `__SUPABASE_URL__` placeholder.
- `vite.config.ts` has a plugin that outputs `public/widget.js` with the URL substituted.
- `public/widget.js` is in `.gitignore`.
- The widget renders correctly when the two-line snippet is pasted into a plain HTML file with a valid embed key.
- The CRM settings page shows both the WordPress shortcode and the JS embed snippet with copy buttons.
- No existing functionality is broken.
- The widget handles: config fetch failure, submit failure, missing `#bcrm-form` div, missing `data-key` — all gracefully.
