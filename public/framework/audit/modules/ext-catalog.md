# ext/catalog

`catalog()` is a single `Page.prototype` method — `previews()` turned into a
persistent left rail beside a `$pages` region — and it earns its place
completely: it is the master–detail mechanism behind eight real pages on the
site plus every `Doc` Overview tab, replacing what used to be the same
`flex`/`gap`/`basis` recipe hand-pasted three times. The single most
important thing to do to it is not a code change — it's the one this audit
did: the module had zero `doc/*.md` files and a `page.js` that wasn't a
`Doc`, so the mechanism the whole site's Overview tabs run on was, until
today, the least-documented thing depending on it.

## State

| | |
|---|---|
| files | 4 (`catalog.js`, `catalog.css`, `page.js`, `readme.md`) — no subdirectories |
| lines of JS / CSS | 84 (`catalog.js`) / 113 (`catalog.css`); `page.js` 78, `readme.md` 109 |
| callers | 8 direct (`framework/ui`, `framework/ai`, `framework/styles/sections`, `framework/styles/layouts`, `framework/styles/elements/forms`, `web/nav`, `web/layout`, `core/Page/nav` demo) + 1 structural (`ext/Doc/Doc.js`, which makes every `Doc` Overview tab a caller by inheritance — 8 `Doc` pages today) |
| docs before | `readme.md` existed as a genuinely good, long-form dated design record — but zero `doc/*.md`, so every claim in it was unlinkable prose. `page.js` was a plain `Page`, not a `Doc` — ironic for the module that makes `Doc`'s own Overview tab work, and it meant the module had no Files/API tabs at all. |
| docs after | `page.js` → `Doc` (`subject: Page`, `methods: "catalog"`, `notes: "decisions"`, `files:` all four); `readme.md` restructured to the skill's shape (overview, short sections, a compact Decisions table, Traps, Open, a re-derived caller table); `doc/decisions.md` (the old readme's full narrative, relocated and preserved); `doc/method/catalog.md`; `doc/file/{catalog.js,catalog.css,page.js,readme.md}.md`, each ending in a ranked Improvements list |

## What I changed

- Rewrote `page.js` as `new Doc({ subject: Page, methods: "catalog", … })` —
  since `catalog()` is a method patched onto `Page.prototype` by an ext (core
  never imports an ext), `subject: Page` on *this* page is what makes the API
  tab show the real, currently-patched source with the "replaced at runtime"
  banner `ext/Doc` already knows how to draw. No other module needed to
  change for this to work.
- Overview now opens with the live demo (unchanged in spirit from before),
  then adds a side-by-side wall-vs-rail comparison with the one differing
  line of code underneath — the skill's own prescribed shape for showing a
  variant — and a section making explicit that `overview:` on a `Doc` *is*
  this method, so a reader who came here from the skill sees the closed
  loop.
- Grepped all of `public/` for callers (Step 2). Found and documented 8
  direct call sites and the structural relationship through `ext/Doc/Doc.js`
  that neither the old readme nor the module's own docs mentioned at all.
- Broke the old readme's nine-decision narrative out to `doc/decisions.md`,
  summarized as a 5-row table in the readme, linked, and added to `notes:`.
- Wrote all five missing `doc/*.md` files from scratch, reading the actual
  source (`Page.class.js`'s constructor order, `App.js`'s `loaders`/`ready`
  handshake) rather than paraphrasing the existing comments, to verify two
  candidate "bugs" I found while reading — both turned out to be intentional
  (see Recommendations #1 and the Traps section of `readme.md`) rather than
  real defects. No behavior was changed; nothing needed to be.

## Recommendations

1. **Guard against a double `catalog()` call.** *(simple, useful)* — No
   caller does this today, so the cost of leaving it is zero right now; the
   cost of adding it is one line
   (`if (this.content === screen) return this;` in `catalog.js`). Left
   unfixed, a future page that calls `catalog()` from both its own
   `initialize()` and a mixin/superclass's would silently get a rail nested
   inside a rail instead of an error. `catalog.js`, top of `Page.prototype.catalog`.
2. **Promote `--rail` (19em) and `row-gap` (1.2em) to named tokens.**
   *(simple, useful)* — Both are magic numbers tuned by eye against four real
   catalogs (`catalog.css`); naming them costs nothing today and turns the
   next re-tune into a one-line change instead of a grep. Not urgent — no
   consumer is fighting the default yet.
3. **Link `--rail`'s CSS-side "lit card" fallback to `Page.css`'s real one.**
   *(medium, important)* — `catalog.css` restates `Page.css`'s selected-card
   ring by hand because "a fallback cannot share the selector it falls back
   from." True, but it means a future recolour of the ring in `Page.css` has
   no automated reason to touch `catalog.css`, and the file only says so in a
   comment a future editor has to already be reading. A shared CSS custom
   property for the ring color would remove the duplication without a build
   step.
4. **Outside-the-box: let a catalog show more than one level at once.**
   *(large, speculative)* — Every catalog on the site is exactly one rail
   deep; a child that is itself interesting (say, a single day in `framework/ai/`
   with its own task list) still gets the full-page swap `container()` always
   does. A `catalog()` variant that keeps the *parent's* rail visible while a
   *child's* rail opens beside it — two sticky columns, not one — would need
   nothing new from `previews()` or the CSS grid, just a second `$pages`
   region and a decision about how far "beside" goes on a narrow screen. Filed
   last because it's a real design question, not a bug: the deep-drill
   pattern (`web/nav/drill/`) exists precisely because this was tried before
   and left "still open."

## Where this module overlaps others

**It doesn't overlap `tabs()` or `Editor`/`Panel` — it *composes* with one of
them and is orthogonal to the others.** `catalog()` and `tabs()` are the same
kind of move (a `Page.prototype` patch, an ext, no new component) applied to
two different shapes of the same problem — `tabs()` for ≤10 named things in a
flat or vertical strip, `catalog()` for a set you browse by *looking* at each
one (a live card) rather than by *reading its name*. `Doc` uses both at once:
`tabs()` for its four top-level sections, `catalog()` inside the Overview
section for the rail. Neither should absorb the other; the real overlap
worth naming is narrower: **`ext/Doc`'s `overview_section()` and this
module's `screen()` do first-paint sequencing and default-child selection
twice, in two different vocabularies** (`.tab-panel`'s contract vs.
`.page-catalog-pages`'s), because `Doc` is built on `catalog()` but the CSS
contracts were written before that dependency was as tight as it now is.
Not urgent, but if `Doc` ever grows a second arrangement primitive, the two
default-hide rules should be looked at together rather than as two modules
that happen to agree.

## Skill feedback

**The skill never says what to do when a module has no class and the method
it's documenting is patched onto *someone else's* class.** Every worked
example in the skill (`View`, `md`) documents members that live on the
subject's own prototype. `catalog()` lives on `Page`'s prototype but is
defined and patched by *this* module — `subject: Page` on `ext/catalog`'s
own page turned out to be exactly right (`Doc.declaration()` reads the live
prototype regardless of which file patched it, and the "replaced at runtime"
banner even labels it correctly), but I had to read `Doc.js` line by line to
convince myself that was legal rather than a hack, and the skill gave me no
steer either way. One sentence — *"a patched method may be documented on the
page of the class it patches, `subject: <TheClass>`, even from the patching
module's own `page.js`"* — would have saved that detour and would help the
`ext/tabs` and `ext/highlight` audits too, both in the identical position.
