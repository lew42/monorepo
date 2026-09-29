# The tree: nesting, the shortened path, and selection

**question → options → weighing → verdict**, as everywhere.

---

## Tabs across the top, or a tree down the side?

- **Tabs** reuse `.tab-bar` and cost no CSS. They cannot show a directory, and
  they run out of room — this module exists partly to show something like
  `about/team/page.js`.
- **A tree** shows nesting, which is the thing being taught.

**Verdict: a tree.** A tab bar is right when the files are peers and there are
four of them, and that case is already served by `Page.tabs()` — a second way
to spell it would be API bloat, not a feature.

## How the display path gets shortened

The files live at `example/app.js` and must read as `app.js`, or the tree
teaches the doc folder's layout instead of the taught site's.

- **An option** (`files(meta, { base: "example/", … })`) — API surface
  forever, and the caller has to say the same directory twice.
- **Strip the longest common directory** — one rule, no options, and it does
  the right thing on every input tried. Adding `example/about/page.js` to the
  set still leaves the common prefix at `example/`, so the tree grows an
  `about/` folder exactly when the author adds a file in one.

**Verdict: strip the common directory**, `common_dir()` in `files.js`.
Segment-wise, never character-wise — a character comparison of `app.js` and
`app2.js` would cut mid-name, so the check compares whole path segments and
only ever cuts at a slash.

## Selection: index into the list, or read it off the row?

The first version matched a clicked row to its path by index into the declared
list. It was wrong in the way that passes every test you'd think to write:
`nest()` groups paths by directory, so tree order is declaration order **until
two paths interleave folders** — `"sub/b.js a.js sub/c.js"` renders
`b.js c.js a.js`, and every click after the first is off by one.

**Verdict: the row carries its own `data-path`.** The leaf of the nested map
holds the fetchable path rather than a placeholder, so the thing that knows the
answer is the thing that is asked. One delegated handler on the panel workspace
reads it off `e.target.closest(".file-name").dataset.path` — never off
`paths[i]`, and never per-row, so a tree the reader splits into a second panel
is wired by the listener that was already there.

## Expand and collapse (2026-09-28)

The verdict above — "these trees run three to six entries by construction, and
a doc example that needs collapsing is too big" — stopped being true the day
`ext/files/fs.js` (minion B's half of this task) started handing this browser
a whole real directory, which can be thousands of paths. A tree that always
renders every row cannot do that without freezing the page.

**A closed folder still gets its own row** — a chevron and a name, so it can
be clicked — **but its children are not built until the first click on it.**
`rows()` takes an `open` depth (default: every level, the old always-open
behaviour) and only recurses into a folder past that depth once its
`.file-dir-name` is clicked, appending the newly built rows into a `.file-dir-
body` that already exists but was empty and `display: none`. Reopening a
folder that was already built (past `open`'s depth, or forced open below)
shows the same rows again — nothing rebuilds twice.

**The chain of folders holding the selected file force-opens**, regardless of
`open`: `tree()` slices the selected path down to the shortened form once and
each level of `rows()` checks whether it is a prefix of that shortened path.
Without this, a caller passing `open: 1` alongside a deep `?file=` link would
show the file selected in the url but nowhere visible in the tree — worse than
the old always-open behaviour, not better. Design record for the removal of
the panel workspace this rode in on: [columns](./columns.md).
