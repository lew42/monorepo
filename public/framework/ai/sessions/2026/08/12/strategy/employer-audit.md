# Employer first-impression audit — /framework/

Lens: a senior engineer Mike sent the link to. Five to ten minutes of clicking,
then a hiring-relevant judgment. Traced from `public/app.js` through every
`children:` declaration; routes below are what a visitor actually reaches.

## The verdict up front

**The content is not the problem. The curation is.** The docs tier is genuinely
strong — Start fetches a real working project (`files()`), the FAQ leads with
code and admits the silent failures, Versus publishes reproducible numbers *and*
the column where React wins, the View page is live demos all the way down. A
senior engineer who reads three pages will be impressed. The three things that
can wreck the visit all happen **before** they read three pages:

1. The framework landing never says what this is — the sell is buried on the
   third nav item.
2. The AI session-log tier sits in the product sidebar and on the landing wall,
   dated `2026-08-12` cards and all.
3. One click on the logo lands on an internal team memo ("Nice work, everyone…
   Sit tight").

The minimum fix is small: **one word deleted, ~20 lines added, one page
rewritten.** Everything else is optional polish.

## What the visitor actually sees (traced)

`/framework/` (`public/framework/page.js`) hides the global top nav
(`classes: "hides-nav"`, so the personal-sandbox links in `app.js`'s `nav`
array are invisible throughout the section — good). Its sidebar + landing tree
come from one line:

    children: "start faq versus core styles ui ext util dev ai"   (line 12)

- Sidebar (`sections()`, lines 68–84): 3 flat links, then titled groups —
  Core (6 entries), Styles (5), UI (**20** — Overview + 19 components),
  Extensions (10), Utilities (4), Dev server (2), **AI (6 — Overview + five
  dated session logs)**. Roughly 56 links, no collapsing (`Sidebar.js` groups
  are flat title+links).
- Landing body (`render()`, lines 37–60): a 3-line hook — "Create
  `/path/page.js`:", a 3-line code block, "That's basically it." — then
  `this.walls()`: every section's children as card walls, **ending with an "AI"
  wall of five date cards** ("2026-08-12 — One axis for everything; then four
  parallel workers…"). Then "Start at Start here…".

`core/new/` and `core/legacy/` are NOT reachable: `core/page.js` declares only
`View Page Router App Sidebar`, and a grep for `/framework/core/(new|legacy)`
in page.js files finds links only *inside* `core/new/1/` itself. No action
needed for first impression.

Dead links: today's unify worker reports a 446-route crawl clean
(`ai/2026-08-12/page.js`); re-crawl `/framework/` after any nav change
(per memory: crawl `/framework/` + `/notes/` only).

---

## Move 1 — Drop `ai` from the framework nav (P0)

**What:** In `public/framework/page.js` line 12, delete the word `ai`:
`children: "start faq versus core styles ui ext util dev"`.

**Why:** That one word puts the workshop on all three first-impression
surfaces at once — the sidebar's last group (five dated logs), the landing's
last wall (five date cards with agent-orchestration blurbs), and the section
count. To a stranger, dated logs titled "2026-08-12" with "four Opus workers"
timelines read as *someone's project diary shipped to production*. Removing
the word removes all three surfaces, because the sidebar (`sections()`), the
wall (`walls()` skips undeclared children), and the tree all iterate
`this.children`.

**What still works:** `/framework/ai/…` urls resolve from disk (declaring a
child is the menu, not the route — `start/page.js` says so). The two product
citations keep working as deep links and are worth keeping — they're a good
story for a reader who digs:
- `public/framework/ui/page.js` line 28 → `/framework/ai/2026-08-09/`
  ("independent review")
- `public/framework/dev/Socket/page.js` line 42 → `/framework/ai/`
  ("session log") — optionally reword to "development log".

**Effort:** one word. **Risk:** near zero. The AI tier stops being crawlable
from nav — re-run the crawl and expect the ai/ routes to drop out of it.

**Decision for Mike (default = hide):** the alternative is keeping it as a
deliberately-labeled "Development log" last section. That's a real
differentiator too (AI-native process, honestly documented) — but it fights
"clean, simple, production-ready", and the deep-link citations preserve the
story without the sidebar cost. Hiding is reversible in one word.

## Move 2 — Make /framework/ say what it is, above the fold (P0)

**What:** In `public/framework/page.js` `render()`, before the existing
"Create `/path/page.js`" hook (line 41), add a headline + one-line lede +
the stat row: **"A no-build, native-ESM web framework."** and
`714 lines · 21 KB gzipped with CSS · 0 build steps · 0 runtime deps ·
0 config`, each stat linking or the row captioned with a link to
`/framework/versus/` ("measured, reproducible").

**Why:** Today the first screen is the hook code with zero framing — a
visitor arriving from a bare link doesn't know if this is a framework, a
tutorial, or a demo. The page's own `description` ("A no-build, native-ESM
web framework — read the code, get it.") renders nowhere on the page itself.
Meanwhile the killer numbers sit on `/framework/versus/` (`versus/page.js`
lines 41–56, the `stat()` grid), third in the nav under a name a stranger may
not click. The no-build/zero-dep architecture is the hiring-relevant
differentiator and it is currently **sold nowhere a first-time visitor
looks.** Keep the "That's basically it." beat — it lands better once the
reader knows what "it" is.

**Trap:** the numbers are hand-counted with a "recount before editing — one
claim in two places" warning in `versus/page.js` (lines 43–46). Adding a third
place: either reuse the exact figures and add the same warning comment, or
factor the five numbers into one small shared module both pages import.
Prefer the shared module (`versus/stats.js` or similar) — three hand-copies is
where drift starts.

**Effort:** ~20 lines. **Risk:** low; visual check at 390 and 3440 (the stat
grid pattern from versus already handles both).

## Move 3 — Replace the homepage memo (P1)

**What:** Rewrite `public/page.js`. Current content: title "Nice work,
everyone", "A note to the team", "Sit tight", "If you're bored", and a
card per personal sandbox (Alex/Arya/Castin/Edric/Michael). Replace with a
neutral one-screen landing: what lew42 is, cards for `/framework/` and
`/web/`, and at most one low-key "team sandboxes" group. Move the memo's
content to `/notes/` or an `ai/` day page if it should survive.

**Why:** The framework sidebar's brand logo always links to `/`
(`app.js` `brand()`, line 42: `a.c("brand-logo", …).href("/")`). Clicking a
logo is the single most common "what site am I on?" gesture — the employer
lands on a four-day-stale internal memo telling staff to sit tight. That's
the most embarrassing reachable page, one click from the link Mike sends.

**Effort:** 1–2 hours (content + the same topic layout it already uses).
**Risk:** the memo was written *to the team* — confirm with Mike it's
expired before deleting; moving it preserves it. The top-nav `nav` array in
`app.js` (lines 13–22) still lists the five sandboxes on non-`hides-nav`
pages (e.g. `/web/`) — acceptable for now since `/framework/` never shows it;
collapsing them to one "Team" entry is a nice-to-have in the same commit.

## Move 4 — Tame the UI group in the sidebar (P2, optional)

**What:** In `framework/page.js` `sections()`, stop expanding sections past a
size threshold — e.g. a section with more than ~8 children renders as a flat
link (its Overview) instead of a titled group. Only UI (19 children) trips it.

**Why:** The sidebar is ~56 links; the UI group alone is 20, pushing Ext,
Util, Dev below the fold of the nav itself. `/framework/ui/` already has the
better index — its `catalog()` rail of live-call cards — so the sidebar
duplication costs scanability and buys nothing.

**Effort:** ~5 lines. **Risk:** discoverability of individual components from
elsewhere in the section drops one click; that's what the catalog is for.
This is a preference, not a defect — skip if time is short.

## Explicitly: hide / delete / keep

| Surface | Action |
|---|---|
| `ai` in `/framework/` nav+walls | **HIDE** (drop from `children:`, Move 1) — do not delete the pages |
| Homepage memo (`public/page.js`) | **REPLACE**; move memo text to `/notes/` or `ai/` (Move 3) |
| Sandbox links on homepage cards/sidebar | **REMOVE or demote** to one group (Move 3) |
| `core/new/`, `core/legacy/` | **KEEP, no action** — already unreachable from nav |
| ai/ deep-link citations (`ui/page.js:28`, `dev/Socket/page.js:42`) | **KEEP** (optionally reword Socket's to "development log") |
| Start / FAQ / Versus / Core / Styles / UI / Ext / Util / Dev pages | **KEEP AS-IS** — this is the good part |

## Ship check

After Moves 1–3: re-crawl `/framework/` (expect ai/ routes gone from the
crawl, zero 404s among the rest), eyeball `/framework/` at 390 and 3440, click
the brand logo from `/framework/core/View/` and confirm the landing you'd
want an employer to see.
