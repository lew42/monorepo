# Spacing census

This is a count of every `padding*` / `gap` / `row-gap` / `column-gap` / `margin*` declaration in the site's CSS (in `.css` files and in `css(\`…\`)` / `.style({…})` calls in `.js`), each one classed as **token** (`var(--pad|--gap|--flow)` alone), **token-xN** (`calc()` of one of those times a number N), **control-em** (a raw em/rem value on a button/chip/tag/pill/input/nav-item), **raw** (any other em/rem/px/%/vw constant), or **zero**. Full rows: [`census.json`](./census.json). Scan script: `spacing-census-scan.mjs` (in the session scratchpad, not the repo).

**Scope:** every `.css` and `.js` under `public/`, except `public/alex`, `public/arya`, `public/castin`, `public/michael`, `public/edric` (added — see note below), `public/framework/core/new`, `public/framework/core/legacy`, `public/framework/ai/**`, `node_modules`. 125 in-scope `.css` files and 918 in-scope `.js` files were read; 176 files (111 css, 65 js) actually contain at least one of these declarations.

**Rows in `census.json`: 1894. Sum of the five class counts below: 1894.** They agree.

## Class counts

| class | count | % of total | what it means |
|---|---|---|---|
| raw | 1064 | 56% | a bespoke em/rem/px/%/vw number, not a token and not a control |
| token-xN | 451 | 24% | `calc(var(--pad\|gap\|flow) * N)` — on-token, but N is a bespoke multiplier |
| zero | 209 | 11% | `0` |
| token | 125 | 7% | `var(--pad)` / `var(--gap)` / `var(--flow)` alone, no multiplier |
| control-em | 45 | 2% | a raw em/rem on something that reads as a control (button/chip/tag/pill/input/nav item) |

So 576 of 1894 rows (30%) touch a token at all (token + token-xN); 1064 (56%) are a plain bespoke number with no token in sight.

## Distinct multipliers (the "how many bespoke numbers" count)

Every `calc(var(--pad|gap|flow) * N)` in the site, counted by its N. **28 distinct multipliers** are in use:

| N | count | N | count | N | count | N | count |
|---|---|---|---|---|---|---|---|
| 0.5 | 76 | 0.15 | 13 | 0.9 | 10 | 1.6 | 4 |
| 0.4 | 61 | 1.2 | 12 | 0.1 | 10 | 1.7 | 2 |
| 0.6 | 55 | 0.45 | 11 | 1.5 | 9 | 1.1 | 2 |
| 0.3 | 45 | 0.75 | 7 | 2 | 4 | 3 | 1 |
| 0.35 | 33 | 0.25 | 28 | 0.55 | 4 | 1.75 | 1 |
| 1 | 27 | 0.7 | 19 | 1.25 | 4 | 0.05 | 1 |
| 0.2 | 17 | 0.8 | 14 | | | 1.4 | 1 |
| | | | | | | 2.5 | 1 |

## Ten files with the most raw values

