# Audits — the eviction list, and how a layout change gets checked

Split out of `readme.md`.

## 6. The eviction list

**Narrowed by §12.** This list was written when the base layer was "framework
styles you might have to fight." Now that it's explicitly *the base theme* — the
one you get free, replaced by loading another — having opinions is its job. The
test is no longer "is this opinionated" but **"is this dead, or is it reachable
only by a fight."** Two of the original entries survive that, two don't.

**Evicted, and what it cost to notice.** Four margins had to go before the flow
rules (§9a) could own rhythm, because an element selector at (0,0,1) beats a
`:where()` rule at (0,0,0):

| was | why it left |
|---|---|
| `table { margin: 1em 0 }` | rhythm, living in the base theme |
| `hr { margin: 3em 0 }` | same. Replaced with `border-top: 1px solid var(--line)`, which is what an `hr` actually needed |
| `figure`'s UA `margin: 1em 40px` | never declared here at all, so every `figure` on the site sat indented 40px. The flow zeroes *block* margins only, so the inline half survived. Now `figure { margin: 0 }` in `base` |
| `dd`'s UA `margin-left: 40px` | the exact bug `ul, ol { padding-left: 1.2em }` was already written to fix, missed because `dl` has no View factory |

**The general rule this confirms: a margin on a generic element in the base theme
is nearly always rhythm in the wrong place.** Spacing belongs to whatever arranges
the content.

**`table` got a scroller, and the reason it took this long is instructive.** `pre`
has had `overflow-x: auto` since the reset was written; `table` never did, because
nobody had looked at a wide one in a narrow column. Measured at 390px: a 442px
table in a 262px column, and **the whole region scrolling sideways to accommodate
it** — so the symptom presented as "the page overflows", not as "the table is too
wide", and every attempt to find the offending element pointed at an ancestor.

```css
table { display: block; width: max-content; max-width: 100%; overflow-x: auto; }
```

Four declarations that only work together: `max-content` keeps a small table small,
`max-width: 100%` makes a wrappable one fill the column and wrap normally, and
`overflow-x` catches only the case that genuinely cannot shrink — a `nowrap` cell,
or a long unbroken string. `display: block` is what makes `overflow` apply at all;
the rows keep their own table display values, so nothing about the layout inside
changes.

**The general lesson: an element that cannot shrink and has no scroller of its own
will make its ancestors overflow instead.** `pre` and `table` are the two in HTML
that do this. There is no third, which is why this list is now complete rather than
open.

Three more were found by writing `/framework/styles/elements/`, which is the
argument for that section existing at all — documenting every element is how you
discover the ones nobody looked at:

- **`input[type=range]` took the text-field border**, because neither `:not()` list
  named it. A 1px border around a slider is not a control anyone designed. Fixed.
- **`audio` and `iframe` were missing** from `img, picture, video, canvas, svg
  { display: block; max-width: 100% }`. Both have View factories; both kept the
  inline baseline gap the rule exists to remove, and an `iframe` could overflow its
  column. Fixed.
- **`kbd` and `samp` were missing** from the `--mono` rule, so they rendered at a
  visibly different size from a `code` in the same sentence. Fixed.
- **`:focus-visible { outline-width: 2px }` genuinely did nothing**, and the reason
  is worth keeping: no `outline-style` is set, so the ring is the UA's
  `outline-style: auto`, which **follows `border-radius`** and by spec **ignores
  `outline-width`**. A `solid` outline honours the width and draws a square ring
  around a rounded control. That is also the answer to the old
  *"messes with the border radius???"* comment beside it. Rounded rings win; the
  declaration was deleted and the reasoning written into the file.

Still evictable:

- **`select`'s SVG arrow.** A data-URI triangle plus `appearance: none`. Not
  because it's opinionated — because it's the one rule here a theme genuinely
  struggles to replace: you must know to re-set `appearance` *and* clear three
  `background-*` longhands. If any rule in the file earns a `:where()` (§9),
  it's this one.
- **`html { scrollbar-color: … }`** — a look with no token behind it, so a theme
  can't retune it without a selector. Give it a token or drop it.

No longer evictable (they're the base theme doing its job, and a theme overrides
them at equal specificity):

- `.btn, button { padding }` and the `.bg` / `.prim` variants.
- `input … { border: 1px solid var(--subtle) }` — and it reads a token, so a
  theme already controls it.

Site-level, unchanged:
- **`.app { background: #ddd }` in `/styles.css`** duplicates and fights
  `body.theme-1 .app { background: white }`. Site-level, but it's the same bug.

And in components, per §1's test:

- **`ColumnPager.css`** set `.main { background: #eef0f4 }`, `.topbar
  { background: #fff }`, borders, and the whole `.col-bar` / `.col-path` /
  `.col-close` chrome. That chrome is developer affordance, not layout — the
  strongest candidate for extraction into a component of its own (which
  `framework/readme.md` §8 already flags for removal on other grounds).
