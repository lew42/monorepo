# Decisions — 2026-08-21

Every call made when `ux/` and the config words were minted, with its one-line reason. The
argued version is [system.md](/framework/ux/doc/system/); this is the record, including what
was rejected.

## The word list

| | |
|---|---|
| **`ui-contrast`** | the same section, readable — remaps `--ink --subtle --line --wash --tint --prim-ink` |
| **`ui-compact`** | less space at the same text size — remaps `--pad --gap --flow`, scaled by `--density` |

**Two words, not four.** Every word has to earn a visibly different demo, and two do. A
third would have been a guess about a case nobody has hit.

**`compact`, and no `micro` / `mini` / `small`.** Those are three values on one axis, and this
module's own rule is that *a variant earns its place by being a different thing, not a
different value* — `avatar/sizes` became `--avatar`, `stats/summary` became `--column`. The
knob is a number: `.ac("ui-compact").style("--density", "0.7")`. The cautionary precedent is
`.zoom-*`, a ladder of eight rungs in `framework.css` that survived an audit only because
eight of nine had real call sites, and is frozen.

**`ui-compact` does not touch `font-size`.** Shrinking the type is `zoom` and it already
exists. Density is *less space at the same reading size* — a different thing, so a different
word. Measured: `font-size` is 15.04px in both panels of the demo; padding is 15.04px against
7.52px.

## The mechanism

**A word sets custom properties and nothing else.** No element selectors, no component
classes, no `!important`. That is the whole contract, and it is what makes a word cost each
of the twenty components zero lines, makes two words compose, and makes a word work the same
on `<html>`, on `.app`, on a section or on one card. The precedent is `dev/DevBar` — one
state class remaps one property and the rail reads it.

**`@layer theme`.** A custom property never fights a utility, because the utility *reads* it
(`.pad { padding: var(--pad, 1em) }`), so there is no specificity war to win — and a site
theme in `@layer site` should still be able to beat a word.

**A word replaces a token; it can never scale one** — `calc(var(--radius) * var(--density))`
self-references and CSS drops it. So a word may only touch a token **nothing else declares**.
`--pad`, `--gap` and `--flow` qualify (the fallback lives at the use site); `--radius` does
not — the theme owns it. Written, measured at 3.76px against `lew42`'s own 3.76px, removed.

**`ui-contrast` names no hue.** Alpha bumps on the `light-dark()` pairs `framework.css`
already declared, the ends of the ink axis, and `--prim-ink: color-mix(in oklab, var(--prim)
70%, var(--ink))` — which `framework.css` documents as the accent's text twin. So one word
covers light and dark and any theme. Verified resolving: `oklab(0.533 0.076 0.071)`.

## Placement

| | |
|---|---|
| `ui/words/words.js` + a line in `ui.js` | a css-only module, exactly like the nine components — and it hits the same trap: a page never imports its own `<name>.js` |
| `ui/words/page.js`, in the **Marks** band | Marks was the only band under five, and therefore the worst at 3440 (four cards ~760px each). `ui/doc/decisions.md` already ruled that band **arithmetic** beats semantics — it killed the cleaner five-band cut over two bands of three. 5 · 6 · 5 · 5 now |
| `ux/` as a `Doc`, `leaf: true` | without it, `framework/page.js`'s `sections()` spills Overview · Docs into the site nav as if they were pages (`ui/page.js` carries the same line) |

## Rejected

| rejected | why |
|---|---|
| a `ui-dark` / `ui-light` colour word | `color-scheme` already does it in one line, sectionally, and every token is a `light-dark()` pair. A word would be a second name for a thing CSS has |
| `--column` inside `ui-compact` | `--column` is content *width*, not space. Riding the same multiplier put a card at 7em; a second multiplier in one word is two ideas |
| `.ui-compact .ui-table td { … }` to reach the cells | per-component CSS wearing a section word's name — the one thing this mechanism exists to delete. Filed as a `framework.css` proposal instead |
| editing `framework.css` to add `--pad-cell` / `--pad-control` / `--muted` | out of fence, and an owner-level call: three new tokens is the token set's own bar ("it must replace a value already hardcoded somewhere, ideally several"). [Proposal](/framework/ai/2026-08-21/ux-system-plan/) |
| a second density word for the second step | it is a number. The slider on [`ui/words/`](/framework/ui/words/) is the argument |

## Two traps that cost time here

- **`--flow` cannot be set from an ancestor.** `framework.css` declares it *on* the flow root
  — `:where(.flow, blockquote) { --flow: 2em }`, `(0,0,0)` — so an inherited value is
  overwritten at every flow on the page and a compact section keeps 2em prose rhythm with
  nothing in the console. `words.js` carries a `(0,1,0)` descendant pair.
