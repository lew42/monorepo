# The columns: plain flex, no panels, replacing `doc/panels.md` (2026-09-28)

**question → options → weighing → verdict**, as everywhere.

---

## Why ext/Panel came out

The browser used to build its tree, its prose and its source as three
[ext/Panel](/framework/ext/Panel/) leaves inside a `workspace()`. That bought a
drag-to-resize seam, but it also bought two things nobody asked a file browser
for:

- **A second toolbar.** `workspace()` bolts its own management bar onto every
  workspace it builds — add a pane, go fullscreen, a size preset, a zoom
  control, a live pixel-width readout. It's the right bar for `ext/editor`,
  which IS a panel editor. It's not a file-browser control, and it sat right
  above this module's OWN mode-switcher bar, so a reader saw two rows of
  chrome before a single file name.
- **Split, move, close, and a `T` menu of regions** nobody used for a tool
  whose whole job is "show me the tree and the file I clicked."

The owner's own words: "the panel system... is really cluttered and kind of
broken... let's strip the panels out." [audit.md](/framework/ai/2026-09-28/file-explorer-fs/minion-a/audit.md)
has the screenshots.

## What replaced it

| option | why not |
|---|---|
| keep `ext/Panel`, hide its bar with CSS | the bar is `Workspace`'s own markup, not a class this module controls; hiding it would still ship the split/move/close machinery nobody uses |
| a second bespoke panel-like system, just for this module | `ui/controls/study/`'s own finding: three modules already reinvented a multi-pane vocabulary independently; a fourth is the wrong direction |
| **plain flex columns + `ext/grip`** | ✓ |

**Verdict: three (or two) flex children in a row, each with its own
[`ext/grip`](/framework/ext/grip/) strip on its right edge.** `grip`'s whole
contract is a pointer-to-pixel gesture with no opinion on what the number
means — the caller's `write(px)` sets a CSS variable
(`--files-col-w`) that only that one column's `flex-basis` reads, so dragging
a seam resizes the column to its left and nothing else, exactly the
`core/Page` columns' own rule ("only the dragged column changes; whatever is
to its right just slides over" —
[resizable-columns-how-they-work-today](/framework/ai/2026/09/28/resizable-columns-how-they-work-today/)).

## What was lost, on purpose

- **Split / move / close a region.** Nobody used it; the owner called the
  chrome it required "cluttered."
- **The seeded stack-below-640px axis.** A narrow screen now scrolls the row
  sideways instead of stacking the tree above the source — see
  `files.css.md`'s own open item; not yet driven with a pointer.
- **A persisted arrangement.** Was never on (`MemorySaver`, "every visit gets
  the seeded one") — unchanged in spirit, just without a `Panel` document
  underneath it.

## Folders that open and close

New in the same pass, unrelated to the panel removal but built at the same
time because `ext/files/fs.js` (minion B's half of this task) needed it: a
folder past the `open` option's depth renders its own row (so it can be
clicked) but does not build its children until the first click. The chain of
folders holding the *selected* file force-opens regardless of `open`, so a
deep `?file=` link is never hidden. Full record: [tree](./tree.md).

## Open

- **`css-scopes.txt` needs one new line**, `files-      ext/files` (a second
  namespace beside the module's existing `file-`), right after the `file-`
  line. That file is outside this task's write fence — whoever next holds it
  should add the line; the census (`grep -rhoE "\.files-[a-z0-9-]*"
  public --include=*.css --include=*.js`) found no collision.
