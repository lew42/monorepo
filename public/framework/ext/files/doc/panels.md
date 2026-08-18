# The panels: one workspace, three regions, no document

**question → options → weighing → verdict**, as everywhere.

---

## Flex columns, or ext/Panel?

The browser was three flex children with a container query and a media query
deciding when they stacked. It worked, and it answered — badly, at fixed
breakpoints somebody guessed — the one question a reader of a file browser
actually has: *make the source bigger*.

| option | why not |
|---|---|
| keep the flex columns | no resize, and two breakpoints nobody can retune from the page |
| add a drag handle to the flex version | that is a grip, and ext/Panel already has one, plus split, move, close and the bar |
| **regions as ext/Panel leaves** | ✓ |

**Verdict: `workspace({ saver, templates, seed })`** — the same three keys
`ext/editor` builds its five-region shell from, which is the seam ext/Panel
exists to offer. What went with the change: `container-type`, an
`@container (max-width: 56em)`, an `@media (max-width: 40em)`, two
`max-height: 26em`s and four `min-width: 0`s. Every one of them was answering a
sizing question a panel answers by construction.

The owner's scope call, the same day: **every caller**, not just `ext/Doc`'s Files
tab. Keeping the flex version for `/framework/start/` would have left two ways
to spell one browser for the sake of one page's chrome.

## A vocabulary of four, and why `blank` is in it

`REGIONS` is `blank | tree | source | about`, and `workspace()` takes it as its
`templates`, so the `T` menu on every bar offers those four and nothing else —
not the site's twenty-eight section bands, and not `random` (ext/Panel
withholds that from any workspace running its own vocabulary).

`blank` is there because `Panel.defaults.template` is `"blank"`. A reader who
splits a region gets a fresh leaf holding that name, and a name the vocabulary
lacks draws nothing at all and warns to the console. `ext/editor` carries a
`blank` entry for the identical reason.

`about` is added only when the caller passed the hook — a two-region browser
should not offer a third region that would render an empty box.

## The selection lives outside the panels

A panel's `data` is the document ext/Panel persists, and the shown file is not
part of how the room is arranged. So the path is one closure variable, and the
regions read it when they draw.

- **One delegated listener**, on the workspace root, for every tree panel there
  will ever be — including one split off after the fact. The row carries the
  path (`data-path`), so nothing holds a view.
- **The readers are walked, not held.** `root.walk()` finds every leaf whose
  template is `about` or `source` and `repaint()`s it — ext/Panel's own export
  for "a control in one panel redraws another". Two source panels side by side
  both track the selection, and a region the reader closed is simply not there.
- **The tree is not repainted.** Only its mark moves, by class toggle across
  every live tree. Repainting it would rebuild the DOM and throw away the
  scroll position of the row just clicked — the one row the reader is looking
  at.

## Saved nowhere

`new MemorySaver()`, one per call. The alternatives were a saver per module
(a file per module in `/data/`, or a localStorage key each) and one shared
document for every Files tab on the site.

Shared loses outright: `Page` caches its view, so two Files tabs visited in one
session are two live mounts over one document and the last writer wins — which
is ext/Panel's own recorded open issue, not a new risk. Per-module is honest
but answers a question nobody asked: **arranging here is exploring, not
authoring.** A reader drags a seam to see more of a file, not to keep a room.

**Verdict: nothing is written anywhere.** Every visit is the seeded one.

## The axis is seeded, never queried

ext/Panel decided that **a split holds its axis at every width** — `dir` is the
user's answer, not the viewport's — and offered the escape hatch: per-width
fidelity is a seed chosen at roll time. So `seed()` reads `window.innerWidth`
once and lays a column below 640px, a row above it, and a stacked tree claims
more of the block than a column of it claims of the row (one share left the
list 82px tall — under three files of it — measured on a 390px viewport).

The cost is stated in the readme's *Open*: a browser seeded wide and dragged
narrow keeps its columns. That is the same trade every workspace on the site
makes, and the reader has a grip.

## `panel-controls` on the tree, and only the tree

The bar floats **over** the top of a panel and lights on hover, so a payload
whose top edge is interactive has to say so — `panel.css` answers the class by
padding the body with `--panel-bar-h`, the same token the bar is sized by.

The tree's first row is a click target, so it says so. The prose and the source
abstain, for the reason `ext/editor`'s canvas does: they are documents, read
with the pointer somewhere else. This was found by driving the thing, not by
reading it — the bar sat on `Doc.js`, the first file in every module's list.