- **A custom property inherits, so a tidy inline value leaks into what it is being compared
  against.** The demo's caption wrapper set `--gap: 0.5em` for its own spacing; it reached
  straight into the section below, and both panels measured 7.52px — the *default* panel
  silently wearing the compact gap. Caught by reading a computed value, not by looking.

## Open, for the owner

- `ui/page.js`'s `files:` string does not list `words/words.js` or `words/page.js` — the fence
  for 2026-08-21 allowed one word in that file. Two names, whenever someone is in there.
- The `framework.css` token proposal above. Nothing is blocked on it; the gap is visible on
  [`ui/words/`](/framework/ui/words/) and honest.
- Mixins by prototype `assign` for `ux` variants — the owner floated it, explicitly not
  explored here.

## 2026-08-21 — the five modules, consolidated

Five `ux/` classes landed today against the contract above. Five verdicts recur across all
of them; each is argued in full at its own module's `doc/decisions.md` — this is the index,
not a restatement.

**Subclass over mixin, proven not asserted.** The owner asked for one feature built both
ways. A naive `Object.assign` mixin crashed (`RangeError` — its own "call the previous
behavior" lookup ended up calling itself); the careful version that saved a local first ran
clean but silently overwrote the first mixin's `render()`, and permanently mutated
`Wizard.prototype` for every instance, including ones built before it. The subclass form
stacked both layers correctly through `super` and left the base class untouched. This is
now the tier's pattern — [`Wizard/doc/decisions.md`](../Wizard/doc/decisions.md).

**Extend-vs-compose is a per-case call, not a rule.** `Course` prototyped
`class Course extends Wizard` first, not last, and rejected it: `render()`/`update()` each
inline four regions with no per-region seam, so a third region and a chapter-grouped rail
would fork both wholesale. `Course extends View` directly instead — 7 of Wizard's 11
methods would have needed touching, the two that mattered most as full copies, not
overrides — [`Course/doc/decisions.md`](../Course/doc/decisions.md).

**A composed method is a seam per thing it composes**, not one seam for the whole method.
`Auth.login()` calls `password_field()` rather than building the field inline, which is the
one line that let `MagicAuth` skip it in 14 lines instead of forking `login()` —
[`Auth/doc/decisions.md`](../Auth/doc/decisions.md).

**The one-wire rule: a predicate or a node out, never a DOM reference.**
`Tree.selected_change(node)` and `Filter.changed(predicate)` both hand the caller a plain
value and never touch the caller's own regions. `Filter` proved it holds unchanged with
three simultaneous consumers (a stat strip, a card wall, a table), not just one —
[`Tree/doc/decisions.md`](../Tree/doc/decisions.md) ·
[`Filter/doc/decisions.md`](../Filter/doc/decisions.md).

**Static parts bought every extension for free.** `TreeKeys` replaces exactly one static
(`TreeKeys.Row`) and needed zero changes to `Tree` itself; `MagicAuth` overrides four seams
in 14 lines and nothing else moved. Reaching a part through `this.constructor`, never the
class name, is what makes both work — hard-coding the base class there would have made the
extension impossible — [`Tree/doc/decisions.md`](../Tree/doc/decisions.md) ·
[`Auth/doc/decisions.md`](../Auth/doc/decisions.md).

## 2026-08-21, program 3 - the sanctioned proposals, consolidated

- **framework.css tokenization landed** - exactly 4 one-line fallback edits (`--pad-cell`, `--pad-control` x2, `var(--muted, 75%)`); byte-identical on fallbacks alone across 4,436 elements on three pages; `ui-compact` now tightens table cells (3.76 to 1.88px) and inputs. Proof: [ai/2026-08-21/ux-tokenize/](/framework/ai/2026-08-21/ux-tokenize/).
- **Themed buttons stay loose** - the lew42 theme restates button padding in `@layer site`, beating the token. Filed for the owner: one line in the theme (`var(--pad-control, 0.7em 1.4em)`), not an autonomous edit.
- **--density ships at 0.5** - a config word must be visibly different or it is not a word (7.52 vs 15.04px is the demonstrated case); 0.7 is the documented half-step via `.style("--density", "0.7")`. Revisable.
- **All eight modules are Docs** - Tree's recorded objection (Doc re-columns a bleed exhibit) did not reproduce; 25 literal .md cross-links moved to pretty routes. [ai/2026-08-21/ux-doc-convert/](/framework/ai/2026-08-21/ux-doc-convert/).
