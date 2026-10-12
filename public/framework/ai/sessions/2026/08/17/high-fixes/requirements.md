# The remaining `high` findings on real pages

`ext/LayoutTool/audit/findings.json` (generated 2026-08-17T05:52Z) has **17 rows
carrying a `high` severity finding, across 11 urls**. Six of those urls are yours
to fix. The rest are fenced off for reasons given below.

## Your six

| url | width(s) | high rule(s) |
|---|---|---|
| `/framework/styles/` | 1280 **and** 3440 | `cramped` |
| `/framework/styles/layers/theme/guide/` | 1280 **and** 3440 | `cramped` |
| `/notes/auth/` | 1280 **and** 3440 | `cramped` |
| `/framework/styles/layouts/` | 1280 **and** 3440 | `gutter` |
| `/framework/ai/` | 3440 | `measure` ×2 |
| `/framework/styles/layouts/fit/` | 3440 | `measure` |

## Read this before you fix anything — it may be the rule, not the pages

**`cramped` fires on three unrelated modules at both widths. That pattern is
suspicious.** A finding that appears across many independent pages usually means
the *rule* is miscalibrated, not that every author independently made the same
mistake. The same goes for `gutter` at both widths on one page and `measure`
appearing on several.

So for each rule family, **before** editing any page:

1. Read the rule's implementation and its threshold's provenance
   (`ext/LayoutTool/` — read-only for you, plus
   `ext/LayoutTool/knowledge/thresholds.md` and `false-positives.md`, which
   record what each number was calibrated against).
2. **Look at the actual rendered page at the actual width** and decide, as a
   designer: is this page genuinely cramped / genuinely mis-guttered / genuinely
   too wide to read? Screenshot it.
3. Only then fix.

**If you conclude the rule is wrong, that is a first-class result — log it with
evidence and fix nothing.** Do not contort three good pages to satisfy a bad
threshold. Say which threshold, what it currently is, what the measured reality
is, and what it should be. Changing the rule itself is not yours (the tool is
frozen this run) — it becomes a written recommendation.

Expect a mix: some real, some not. Report per-url, not per-rule-family.

## What a real fix looks like

- **Climb the CSS ladder and stop at the first rung that works** (RULE#6, and the
  `code-architecture` skill has the ladder): nothing → a utility class → an
  existing component class → the module's own `.css`, layout only → `/styles.css`
  skin. A new stylesheet is a last resort.
- **Never escalate downstream.** If you're overriding a `framework.css` rule,
  that's a bug report about `framework.css` — de-escalate upstream (a flatter
  selector, a token, `:where()`) rather than adding specificity or `!important`.
- Restate the full layer order in any stylesheet you touch:
  `@layer base, theme, site, util;` — a short list silently drops `site` past
  `util`. And every rule must be **inside** a layer.
- **Fix the cause once, not the symptom three times.** If all three `cramped`
  pages share an ancestor rule, fix the ancestor.

## Verify, at both widths

For every url you change: measure it again at **1280 and 3440** with
`ext/LayoutTool` (read-only use — run it, don't edit it), and **screenshot before
and after**. Report the score and the `high` count for each, before → after.

**A fix that raises the score but makes the page look worse is a regression.**
Say so if you see it, and keep the better-looking version.

Also confirm you didn't break the *other* width: several of these fire at both,
and a fix aimed at 3440 that cramps 1280 is not a fix.

## Fenced off — do not touch

- **`public/framework/ext/LayoutTool/**` — read-only.** Frozen so another agent's
  numbers stay comparable. This includes its own bad rows
  (`audit/` reads 59/F with five `measure` highs, `audit/taste/` 73/C) — leave
  them; they'll be fixed once the freeze lifts.
- **`public/framework/styles/layouts/space/**` — another agent owns it right
  now.** That's why `/framework/styles/layouts/space/compose/`'s `gutter` high
  isn't on your list. `/framework/styles/layouts/` **is** yours — be careful, they
  are different directories, and do not edit anything under `space/`.
- **`public/framework/ext/Panel/**` — another session owns it.**
- **`/framework/start/example/` and `/framework/start/example/about/`** (`empty`
  at both widths) — this subtree is deliberately unrouted static demo text
  (`start/page.js:16`). Don't fix, don't reclassify.

## Files you own

- The `page.js` / `.css` of the six urls above and the modules they belong to.
- `public/framework/ai/2026-08-17/high-fixes/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

## Deliverables, in this order

1. **Per-url verdict as `log` lines in your own `task.jsonl`** — real defect or
   miscalibrated rule, with the before → after score and `high` count, or the
   threshold recommendation. Not a `findings.md`: the harness blocks subagents
   writing report files, and RULE#15 wants this in the log.
2. The fixes themselves.
3. Any threshold recommendations, stated as: rule, current number, measured
   reality, proposed number, and the pages that prove it.

Running short? **Do the four `cramped`/`gutter` rows before the two `measure`
rows** — `cramped` and `gutter` are structural, `measure` is a token argument
that's already an open question for Mike. Say plainly what you didn't get to; a
silent truncation reads as "covered everything".

## Working notes

- **Foreground is the default.** A two-minute blocking command is normal. If you
  background one, poll it: `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Headless Playwright is installed **globally** (LAW#4 — do not add any npm
  dependency, devDependencies included). Assert
  `document.visibilityState === "visible"` before trusting any measurement: a
  hidden tab runs no rAF and no ResizeObserver and returns frozen geometry.
- Never wait for `networkidle` — the live-reload socket never idles. Scope
  selectors to `.active-page`; the Router keeps parents as hidden
  `.active-ancestor`.
- Recycle the browser context every ~40 navigations; the renderer wedges after
  ~85–110 in one.
- The dev server is already running on port 80 — reuse it, don't start another.
- Check usage before wide work.
