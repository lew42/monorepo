# Page overview demos — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Fourteen live `Page` trees, simplest first — **the rail of the
[Page overview](/framework/core/Page/)**. One directory each, flat under
`overview/`, so a demo you are looking at is a `page.js` you can find in one hop:

```
overview/<name>/page.js    the tree, then `export default new Page(demo.tree({…}))`
```

The order is one string — `overview:` in `core/Page/page.js`. The three headings
are not in it: each demo declares its own `group:`, and `previews()` heads every
run of one. The card in the rail **is** the tree at half size; the page is the
one detail assembly every catalog on the site now uses — the tree on a stage, a
layout bar wired to the page it is showing, and **the tree function's own source**
open beneath, with `page.js` linked beside the summary
(`demo.exhibit()`, `ext/demo/doc/record.md` §15).

| group | demos |
|---|---|
| Basics | `page` `children` `add` `labels` `route` `shapes` |
| Arrangements | `wall` `catalog` `dashboard` `strip` `deep` |
| Sites | `landing` `docs` `site` |

`demo.tree()` and `demo.app()` both live in `ext/demo/` — they were born here and
moved, per the five-block census. Their record is `ext/demo/doc/record.md` (§11, §15).

## Decisions

**A directory per demo.** They were three files of exported tree functions
(`basics.js`, `arrangements.js`, `sites.js`) assembled by a `demos.js` array —
and browsing the rail, the first question was always *where is this one defined*.
Fourteen inline configs in three files answer that with a search; fourteen
directories answer it with the url — and `page.js`, linked beside the source, is
one hop from the demo you are looking at.

| option | weighing |
|---|---|
| keep the array, add a source per demo | the file printed would still be one of three, and the reader has to find the tree in it |
| a directory per demo, named by url | ✓ url = path = source, and `children:` already auto-imports names |
| a directory per *group*, demos inside | urls get a level nobody asked for (`/overview/basics/page/`) for three headings |

**The source shown is the `tree` function, not the file.** the owner, 2026-08-12: the
file view *"is clear and good, except for a newcomer the extra imports and
`export default new Page(demo.tree())` is all quite confusing."* So the harness —
`meta`, `group`, `rail`, `height`, the `export` — no longer prints, and what is
left is exactly the tree the demo teaches. Two consequences worth knowing:

