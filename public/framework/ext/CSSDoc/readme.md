# CSSDoc — every CSS rule that lands on one element, read out of the live CSSOM

A human writes *why a rule exists*. A human must never write a declaration, a selector, a
layer, a file name or a computed value — those are all available at runtime, so `cssdoc()`
reads them. Nothing it prints can go stale.

## Use
```js /framework/styles/elements/code/page.js
import { cssdoc } from "/framework/ext/CSSDoc/CSSDoc.js";

content(){ cssdoc("code"); }   // a block, like md() and demo()
```
⚠ **`target` is the label, not a selector** — both specimens are always a real `<code>`, so `cssdoc("blockquote")` silently documents `code`. v1 is one element on purpose; generalising is a v2 design, not a rename (see `CSSDoc.js`).

It renders the specimen twice live — inline, and inside a `pre` — then the rules that match
either specimen in document order, then every property those rules touch with its computed
value on **each** specimen. A property the two disagree about is `mark`ed: that row is where
a declaration one rule set and the next forgot to reset shows up.

## Watch out
- `getComputedStyle` on a detached element returns `""` for everything and throws nothing — and `content()` runs before `App.inject()` on a cold load. `measured()` waits for `View.stylesheets` *and* `isConnected`, and stamps `data-connected` on the box so a test can check it. A `MutationObserver`, never rAF: a hidden tab never animates.
- `el.matches("code::before")` is **false and never throws**, and `selectorText.split(",")` shreds `:where(p, li, td)` into fragments that match the wrong elements. `parts()` splits at paren depth 0, *then* strips the pseudo-element. One probe that got this backwards manufactured 149 false pairs and looked plausible.
- The property table is longhands (`padding` is four rows) because computed style answers a shorthand with `""`. The authored shorthand is in the rule table's `declarations` column.
- No line-number API exists and `cssText` is normalised, so grepping the file for it is unreliable too — link the file, never a line. 14 of 72 sheets have no `href` at all (`ui/parts.js` appends a bare `<style>`) and show as `<style>`.
- A rule whose `@media` does not match right now stays in the table, labelled `only when (…)`. That variant is what you need while editing.
- The CSSOM sees only *this* document, so a target page documents the sheets it happens to load. `.space-word > code` shows up only where `space.css` is loaded.

## Not in v1, on purpose
`target` is an explicit string, **not** derived from the page slug — one call site cannot
rot, and a derivation would have to guess. No `doc/style/<name>.md` prose files, no `Doc`
`styles:` section, no specificity column (there is no API and none is needed —
`getComputedStyle` *is* the resolved cascade), no `page.js` of its own: the one live demo is
the call site.

## More
- [The live demo](/framework/styles/elements/code/) — the page this replaced, whose four hand-copied rules were wrong, one of them the shipped `box-shadow` bug of 2026-08-18
- The measured design: [`ai/2026-08-18/cssdoc/proposal.md`](/framework/ai/2026-08-18/cssdoc/proposal.md)
- Files that matter: `CSSDoc.js` — the whole module, no stylesheet
