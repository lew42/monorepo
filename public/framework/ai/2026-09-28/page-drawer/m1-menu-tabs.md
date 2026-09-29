# Minion 1: the ☰ menu and the drawer's tabs

Load the `minion` skill first, then `code`, `page` and `css`. The owner's raw words: `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words.md` (read the last third: "each page could have like a little menu button in the top right…"). The design: `design.md` in the same dir. The whole brief: `public/framework/ai/2026-09-28/page-drawer/requirements.md`.

**Work only in the worktree** `C:\Code\lew42\worktrees\page-drawer` (branch `worktree/page-drawer`, its own server at http://localhost:62178/). Commit there. Do not merge. Log in `public/framework/ai/2026-09-28/page-drawer/m1/task.jsonl` (in the worktree).

## Deliverables

1. **The menu:** a ☰ button, top right, on every page, added in the site chrome (`public/app.js`, the menu only). One click opens `ext/drawer`; a second click (or the drawer's ✕) shuts it. It must not cover the page head or the dev bar. Shoot it at 1280 and 3440.
2. **Tabs in the drawer:** AI, Sessions, Dictation, Settings, Admin — a new file set under `public/framework/ext/drawer/` (e.g. `tabs.js` plus one small file per tab). Each tab is routed: `?drawer=sessions` in the URL opens the drawer on that tab, clicking a tab rewrites the URL with `history.replaceState`, so a reload lands on the same tab. No `?drawer` = drawer shut.
3. **AI tab:** the card's composer (chat and dictate) — `public/framework/ai2/compose.js` and where `ai2/card.js` uses it — is reused here, imported, not copied. Add a model picker that only shows the choice (Haiku / Sonnet / Opus / Fable) and stores it; nothing reads it yet. On a card page, sending goes where the card's composer already sends. On a plain page, send by the agreed interface `public/framework/ai/2026-09-25/recursive-pairs/interface.md` (`POST http://servex.localhost/api/page-ai`, body `{page, text, from, context}`); that endpoint is not live yet, so when it fails, fall back to the dev bar Ask route (`dev/DevBar/ask.js`, `ext/Ask`) so a message still gets an answer today. Keep the send in one function, `send({page, text, context})`, exported, so minion 2 can pass element context through it.
4. **Sessions tab:** every thread on this page, read from the dev bar Ask's store (`<page>/ai/<slug>/task.jsonl`; `chat_session_id` resumes a thread — see `dev/DevBar/sessions.js`, `ask.js`). One click reopens that thread in the AI tab and the next send resumes it. On a card, the card's sub-cards show here too.
5. **Dictation tab:** embeds the dictation playground (`/framework/ux/Dictate/playground/`, built today). **Settings tab:** the dev bar's settings (`dev/DevBar/settings.js`), reused. **Admin tab:** only what already exists (e.g. hold on/off, links to the dev bar's tools); nothing new.
6. **Docs:** `ext/drawer/doc/tabs.md`, a screenshot first, then the tab model (how to add a tab, the route word). Add one line to `ext/drawer/readme.md` pointing at it, and a live demo on `ext/drawer/page.js`.

## Proof (put the pngs in `public/framework/ai/2026-09-28/page-drawer/shots/`)

- the drawer open on a plain page (`/framework/ext/drawer/`) and on a card (`/framework/ai2/` with a card open) at 1280 and 1920;
- the ☰ at 3440, not covering the head or the dev bar;
- a reload on `?drawer=sessions` landing on Sessions;
- an old Ask thread resumed from the Sessions tab (find one under any page's `ai/` dir).
Drive a headless Playwright against http://localhost:62178/, never the owner's tabs. Zero console errors on the pages you touched: `node Server/smoke.mjs C:\Code\lew42\worktrees\page-drawer`.

## Never

Edit files outside the fence (`public/app.js` menu only, `ext/drawer/**`, and a small export seam in `ai2/compose.js` if needed — say so in your log). Start or restart any server. Show a window: every spawn sets `windowsHide: true`. New CSS classes go through `new-css-class` with the `drawer-` prefix.

When done, write `m1/proof.md` (checklist, one line per deliverable with its png) and stop.
