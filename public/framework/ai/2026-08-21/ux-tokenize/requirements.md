# ux-tokenize — brief (Opus)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** final report = one screen; numbers and shots are the deliverable.

## The grant — and its exact edges

The owner approved the framework.css tokenization proposal from `public/framework/ai/2026-08-21/ux-system-plan/` (the four values no config word could reach). You are Opus because framework.css is the one file every page wears. The sanction is for **exactly four one-line changes, with fallbacks, and NOTHING else in that file**:

1. `th, td` padding → `var(--pad-cell, <current literal>)`
2. `button` / `.btn` padding → `var(--pad-control, <current literal>)`
3. `input, select, textarea` padding → `var(--pad-control, <current literal>)` (same token)
4. `.muted` → `color-mix(in srgb, currentColor var(--muted, 75%), transparent)` — only if you PROVE it computes identical to the current rule; if it does not, log the measured delta and SKIP this line (a refused line with evidence is a first-class result — the sanction is for equality, not for a visible change)

`<current literal>` means: read the current value in framework.css first and use IT as the fallback, so the edit is a no-op until a word sets the token. No reordering, no reformatting, no touching any other line. The diff of `styles/framework.css` must show exactly the changed lines and nothing else — include the diff in your task log.

## Prove it in this order

1. **Before**: on http://localhost:8918 shoot + probe `getComputedStyle` for: a `td` (ui/table page), a `button` and an `input` (ui/field page or the words demo), a `.muted` element — record padding/color values. A small Playwright probe script in the scratchpad (`ux-tok-*` names) is the way; the proven shot recipe is `node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs <url> <out.png> <width>`.
2. **Edit** the four lines.
3. **After, fallbacks only**: same probes — every number byte-identical. If ANY moved, fix or revert that line before proceeding.
4. **Remap**: extend `public/framework/ui/words/words.js` so `.ui-compact` now also sets `--pad-cell` and `--pad-control` (scaled by `--density` via calc is fine — the never-scale rule bans only SELF-reference like `--radius: calc(var(--radius) * x)`; a new token computed off `--density` is legal; confirm against the contract in `ux/doc/system.md`). `.ui-contrast` + `--muted`: a contrast section may bump `--muted` (e.g. 85-90%) if it visibly improves the demo — your call, measured, logged.
5. **Re-measure the words demo**: the documented loose spots inside `.ui-compact` (table cell padding, button padding, the search field) must now tighten. Record before/after numbers in your task log and update the demo page prose where it states the old numbers.
6. **Refresh the artifacts**: re-shoot `words.png` on `public/framework/ai/2026-08-21/ux-system-plan/` (same filename, the board links it) and update that task's `page.js` where it documents the four unreachable values — they are now reachable; say so with the new numbers. Update `ui/words/` doc/readme lines that named the limitation.

## Also yours: the --density verdict (the mastermind's call, you document it)

Verdict, decided: **the shipped default stays `--density: 0.5`, and 0.7 stays the documented half-step** (`.style("--density", "0.7")`). One-line why: a config word must be visibly different or it is not a word — 0.5 is the measured, demonstrated value (7.52 vs 15.04px); the knob exists for everything in between. Revisable, per the verdict-firmness rule — write it exactly that firm, no never/always. Put it in `ui/words/` doc (where the density prose lives) and leave `ux/doc/decisions.md` alone (the mastermind appends there at harvest).

## Fence

Yours alone: the named framework.css lines · `ui/words/**` · `public/framework/ai/2026-08-21/ux-system-plan/` (page.js + words.png refresh only) · your task dir `ai/2026-08-21/ux-tokenize/**`. READ-ONLY: everything else. ⚠ A sibling agent is editing the eight `ux/*/page.js` files RIGHT NOW — do not touch any ux module dir; the words demo page you own is `ui/words/page.js`.

## Process

- Load skills: `code`, `css` (it makes you read framework.css — good, do it first) before writing; `documentation` for the doc touches; `finish-task` to land; `skill-improvement` if a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-tokenize/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends via Add-Content, **pure ASCII** (an em dash under default Add-Content encoding becomes an invalid byte and the board drops the line).
- **Timestamps are READ FROM THE CLOCK in the same command that writes the line, never typed** — `Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"` (or `date +%Y-%m-%dT%H:%M:%S%z`) inline in the SAME append command. An agent hand-typed stamps 90 minutes into the future today.

## Safety (non-negotiable)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server (8918 is the mastermind's, pid noted in its log); never drive the owner's browser tabs; never `git stash` (shared tree — diff, don't stash); never commit or push; scratch stays in the scratchpad.

## Traps

Every CSS rule inside a layer (your four lines are edits-in-place — do not move them across layers); one backtick inside `` css(`…`) `` kills every page; `**/` inside a css() comment closed a rule silently today; a custom property inherits — probe computed styles, never eyeball; `color-mix` percentages: `currentColor 75%` vs opacity are NOT automatically equal — measure; hidden tabs do not lay out — screenshot through 8918, never a hidden eval.

## Cut first if squeezed

The `.muted` line (skip with evidence) → the `--muted` contrast bump → the system-plan page prose polish. Never cut: the 4-line-diff proof, the fallbacks-only equality proof, the words remap with re-measured numbers.
