# cloudflare-mcp

Verbatim ask (owner, in `/imagine/cms/services/`):

> is there an Mcp for cloudflare, so you can setup and configure these cloudflare services
> without me? if so, make a note of that on the imagine page, so when I check it out
> tomorrow, I can see these actionable steps.

## Scope

- Research (WebSearch/WebFetch only): does an official Cloudflare MCP exist, mid-2026 state —
  which services it covers (Workers, D1, KV, R2, Durable Objects, DNS, docs-search), auth model
  (OAuth vs API token + scopes), how it connects to Claude Code (`claude mcp add` forms), what
  becomes autonomous vs still-dashboard-only. Also the `npx wrangler` CLI fallback.
- Write a new section into `public/imagine/cms/services/page.js`: "Claude can do this — the
  setup" — numbered actionable steps, each one line + source link. State plainly which of the
  page's mock screens become real once connected. If the MCP story is weak/in flux, say so and
  give the wrangler fallback instead.

## Fence

- Files: `public/imagine/cms/services/page.js` (and this task dir only).
- No cloud calls, no logins, no commits, no stash. Never touch the :80 dev server.

## Steps

1. Research Cloudflare's official MCP offering(s) — repo, hosted/remote server, service coverage
2. Research auth model + `claude mcp add` connection form
3. Research what becomes autonomous vs dashboard-only; verify currency (mid-2026)
4. Read the existing services page.js in full (done)
5. Draft the "Claude can do this" section matching the page's voice/shape
6. Edit page.js, wire the section into `content()`
7. Verify: renders at 400/1920, links resolve (HEAD-check externals), zero console errors
8. Land via finish-task
