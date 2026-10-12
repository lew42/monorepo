# ai-page — build brief (worker task, group: timeline)

Build waves 1–3 of [`../timeline/design.md`](../timeline/design.md). Read that
file FIRST, then [`../timeline/requirements.md`](../timeline/requirements.md)
(Mike's verbatim ask). Work **autonomously** — no questions; defer non-MVP
choices to phase 2 (note them in the module readme); when a design decision is
genuinely contested, build the simple version that *shows* the dilemma (two
variants side by side, or the rough edge visible) rather than stopping.

Before writing any JS/CSS: load the `code-architecture` and `layout-design`
skills. Study: `core/Sidebar/Sidebar.js` (the View-subclass idiom),
`ext/catalog/catalog.js` + `catalog.css` (the rail IS `this.previews()`),
`ext/AISession/dashboard.js` (`json`/`manifest` helpers, `running()`),
`ext/JSONL/JSONL.js` (TaskJSONL). Dev server is already on port 80 — reuse it;
never `pkill` (Windows — `taskkill //F //PID` if you must kill something).

## Wave 1 — ext/Timeline core

`public/framework/ext/Timeline/`: `Timeline.js` (aim <100 lines),
`Timeline.css`, `page.js`, `readme.md`; add `Timeline` to `ext/page.js`
children.

- `class Timeline extends View`, assign-based config:
  `{ orientation: "h"|"v", reverse, zoom /* em per hour */, lane /* em per lane */, from, to, items }`.
  `from`/`to` ms epoch; default to the items' extent padded ~15 min.
- Item: `{ at }` instant (dot) or `{ from, to? }` span (bar; missing `to` =
  still open, runs to now). Plus `label`, `kind` (becomes a CSS class: `task`,
  `agent`, `log`, `action`, `window`, `day`), `url` (render the bar as an
  `<a>` — that is what makes catalog routing and `mark_links()` work),
  `children` (nested items positioned relative to the parent's `from`).
- **Positioning is CSS, not layout math.** Root carries `--em-per-hour`,
  `--em-per-lane`, `--dur` (domain hours), `--lanes`; each item carries `--t`
  (hours since domain start) and `--d` (duration hours). `.h` maps `--t` to
  `left`/`width`, `.v` to `top`/`height` (`.reverse` flips via the opposite
  inset); lanes map to the cross axis. Zoom is ONE property write; the
  track's own size comes from `--dur`/`--lanes` so scrolling works.
- Lanes: greedy interval packing (sort by `from`; first lane whose last end ≤
  `from`). An explicit `lane: "<string>"` pins items to a shared named track.
  `kind: "window"` spans the whole cross axis, z-below the bars, no lane.
- Ruler: hour ticks via `repeating-linear-gradient` sized from
  `--em-per-hour`; text labels at a cadence keeping them ≥4em apart; a `now`
  line nudged by a 60s timer while the page is visible.
- CSS: restate `@layer base, theme, site, util;` IN FULL; every rule in a
  layer; layout only — skin stays minimal, kinds get one accent each.
- `page.js`: code-first demos on synthetic items — h at two zooms (side by
  side — the zoom-control dilemma made visible; a live ext/layout slider is
  phase 2), v, parallel-lane packing, window band, nested children.

## Wave 2 — the ai page

- `ext/Timeline/ai.js`: `ai_timeline(page)` → a vertical `.reverse` Timeline
  (newest at top). Items: day dirs from `/framework/directory.json`; per task
  dir `task.jsonl` via `TaskJSONL` (else legacy `session.json` — fetch with
  the SPA content-type sniff) → task bar (`requested_at → landed_at ?? open`,
  `url` to the task, slug label), its `logs`/`actions` `at` entries → child
  dots. Window bands from `usage.json` `utilization.five_hour.resets_at` →
  `[resets_at − 5h, resets_at]`, labeled with the session percent;
  `/framework/ai/usage.jsonl` (append-only history, `{"log": {at, session,
  weekly_all, weekly_scoped, resets_at}}`) exists — a stepped fill from it is
  phase 2, a flat band is MVP. Agent slivers: skip (no timestamps yet) —
  phase 2, note it.
- `framework/ai/page.js`: `initialize(){ this.catalog(); }`;
  `previews(){ return ai_timeline(this); }`; `content()` keeps the intro
  prose + the **Running now** strip (it becomes the catalog's intro entry —
  the default right-hand region). Keep the declared children and the dynamic
  `route()`.
- Even split: in `Timeline.css`,
  `.page-catalog > .timeline { flex: 1 1 0; min-width: 0; position: sticky; top: 0; max-height: 100dvh; overflow: auto; }`
  (mirrors the catalog rail's pin). Below catalog's 64em breakpoint add your
  own stack rule for `.timeline` (cap its height ~40vh above the region).

## Wave 3 — rename ext/AISession → ext/AITask

`git mv public/framework/ext/AISession public/framework/ext/AITask`, then
`git mv .../AISession.js .../AITask.js`. Class `AISession` → `AITask`; its
emitted class `ai-session` → `ai-task`. Update every LIVE reference:
`app.js` (export block + comment), `ext/page.js` children, `framework/ai/page.js`,
`ai/2026-08-13/page.js`, `ai/2026-08-13/sessions/page.js`,
`ai/2026-08-13/manifest-vs-log/page.js` (the `stats.js` import path + prose),
`ai/2026-08-13/task-previews/page.js` (link text/url), `ext/JSONL/readme.md` +
`ext/JSONL/page.js`, and the moved module's own `readme.md`/`page.js`.
Do NOT touch historical records (`requirements.md` files, the `renames` task
text, `analysis.md`, `notes.md`).

## Ownership

Yours: `ext/Timeline/**` (new), `ext/AISession/**`→`ext/AITask/**`,
`framework/ai/page.js`, the single lines named above in `app.js` +
`ext/page.js`, the four listed `ai/2026-08-13/*/page.js` files,
`ext/JSONL/readme.md`+`page.js`, this task dir.
NOT yours: `CLAUDE.md`, `.claude/**`, `Server/**`, `core/**` (read-only),
memory, any other task dir.

## Process

- Log to THIS dir's `task.jsonl` as you work — one verb per line, value
  self-contained: `{"assign": {"now": "…"}}` on phase changes,
  `{"log": {"at": "<ISO>", "msg": "…"}}` findings, `{"action": {"at", "did",
  "files": […]}}` per wave. Do NOT stamp `landed_at` — the orchestrator lands.
- Verify before reporting: `node --check` every touched js via an `.mjs` copy
  (the backtick-in-css trap); then playwright (`NODE_PATH=$(npm root -g)`,
  chromium, `http://localhost`) over `/framework/ext/Timeline/`,
  `/framework/ai/` (click a timeline bar — the task must render in the right
  region), `/framework/ai/2026-08-14/`, `/framework/ai/2026-08-13/`,
  `/framework/ext/AITask/` — zero console errors. Log the results.
- Final report (your last message): what shipped per wave, verification
  output, phase-2 list, anything broken you couldn't fix.
