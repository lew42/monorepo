# Pilot report — pricing the Figma→framework workflow

Design `51:1477` ("AI Slop"), built and measured. **The headline for the fan-out: reading Figma
is the cheapest part of this job.** It cost ~7.5k tokens of ~66k. Priming an agent on the repo
cost four times that. Optimise the brief, not the MCP calls.

## 1. Measured cost per Figma tool

One node, `51:1477` — a frame holding **eight** complete layouts (133 elements).

| tool | what came back | size | ~tokens | verdict |
| --- | --- | --- | --- | --- |
| `get_metadata` | full XML tree of **all 8 layouts** — ids, names, x/y/w/h | ~14.8k chars | **~4.0k** | **the only call you need** |
| `get_variable_defs` | `{}` | 2 chars | **~1** | **skip** — the file binds no variables |
| `get_screenshot` (1400px) | URL + curl text | 493 chars | ~130 | cheap; the PNG is the cost |
| ↳ the PNG once you look at it | 1400×648 | 46 KB | **~1.2k** | **worth it once, for the whole frame** |
| `get_design_context` | React+Tailwind for **1 of 8** + inline 1024px shot | ~5.4k chars + image | **~2.1k** | **skip** — see below |

`get_design_context` ×8 ≈ **16.9k tokens** to cover what `get_metadata` covered for 4.0k. It is
**4.2× the price for the same coverage**, and in this repo its entire marginal content —
`font-['Montserrat:ExtraBold'] text-[32px]`, `bg-[#e5e5e5]`, `p-[50px]` — is **discarded by
standing rule 1** (reuse existing text styles and colours). I paid for it once so nobody else
has to.

It also demands its own guidance skill (`skill://figma/figma-design-to-code`) before you may
call it, and **a subagent has no tool that can read an MCP resource** — so its precondition is
unsatisfiable from a minion anyway. Another reason to route around it.

### The cheapest sufficient sequence

1. **`get_metadata` on the node.** One call, whole frame. Names, nesting, and every x/y/w/h —
   which is all the *structure* there is.
2. **`get_screenshot` at `maxDimension` 1400, then `curl` it and Read the PNG.** One image for
   the whole frame. It contributes exactly one thing metadata cannot encode: **fills**. Worth
   1.2k tokens; do not take eight of them.
3. **Stop.** Do not call `get_design_context`. Do not call `get_variable_defs`.

Total: **~5.3k tokens to fully understand a design.** That is the number to brief against.

⚠ `get_metadata`'s own trailing instruction says *"you MUST call `get_design_context` if trying
to implement the design."* **For this repo that is wrong** and following it costs 17k tokens of
code you must then throw away. Put that sentence in every minion's brief pre-refuted.

## 2. Where the tokens actually went (~66k total)

| phase | ~tokens | note |
| --- | --- | --- |
| Reading Figma | **7.5k** (11%) | all five calls, including the one I now say to skip |
| Priming on the repo | **~30k** (45%) | `framework.css`, `layouts/` readme + decisions + `web.js` + `hero` + `400/`, `demo/layout.js`, 4 skills |
| Headless verification | **~13k** (20%) | 3 probe runs × 32 loads, plus 4 screenshots read |
| Writing code + docs | **~16k** (24%) | `specs.js` twice, 4 markdown files |

**Priming is the cost centre, and it is the one thing a brief can pay down.** Nearly all of it
was learning the utility vocabulary and the module's conventions — knowledge that is identical
for all 19 designs and does not need re-deriving 19 times.

## 3. Can a Sonnet minion run a later design?

**Yes — for tiers B, C, E and F, with the brief below. No for tier D.**

What made this task hard was never the Figma. It was (a) knowing which of ~40 utility classes
exists, (b) knowing which of 28 existing layouts already covers the design, and (c) noticing a
class that silently does nothing. (a) and (b) are brief-able. (c) is caught by a probe, not by
intelligence — I shipped `.tint` on eight layouts and only the *measurement* found it.

**A Sonnet brief must carry, verbatim:**

1. **The cheapest sequence above, and the "ignore `get_metadata`'s closing instruction" line.**
2. **The class vocabulary as a list**, not a pointer to `framework.css`: `flex` `v` `wrap`
   `auto` `three` `all-1` `split` `v-center` `h-center` `reverse` `flex-1` `basis` `gap` `pad`
   `all-pad` `measure` `measure start` `grid` `grid auto` `grid three` `masonry` `packed`
   `surface` `wash` `muted` `zoom-*`; tokens `--pad --gap --column --basis --measure
   --sidebar --flow`. **And the negative list: there is no `.tint`, no `.card`, no `.stack`,
   no grow-weight word.** A silent no-op is the failure mode Sonnet will actually hit.
