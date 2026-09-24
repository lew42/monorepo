# Build brief — two layout repairs on /framework/ai2/

Minion: `minion-ai2-layout`. Parent: `task-mastermind-ai2-dashboard`. Load the `minion`, `layout` and `css` skills first.

## The owner's words

> "We don't want to clobber the dashboard. It's not terrible right now, so we need to be very
> careful about how we merge these updates. I had an overnight session destroy a bunch of padding
> on a bunch of containers the other day." (2026-09-24)

> "These four columns should be full height and share the full width... no padding on this page,
> no borders, radiuses or gap... substantial padding on them... the default padding should scale
> with size." (2026-09-23, the overview)

> "The compose area is massive (277px+), way too much padding; one compact line with the mic at
> the end of the text area; the dashboard must be minimal, no dead space." (2026-09-22)

> "You never have zero padding with text. It looks terrible." (2026-09-22, the padding law)

The whole record: [`ai2/doc/owner-asks.md`](/framework/ai2/doc/owner-asks.md) — entries `#overview-fit` and `#rail-head`.

## Deliverables

1. **The overview fits the screen** (`/framework/ai2/overview/`). Today at 1920 the first column
   slides under the site's nav sidebar (only "ds you" of "Needs you" shows, text at 0px from the
   edge), the fourth column runs off the right edge, and a huge "Overview" h1 leaves ~130px of
   dead space. Wanted: the four columns sit entirely to the right of the site sidebar, share the
   remaining width, run full height, each padded with the existing `--ai2-ov-pad`; no giant title
   (a small head line with the way back to the inbox is fine, or none — the rail's `overview`
   word already exists). Check at 1280, 1920 and 3440. Find the ROOT cause (why it overlaps the
   sidebar) before writing CSS; fix it in the overview's own rules, not in shared CSS.
2. **The rail head fits** (`.ai2-chrome` in page.js, rules in ai2.css). Today at 1280 and 1920
   the `notes` word spills out of the rail into the detail pane and "auto-transcribe" wraps onto
   two lines. Wanted: everything inside the rail's width, nothing wrapping mid-label, compact (one
   line if it fits, a tidy second line if not), at the rail's default width AND when the rail is
   dragged narrow (its grip).

## Fence — what you may touch

- `public/framework/ai2/overview.js`
- `public/framework/ai2/ai2.css` — ONLY `.ai2-ov*`, `.ai2-overview*`, `.ai2-chrome` and the rail-head rules
- `public/framework/ai2/page.js` — ONLY markup/classes inside the `.ai2-chrome` block. Do NOT change
  the `+ New card` click handler, `route()` or `card_page()` (task-mastermind-card-folders is
  rewriting those). Do not touch `live.js`, `card.js`, `inbox.js`, `.ai2-card-live*` rules
  (task-mastermind-live-card), or anything outside `public/framework/ai2/`.
- No change to `framework.css`, `styles/`, or any `.page` / shared padding rule. If the root cause
  is in shared CSS, STOP and report it instead of changing it.

## Where

Worktree `C:\Code\lew42\worktrees\ai2-dashboard` (branch `worktree/ai2-dashboard`), its own server at
`http://127.0.0.1:53800`. Work and commit ONLY there — never the main tree `C:\Code\lew42\monorepo`.
Headless Playwright only (global: `await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`);
never the owner's tabs. Scratch scripts go in the session scratchpad, named `ai2d-build-*.mjs`.

## Done means

- Shots at 1280 and 1920 of `/framework/ai2/` and `/framework/ai2/overview/`, before and after,
  in the scratchpad (`ai2d-build-shots/`), opened and looked at.
- `node Server/padding-check.mjs /framework/ai2/overview/ --base http://127.0.0.1:53800` and the
  same for `/framework/ai2/` — no new offenders vs before (report both). ⚠ In Git Bash prefix it
  with `MSYS_NO_PATHCONV=1`, or the `/framework/…` argument becomes `C:/Program Files/Git/framework/…`.
  Before today (1920): FAIL, "Overview" at 0px and "Open the inbox →" at −37px — after must PASS.
- Zero console errors / failed requests on both pages.
- One commit on `worktree/ai2-dashboard`; `git diff michael/dev...HEAD --stat` shows only the fenced files.
- Reply with one short paragraph: root cause, what changed, the check results, the commit hash.
