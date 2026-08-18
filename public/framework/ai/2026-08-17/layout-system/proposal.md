# A simple page layout system — the causes, and the five words that replace them

Measured 2026-08-17 at 900 / 1440 / 3440, headless, DPR 1.
Contact sheets: [900](contact-900.png) · [1440](contact-1440.png) · [3440](contact-3440.png).

## The CSS is not too big. It is too conditional.

**47 live stylesheets, 239 rules** (85 / 366 counting the `core/new/` starter sandbox and `ai/` task dirs). For 274 pages that is small. The sprawl is branching: **59 `:has()` across 17 files, 14 width media queries on 10 different breakpoints** (26rem, 28em, 34em, 36em, 52em, 56em, 60em, 64em, 82em). About one rule in four conditionally overrides another.

And every media query measures the **window** while styling a box inside a region that is window − 220–274px of sidebar (− up to 34em more of task rail). `@media (max-width: 64em)` fires at a 1024px window where the region is 750px. Every breakpoint is wrong by 220–640px.

## The defects, and the one rule behind each

| where | what you see | cause |
|---|---|---|
| report @900 | task rail = a 306px band holding **31,838px**, above a second scroller — Mike's "two scrollable rows" | `ext/AITask/ai.css:214` — `@media (max-width:64em){ … flex: 0 0 min(22em, 34dvh) }`; `34dvh` of 900 = 306. Three `:has()` rules (`:196`, `:215`, `:225`) fight over this one rail |
| every prose page @1440+ | **104 chars/line** (795px@1440, 936px@3440) | `core/Page/Page.css:70` — `--measure: 52em`. Hand-counted at ~100 in `styles/doc/measure.md`; verdict pending Mike |
| report @3440 | **2248px prose = 250 chars/line** | `Page.css:47` — `.page.full { --measure: none }`. `none` removes the ceiling, not the width |
| doc @3440 | content stops at 1624px — **53% of the screen dead** | `Page.css:71` — `--breakout: max(7em,(100% - 96em)/4)` caps `.wide` at 1295 of 3165. No rung between 52em and full bleed |
| day @900 | the ACTIVE band drawn **twice** | the page shows a dashboard *and* a wall of the same children (layout skill Q4) |
| ui @3440 | every row padded to the tallest cell | `Page.css:182` — `.page-preview-thumb { height: 12em }`; today's `wall-polish` traded ragged rows for dead cards |
| DesignTool @900 | tab strip clipped at the right edge | `ext/tabs/tabs.css` — no wrap, no scroll |
| /framework/web/ | 404 (`App.load: nothing matches`) | declared child with no `page.js` |

**Five page shells are in use, three are documented**: `standard` `full` `fill`, plus `topic` (`styles.css:89`), `doc-page`/`doc-section` (`Doc.css`), `layout-full` (`layouts.css:18`), `dt-page`. `c("page full fill flex v")` is hand-typed **26 times** — the vocabulary is missing a word and 26 pages spelled it out.

## Why the prior art didn't fix it

`layout-hunt/audit.md` (08-15) ends "**Nothing here was applied. Proposals only.**" `styles/doc/measure.md` hand-counts the failure, picks 40em, ends "**the verdict is Mike's**." `wall-polish` (today) fixed row alignment and its own verdict admits it created dead space in 12 cards. The diagnosis has been right for three days; what landed was per-page patches, each adding a rule. The two site-wide decisions — the measure value, and the missing region primitive — were never taken. **Nothing below is a new finding about a page. It is a proposal to take those two decisions.**

## The five primitives

**1 · `.page` — one shell, three tracks.** Keep today's `.page.standard` grid; let `wide` take *all* the leftover instead of a capped breakout; drop the other shells.

