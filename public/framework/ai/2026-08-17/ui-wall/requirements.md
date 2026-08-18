# The component wall — click a card, see variants of that card

Mike, 2026-08-17, verbatim:

> we dont' want to randomly process screenshots. We want to lock in on a very
> small subset of the most useful layouts and designs. Sort of like this Aurora
> site thing. Sidebars, toolbars, cards, everything. But organized, and starting
> with the most useful versions, and organizing variants from there. **If I click a
> basic card, I could see variants of that card.**

`/framework/ui/` is that catalog and it is **19 flat children** on one line
(`ui/page.js:18`): `table field crumbs pagination card stats badge alert toolbar
tags panel tooltip avatar dialog progress menu accordion timeline kbd`. A flat
list of nineteen is the same information-architecture problem
`/framework/styles/layouts/` had this morning.

## Reuse the wall that already works — do not invent a second one

`styles/layouts/page.js` was rebuilt today into a **sticky filter rail beside a
wall of bands, one grid per band**, and it works at 390, 1280 and 3440. **Read it
first**, along with `styles/layouts/readme.md`'s Decisions.

RULE#7 — one demo system. ⚠ **A new sibling wall with its own styles is a proposal,
not a commit.** Extend or reuse what's there. If the layouts wall's mechanism needs
generalising to serve both, generalise it — that is better than two walls that
drift apart, and say what you factored out.

Specific lessons from that rebuild, so you don't rediscover them:

- **`previews()` emits one flat run** with a full-width heading per group, so a
  one-member group renders a one-card row. One grid *per band* is the fix — then
  only a band's last row can be ragged.
- Declare the bands **once**, in one object, and derive `children:` from it. A
  second list is a second thing to forget.
- The layouts wall **dropped `ext/Panel`**: panel-body shrink-wrap gave it 1450px of
  a 3440 screen and at 390 the row would not stack at all (155px). ⚠ **`ui/panel/`
  is a catalogued component here and `ext/Panel` belongs to another session — do
  not edit `ext/Panel/**`.**

## The two jobs

**1. Band and order the nineteen, most useful first.** Mike's framing is *"starting
with the most useful versions"* — so the ordering is a real editorial judgement,
not alphabetical. A reader landing here should meet `card`, `toolbar`, `table`,
`dialog` before `kbd`. Group them into a handful of bands that read as sets. Say
what your bands are and why in one line each.

**2. Variants one click inside — this is the ask.** *"If I click a basic card, I
could see variants of that card."* For each component page: the **most useful
version first, at the top, big**, then its variants below as a browsable set.

⚠ **Consolidate, don't multiply.** The layouts wall's lesson applies directly —
Mike said of it, *"we don't really need a separate card for gap vs no gap. and
maybe don't need one for 2 columsn vs 3 columns."* A variant earns its place by
being a *different thing*, not a different value. **Report the variant count per
component, before and after.**

You do not need to perfect all nineteen. **Do the wall properly, then do the
variants properly for the components that carry the most weight** (`card`,
`toolbar`, `table`, `dialog`, `menu` are the obvious candidates) and log honestly
which ones you left with their existing bodies. A wall that works plus five deep
components beats nineteen shallow ones.

## Previews: pictures, not instances

- A preview **must not scroll**. Fixed site-wide today via `scrollbar-width: none`
  on `.page-preview-thumb` and descendants — the scroller is the `.page` *inside*
  the thumb, and a scrollbar paints at full size whatever `zoom` sits above it.
  Don't undo it; if a card still shows a bar, that's a finding.
- ⚠ **No mobile+3440 dual previews on the wall.** Mike: *"they're too hard to
  see."* `demo.layout`'s `preview()` now ignores `twin:` and draws one `zoom-25`
  frame; `twin:` still steers the stage, so the dual slider survives where it
  belongs.
- **A component whose body is documentation prose will always preview as grey
  mush** — that was the real cause of the two weak layout cards today. If a
  component page's demo body is a readme, give it a body that looks like the thing.

## Verify — and the tool is trustworthy again as of today

`ext/DesignTool`'s measurement tier was repaired an hour ago: `width-used` now
reads a real union-of-intervals (full-corpus median **0.92 at 1280, 0.58 at 3440**
— it distinguishes widths for the first time), `repetition` no longer counts bare
tags as components, the rules tier's bogus aggregate score is gone, and the
`gutter` finding the devbar itself used to manufacture is fixed. **Baselines
regenerated: 338 rows, `generated_at 2026-08-17T17:14Z`.** Read
`ai/2026-08-17/tier-calibration/task.jsonl` for what is and isn't fixed.

So: **measure your wall, and screenshot it.**

- Screenshots at **390, 1280 and 3440**, before and after, paths logged in your
  `task.jsonl`.
- **Look at your own screenshots and write an honest verdict**, including whatever
  is still weak. A change that improves a number while looking worse is a
  regression — keep the better-looking version and say so.
- 3440 must be **used**, not gutter-padded. That's the prime objective and
  `width-used` can finally see it.
- ⚠ Two bands are known still-broken and you must not trust them: **`measure`**
  (188px card captions outvote the prose) and **`contrast`** (a 125.7px demo clock
  over a 15px median). Ignore what they say about your pages.

## Files you own

- `public/framework/ui/**` — all of it.
- `public/framework/ai/2026-08-17/ui-wall/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

You may **read** `styles/layouts/**` freely and, if you genuinely factor a shared
mechanism out of its wall, you may edit `styles/layouts/page.js` — but say so
loudly and re-verify that page at all three widths, because it was rebuilt today
and is Mike's headline result.

**Fenced off:** `ext/Panel/**` (another session), `ext/DesignTool/**` (another agent
is in its UI right now — read it, run it, don't edit it), `core/**` without saying
why.

⚠ **Urls must not change.** Inbound links exist. Consolidating a variant means
moving it *inside* a page, not deleting its url without checking who links to it.

## RULE#13 — link it or it doesn't exist

Nothing crawls the filesystem. Every page you add must be declared in a parent's
`children:`, and `/framework/ui/` must be reachable from where a reader already is.
Log the clickable urls.

## Deliverables, in this order

1. **The banded, ordered wall at `/framework/ui/`**, working at 390/1280/3440,
   with screenshots and your verdict.
2. **Variants one click inside** for the highest-weight components, with the
   per-component variant count before → after.
3. A **Decisions** entry in `ui/readme.md`: the bands, the ordering rationale, and
   what you consolidated.
4. An honest list of components left shallow.

Running short? Cut 3, then narrow 2 to fewer components. **Never cut 1**, and never
silently truncate — say which components you didn't reach.

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- **Capturing is synchronous — never build DOM after an `await`.** A factory call
  textually after an `await` is wrong; fill containers inside a callback.
- Climb the CSS ladder, stop at the first rung that works, **never escalate
  downstream**. Restate `@layer base, theme, site, util;` in full in any stylesheet
  you touch — and ⚠ **re-grep that line before you finish**: a `rank.css` shipped
  today with the full restatement was later found carrying a bare `@layer theme {`,
  and nothing warned.
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; do not restart it. Assert
  `document.visibilityState === "visible"` before any screenshot or measurement.
  Never wait for `networkidle`.
- Load `code-architecture`, `layout-design`, `css-strategy` and `documentation`.