- **A comment inside the tree function is documentation** — it prints. A comment
  above it is a maintainer's note and does not. The `// the rail: one link per
  child` in `labels/` is there on purpose.
- **Imports do not print.** `landing` and `site` call `hero("dark")` with the
  import off-screen, so both say in prose (or in one printed comment) where the
  bands come from. The file link carries the rest.

**Every displayed source must contain the thing the card promises.** `labels`
failed this outright — it rendered a left rail it got from `rail: true`, a
*harness* flag, so the code said nothing about the one visible arrangement on
the page. It now builds the rail itself out of `nav_for()`, which is also the
demo's actual subject; `rail: true` is gone from it. The four demos that still
take `rail: true` (`shapes`, `deep`, `docs`, `site`) claim nothing about rails —
there it is box chrome, like the url strip.

**Code as a lesson is formatted like documentation.** the owner, on the inline object
children the demos used to be written with: they *"make it harder to see the
structure. when the code is a lesson, use a new line and indentation after each
object literal and fn `{}`."* So every child literal in these fourteen files is
one property per line — longer files, and the only version of them a reader ever
sees is the one on the page.

**Categories before specifics.** Fourteen near-identical cards in one flat rail
read as a list of nothing. `previews()` now emits an `h4` whenever a child claims
a `group` different from the one before it — the same kind of claim `card:` is,
made by the child, read by whatever wall it turns up in. It is *one* arranger
still: same `previews()`, same `.page-preview`, no second card shape and no
second rail. `walls()` was the other candidate and does not fit — its rung
headings are *child pages*, which is the extra url level rejected above.

**Every demo is a different little site.** All fourteen used to be `/web/`, so
every thumbnail said "Web" and the rail was fourteen identical grey rectangles.
Each root now has its own short name — `Hello`, `Web`, `Manual`, `Guide`, `Wiki`,
`Studio`, `Shelf`, `Parts`, `Admin`, `Feed`, `Handbook`, `Nimbus`, `Docs`, `Acme`
— which is also the url (`Page.slug`), so the crumb strip differs too. What the
trees *teach* is unchanged; only the sign over the door.

**The prose lives inside the tree.** A note above the demo pushed the source and
the render down by a different amount on every page, so the pair jumped as you
walked the rail. The page is title, then the render — nothing else — and each
lesson renders inside the mini site's own pages, where it reads at the moment it
applies ("click one", "drag the handle") and prints as part of the source.
`demo.tree()` still takes a `note:`, captioned *below* the source where it cannot
move anything; no demo needs one yet. ⚠ Prose written inside the tree prints with
it — which is the point, and also why it has to read as part of the lesson rather
than as a caption about it.

**Titles derive from names.** A demo is called what its url is called — `page`,
`children`, `add`, `route`, `site` — one word, one line of `h1`, the same
vertical position on every demo page.

**One title per surface.** That `h1` is the **lesson's** name, and it used to
compete with the specimen's: `labels` above a box whose first line was a
40px "Guide". The specimen's name now lives only in the box's own chrome — the
url strip (`/guide/`), and the rail's first entry where there is one. In a
**card** it stays a heading, because a thumbnail is the sign over the door and
naming all fourteen roots differently is what stopped the rail reading as
fourteen grey rectangles. Mechanism: `ext/demo/doc/record.md` §15.

**One idea per demo, and the order reads without opening anything.**

| | |
|---|---|
| `page` → `children` → `add` | a page, then children, then children added later |
| `labels` → `route` → `shapes` | what a menu calls a page; a page nobody declared; the shape a page wears |
| `wall` → `catalog` → `dashboard` → `strip` | four ways a parent shows the children it has |
| `deep` | all of it at once, opened three levels down |
| `landing` → `docs` → `site` | a page of bands, a documentation site, and both together |

The rule bought two edits. **`icon:` left `children` and `add`** — it arrived
three demos before `labels`, the demo whose whole subject is `label` and `icon`.
And **`everything` is `deep`**: it was named for being the finale, three demos
before the end, and what it actually shows is one tree opened deep.

**The top end is three whole sites, because that is where the questions were.**
The eleven answered *how does a tree work*; nobody had shown what a `Page` tree
looks like when it is a **site**. `landing` is one page that is a stack of bands;
`docs` is a rail, four prose pages and a reading order; `site` is both, two levels
deep, with pages of its own.

**The bands are imported from `styles/sections`, not copied.** They are
`tone => view` functions with no argument but their tone, which is exactly what a
demo needs: `hero("dark")` inside a capture callback *is* the band. Copying would
mean a second, worse `sections/` — and the demo would stop being evidence. The
import lines are the one thing the printed definition loses, so `landing` says
where the bands come from in its own prose and `site` says it in a comment inside
the tree.

**Hand-built trees, not `ext/demo/sample.js`.** Here the *source is the lesson*, and
a source that opens with an import teaches the import. The prebuilt `sample()` stays
for pages that just need *a tree* — `ext/catalog`, `ext/demo`'s own page, the
Page `nav` page, the AI logs.

**The sliders are gone.** `core/Page/page.js` carried a two-knob tuner for
`--rail` and the thumb zoom while the rail was being fitted. The settled values
are the defaults now — `--rail: 19em` (`ext/catalog/catalog.css`) and `zoom: 0.5`
on the demo app inside a card (`ext/demo/exhibit.css`), which lays a site out at 36em
and shows it at 18em. Revisable, but by editing one number in the file that owns
it, not by a rig shipped on a doc page.

## Traps

- **A demo tree must not name children as a string.** `children: "a b"` is a
  filesystem declaration and probes the server. Object children, real `Page`s,
  or `add()` — and the root needs no url line: `title: "Shelf"` derives `/shelf/`
  (`Page.slug`), and adoption would overwrite it anyway (`move()`).
- **The tree is a function, not a `Page`.** A `Page` caches its `view`, so the
  card's copy and the stage's copy would fight over one DOM node — and a function
  is the only thing that can be stringified, which is what the page prints.
- **A url written into a demo's prose has to match its root.** The trees link and
  quote their own addresses (`/manual/css/layout/`); `demo.app` only intercepts
  urls under its root, so a stale `/web/…` link would navigate the real site.
  `route` builds its links from `this.url` for exactly that reason.
- **Half the bands return nothing.** `hero`, `features`, `pricing` and `footer`
  are `tone => { section(…) }` — they append into the captor and hand back
  `undefined`, where `logos`, `faq` and `callout` return the band. So
  `hero("dark").ac("bleed")` throws: never chain on the call, wrap the stack —
  `div.c("bleed", () => { hero("dark"); … })`.
- **Every page renders its `h1`** — `Page.render()` has no opt-out, and
  `classes: "full"` only moves it flush into the corner (`sections/readme.md` §2).
  A demo app on a **stage** hides its ROOT's title in CSS (`.demo-app-root`), which
  is why `landing` opens on a hero rather than on the word "Nimbus"; every other
  page in every tree still prints its own. The demos keep the default `standard`
  shape: prose stays in the measure, the bands take the `bleed` track.
- **Never `--measure: none` on a `.page.standard` retune.** The template's
  `min(var(--measure), …)` is invalid at computed-value time with `none` and
  silently drops the WHOLE template. The fix and the warning live in
  `ext/demo/app.css`.
- **Nothing is built after an `await`.** Every builder here is synchronous;
  `demo.stage` and `preview_card` both take capture callbacks.
- **The thumb is inert** (`pointer-events: none`), so the demo app in a card is a
  picture that happens to be alive. The invisible overlay link is the only
  interactive thing in it.
