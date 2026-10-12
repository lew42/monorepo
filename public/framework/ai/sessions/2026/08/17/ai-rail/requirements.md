# The `/framework/ai/` rail takes too much, and stacks wrong

**Laws: less is more (ASAP), clarity is the exception, prioritize.**
**Budget: this is a CSS sizing fix. A handful of declarations. If it grows past
that, you have found a different bug — say so instead of writing more.**

Mike, looking at `/framework/ai/2026-08-17/report/`:

> the report page is split 50/50 with the rail (the rail is full width, on top,
> rather than a vertical rail...)

## The cause is measured — don't re-derive it

`ai/2026-08-17/report-full/task.jsonl` has the numbers. In short:

- **`ext/AITask/ai.css:181`** — `.page-catalog > .ai-index-rail { flex: 0 0 min(34em, 45%) }`.
  That is the sitewide catalog rail (`--rail: 19em`, `catalog.css`) deliberately
  widened for everything under `/framework/ai/`.
- **Measured widths:** rail **474px of 1280**, **613px of 3440**.
- **Below `64em`** `catalog.css` turns `.page-catalog` into a **column**. Mike's tab
  was at **999px**, where `min(34em, 45%)` resolves against the *flipped axis*: the
  rail became **731px wide and 45% of the stack height**, sitting above the
  content. That is exactly what he described, and `ai.css`'s own comment predicts it.

A page cannot fix this from its own file — a takeover with `full` was measured at
**0px change** to the rail at both widths. It belongs here.

## The two fixes

**1. The column case is the bug.** When `.page-catalog` is a column, a percentage
basis resolves against height, which is meaningless for a rail — a **45% tall,
full-width block above the content**. Decide what a stacked rail should be and make
it that. ⚠ Read `ai.css`'s existing `@media` comment first: a previous unconditional
`max-height: none` here let the rail claim tens of thousands of px and squeezed the
content to `clientHeight: 0` with no scrollbar. **Whatever you do must be checked
for that.**

**2. `min(34em, 45%)` is too generous at 1280.** 474 of 1280 is 37% of the screen
for navigation. At 3440, 613px is cheap and fine. **A percentage that is right at
3440 is wrong at 1280** — bound it so the content keeps a usable measure at the
middle widths. Say what you chose and why in one line.

⚠ **This rail is the day board's cross-task navigation** — it earns real width, and
`ai.css`'s comment says so. **Do not delete it or collapse it to an icon strip.**
The goal is proportion, not removal.

## Verify — every page under `/framework/ai/`, not just the report

This rule fires on the day boards, every generated task page, and the hand-written
pages. Check at least: a **day board** (`/framework/ai/2026-08-17/`), a **generated
task page** (any task dir), and the **report** (`/framework/ai/2026-08-17/report/`,
which now takes over with `full` — confirm you didn't break it).

- Widths **390, 999, 1280, 1920, 3440**. ⚠ **999 is not optional** — it is where Mike
  was and where the column case lives.
- Rail width **and** content width, before and after, as numbers.
- `rate()` and the high count per page. The report read **73/C · 81/B · 92/A · 81/B**
  at 390/1280/1920/3440; nothing should drop a letter grade.
- Screenshots at 999 and 1280, before and after — **look at them.**

## Files you own

- `public/framework/ext/AITask/**` — `ai.css` above all. (`ext/AITask` is now
  unfenced; the agent that held it has landed.)
- `public/framework/ai/2026-08-17/ai-rail/**` — your task dir.

**Fenced:** `ext/catalog/**` — it is shared by every catalog page on the site.
⚠ If the real fix belongs in `catalog.css`'s column collapse rather than `ai.css`,
**say so with the numbers and fix what you can from `ai.css`** — a sitewide catalog
change needs its own coordinated task.
Also fenced: `ai/2026-08-17/report/**` and `ai/2026-08-17/vision-browse/**` (another
agent is in the latter right now).

## Deliverables

1. The column case fixed, verified at 999.
2. The width bounded, with before/after numbers at all five widths.
3. One line: what you chose, and why.

Short on room? Do 1 before 2 — the column case is what Mike actually saw.

Findings go in your own `task.jsonl` as `log` lines. Run `finish-task` when it lands.

## Notes

- Foreground is the default. Reuse the dev server on port 80; don't restart it.
- ⚠ Every rule inside a layer; the order is declared **once**, in `framework.css` —
  never restate it.
- ⚠ Prefer a token (`--rail`) to a new rule; constrain the container, not the items.
  **No inline styles** — static styling belongs in a stylesheet.
- Assert `document.visibilityState === "visible"` before any measurement; a hidden
  tab returns frozen geometry. Never wait for `networkidle`.
- Load `css` and `layout` before touching sizing.
