# The two things still making the walls look unfinished

Mike, 2026-08-17: *"those designs actually suck. they don't look cool, inspiring,
useful. they look unfinished, broken, etc."*

`/framework/ui/` and `/framework/styles/layouts/` were both rebuilt today and both
read well as walls. Their own authors left exactly two visual weaknesses, each
diagnosed. **Fix those two, and nothing else.**

## 1. Ragged rows — short cards leave 100–200px of white beside tall ones

The `ui-wall` agent's verdict: *"dropping `packed`/`pack()` bought even bands and
cost the tight vertical pack; the fix is a uniform thumb height, not masonry."*

⚠ **Masonry has already been considered and rejected twice today, with reasons** —
read `styles/layouts/readme.md` before reaching for it. Post-consolidation the
cards are uniform in kind, so masonry of uniform children is a grid with extra
steps, and a CSS-columns masonry puts band headings *inside* a column and breaks
reading order. **A uniform thumb height is the stated fix.** If you conclude
otherwise, you must say why in a way that answers both of those points.

The thumb is a **picture, not an instance** — it already carries
`overflow: hidden` and `scrollbar-width: none`. A fixed aspect or fixed height is
consistent with that; a card that grows to fit its content is not.

⚠ If the rule belongs in core `Page.css` (`.page-preview-thumb`) it lands
site-wide, exactly like today's scrollbar fix. **Check the other preview walls
before and after** — `/framework/`, `/framework/core/`, `/framework/ext/` — and
report what else moved. Site-wide is probably correct here; verify rather than
assume.

## 2. Four components preview as near-empty cards

`tooltip`, `menu`, `crumbs`, `pagination` — the `ui-wall` agent's read: *"the
component **is** small — a demo-body problem."*

A 60px control alone in a quarter-scale desktop frame reads as a broken page. The
already-proven fix from today's `weak-cards` task: **a demo body that looks like
the thing it demonstrates**, at the size the card actually renders. There, two
cards that rendered as grey mush turned out to have *documentation prose* as their
body; the fix was content, never CSS.

**Give each of the four a small realistic context** — a tooltip on a real control,
a menu open beside the thing it belongs to, crumbs above a page heading,
pagination under a short list. Keep it minimal: enough to show the shape and not
one word more (RULE#6).

⚠ **Don't scale the component up to fill the card.** That would misrepresent it —
these components genuinely are small, and the card should show that truthfully at
a believable size.

## Measure — and note what changed under you today

`ext/DesignTool` was repaired twice today, so re-measure rather than trusting any
earlier number:

- **`scale` was rewritten hours ago.** It used to count distinct type sizes, which
  grew with page size — `/framework/ui/` was scoring **zero for being large**. It
  is now the share drawn from the four commonest sizes. Any earlier `scale`
  reading on these walls is void.
- **`measure` and `contrast` were re-derived** — `measure` now samples prose only
  (>80 chars, not code, not a cell, not inside a frame), `contrast` uses the
  largest heading. Both are trustworthy for the first time today.
- ⚠ **`audit/taste.json` is stale in a new way**: its `scale` column stores counts
  against a share band. Nothing throws and the tables render — **distrust that
  column** and measure live instead.
- ⚠ **`frame-gap` is known suspect**: on 94 of 141 pages its 10th percentile comes
  from outside the content region, 87 of them from `div.sidebar` at exactly 1.400.
  Ignore what it says about your pages; the repair is a pending Mike call.

**Do not regenerate `audit/taste.json` or `audit/findings.json`.** One sweep runs
after this task lands, covering everything at once.

## Verify with your eyes as well as the numbers

- Screenshot both walls at **390, 1280 and 3440**, before and after, paths logged
  in your `task.jsonl`.
- **Look at the screenshots.** Do the rows read as even sets? Does each of the four
  small components now read as a real, usable thing? Write an honest verdict
  including whatever is still weak.
- **A change that improves a number while looking worse is a regression** — keep
  the better-looking version and say so.
- Confirm both walls still work: filter rail, search, the empty-wall message, no
  horizontal overflow at 390, zero console errors.

## Files you own

- `public/framework/ui/**`
- `public/framework/styles/layouts/**`
- `public/framework/ext/catalog/browse.*` — the shared wall mechanism both use.
- `public/framework/core/Page/Page.css` — **only** for the thumb-height rule, and
  only if that is genuinely where it belongs.
- `public/framework/ai/2026-08-17/wall-polish/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `ext/DesignTool/**` (read it, run it, don't edit it),
`ext/Panel/**` (another session), `.claude/**` (another agent is in the hooks).

⚠ **Urls must not change.** Inbound links exist, and the word cards on the layouts
wall are deliberately *borrowed* from `flex/` and `grid/` rather than moved.

## Deliverables, in this order

1. **Uniform thumb height**, with the site-wide check on other preview walls.
2. **The four demo bodies**, with before/after crops.
3. Your honest verdict on both walls, including what's still weak.

Running short? Narrow 2 to fewer components and say which. **Never cut 1** — it
affects every card on both walls.

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- **Capturing is synchronous — never build DOM after an `await`.**
- Climb the CSS ladder, stop at the first rung that works, never escalate
  downstream. ⚠ Restate `@layer base, theme, site, util;` **in full** in any
  stylesheet you touch, and **re-grep it before you finish** — a file shipped today
  with the full restatement was later found carrying a bare `@layer theme {`, and
  nothing warned.
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; do not restart it. Assert
  `document.visibilityState === "visible"` before any screenshot; never wait for
  `networkidle`.
- Load `code-architecture`, `layout-design`, `css` and `new-css-class`.