```css
.page { --measure: 40em; --gutter: clamp(1.5em, 4%, 5em); display: grid; align-content: start;
  grid-template-columns: [bleed-start] var(--gutter)
    [wide-start main-start] min(var(--measure), 100% - var(--gutter)*2) [main-end]
    minmax(0, 1fr) [wide-end] var(--gutter) [bleed-end]; padding-block: 3em; }
```
Deletes `.standard` `.full` `.fill` `.topic` `.doc-page` `.doc-section` `.layout-full` `.dt-page`, `--breakout`, and the **three gutter-payback rules** that exist only because `wide` was too narrow to use (`Page.css:137`, `catalog.css:84`, `ai.css:196`). This is the centre-vs-sprawl answer: prose is capped, `.wide` sprawls.

**2 · `.rail` — every side region, sized by its container, never the window.**
```css
.rail { flex: 0 0 clamp(14em, 26%, 22em); min-width: 0; align-self: stretch; overflow-y: auto; }
@container page (width < 52em) { .rail { position: static; overflow: visible; } /* → <details> */ }
```
Below its threshold a rail is a **disclosure, never a short scroll band**. Deletes `ai.css:188-241` (all three `:has()` rules + the 64em query), `catalog.css:140-196`, `styles.css:121-124`, `.topic > .sidebar`. Kills Mike's bug at the cause.

**3 · `.wall` — the one grid of cards.** `repeat(auto-fill, minmax(min(var(--column,18em),100%),1fr))`, `gap: var(--gap,1em)`, `align-items: start` — what `.page-previews` already is, minus `dense` and the `.two`/`.big` spans that force an extra track. On `wide` by default, `bleed` by asking.

**4 · `.stage` — a preview is a picture with a declared aspect.** `container-type: inline-size; aspect-ratio: var(--stage, 16/10); overflow: hidden; pointer-events: none;` Replaces `.page-preview-thumb`'s fixed `12em`, the `.tall`/`.big` doubling, and `.demo-stage`'s heights. An aspect is right at 900 *and* 3440; a pixel height picks one and is wrong at the other — the trade `wall-polish` was stuck in.

**5 · `.solo` — the one full-screen word, and it is a url.** `.page.solo { --measure: none; --gutter: 0; position: absolute; inset: 0; overflow: auto; }` Reached as `/…/full/`, a real route (already proposed in `layouts/doc/full-view.md`), so it is linkable and Back closes it. Deletes the z-index ladder — `layout-full` 20, `demo.max` 30, `mode-btn` 60 — because only one thing is ever solo.

## Migration — three templates, then derivations follow

1. **`/framework/ai/2026-08-17/report/`** — the page that broke. Exercises `.page` + `.rail` + `.solo`; deletes `ai.css:188-241`. One page, visible tomorrow morning.
2. **`ext/Doc/Doc.css`** — one file, **42 `page.js` derive from it**, currently the site's *worst* measure (105 chars via `--measure: none`). Exercises `.page` alone.
3. **`ext/catalog/browse()`** — shared by `/framework/ui/`, `/framework/styles/layouts/`, `/framework/ai/`. Exercises `.rail` + `.wall` + `.stage` together.

~120 of ~274 `page.js` between them. Nothing else moves until all three look right at 900 / 1440 / 3440.

## The three ways this fails

1. **`@container` is not `@media`.** A rail cannot query itself; the parent must declare `container-type`, which changes `position: sticky` and percentage heights inside it. Miss one declaration and the query silently never fires — today's bug, with no error. `ext/Panel/toolbar.css` already hit this.
2. **40em costs width where nothing was broken.** `measure.md` priced it: width-used at 1280 falls 73.5% → 57.2%. The slack returns only if pages actually *claim* `wide` — authoring across ~210 files, not a CSS change. If they don't, it is a 1280/1920 regression bought for a 3440 gain.
3. **One shell has no opt-out, by design.** The first page needing a sixth word will get one, and the vocabulary regrows — the same gravity that turned three documented shells into eight. Worth doing only if the answer to "can we add a class?" is no.
