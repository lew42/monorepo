# Today, on one page, in two minutes

Mike has been away since about 11:00 and roughly a dozen tasks have landed since.
The day dashboard shows them **chronologically, as logs**. That is the record, not
the report.

**Build the report:** one page, ranked by what matters, **showing** results rather
than describing them.

Mike, 2026-08-15, standing: *"he wants to SEE results"* — and *"3 words over 5, 1
sentence over 3. Simplicity is gold."* A claim without something clickable or
visible is not a result.

## Where the material is

Every task under `public/framework/ai/2026-08-17/` has a `task.jsonl` with its own
findings, plus `ai/2026-08-16/mastermind-layout/task.jsonl` which is the run log
tying them together. **Read the logs; do not re-derive anything.**

⚠ **Screenshots are already logged and the route is live.** Tasks recorded shot
paths as `{"shot": {...}}` or in `log` lines — `layouts-redesign`, `weak-cards`,
`ui-wall`, `designtool-ui-build`, `designtool-ui` and `human-ranking` all took
before/after sets at 390/1280/3440. `GET /screenshot?path=<abs>` serves them
(loopback-guarded, `Server/plugins/Screenshots.js`). **Use real images.** A
before/after pair beats any paragraph about it.

## What to lead with

Rank by what changes Mike's decisions, not by chronology. From the run log, the
strongest material is roughly:

- **`/framework/ui/` and `/framework/styles/layouts/`** — both rebuilt today into
  browsable walls. Before/after at 3440 is the single most persuasive image pair
  available.
- **The tool now measures what it claims.** `width-used` distinguishes 1280 from
  3440 for the first time; `scale` was scoring pages **zero for being large**;
  `measure` was reading preview captions as prose. Tier-wide **spread grew while
  the mean stood still** — the signature of better discrimination.
- **The devbar was manufacturing its own top finding** — rail closed 0 `gutter`
  findings, rail open 18 of 24, and its highlight ring covered 79% of the
  viewport.
- **One screen, 2 controls**, and bad highlights measured to zero.
- The scoring program's honest state: **no tier is ground truth**, and Mike's
  five minutes on the ranking page is what unblocks it.

Use your own judgement on the order — that list is evidence, not a script.

## The section that matters most: what needs Mike

Put it **near the top, unmissable**, and keep it to what genuinely needs him:

1. **[Rank the 18 shots](/framework/ai/2026-08-17/human-ranking/rank/)** — five
   minutes, and it is the only thing that can anchor any scoring tier.
2. **`frame-gap` measures the sidebar on 87 pages** — 94 of 141 pages take their
   10th percentile from outside the content region, 87 from `div.sidebar` at
   exactly 1.400, and it pays full credit to 138 of 141. Fixing it contradicts the
   band's deliberate root scope, which is a design call.
3. **Masonry** — he asked for it on the layouts wall by name; a per-band grid was
   built instead, with reasons. His to overrule.
4. **`session_id` in published logs** — 87 task files carry it in plain text.
5. **`SubagentStop`** is not registered, so worker agents have never had the
   unfinished-ledger gate. The machinery now supports it; enabling it is his call.

## Rules for the page itself

- ⚠ **No walls of text.** If a section needs three paragraphs, it belongs in its
  task log with a link, not here.
- Every claim carries a **number, an image, or a link** — ideally all three.
- ⚠ **Say what is still weak.** Ragged rows, four near-empty component previews,
  two untested bands, and the baseline sweep still owed. A report that only lists
  wins is not a report.
- It must read at **390, 1280 and 3440**. Screenshot it at all three and look.

## The trap that will bite you

⚠ `public/framework/ai/<date>/page.js` has a **`route()` that turns any unknown
child name into an `AITask`** reading `<name>/session.json`. A plain `Page` placed
under `2026-08-17/` may be swallowed by that route and rendered as a task log
instead of your page. **Read `ai/2026-08-17/page.js` and `ai/page.js` first**, and
declare your page explicitly so it renders as itself. Verify by loading the real
url, not by assuming.

RULE#13: nothing crawls the filesystem — the page must be reachable from
`/framework/ai/` or `/framework/ai/2026-08-17/` without knowing its url. **Log the
clickable url** and confirm you reached it by navigation.

## Files you own

- `public/framework/ai/2026-08-17/report/**` — your page.
- The **one** parent file needed to declare it (`ai/2026-08-17/page.js` or
  `ai/page.js`) — minimal edit, and say what you changed.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `ui/**`, `styles/layouts/**`, `ext/catalog/**`, `core/Page/Page.css`
(another agent is polishing those right now — read them, don't edit, and **don't
screenshot them mid-edit**; use the before/after shots already logged),
`ext/DesignTool/**`, `ext/Panel/**`, `.claude/**`.

⚠ **Do not regenerate the audit baselines** — one sweep runs after the polish
lands.

## Deliverables, in this order

1. **The page, reachable, with real screenshots rendering.**
2. The "needs Mike" section, near the top.
3. The honest still-weak list.

Running short? Cut sections, never the images — **the images are the report.**

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- **Capturing is synchronous — never build DOM after an `await`.** This page loads
  image data, so the trap is live: fill containers inside a callback
  (`$box.append(() => …)`).
- Prose is markdown — `md("…")`, not `p()` with backticks. ⚠ Only `p()` and
  `h1`–`h6` read backticks; every other factory appends raw.
- ⚠ A backtick inside a `` css(`…`) `` template literal terminates the string and
  kills every page. `node --check` any file you edit.
- Reuse the dev server on port 80; do not restart it. Assert
  `document.visibilityState === "visible"` before any screenshot.
- Load `code-architecture`, `layout-design` and `css`.
