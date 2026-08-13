# ui — design record

Nineteen UI components. **Three are exported functions; sixteen are copy-paste
templates** with a page, a copy button, and — where a rule earned it — a small
stylesheet beside them.

```js
import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");
```

## The bar: logic a user shouldn't have to carry

**Encapsulating hides internals, and hiding internals makes modification
harder.** A function you can't see inside is a function you have to fight the
first time your case is half a step off the one it was written for — and for a
padded flex row, that is the *second* use.

So the bar is: is there **logic** here? A loop over rows, a listener, a name that
must be unique, a trap that costs an afternoon. If yes, export a function. If no
— if it is four elements and three utility classes — the honest deliverable is
the **markup itself**, documented on its page with a copy button, so the reader
takes it and edits it in place.

**Sixteen of the nineteen failed that bar**, in an independent per-module review:
`framework/ai/2026-08-09/proposal.md`, whose *Reviews* table is the verdict and
the reasoning for each. Two findings recur and are worth carrying: almost every
helper had **zero call sites**, and where the site genuinely needed the thing —
the versus page's panel and stat tiles, both FAQs, three crumb trails — its
author wrote the markup by hand rather than import the helper.

| | |
| --- | --- |
| **exported (3)** | `table` — two nested loops and the `width: max-content` shrink-wrap trap · `timeline` — a loop, and the rail is not obvious · `keys` — the interleave that puts a `+` *between* real `<kbd>`s |
| **template + CSS (9)** | `crumbs` `badge` `alert` `panel` `tooltip` `avatar` `dialog` `menu` `accordion` — a rule about a **relationship or a state**, which markup cannot say about itself |
| **template only (7)** | `field` `toolbar` `progress` `card` `stats` `pagination` `tags` — no `.js` in the directory at all |

## The CSS

A css-only module is a `<name>.js` holding one `css()` call and nothing else;
`ui.js` imports the nine so the classes exist site-wide. Two rules, both silent
when broken, and `css()` handles the first for you:

- **The layer order is restated in full** — `@layer base, theme, site, util;`.
- **Every rule is inside a layer.** An unlayered rule beats *every* layer.

Look goes in `theme`. Two blocks are in `util` on purpose: `.ui-tags-input` (an
opt-out of the theme's input border, which a `theme` class would lose to on
specificity) and `.ui-dialog`'s `margin: auto` (which `.flex > * { margin: 0 }`
erases from a later layer).

**No component names a colour.** Every value is a framework token —
`--surface --ink --line --radius --wash --prim --error`. The review found two
hardcoded `white`s (tooltip's bubble, avatar's circle) and a third in badge; all
three now read `var(--ink)` / `var(--surface)`, the pair the theme guarantees
contrast between in both modes.

**Nothing is styled inline** except `--gap`, `--column` and `--avatar`, which are
knobs rather than declarations.

### Verdict: `.ui-surface` and `.ui-muted` are gone

They were `framework.css`'s `.surface` and `.muted`, character for character.
*"The class name is the registry"* is a rule about a class you **emit** — these
re-declared somebody else's, and a duplicate is not an alias, it is a second
definition that can drift. Every template here writes `surface` and `muted`, the
same classes `styles/sections/*` already wore. `.ui-pill` stays: it has no
counterpart upstream.

## Shared

`parts.js` holds `.ui-pill`, `.ui-tags-input` and two helpers: `css(rules)` (the
`<style>` tag, layer statement written for you) and `component(fn)` (the `.c()`
form every View factory has).

`parts.js` and every `<name>.js` import from `../../core/View/View.js`, never
`/app.js`: `app.js` exports `ui`, so importing back through it would be a cycle
that breaks on deep reloads only. `page.js` is loaded by the Router long after
that, so it uses `/app.js` like any page.

## The unification (2026-08-12)

