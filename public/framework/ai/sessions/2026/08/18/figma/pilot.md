# Pilot — price the Figma→framework workflow on ONE design

**The three laws govern** (CLAUDE.md, read it). Less is more. Clarity is the exception. Prioritize.

You are the **pilot**. 18 more designs wait behind you, so what you learn is worth more than what
you build. Two deliverables, in this order of importance:

1. **A cost + method report** the mastermind uses to size 18 more minions.
2. **The design itself, built and working.**

## Your design

`https://www.figma.com/design/0rZv3Z6Hnqkxa2UQJ5xOOG/July-2026?node-id=51-1477`

The owner: *"here are some good layouts to demonstrate (with their (super simple) code examples)…
That should be a good one for testing purposes... **Can we get these outcomes?** These super
generic filler layouts should work as expected on Mega and Mobile? With some wrapping of course…"*

So this design is a **test of the framework's vocabulary**, not a pixel port. The question it asks
is literally "can our class strings produce these?" Answer it honestly — a layout our words cannot
express is a **finding**, not a failure, and the most valuable thing you could bring back.

## Read first — this workflow has been run before

`public/framework/ai/2026-08-18/figma/requirements.md` — the full list and the standing rules. **All
eight apply to you.**

`public/framework/styles/layouts/` already has 28 layouts and was built partly from this same Figma
file. `layouts/hero/page.js` opens: *"The Figma names the same band three times — 'Hero — Full
Bleed' at 1920, 'Stacked Hero' at 800, 'Mobile Hero Sizing' at 400. Here it is one row."* Read
`layouts/readme.md`, `layouts/web.js`, `layouts/hero/page.js` and `layouts/doc/decisions.md` before
you write anything. **Follow `demo.layout()`; do not invent a parallel system.**

## The cost report — measure, do not estimate

This is the part the mastermind needs. In your final message, give:

- **Tokens to pull one node**, per tool: `get_metadata`, `get_design_context`, `get_screenshot`,
  `get_variable_defs`. Which is cheapest for which purpose, and **what you would skip next time**.
- The cheapest *sufficient* sequence for a design of this kind, as an ordered list.
- Whether a **Sonnet** minion could do this job on a later design, and what it would need in its
  brief to succeed — be blunt if the answer is no.
- Your total token spend, and roughly how it split between reading Figma and writing code.

## The questions you must answer for everyone behind you

- **What page layout?** The owner: *"One of the biggest questions for these is, what page layout?
  That drives the entire thing."* Run the `layout` skill; answer its five questions in one line each.
- **Padding and spacing** — the owner wants convergence on one to three values. The framework
  already has `--pad`, `--gap`, `--column`, `--measure`. State the set you used and whether
  *"a `div.card.pad` with an `h2` looks the same in any of these."* If it does not, say why.
- **Mega and Mobile.** Verify at **400 / 1280 / 1920 / 3440**, headless. Screenshots in your task
  dir. "Works with some wrapping" must be a measurement, not a hope.
- **Do these belong in `styles/layouts/`?** You are the first to see the real content. If they are
  whole-page layouts, they are layouts. If they are component sets, say where they should go and
  why. A verdict with a reason, not a preference.

## Fences — the repo has other agents in it right now

- YOU OWN: `public/framework/styles/layouts/<your-new-layout-dirs>/`, and the ONE `BANDS` line in
  `styles/layouts/page.js` that makes each new layout exist.
- YOU OWN: `public/framework/ai/2026-08-18/figma/` — your `task.jsonl`, `questions.md`, `pilot-report.md`, screenshots.
- ⚠ **DO NOT TOUCH**: `public/framework/styles/css-scopes.txt`, `public/framework/framework.css`,
  `public/framework/ext/CSSDoc/`, `public/framework/styles/elements/code/`. Another agent holds
  those right now and a collision costs us both.
- No new stylesheet in a layout dir — that is the standing rule of this module.
- Scratch scripts in the session scratchpad, never the repo.

## Skills — mandatory, and they write files, which is expected

`new-task` is already done (this dir). Then `layout` **before the first factory call**, `css` if you
write any CSS at all, `new-page` for each `page.js`, `documentation` at the end, and
`skill-improvement` the moment a skill misleads you — one line to its `improvements.md`.

## Ask, do not guess

Anything unclear — which existing text style, which colour, whether a card maps to a component we
already have — goes in `public/framework/ai/2026-08-18/figma/questions.md` **and** your final
report. The owner is asleep; questions are collected, not blocking. Where you must proceed, state
the assumption in the file and keep going. A card you cannot mock up gets a visible placeholder.

## Log

`log` lines in your `task.jsonl`, append-only, `printf`/`Add-Content` — never `Out-File` (BOM breaks
the viewer). **Timestamps from `date -Iseconds`, never typed.** Absolute paths only; the Bash cwd
persists between calls and a stray `cd` has already misplaced a task dir tonight.

Headless: `const require = createRequire(import.meta.url); const { chromium } = require("C:/Users/mike/AppData/Roaming/npm/node_modules/playwright");`. Dev server live on `http://localhost`.
