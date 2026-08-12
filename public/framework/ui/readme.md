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

`parts.js` holds `.ui-pill`, `.ui-tags-input` and four helpers: `css(rules)` (the
`<style>` tag, layer statement written for you), `component(fn)` (the `.c()` form
every View factory has), `palette(…)` (the variants side by side — every page
opens with one) and `copy(fn)` (a code block with a copy button).

**Pass `copy()` the function that rendered the example** and the two cannot
drift: the reader copies the code that ran.

`parts.js` and every `<name>.js` import from `../../core/View/View.js`, never
`/app.js`: `app.js` exports `ui`, so importing back through it would be a cycle
that breaks on deep reloads only. `page.js` is loaded by the Router long after
that, so it uses `/app.js` like any page.

## The index wall

`page.js` is `this.previews().style(SCALE)` and nothing else above the fold.
**Every one of the nineteen pages overrides `preview()`**, one line, always the
same shape — and always over the same `const` its `palette()` and its `copy()`
use, so a card cannot show something its page doesn't:

```js
preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", card)); },
```

Two pages declare a claim on the wall (`card: "wide"` on stats, `card: "tall"` on
timeline) and both say so in their own `page.js`. There is no second copy of
those calls: `/michael/previews/` (a sandbox comparing three wall scales) calls
`previews()` on this page.

## Two things that will bite

- **`ui/` is imported by `app.js`**, so every surviving stylesheet loads on every
  page of the site. A dozen small style elements, measured as noise; the
  alternative was a second import in every page that wants a badge.
- **A tooltip or a menu panel is out of flow**, so an ancestor with
  `overflow: hidden` clips it — `.demo` is one.

The long record — the ladder per component, the nine findings the set produced,
and the review outcome — is in `doc/record.md` beside this file.
