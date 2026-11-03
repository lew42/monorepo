# Elements — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## Decisions

**One long page, or one per group?** Seven pages, grouped by *what you are doing*
(writing prose, showing code, building a form) rather than by spec category, because
that is how you arrive. A single page is the honest default for a pure lookup, and this
section is not only a lookup: each element comes with the *reason* its rule exists, and
those reasons cluster — the `pre`/`code` padding story is one argument, the two form
`:not()` lists are one argument. Interleaved on one page, each gets read at the wrong
moment. A page per element is out on volume: ~70 factories, most with no rule at all.

**The cost, recorded:** you cannot `Ctrl+F` across the set. Accepted, because the
sidebar names all seven. If it bites, the fix is a single flat "all elements" page *in
addition*, not a merge.

**`demo()` for everything, no helper.** A compact swatch grid is denser and looks more
like a reference, and it hides the call: the reader sees `<mark>` rendered and never
sees `mark("mark")`, so the page documents HTML rather than **this framework's way of
writing HTML**. A helper is also a second source of truth the sample can drift from,
which is exactly what `demo()` prevents. The decisive argument is the **third pane** —
the real DOM, which turns "here is an element" into "here is what your call produced".

Where several elements belong in one sentence, they go in *one* `demo()` as a sentence:
a row of isolated `<sub>` swatches teaches less than "water is H₂O at 10³ kPa".

**One cost, taken knowingly:** `text/` demos a real `h1()`, so that document has two
`<h1>`s. `theme/page.js` avoids this with `div.c("h1", …)`, which is right *there*, where
the subject is the scale. Here the subject is the element, and a reference showing
`div.c("h1")` when you asked about `h1` has answered a different question.

**Cover the unstyled elements too.** The question a reader arrives with is *"what
happens if I use `<kbd>`?"*, and a document that omits `kbd` answers it by implication —
badly, because "not listed" reads as "not supported" when the truth is "renders fine, UA
styling, nothing to override". So every page states the rule *or* states there isn't
one, and `misc/` ends with the full list: thirty-nine of about seventy factories have no
rule anywhere. **That ratio is the design** — `framework.css` is meant to contain
nothing you would ever want to override, and the cheapest way to hold that line is to
style very little.

**Findings get recorded, not shipped.** Several gaps found here are worth fixing, and
writing a doc page is not a licence to change the thing being documented: a rule added
while writing prose about it has skipped the ladder and the override test.

**Under `styles/`, not beside `View`.** The pages are mostly `View` factory calls, but
what they *say* is almost entirely CSS — which rule, what value, which layer, whether
there is one. A reader who wants "what can `el()` build" wants the View docs. This also
puts the reference next to `base/`, `theme/` and `util/`, so the four together are the
whole story of `framework.css`.

## No stylesheet — and one place it nearly broke

Every page under `/framework/styles/` ships no CSS, and that is the proof the utilities
are enough. Three demos here needed geometry the utilities don't have, and all three
took an inline `.style()` **inside the demo, where the reader can see it**: a
`max-width` + `overflow-x` wrapper showing what a wide table needs; explicit sizes on
`img`/`video`/`iframe`, because a fixture has to be a known size; and `--code-bg` /
`--code-ink` on a box, which *is* the demo.

That last one is the pattern worth keeping: **an inline style demonstrating a token is
content, not styling.** None of the three would survive being moved into a `.css` file,
because none of them describes this page — they describe a fixture inside one example.

**Keep the no-stylesheet rule absolute**, and let a fixture that needs a size say so at
the call site.