3. **"Six of these already exist in `styles/layouts/` — check the readme's page list before
   building anything."** The pilot's biggest save was not building eight directories.
4. **The three spacing rules as an instruction, not a principle:** never set `--pad`; one
   `--gap`; every other number is a `--column` and is a wrap threshold.
5. **A mandatory headless probe at 400/1280/1920/3440 asserting `scrollWidth === clientWidth`
   and a non-zero count of rendered labels**, with the script handed over rather than described.
   This is what turns "works with some wrapping" into a measurement, and it is what catches the
   silent no-ops.
6. **The fence list**, and "no stylesheet in a layout dir".

**Tier D (`80-2916`, `65-1507`, `109-369`) stays Opus.** Not for the code — for the judgement
of *what not to build*, which is where the value was here.

**One correction to `plan.md`:** it budgets one minion per design. `51:1477` was **eight**
layouts behind one node id, and `get_metadata` is what reveals that. Run `get_metadata` on all
19 nodes first (~19 × 4k = 76k, one cheap Haiku pass) and size the tiers off real element
counts. Several of the 19 are probably also multi-layout frames.

## 4. What was built

`/framework/styles/layouts/wire/` — eight layouts, eight class strings, one card in the
`Reference` band. One new directory, one word added to `BANDS`, **no CSS written at all**.

- [`readme.md`](/framework/styles/layouts/wire/readme.md) ·
  [`doc/bento.md`](/framework/styles/layouts/wire/doc/bento.md) the missing word ·
  [`doc/measured.md`](/framework/styles/layouts/wire/doc/measured.md) 8 × 4 widths ·
  [`doc/decisions.md`](/framework/styles/layouts/wire/doc/decisions.md) the record
- [`questions.md`](./questions.md) — seven, each with the assumption shipped.
- `shots/` — 16 PNGs, every layout at 400 and 1920. `figma-51-1477.png` — the source frame.

**Verified:** 32/32 loads clean at 400/1280/1920/3440 — no console errors, no `.md-error`, and
`scrollWidth === clientWidth` on every one. Every layout is one column at 400 without being
told to be; the two with `grid auto` walls re-count to 4 and 6 columns at 1920 and 3440.

## 5. The findings, ranked

1. **No word makes a fluid track twice its neighbour.** Every flexible class sets
   `flex-grow: 1`. Two of eight layouts need it and ship an inline `flex: 2 1 30em`. A
   zero-CSS workaround exists and *decays* (measured 2.00 → 1.45 → 1.30 → 1.17 as the row
   widens); the fix is one token on a class we already have. **Decide before tier B/C —
   bento grids are on at least four more designs.**
2. **`.tint` is a token with no class, and typing it paints nothing and throws nothing.** Cost
   one build-and-measure cycle. The Figma's greyscale ladder has three steps and we have two.
3. **`get_design_context` is the wrong tool for a repo with its own vocabulary** — 4.2× the
   price of metadata for content the reuse rule deletes.
4. **The design binds no Figma variables** (`get_variable_defs` → `{}`). If that holds across
   the file, drop token-mapping from every brief.
5. **Six of the eight already existed here** — the correct output was one Reference page, not
   eight sibling layouts. Expect the same on `163-613…619`.
6. **`align-content: start` is right only where the wrapped lines are uneven**, and there is no
   class for "stretch one line, hug many".

## 6. The five layout questions, answered

1. **Container** — each layout returns its own `div.c("page full fill flex v")`: a whole page,
   `full` (no gutters), `fill` (region height + its own scroller). Not `main`; every one of
   these is 2+ columns of content.
2. **Size** — 400 / 1280 / 1920 / 3440, all measured. One column at 400 in all eight.
3. **Own layout** — `flex` + `gap`/`auto`/`three`/`wrap` for bands and rows, `grid gap auto`
   for the two walls. No `.flow` anywhere: these are UI stacks, not prose.
4. **Regions** — two or three per layout, matching the Figma's own band structure.
5. **Preview** — `demo.layout`'s inherited `preview()`: one `zoom-25` frame at `56em`. Not
   overridden.

**Padding and spacing:** two values, and one is the default. `--pad` is **never set** — every
box is a plain `.pad` at `1em`; `--gap: 0.4em` sits between a label and its line, declared once
in `region()`. So **yes**: a `div.pad` with an `h3` in it is identical in all eight. Every other
number is a `--column`, which is a wrap threshold rather than spacing, and collapsing those
would collapse the eight layouts into one.

**Do these belong in `styles/layouts/`?** Yes, but as **one page, not eight.** They are not
component sets — every one is a whole-page skeleton, which is this tier's definition. But six
of the eight already ship here as content-bearing layouts, so eight new sibling directories
would re-run the merge this tier already did in August. `wire/` teaches the *strings* and links
to the real layout beside each one.
