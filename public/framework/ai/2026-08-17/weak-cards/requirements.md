# The cards that still look unfinished

Mike, 2026-08-17, about the layout previews: *"those designs actually suck. they
don't look cool, inspiring, useful. they look unfinished, broken, etc."*

`/framework/styles/layouts/` was rebuilt today and now reads well as a wall — but
its own author left a list of cards that are still weak, and named the causes.
**Fix those.** Read `ai/2026-08-17/layouts-redesign/task.jsonl` and
`styles/layouts/readme.md`'s `Open` section first; the diagnosis is already done.

## The four items

**1. `stack` and `sidebar` are the two weakest cards — and it's the layout, not
the preview.**

- `stack`: `.measure` carries `margin-inline: auto`, so the card renders as a
  narrow strip with roughly **35% empty on the left**.
- `sidebar`: its body is a **readme**, so the card shows ~4px prose with `md` code
  fences rendering as **black bars**.

The redesign's verdict was *"fix is content, not CSS"* — a demo layout whose body
is documentation will always preview as grey mush. **Give each a body that looks
like the thing it demonstrates**, at the size the card actually renders. Keep it
short: a layout demo needs enough content to show the shape and not one word more.

⚠ Don't reach for CSS first. If `stack`'s emptiness is genuinely
`margin-inline: auto` doing its job on a `.measure` block, the honest fix may be
that the demo shouldn't use `.measure` — not that `.measure` should change.
`.measure` is a site-wide token behaviour and **changing it to fix one card is the
bandaid RULE#18 forbids.**

**2. `space/`'s card is out of family.** It overrides `preview()` with its own
`42em`, so it sizes differently from every sibling. It was moved last in its band
as a stopgap so it no longer sets row height from the middle. Now that `space/` is
unfenced: **make it conform, or state why it genuinely can't.** If it can conform,
remove the stopgap ordering too.

**3. `page.js` is 147 lines against RULE#11's 100.** Its author judged there was no
second responsibility worth splitting out — five short methods plus trap comments.
**Look with fresh eyes.** If you agree, say so in one sentence and leave it; a
deliberate, argued exception is fine. If a band definition, the filter rail or the
tagging helper wants its own file, move it.

**4. `doc/file/` is stale and unread — decide it.** `page.js.md` and
`preview.js.md` describe files that were rewritten today, and the redesign found
the whole tree is referenced by nothing.

**Deleting beats adding** (RULE#18). ⚠ But verify before you delete: grep for
anything that reads that directory, and check whether `ext/Doc` enumerates it by
convention rather than by an explicit link — *"files: declared not crawled"* is the
rule there, so an unreferenced file really may be dead. If it is, delete it and say
what you removed. If something does read it, update the two stale files instead.

## How to verify — with your eyes, not the tool

⚠ **Do not run `ext/DesignTool` to check your work.** Another agent is inside that
module right now fixing four calibration bugs, so its numbers are unstable and its
`width-used` band is known to read a hard zero on almost every page. Measuring
with an instrument mid-surgery is worse than not measuring.

Instead:

- **Screenshot each card you change at 1280 and 3440**, plus the whole wall.
- **Look at the screenshots and judge them.** Does the card now read as an
  inspiring example of the layout it names? Would you click it?
- Log every screenshot's absolute path in your `task.jsonl` — the dashboard
  surfaces those lines.
- Confirm the wall still has no ragged-row problem, the filter rail and search
  still work, and nothing overflows horizontally at 390.

**A change that makes a card score better but look worse is a regression.** Your
own honest verdict on each card, including anything still weak, is a required part
of the deliverable.

## Files you own

- `public/framework/styles/layouts/**` — all of it, including `space/`.
- `public/framework/ai/2026-08-17/weak-cards/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `ext/DesignTool/**` (another agent owns it — read-only, and don't
run it), `ext/Panel/**` (another session), `core/**` (the redesign already made the
one core change it needed; don't make another without proposing it),
`ai/2026-08-17/rubric-v2/**` and `vision-baseline/**`.

⚠ **Urls must not change.** The word cards are *borrowed* from `flex/` and `grid/`
rather than moved, precisely so the seven inbound links from `styles/sections/`
keep working. Don't move a page to tidy the wall.

## Deliverables, in this order

1. **`stack` and `sidebar` fixed**, with before/after screenshots and your verdict.
2. **`space/`'s card conforming**, or the argued reason it can't.
3. **The `doc/file/` decision**, executed, with the verification that justified it.
4. The `page.js` line-count call, one sentence either way.

Running short? Cut 4, then 3. **Never cut 1** — those two cards are the specific
thing Mike called out.

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; **do not restart it**.
- Assert `document.visibilityState === "visible"` before any screenshot — a hidden
  tab runs no rAF and no ResizeObserver, so you would shoot a page that never laid
  out. Never wait for `networkidle`; the live-reload socket never idles.
- Climb the CSS ladder and stop at the first rung that works: nothing → utility
  class → existing component class → module `.css` (layout only) → `/styles.css`.
  **Never escalate downstream.** Restate `@layer base, theme, site, util;` in full
  in any stylesheet you touch, and keep every rule inside a layer.
- **Capturing is synchronous** — a factory call textually after an `await` is
  wrong; fill containers inside a callback.
- Load the `layout-design` and `css-strategy` skills; this is their subject matter.
