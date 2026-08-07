# Elements — design record

A browsable reference for every element `framework.css` styles, and for the ones
it doesn't. Seven child pages under `/framework/styles/elements/`.

`framework.css` is the only source of truth here. Every quoted value in every
page was read out of that file, not remembered — if a page and the file disagree,
the file is right and the page is a bug.

---

## 1. One long page, or one page per group?

**Options.** (a) A single `elements/page.js` — every element in one scroll, one
`Ctrl+F` away. (b) Seven child pages, grouped by kind. (c) A page per element,
which is what a formal reference like MDN does.

**Weighing.** (a) is the honest default for a *reference*: you arrive knowing the
element you want, and one long document is the fastest possible lookup. It also
matches how the file itself reads — `framework.css` is 310 lines and you can hold
all of it at once.

But this section is not only a lookup. Each element here comes with the *reason*
its rule exists, and those reasons cluster: the `pre`/`code` padding story is one
argument, the two form `:not()` lists are one argument, `display: block` on
replaced elements is one argument. On a single page those arguments interleave
and each one gets read at the wrong moment. Seven pages let each be a short piece
with a payoff, which is the house shape (*"a section is a path, not a fan-out"*).

(c) is out on volume: ~70 factories, most with no rule at all. A page whose whole
content is "nothing styles `<mark>`" is worse than a line in a list saying the
same thing.

**Verdict: (b), seven pages** — text, lists, code, table, forms, media, misc.
Grouped by *what you're doing* (writing prose, showing code, building a form),
not by spec category, because that's how you arrive. `misc` catches disclosure,
focus rings and the unstyled-landmarks list, and having one honest catch-all beat
inventing a fifth category for `details`.

**The cost, recorded:** you can't `Ctrl+F` across the set. Accepted, because the
sidebar names all seven and the labels are obvious. If it bites, the fix is a
single flat "all elements" page *in addition*, not a merge.

---

## 2. `demo()` for everything, or a hand-built swatch grid?

**Options.** (a) `demo(fn)` per element. (b) A compact grid — element name in one
cell, live sample in the next — hand-built with `.grid` and a small helper.
(c) A `code.fn()` block beside a rendered sample, no `demo()`.

**Weighing.** (b) is denser and looks more like a reference. It was tempting for
`text/`, where twenty inline elements each need one line. But a grid hides the
call: the reader sees `<mark>` rendered and never sees that it came from
`mark("mark")`, so the page documents HTML rather than **this framework's way of
writing HTML**. It also needs a helper, and a helper is a second source of truth —
the sample and the label can drift, which is precisely what `demo()` exists to
prevent (`fn.toString()` cannot lie).

(c) is `demo()` with extra steps and two things that can drift.

The decisive argument is the **third pane**. `demo()` now shows the real DOM,
which is what turns "here is an element" into "here is what your call produced" —
you can verify `pre > code` nesting, see that `p()` moved a pre-built child view
into itself, and check that `icon()` really emits `span.material-icons.icon`. No
swatch grid does that.

**Verdict: `demo()` everywhere, no exceptions and no helper.** Where several
elements belong in one sentence — the emphasis row, the semantics row — they go in
*one* `demo()` as a sentence, because that's where inline elements actually live.
A row of isolated `<sub>` swatches teaches less than "water is H₂O at 10³ kPa".

**One cost, taken knowingly:** `text/` demos a real `h1()`, so that document has
two `<h1>`s — the page title and the sample. `theme/page.js` avoids this with
`div.c("h1", …)`, which is right *there*, where the subject is the scale. Here the
subject is the element, and a reference that shows `div.c("h1")` when you asked
about `h1` has answered a different question. The sample sits inside
`.demo-render`, and the imperfect outline on one doc page is the smaller cost.

**Rejected along the way:** a `compare(without, with_)` helper like
`base/page.js` has. It earns its place there, where the whole subject is *what
one reset declaration buys*. Here the subject is the element, and reverting a
declaration inline would double every demo for no gain.

---

## 3. What about elements the framework deliberately does NOT style?

The real question of this section, and the one that changed how the pages are
written.

**Options.** (a) List only what's styled — a reference to `framework.css`.
(b) Cover everything a factory can emit, and say plainly when there's no rule.
(c) Cover everything, and *add* rules for the gaps found along the way.

**Weighing.** (a) is defensible and useless in practice. The question a reader
actually arrives with is *"what happens if I use `<kbd>`?"*, and a document that
omits `kbd` answers it by implication — badly, because "not listed" reads as "not
supported" when the truth is "renders fine, UA styling, nothing to override."

(c) is out on process, not on merit. Several gaps here are worth fixing (§4), but
writing a doc page is not a licence to change the thing being documented, and a
CSS rule added while writing prose about it has skipped the ladder and the
override test. **Findings get recorded, not shipped.**

**Verdict: (b).** Every page states the rule *or* states that there isn't one,
and "nothing to override" is treated as a finding rather than a hole. `misc/` ends
with the full list of factories with no rule anywhere — thirty-nine of about
seventy — because that **ratio is the design**: `framework.css` is meant to
contain nothing you'd ever want to override, and the cheapest way to hold that
line is to style very little.

---

## 4. What surprised me in `framework.css`

