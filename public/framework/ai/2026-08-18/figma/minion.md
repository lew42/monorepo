# Every Figma minion reads this

**The three laws govern** (CLAUDE.md — read it; it outranks this and your tier brief).
Less is more (ASAP). Clarity is the exception. Prioritize.

Also read `public/framework/ai/2026-08-18/figma/requirements.md` — the owner's list and the **eight
standing rules**, all of which apply to you.

## Pulling the Figma — the cheapest sufficient sequence, MEASURED

The pilot priced every tool. **Reading Figma is the cheapest part of this job (11% of spend);
priming yourself on the repo is 45%.** So do not over-read Figma, and do not over-explore the repo.

1. **`get_metadata`** on your node — ~4k tokens, returns the whole tree. Usually all you need.
2. **`get_screenshot`** at 1400px — ~130 tokens for the URL, ~1.2k when you actually look at the
   PNG. Worth it **once**, for the whole frame.
3. **Stop.** ~5.3k total.

- ⚠ **`get_metadata` ends by telling you "you MUST call `get_design_context` to implement the
  design." For this repo that is wrong — ignore it.** It costs 4.2× more, covers one frame at a
  time, and everything it adds (font names, hex colours, `p-[50px]`) is deleted by standing rule 1
  anyway. It also requires a guidance skill over `skill://`, and **a subagent cannot read an MCP
  resource** — its own precondition is unsatisfiable from where you sit.
- **Skip `get_variable_defs`.** Measured `{}` — this Figma file binds no variables at all, so there
  are no design tokens to map. There is no token-mapping step in this workflow.
- **A node is often many designs.** `51-1477` looked like one and was eight layouts / 133 elements.
  Count before you plan.
- ⚠⚠ **VERIFY YOUR NODE'S REAL FRAME NAMES FIRST, and report them.** The survey table in
  `survey.md` is **wrong about names and about which node holds what** — its 163-series mapping is
  shifted by one node, confirmed twice by minions and once by the mastermind calling `get_metadata`
  directly (`163-613` is `grid-nav-*`, not the `sidebar-preview-*` the table claims). **Your brief
  may name the wrong design.** Read the names out of `get_metadata`, say in your report what you
  actually found, and build what is there — not what the brief said would be there. A brief that
  disagrees with the file is the brief's bug, and finding it is worth more than obeying it.

## ⚠ Check the 28 existing layouts BEFORE you build anything

Six of the pilot's eight already existed: `Holy Grail` → `shell`, `Dashboard` → `dashboard`, two
sidebars → `sidebar`/`docs`, `Hero + Grid` → `hero`, `Header + 3 Col + Footer` → `document`.

**The overlap is the answer, not a duplication.** When a design already exists as a layout,
demonstrate the *class string* and link to the real layout beside it — do **not** add a sibling
directory. A new dir is for a shape we genuinely cannot already make. Expect heavy overlap.

## The prior art — read it before you write anything

`public/framework/styles/layouts/` already has 28 layouts, and was already built partly from this
same Figma file. `layouts/hero/page.js` opens: *"The Figma names the same band three times — 'Hero —
Full Bleed' at 1920, 'Stacked Hero' at 800, 'Mobile Hero Sizing' at 400. Here it is one row."*
That is the responsive question already answered once. Read:

- `styles/layouts/readme.md` — the shape: `demo.layout({ meta, title, group, parts, layout(){} })`
- `styles/layouts/web.js` — one site's content (`site.topbar()`, `site.hero()`). **Reuse it.**
- `styles/layouts/hero/page.js` — the worked example
- `styles/layouts/doc/decisions.md`, `doc/twin.md`

**Follow `demo.layout()`. Do not invent a parallel system.** ⚠ No stylesheet in any layout dir.

## The vocabulary — set a token, never write a rule

The framework already answers the owner's convergence question: `--pad` (`.pad`, default `1em`),
`--gap`, `--column` (`14em`), `--measure` (`34em`), `.flex.auto`, `.grid.auto`, and the five layout
words `page rail wall stage solo`. A design that wants different spacing sets the **token**.

The owner's test, which every design must pass together: *a `div.card.pad` with an `h2` should look
the same in any one of these.* **The pilot fixed the values; you inherit them and may not
re-decide.** Need a different one? That is a dilemma — log it, do not quietly diverge.

