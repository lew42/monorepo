# Elements architecture — one reference page per group, every example rendered by `demo()`

Elements is the reference for every HTML element `framework.css` styles, and the ones it leaves alone. Its main file is [`page.js`](../page.js), which declares seven child pages (`text`, `lists`, `code`, `table`, `forms`, `media`, `misc`), each a `page.js` of `demo()` calls. The module holds no CSS: every example is plain HTML built with the factories, and the rule that styles it is read from [`framework.css`](/framework/framework.css), never copied.

## Seven pages, grouped by what you are doing

**Decided:** the reference is seven child pages grouped by task (writing prose, showing code, building a form), declared in `page.js` `children:`.
**Why:** a reader arrives with a job, not a spec category, and the rules for one job share one argument (the `pre`/`code` padding story, the two form `:not()` lists).
**Instead:** one long page is the honest default for a pure lookup, but interleaved elements get read at the wrong moment. A page per element is about seventy pages, most with no rule.
**Detail:** [doc/decisions.md](./decisions.md)

## Every example is a `demo()`, never a helper

**Decided:** each example is written as a real `demo(() => { … })` call, and the reader sees the factory calls, the result, and the live DOM in one box.
**Why:** the third pane (the real DOM) turns "here is an element" into "here is what your call produced", and a helper would be a second source of truth that could drift from what renders.
**Instead:** a swatch grid is denser, but it hides the call and documents HTML instead of this framework's way of writing it. `compare(…)` helpers, which `base/page.js` uses, are rejected here: the subject is the element, not one reset declaration.
**Detail:** [doc/decisions.md](./decisions.md)

## Unstyled elements get a line too

**Decided:** every element page states the rule that styles an element, or states that there is none. `misc/` lists the elements with no rule.
**Why:** a reader who asks "what happens if I use `kbd`?" must not infer "unsupported" from silence. The ratio of styled to unstyled is itself the design: `framework.css` should contain almost nothing you would want to override.
**Instead:** listing only styled elements, which leaves `mark`, `kbd` and `figure` unexplained.
**Detail:** [doc/decisions.md](./decisions.md)

## No stylesheet, here or in any child

**Decided:** no `.css` file exists under `styles/elements/`, and `page.js` and each child say so in a comment.
**Why:** an element reference that ships CSS would document itself rather than the framework, and the claim being proved is that the base layers are enough.
**Instead:** a fixture that needs a size takes an inline `.style()` at the call site, where the reader sees it (see `media/page.js` and `table/page.js`). Such a demo is content, not styling, because it describes a fixture, not the page.
**Detail:** [doc/decisions.md](./decisions.md#no-stylesheet--and-one-place-it-nearly-broke)

## Findings are recorded, not shipped

**Decided:** a gap found while documenting an element is written in [`doc/framework-css.md`](./framework-css.md). This module does not change `framework.css`.
**Why:** writing prose about a rule is not a licence to add it; a rule added here skips the ladder and the override test.
**Instead:** fixing the gaps in the same change, which was rejected to keep the reference honest about the file it reads.
**⚠ Code mismatch:** several findings in `framework-css.md` are now out of date. Checked against `public/framework/framework.css`: `audio` and `iframe` are in the replaced-element reset (line 24); `kbd` and `samp` are in the mono `font-family` rule (line 679); `figure` has `margin: 0` (line 35), so the 40px inline margin no longer exists; and the theme input rule excludes `[type="range"]` (line 797). The doc is stale here, not the code; its fixes are not made in this change.
**Detail:** [doc/framework-css.md](./framework-css.md)

## Lives under `styles/`, beside `base/`, `theme/` and `util/`

**Decided:** the module sits at `public/framework/styles/elements/`, next to the layers it documents.
**Why:** the four together are the whole story of `framework.css`, and a reader wanting the layers finds the reference beside them.
**Instead:** placing it beside `View`, where the factories live; rejected because what the pages say is almost entirely CSS (which rule, which value, which layer).
**Detail:** [doc/decisions.md](./decisions.md)

## Checked by hand

**Decided:** the decisions above were checked against `page.js` children, the absence of `.css` files, and the `framework.css` lines cited. The census (`Server/ArchitectureCensus.mjs --decisions`) found no task-log decision lines naming this module, so every entry comes from its own `doc/` and code.
**Why:** a doc that copies a stale claim misleads the next agent; the source is the test.
**Instead:** trusting `framework-css.md` as written, which the ⚠ above shows would be wrong on four points.
**Detail:** [doc/framework-css.md](./framework-css.md)