Recorded as findings. None of them was fixed here; each is a candidate for the
eviction list in `../readme.md` §6 or for a one-line addition.

**The two form `:not()` lists deliberately differ, and it isn't obvious.**
`@layer base` excludes `submit`, `button` and `reset` from `width: 100%`;
`@layer theme` does *not* exclude them from `padding` and `border`. So a submit
input is full-width-exempt but border-and-padding-included. The comment beside
the theme rule (*"adding a border affects input[type=submit] height and bg +
hover, for some reason"*) says someone already hit this. Correct as written, and
worth documenting rather than tidying.

**Types in neither list get the text treatment.** `range`, `file` and `date` take
`width: 100%`, `padding: 0.25em 0.6em` and `border: 1px solid var(--subtle)`. A
1px border around a slider is very unlikely to be intended. **Eviction candidate:**
add `[type="range"]` to the theme rule's `:not()`.

**`audio` and `iframe` have factories and are missing from the reset's replaced
list.** `img, picture, video, canvas, svg { display: block; max-width: 100% }`
misses both, so both keep the inline baseline gap that rule exists to remove, and
an `iframe` can overflow its column. **Two-word fix**, deliberately not applied:
nothing on this site embeds either, and an unexercised rule is a guess.

**`kbd` and `samp` are missing from `pre, code, .code { font-family: var(--mono) }`.**
They fall back to the browser's generic `monospace`, so they render at a
different apparent size from a `code` in the same sentence. Open, because
*"looks like code"* and *"is code"* aren't the same claim — `samp` is program
output, and a theme might reasonably want it plainer.

**Nothing gives a `table` a scroller.** `pre` got `overflow-x: auto` in the reset;
`table` didn't, so a wide table overflows the page. **Not fixable in the base** —
the fix is a wrapper element, and a stylesheet can't wrap. Documented at the call
site instead.

**`dl` has no factory and no reset.** `dd` keeps the UA's `margin-left: 40px`,
which is the exact bug `ul, ol { padding-left: 1.2em }` exists to fix. Left as
found: a definition list is nearly always a two-column table or a grid in
disguise, and adding a factory plus a rule for an element the site never uses
buys API surface and no readers.

**`figure` keeps `margin: 1em 40px`.** The flow rules in `Page.css` zero
`margin-block` only, so the *inline* 40px survives and every `figure` sits
indented. Visible in the media demo. Arguably a reset gap; left alone because a
figure genuinely is a set-apart block and the base can't know how far apart.

**`a` has no rule at all** — only `a * { cursor: pointer }`. Every link on this
site gets its look from a component class (`.page-link`, `.tab`, `.nav-link`,
`.sidebar-link`). Correct and worth stating loudly, because "the framework styles
links" is the natural assumption and it's false.

**`hr` has no margin**, and `../theme/page.js`'s rule table claims
`hr { margin: 3em 0 }`. The file says `border: none; border-top: 1px solid
var(--line)` and nothing else — spacing comes from the `--flow` rules in
`Page.css`. **The theme page is stale, not the element page.**

**`:focus-visible`'s `outline-width: 2px` genuinely does nothing**, and the file
has a comment wondering why. Answer: no `outline-style` is set, so the UA's
`outline-style: auto` draws the ring, and `auto` ignores `outline-width` by
design. That is also why the commented-out `outline: 2px solid var(--prim)` above
it *"messes with the border radius"* — a `solid` outline doesn't follow
`border-radius`; an `auto` one does. Losing `outline-width` is the price of
rounded rings, which is the right trade and now has a reason written next to it.

---

## 5. No stylesheet — and one place it nearly broke

Every page under `/framework/styles/` ships no CSS, and that is the proof the
utilities are enough. These seven hold the line.

Three demos needed geometry the utilities don't have, and all three took an
inline `.style()` **inside the demo, where the reader can see it**:

- a `max-width` + `overflow-x: auto` wrapper, to show what a wide table needs;
- explicit `width`/`height` on `img`, `video` and `iframe`, because a demo
  fixture has to be a known size;
- `--code-bg` / `--code-ink` on a box, which is the demo — it shows the tokens
  cascading.

That last one is the pattern worth keeping: an inline style *demonstrating a
token* is content, not styling. The first two are honest one-offs. None of them
would survive being moved into a `.css` file, because none of them describes this
page — they describe a fixture inside one example.

**Verdict: keep the no-stylesheet rule absolute**, and let a fixture that needs a
size say so at the call site.

---

## 6. Should this section live under `styles/` or beside `View`?

**Options.** (a) `framework/styles/elements/` — with the CSS it documents.
(b) `framework/core/View/elements/` — with the factories that emit it.

**Weighing.** The pull toward (b) is real: the pages are mostly `View` factory
calls, and every element here comes from `View.elements()`. But what the pages
*say* is almost entirely CSS — which rule applies, what value it has, which layer
it's in, whether there is a rule at all. A reader who wants "what can `el()`
build" wants the [View](/framework/core/View/) docs; a reader who wants "what does
a `th` look like and why" wants this.

**Verdict: (a).** The subject is the stylesheet; the factories are how the
examples are written. It also puts the element reference next to `base/`, `theme/`
and `util/`, so the four together are the whole story of `framework.css`: ten
reset rules, the base theme, the utilities, and then every element under both.