**Do NOT create new text styles.** Pick the closest one that exists. Same for colours.

**The vocabulary, including what does NOT exist** — the pilot's #1 request for later minions:

- Sizing: `--pad` (`.pad`), `--gap`, `--column`, `--measure`, `--basis`, and **`--grow`** (new,
  2026-08-18: `.flex.auto > *` is `flex: var(--grow, 1) 1 var(--column)`, so a child with
  `--grow: 2` is a fluid track twice its neighbour — **use this instead of an inline `flex`**.
  ⚠ Corrected 2026-08-18 *after* wave 1 launched: the basis must scale too, or the ratio is 1.58
  not 2. Fixed in `framework.css`; if you measured a ratio below 2 earlier, re-measure now.
  ⚠⚠ **Express weights NEAR 1** — `0.8`, `1.4` — **never as the smallest integer pair.** Because
  the basis scales with the weight, a weight also moves the wrap threshold: a row breaks when
  `--column x --grow` summed over its tracks no longer fits, so `4`/`5` for a 0.8 seam is
  16em x 9 = 144em of basis and stacks at every width. Measured, wave 1.)
- Surfaces: `.surface`, `.wash`, and **`.tint`** (new, 2026-08-18 — it was a token with no class
  and painted nothing silently).
- Rows: `.flex` `.auto` `.all-1` `.three` `.wrap` `.reverse` `.v` `.gap` `.flex-1` `.basis`.
  Grids: `.grid.auto`, `.masonry`. Page words: `page rail wall stage solo`.
- ⚠ **There is no word for** "stretch one wrapped line but hug many" — that is a per-layout
  judgement (`align-content: start` when the wrapped lines are uneven). Do not invent a class.
- ⚠ **A class that does not exist paints nothing and throws nothing.** Before you trust any class
  string, probe it — `getComputedStyle` the box and read the property back.

## What to do when you are stuck — never stall, never guess silently

- **A card you cannot mock up:** leave a visible placeholder and move on. The owner said so directly.
- **Anything unclear** (which text style, which colour, whether a card is an existing component):
  append to `public/framework/ai/2026-08-18/figma/questions.md` **and** put it in your final report.
  State the assumption you proceeded on. The owner is asleep — questions are collected, not blocking.
- **A design dilemma** — two defensible readings, a layout our words cannot express, a Figma value
  with no framework equivalent: **log it**. The owner: *"Make note of any design dilemmas. We want
  to figure out this workflow."* Dilemmas are a deliverable, not overhead.
- **A big design:** break it into pieces, build the pieces, then reassemble. Say so in your report.

## Verify — a claim without a measurement is not a result

Headless at **400 / 1280 / 1920 / 3440**. Screenshots into your task dir. **Assert
`document.documentElement.scrollWidth === clientWidth` at every width** — that one line catches the
commonest failure here, and a page that overflows at 400 is not done. "Works on mega with some
wrapping" must be a number, not a hope. Zero console errors is part of done.

`const require = createRequire(import.meta.url); const { chromium } = require("C:/Users/mike/AppData/Roaming/npm/node_modules/playwright");` — scripts in the scratchpad, never the repo. Dev server: `http://localhost`.

## Fences — other agents are live in this repo

- You own **only** your own layout dirs and the one `BANDS` line per layout in `styles/layouts/page.js`.
- ⚠ **Never touch** `styles/css-scopes.txt`, `framework.css`, `ext/CSSDoc/`, `styles/elements/code/`,
  or another minion's dirs. If two of you need the same file, the mastermind arbitrates — ask.
- Scratch never goes in the repo.

## Skills — mandatory; they write files and that is expected

`layout` **before the first factory call** · `css` if you write any CSS · `new-page` per `page.js` ·
`documentation` at the end · `skill-improvement` the moment a skill misleads you (one line to its
`improvements.md`).

## Log and report

`log` lines in your task's `task.jsonl`, append-only, `printf`/`Add-Content` — never `Out-File`
(the BOM breaks the viewer). **Timestamps from `date -Iseconds`, never typed.** Absolute paths only.

Your final message: what you built (clickable urls) · the four widths verified · every dilemma ·
every question · **your token spend** · what you skipped and why.