- **`.page { background: white }` lives in `/styles.css`** while `Page` emits
  `.page` — so the framework alone renders an unstyled page. Noted in
  `framework/readme.md` §8; the fix is a minimal default here, at the cost of
  two rules that can drift.

### 6a. `table { width: 100% }` — REJECTED, with the measurement

`framework.css` gives `table` `display: block; width: max-content; max-width:
100%; overflow-x: auto`. `display: block` is what makes `overflow` apply at all,
and the side effect is that a table **shrink-wraps where every other block
fills** — a component preview measured 187px inside a 320px stage.

The obvious fix is `width: 100%` on that same rule: one declaration, no new
selector. It was filed as a bug report about `framework.css` and it is not one.

**Measured, all 49 tables on the site, at 1600px** (`table { width: 100%
!important }` injected, every visible table's box compared before and after):

| | tables |
|---|---|
| already full width — no change | 24 |
| **stretched** | **25** |
| newly scrolling (overflow regression) | 0 |

No overflow regression, and that is not the problem. The problem is the 25:

| table | before → after |
|---|---|
| `module │ lines` (components/table) | 161 → **797** |
| `token │ is` (layers/theme) | 196 → **780** |
| `element │ styled by` (elements) | 247 → **769** |

Every one is a narrow key/value docs table, and every one ends up with several
hundred pixels of white between the key and the value. **`width: max-content`
keeping a small table small is the design, not the defect** — it is the first of
the four declarations and the comment beside it says so.

**Verdict: the declaration stays at the call site.** `components/table/component.js`
carries `width: 100%` because a preview genuinely wants to fill its stage; nothing
else on the site does. A rule that is right for one box and wrong for 25 is not a
base-layer rule.

---

## 6b. After a layout change: six urls, two widths

Layout bugs here have never been caught by reading the diff. Every one was found
by looking, and the two that shipped — a gallery wall flush against the sidebar,
a `.tabs.vertical` panel scrolling sideways at 390px — were both invisible on the
page the author was editing. This is the pass, and it is short so that it happens.

**The urls.** Between them they exercise every page word (`default`, `standard`,
`full`, `fill`, `flow`), both breakout tracks (`wide`, `bleed`), a
`route()`-synthesised page, and a `.topic` region:

| url | breaks here first |
|---|---|
| `/framework/ui/` | `grid` + the previews wall — where the gutter bug shipped |
| `/framework/styles/layouts/` | the same pair, one level up |
| `/framework/styles/layouts/fit/` | `wide` and `bleed` side by side, as documentation |
| `/framework/styles/sections/hero/` | a `route()` page, and a band that *should* bleed |
| `/framework/styles/layouts/shell/` | `full fill flex v`, five regions, a scrolling row |
| `/framework/core/View/` | a deep doc page — `Doc` → a vertical `tabs` rail inside `.topic` |

**The widths: 1600 and 900.** 1600 is a real desktop; 900 is where a sidebar plus
a measure stops fitting. 390 is worth a third look — every measured bug in this
file was found there.

**The three things, in order:**

1. **Is the gutter there?** Air between the sidebar's border and the content, at
   every scroll position.
2. **Does anything scroll sideways?** Fastest check, no devtools:
   ```js
   document.querySelectorAll(".pages").forEach(r =>
       r.scrollWidth > r.clientWidth && console.warn("overflow", r));
   ```
3. **Any giant blank areas?** A card taller than its content, a band with a hole
   in it — usually a fixed height or an `aspect-ratio` meeting content it was not
   sized for.

⚠ **This protocol catches (2) and (3). It does not catch (1)** — a gutter of zero
is not an overflow and not a blank area; it is a page that looks fine unless you
know what to compare it to. Nothing in a checklist covers that class, which is
why the guard for it is structural: **the choice of breakout track lives in
`previews()`** (`core/Page/Page.class.js`), so an index page cannot pick `bleed`
by hand and lose the gutter. Keep it that way — see §6c.

---

## 6c. Why there is no `--region-gutter` floor

The obvious structural guard for the gutter bug is a floor the region owns:
`.pages { padding-inline: 1.25em }`, so `bleed` reaches the region's content edge
and never the chrome. It was designed and **rejected**.

`bleed` has four call sites. Two are its own documentation (`layouts/fit/`), one
was the bug (an index wall, now `previews()`'s `wide`), and one is
`sections/page.js` — a section band, whose comment reads *"`bleed` and not
`wide`, because touching the window is the one thing a section is for."* A region
floor would put 1.25em of white down both sides of every section band on the
site. **It breaks the only correct consumer to guard against a misuse that no
longer has a call site.**

The same objection kills the cheaper variant (`--bleed-floor` inside
`.page.standard`'s padding), for the same reason and to the same degree.

So: no CSS. `bleed` means what it says, `wall()` is where the walls get their
track, and the vocabulary page (`layouts/fit/`) states the rule at the point the
words are defined. A guard that breaks the feature is not a guard.

---

## 6d. A doc page that quotes a rule is a claim that can be checked

These pages quote real declarations — ``md("`pre` gets `padding: 0.75em 1em`")`` —
which is what makes them useful and also what makes them rot. Four of them went stale
**within an hour** of being written, because fixing the bugs they had just found
changed the values they quoted.

That is a checkable class of claim, and the check is about fifteen lines: pull every
`` `prop: value` `` out of the doc pages with a regex, normalise whitespace, and assert
the string appears in `framework.css` or `Page.css`. Run against this section it found,
with no false negatives worth the name:

- `input:not(…[type=color])` — the `:not()` list had gained `[type="range"]`
- `dd`'s `margin-left: 40px` — no longer true, `dd` now has a rule
- `figure`'s `margin: 1em 40px` — same
- `outline-width: 2px` — the declaration had been deleted as a no-op

The false positives are all counter-examples (`background: #eef0f4`, quoted as *"not
this"*), which a human dismisses in seconds.

**Worth knowing rather than worth automating, for now.** It is a scratch script, not a
repo script — a work-in-progress check doesn't earn an npm script, and nothing here
runs tests in CI. But *"the docs quote the CSS, so the docs are testable against the
CSS"* is the useful idea, and it is the only mechanism in this repo that would have
caught any of the four.

## 10. Does an ext need any CSS?

**The question, asked of `md.css`:** it was 47 lines. How much of that is
markdown's?

**Almost none.** Markdown emits plain HTML — `pre`, `code`, `blockquote`,
`table`, `h2`. Those are *HTML's* looks. `md.css` owning them meant the site had
two blockquote designs (one for markdown, one for a hand-written
`blockquote()`), two table designs, and a `pre` that looked different depending
on who rendered it.

**The rule this generalizes to:**

> **A module styles the classes it emits. Generic elements belong to whoever
> styles generic elements** — `framework.css`.

`md.css` is now two classes: `.md-error` and `.md-details`. Both prefixed, both
emitted by `md.js`, both styled nowhere else. That's the target shape for every
ext.

**The `pre` finding is the strongest evidence this file has for §1's
"overriding the framework is a bug report."** Four stylesheets had an opinion
about one box: `framework.css` at `0.25em 0.5em`, and `md.css` (0.75/1),
`highlight.css` (0.75/1) and `demo.css` (0.9/1) each independently overriding it —
plus three verbatim copies of `pre > code { padding: 0; background: none }`.
Nobody coordinated; three of them landed within 0.15em of each other. The base
was simply wrong: `pre` is a block and `code` is inline, and one padding was
never going to fit both. Split in `framework.css`, all four overrides deleted.

**`md.details` — a reusable disclosure?** Yes, eventually. The look (top rule,
quiet summary, smaller body) is generic; only the *content* is markdown's.
**Verdict: extract `core/Details/` when a second disclosure appears, not
before** — one consumer doesn't justify a fourth file, and `.md-details` is
md's own prefixed class, so it's the safe kind of ownership meanwhile.
`summary { cursor: pointer }` did move to `framework.css`: that one is a UA gap,
not a design.



---

## Still to write

The docs now mirror the stylesheet: `styles/page.js` is the strategy, and
[`layers/`](layers) holds one child per layer — [`base/`](layers/base),
[`theme/`](layers/theme) (with [`theme/guide/`](layers/theme/guide) for writing
your own), [`site/`](layers/site), [`util/`](layers/util).

Coverage as it stands:

| layer | covered | not yet |
|---|---|---|
| `base` | all ten rules, eight with a before/after `compare()` | — |
| `theme` | tokens, type scale, code, block elements, controls; the remainder in one table | a demo for `:focus-visible`, `scrollbar-color`, the `clamp()` body size |
| `util` | flex, grid, spacing, text, zoom, `textarea.auto` | `zoom-responsive`, `gap-2em`, `all-pad` have no demo of their own |

The before/after pattern is a local `compare()` — the same markup twice, the
left side with one declaration reverted inline. It lives in `layers/base/page.js`
because that's where it earns its keep; if a second page needs it, it goes in
`ext/demo/` rather than being copied.

Bigger items, in order of value:

1. **Rewire component hardcodes to tokens** (§12) — the thing standing between
   here and working dark mode.
2. **`app.css_audit()`** (§8) — the dev-only styled-vs-applied diff.
3. ~~**`.page > .md`** (§8) — the last undeclarable core→ext CSS dependency.~~
   **DONE**: the direction flipped — `md()` and `demo()` now *emit* `flow` in
   their own class strings, and the flow selector shrank to
   `:where(.flow, .page, blockquote)`. Core names no ext class; the ext opts its
   boxes into a substrate concept, which is the right way round.
