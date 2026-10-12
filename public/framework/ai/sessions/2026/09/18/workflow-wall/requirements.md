# workflow-wall — every sign-up and sign-in workflow as a demo app you can click through, on one wall, with the click count to "logged in"

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one wall; each card one workflow; reuse `ux/Auth` and `demo.app()`). Clear beats brief by far (a newcomer sees the flow and its click count without reading). Prioritize (the wall and three flows first; avatar and the provider study second).
**Length budget:** the wall is one screen; a card is a demo app in a box with a title and a click count. Your landing report is one screen.

## The owner's words (2026-09-18, 13:25)

> do we have user interfaces built out for that yet? And how would that look? [...] I know we have demo apps where we can see the URL changing and click through different workflows. We really need to lean into that system to document these systems. [...] creating a grid of user interface cards and each one represents a specific workflow like registration. [...] I'd like to be able to study the user experience from landing page to sign up, how many clicks it takes to get logged in. [...] using Google sign in has always been an objective of mine. I don't know if we want to use some sort of third party auth provider. I'd actually lean away from it — having the raw APIs is almost always better than an aggregate API that shields you from the underlying API. [...] social login — how to use those APIs to pull people's avatar image, or maybe look for a Gravatar.

## What exists — reuse

- `ux/Auth` (`/framework/ux/Auth/`): the sign-up / sign-in workflow class (read its readme and demo). `ux/Wizard`. `ext/demo`'s `demo.app(tree)` — a Page tree playing App and Router in a box, the url changing as you click (`ext/demo/readme.md`, `doc/method/app.md`).
- The platform: `/imagine/platform/decisions/identity.md` (GitHub + Google OAuth, six roles), `/imagine/platform/local/` (me, likes, room on the local harness), `worker/session.js` + `worker/me.js` (the session the worker keeps), the memery scout's report `ai/2026-09-18/memery-scout/report.md`.
- The tree component and the list shapes landing today (`ux/Tree`, `/imagine/design/lists/`) — not needed here.

## Deliverables

1. **`/imagine/platform/workflows/`** — a child of `/imagine/platform/` (one `children:` word + one visible line). A wall of workflow cards, each a `demo.app()` in a box (a real url bar changing inside it), each titled with the workflow and showing a live **click counter** ("3 clicks to logged in") that the demo itself counts: (a) landing → sign up with email → logged in; (b) landing → **Google** sign-in → logged in; (c) landing → **GitHub** sign-in → logged in; (d) a returning user: landing → sign in → logged in; (e) sign out. Password reset is out (the owner said so). In the demo the provider step is a mocked consent screen (one page in the tree) — no real OAuth — but the card's fold shows the REAL request the raw API takes (the authorize url with its parameters for Google and for GitHub, the token exchange, the userinfo call that returns the avatar), read from the providers' documented endpoints; say in one line that nothing here calls a provider.
2. **Avatar, two ways:** a sixth card: the provider's picture (from the mocked userinfo) versus a Gravatar (`https://www.gravatar.com/avatar/<sha256 of the lowercased email>?d=identicon` — compute the hash in the browser with `crypto.subtle`, draw the real Gravatar image for a demo email, `d=identicon` so it always renders); one line on when each wins.
3. **The provider decision**, as a `decision` line in your log and one paragraph on the page's fold: raw provider APIs (the owner's lean: no aggregator shielding the API) versus a third-party auth provider (Auth0 / Clerk / Supabase — wins when you need many providers, MFA and compliance on day one); chosen: raw GitHub + Google, matching `identity.md`.
4. **Docs:** the page's `decisions.md` (the record, the click counts per flow, the endpoints cited), one line in `/imagine/platform/readme.md`.

## Rules

- Load `code`, `layout` (under a COLUMNS host there is no page grid: `/imagine/` is one — the wall is `.grid.auto` with a `rem` column), `css`, `new-css-class`; `new-task` before the first edit (your dir exists: `ai/2026-09-18/workflow-wall/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/imagine/platform/workflows/**` (new), one `children:` word + one line in `public/imagine/platform/page.js`, one line in `public/imagine/platform/readme.md`, your task dir. Nothing else — not `ux/Auth` (consume; log what it lacks), not the worker, not `/imagine/platform/local/`.
- The owner's dev server (port 80) is running: never touch it; your own is `PORT=8125 node server.js` from the repo root, background, killed by its real Windows PID when you land. Never `git stash`, never `find /`, never drive the owner's tabs; no real network calls to any provider. `ui-test` has the headless recipe: click through flow (b) headless and shoot the logged-in state; the counter must read the number of clicks you made.
- Demos never persist. Two numbers that must agree: the counter on card (b) and your headless click count.
- Landing: `outcome` = a headline, the link, one shot of the wall at 1920, the click counts per flow, the decision line, what was left and why. One screen.
