# Let the report page take the screen

**Laws: less is more (ASAP), clarity is the exception, prioritize.**
**Budget: this should be a handful of lines. If it grows past ~20, you have found a
different bug — say so instead of writing more code.**

## What Mike sees

> the report page is split 50/50 with the rail (the rail is full width, on top,
> rather than a vertical rail...) can the report page "takeover" and go "full"?

On `/framework/ai/2026-08-17/report/` at his width, the rail is eating half the
screen and stacking above the content instead of standing beside it.

## The answer is yes, and the pattern exists

`styles/layouts/page.js:32` does exactly this:

```js
render(){ return this.view ??= div.c("page full", () => this.content()) }
```

It replaces the view rather than patching it — because `Page.render()` emits the
`h1` **outside** `content()`, and `full` zeroes the gutter that would otherwise
sit it somewhere sane, so the page draws its own title. Read that file and its
trap comment before copying it; copy the reasoning, not just the line.

The report page currently has **no `render()` override**, so it renders as an
ordinary page inside the catalog region beside the rail.

## Two things to establish, in order

**1. Measure before you change anything.** At **1280 and 3440**: what width does
the rail take, what width does the content take, and is the rail beside or above?
⚠ `ext/AITask/ai.css` widens the catalog rail for everything under
`/framework/ai/`, and `.ai-columns` collapses to one column under `60em` — work
out which of those is producing what Mike sees. **A number, not a guess.**

**2. Then make the report take over**, and measure again. Success is the report
using the screen at 3440 and still readable at 390 and 1280.

⚠ If taking over means the reader loses the way back to the day dashboard, that is
a regression — the page already links it in its opening line, so confirm that
still reads well as the only route back.

## The fence, and it matters

- **You own `public/framework/ai/2026-08-17/report/**` only.**
- ⚠ **`ext/AITask/**` is being edited by another agent right now — do not touch it,
  including `ai.css`.** ⚠ `ext/catalog/**` is shared by every catalog page on the
  site.

**If the root cause turns out to be in the rail rather than the page, do not fix
it there.** Report it precisely — file, line, the measured numbers — and still
deliver the takeover from the page's own files. A rail bug affects every task page
and is a separate, coordinated change.

## Say whether this generalises

One line in your log: **should other content-heavy pages under `/framework/ai/`
take over the same way, or is the report a special case?** Mike will ask. Don't
build it for them — just answer.

## Verify

- Screenshots at **390, 1280, 3440**, before and after, paths logged.
- **Look at them.** Does it use the screen, or just fill it?
- `rate()` and the high count at all three widths — it read 0 highs and 73/C ·
  85/B · 88/B before you started, so nothing should get worse.
- Zero console errors. `node --check` what you edit.

## Deliverables

1. The takeover, measured before and after.
2. The root-cause line if the rail is at fault.
3. The generalises-or-not answer.

Findings go in your own `task.jsonl` as `log` lines, never a `findings.md`. Run
`finish-task` when it lands.

## Notes

- Foreground is the default. Capturing is synchronous — no DOM after an `await`.
- ⚠ Every CSS rule inside a layer; per current CLAUDE.md the layer order lives
  **once, in `framework.css`** — don't restate it.
- Reuse the dev server on port 80; don't restart it. Assert
  `document.visibilityState === "visible"` before a screenshot.
- Load `layout` and `css` before touching sizing.