**The question.** `ui/` was the last section outside the site's one page system.
Its index was a `previews()` wall with three token overrides; its nineteen leaves
were `palette()` + `copy()` + prose + loose `demo()` boxes, while every other
detail page on the site had converged on `catalog()` rail + `demo.exhibit()`.
Different pages doing similar things means one of them is always stale — and
`ai/2026-08-11`'s census had already named `palette()` the **fourth preview
mechanism** and pre-committed its removal.

| | |
|---|---|
| leave `palette()`, add an exhibit above it | two previews of the same component on one page, and the wall would be the stale one |
| keep `copy()` beside the exhibit's source | two code blocks showing the same function — the exact drift `demo(fn)` exists to prevent |
| **exhibit as THE assembly; variants become child pages** | ✓ |

**Verdict, in three parts.**

1. **The index is `initialize(){ this.catalog(); }`** — one line, the same one
   `styles/sections`, `styles/layouts` and `styles/elements/forms` wear. The page's
   own prose becomes the rail's first card, so nothing was lost to gain the rail.
2. **Every leaf leads with `demo.exhibit({ page: this, … })`** — the component live
   on a stage you can drag, the layout bar wired to it, the template open beside it.
   `def` is the same `const` the card renders, so a card still cannot show something
   its page doesn't.
3. **Every other runnable example is a child page** — 29 of them, real urls, drawn
   under a `Variants` heading with the same cards the rail is made of.
   `/framework/ui/field/invalid/` is a url, a card and a stage.

`palette()` and `copy()` are deleted. The clipboard did not go with them: it moved
onto `demo.source()`, so *every* detail page on the site copies its own code now
(`ext/demo/readme.md` §19.2).

### The per-page calls

Every page took the same assembly; what differed is what became a variant.

| page | variants | note |
|---|---|---|
| `table` `timeline` `kbd` | `num` `cells` · `single` · `keys` `bare` | the three functions — `file:` points at the component's own `.js`, not `page.js`, because that file *is* the lesson |
| `field` | `invalid` `select` `form` | its in-prose "two fields is a form" demo became the third variant rather than staying a box |
| `card` `stats` `alert` `pagination` `tags` `avatar` `progress` | 2 each | the palette's second entry plus the page's own trailing `demo()` — in five of the seven those were already **the same function**, so nothing was invented |
| `crumbs` `badge` `toolbar` `panel` `menu` `accordion` | 1 each | palette entry and trailing demo were literally the same `const`; one variant, no duplicate |
| `dialog` | `open` | the primary is the real modal (open it, press Esc); the variant is what `showModal()` shows, because a closed `<dialog>` renders nothing on a card |
| `tooltip` `menu` | — | ⚠ **the templates carry a `pad` wrapper.** The bubble and the panel are out of flow and every stage, box and thumb crops; on a flush `bleed` render they would be invisible rather than merely clipped. It is in the template, not around it, because that is the honest markup |
| `stats` `timeline` | — | keep their wall claims (`card: "wide"`, `card: "tall"`), which the rail already knows to reinterpret |

**Card zoom dropped `zoom-75` → `zoom-50`.** A rail is 19em with `--thumb-max: none`,
so twenty three-quarter-scale renders made a rail four screens tall. `zoom-50` is
also what `demo.page()`'s card uses, so a component card and a variant card are now
the same size.

**Nothing here is "mostly prose".** The brief allowed a page to keep prose where the
render+code assembly would be forced; nineteen for nineteen had a real render, so
nineteen took the exhibit.

## Two things that will bite

- **`ui/` is imported by `app.js`**, so every surviving stylesheet loads on every
  page of the site. A dozen small style elements, measured as noise; the
  alternative was a second import in every page that wants a badge.
- **A tooltip or a menu panel is out of flow**, so an ancestor with
  `overflow: hidden` clips it — a `.demo` box and a stage's screen both are.

The long record — the ladder per component, the nine findings the set produced,
and the review outcome — is in `doc/record.md` beside this file.