| file | raw rows |
|---|---|
| `public/imagine/paging/paging.css` | ~~100~~ 5 (converted 2026-09-18, [`paging-ladder`](/framework/ai/2026-09-18/paging-ladder/), 20 to a rung/token and 75 kept as a control's own `em`; proven with a 0.000% stylesheet-swap pixel diff) |
| `public/framework/core/Page/generator/generator.css` | 47 |
| `public/imagine/blogx/blogx.css` | 34 |
| `public/blog/blog.css` | 32 |
| `public/imagine/imagine.css` | 32 |
| `public/framework/dev/DevBar/devbar.css` | 31 |
| `public/imagine/paging/make/make.css` | 28 |
| `public/imagine/paging/templates/templates.css` | 25 |
| `public/layouts/layouts.css` | 21 |
| `public/framework/core/Page/Page.css` | 20 |

## `ext/AITask/ai.css` — every number, classified

55 rows: 7 token, 24 token-xN, 6 control-em, 12 raw, 6 zero (7+24+6+12+6 = 55).

| line | property | value | class | note |
|---|---|---|---|---|
| 25 | gap | `calc(var(--gap) * 0.5)` | token-xN | |
| 58 | gap | `var(--gap)` | token | |
| 60 | margin | `0` | zero | |
| 62 | margin-block-end | `calc(var(--gap) * 0.5)` | token-xN | |
| 68 | gap | `calc(var(--gap) * 0.35)` | token-xN | |
| 69 | padding | `var(--pad)` | token | |
| 97 | margin-block-start | `auto` | raw | keyword, not a length |
| 97 | padding-block-start | `calc(var(--gap) * 0.35)` | token-xN | |
| 103 | padding | `0 .6em` | control-em | `.ai-ask-status`, a status chip |
| 115 | gap | `.5em` | control-em | `.ai-ask-foot, .ai-ask-links, .ai-links` — spacing a row of chip/pill links |
| 136 | padding | `var(--pad)` | token | |
| 144 | gap | `calc(var(--gap) * 0.4)` | token-xN | |
| 145 | margin | `0` | zero | |
| 151 | padding-inline-start | `.75em` | raw | |
| 153 | padding | `.25em .75em` | raw | `.ai-fold-bar`, a disclosure toggle — script didn't match it as a control (no button/chip/tag/pill/input/nav in its selector name), even though it behaves like one |
| 158 | margin-inline-start | `2em` | raw | |
| 169 | gap | `var(--gap)` | token | |
| 178 | gap | `var(--flow)` | token | |
| 197 | padding-block-end | `.35em` | raw | |
| 199 | gap | `calc(var(--gap) * 0.2)` | token-xN | |
| 206 | gap | `.5em` | control-em | `.ai-prompt`, a link row in the rail |
| 207 | padding-block | `.15em` | control-em | `.ai-prompt` |
| 222 | padding-block | `.5em` | control-em | `.ai-prompt` at narrow width |
| 225 | gap | `calc(var(--gap) * 0.5)` | token-xN | |
| 233 | padding | `calc(var(--gap)*0.6) calc(var(--gap)*0.8)` | token-xN | two multipliers, 0.6 and 0.8 |
| 247 | padding-inline | `0` | zero | |
| 254 | gap | `calc(var(--gap) * 0.5)` | token-xN | |
| 261 | gap | `calc(var(--gap) * 0.6)` | token-xN | |
| 268 | margin-block-start | `calc(var(--gap) * 0.3)` | token-xN | |
| 277 | gap | `calc(var(--gap)*0.9) calc(var(--flow)*1)` | token-xN | two multipliers, 0.9 and 1 |
| 279 | gap | `calc(var(--gap) * 0.15)` | token-xN | |
| 285 | padding-top | `.5em` | raw | |
| 304 | gap | `calc(var(--gap) * 0.2)` | token-xN | |
| 313 | gap | `calc(var(--gap) * 0.3)` | token-xN | |
| 313 | margin-block-start | `calc(var(--gap) * 0.6)` | token-xN | |
| 314 | gap | `calc(var(--gap) * 0.6)` | token-xN | |
| 334 | margin-block-start | `var(--flow)` | token | |
| 347 | margin-block-start | `var(--flow)` | token | |
| 349 | gap | `calc(var(--gap) * 0.4)` | token-xN | |
| 368 | gap | `calc(var(--gap) * 0.6)` | token-xN | |
| 374 | margin-block | `1.1em 0` | raw | |
| 375 | margin-block-start | `0` | zero | |
| 395 | gap | `calc(var(--gap)*0.3) calc(var(--gap)*1.5)` | token-xN | two multipliers, 0.3 and 1.5 |
| 397 | padding | `.55em 1em` | raw | `.ai-card`, a list row |
| 430 | padding | `0 .6em` | control-em | `.ai-link, .ai-tag` — pill/tag controls |
| 449 | gap | `0 1em` | raw | |
| 459 | gap | `calc(var(--gap) * 0.5)` | token-xN | |
| 475 | margin-block | `1.1em calc(var(--gap)*0.5)` | raw | mixed: `1.1em` raw, `0.5` a token multiplier |
| 478 | margin-block-start | `0` | zero | |
| 487 | gap | `calc(var(--gap) * 0.4)` | token-xN | |
| 488 | padding | `.6em .8em` | raw | `.ai-hl`, a highlights-wall card row |
| 503 | gap | `.8em` | raw | `.ai-hl-foot` |
| 512 | margin-block-start | `calc(var(--flow) * 0.5)` | token-xN | |
| 513 | gap | `calc(var(--gap) * 0.75)` | token-xN | |
| 614 | margin-inline-start | `0` | zero | |

## Where `--pad` / `--gap` / `--flow` are documented today

The token definitions and the reasoning behind them: [`framework.css` lines 225-247](/framework/framework.css) (`:where(*)` sets `--pad`/`--gap`/`--flow` from one `--size` knob) and [lines 635-641](/framework/framework.css) (`.pad`/`.gap`/`.mb` are the opt-in classes that wear the token). The one-paragraph pointer from the module readme: [`public/framework/styles/readme.md`](/framework/styles/readme.md) — "Spacing is one knob, never a constant" — which links to [`/imagine/design/size/`](/imagine/design/size/) as the full explanation.

**Markdown docs that mention a token by name (25 files):**
- [`framework/styles/readme.md`](/framework/styles/readme.md)
- [`framework/styles/doc/cascade.md`](/framework/styles/doc/cascade.md)
- [`framework/styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md)
- [`framework/styles/rules/nesting.md`](/framework/styles/rules/nesting.md)
- [`framework/styles/elements/doc/framework-css.md`](/framework/styles/elements/doc/framework-css.md)
- [`framework/styles/sections/doc/decisions.md`](/framework/styles/sections/doc/decisions.md)
- [`framework/styles/layers/theme/lew42/readme.md`](/framework/styles/layers/theme/lew42/readme.md)
- [`framework/styles/layers/theme/lew42/doc/decisions.md`](/framework/styles/layers/theme/lew42/doc/decisions.md)
- [`framework/styles/layouts/doc/decisions.md`](/framework/styles/layouts/doc/decisions.md)
- [`framework/styles/layouts/screens/doc/decisions.md`](/framework/styles/layouts/screens/doc/decisions.md)
- [`framework/styles/layouts/home/readme.md`](/framework/styles/layouts/home/readme.md)
- [`framework/styles/layouts/home/doc/decisions.md`](/framework/styles/layouts/home/doc/decisions.md)
- [`framework/styles/layouts/anatomy/doc/decisions.md`](/framework/styles/layouts/anatomy/doc/decisions.md)
- [`framework/styles/layouts/wire/doc/decisions.md`](/framework/styles/layouts/wire/doc/decisions.md)
- [`framework/styles/layouts/wire/doc/bento.md`](/framework/styles/layouts/wire/doc/bento.md)
- [`framework/styles/layouts/space/doc/decisions.md`](/framework/styles/layouts/space/doc/decisions.md)
- [`framework/styles/layouts/masonry/doc/decisions.md`](/framework/styles/layouts/masonry/doc/decisions.md)
- [`framework/styles/layouts/masonry/readme.md`](/framework/styles/layouts/masonry/readme.md)
- [`framework/styles/layouts/400/readme.md`](/framework/styles/layouts/400/readme.md)
- [`framework/styles/layouts/400/doc/decisions.md`](/framework/styles/layouts/400/doc/decisions.md)
- [`framework/styles/layouts/cols/readme.md`](/framework/styles/layouts/cols/readme.md)
- [`framework/styles/layouts/cols/doc/words.md`](/framework/styles/layouts/cols/doc/words.md)
- [`imagine/design/spacing/decision.md`](/imagine/design/spacing/decision.md)
- [`imagine/design/size/landing.md`](/imagine/design/size/landing.md)
- [`imagine/design/size/alternatives.md`](/imagine/design/size/alternatives.md)

**Dedicated design-system pages, shown not just told (7 pages):**
- [`/imagine/design/spacing/`](/imagine/design/spacing/) "Spacing"
- [`/imagine/design/spacing/ceilings/`](/imagine/design/spacing/ceilings/) "Ceilings"
- [`/imagine/design/spacing/audit/`](/imagine/design/spacing/audit/) "Audit"
- [`/imagine/design/padding/`](/imagine/design/padding/) "Padding"
- [`/imagine/design/padding/one-rule/`](/imagine/design/padding/one-rule/) "One rule"
- [`/imagine/design/size/`](/imagine/design/size/) "Size"
- [`/imagine/design/scale/`](/imagine/design/scale/) "Scale"

Left out of this list: dozens more `.page.js`/`.css` files (`styles/layouts/*`, `imagine/design/system`, `imagine/design/layout`, `imagine/design/controls`, and others) that *use* `--pad`/`--gap`/`--flow` in their own layout — `rg -l -- "--pad|--gap|--flow" public/framework/styles public/imagine/design` finds about 85 files total — but do not explain the token; they only spend it. The 25 + 7 above are the ones that actually say what the token is or how to use it.

## Methodology notes

- **`public/edric` was excluded**, though the brief's exclusion list did not name it. It has the same shape as the four named personal dirs — its own `page.js`, its own `framework` import, legacy `.style()` chaining — and one of its pages ([`edric/style/spacing/page.js`](/edric/style/spacing/)) is a hand-built teaching demo that deliberately places `1em`/`2em`/`3em`/`4em` padding side by side. Left in, it was the #3 raw-value file and would have misrepresented real site design debt as a personal sandbox's teaching example.
- **`framework/ext/DesignTool/library/bad/traps.js`** (17 raw rows, all in one file) is not excluded — it is in scope and counted — but its own file comment says it exists to be bad: "The don'ts... deliberately broken in one way, live, so the tool can put a number on how badly." It did not reach the top-ten list (17 rows, versus 20 for the tenth file), so it does not change the table above.
- **Control-em detection is name-based**, not a read of every comment: a declaration is called control-em only when its selector text contains a literal control word (`button`, `.btn`, `.chip`, `.tag`, `.pill`, `input`, `select`, `nav`, `.link`). A handful of elements that behave like controls but are not named like one — `.ai-fold-bar`, a disclosure toggle — land in **raw** instead, the safer default. `ai.css` line 153 is one; flagged in its row above.
- **A shorthand mixing a bespoke number with a token** (e.g. `margin-block: 1.1em calc(var(--gap) * 0.5)`) is counted once, classed by its most bespoke component (raw beats control-em beats token-xN beats token beats zero) — but every token multiplier inside it still counts toward the distinct-multiplier tally above.
- **Not scanned, out of the brief's five properties:** `.style("--gap", "…")` / `.style({ "--pad": "…" })` calls that redefine the *custom property itself* for a subtree (seen repeatedly, e.g. `framework/styles/layouts/carousel/page.js`). These are a different question — not a `gap:`/`padding:` declaration, but a token override — worth its own pass if the design-system work continues.
