# `files.js`

The whole module, one file: the exported `files(meta, names, { about, route, fill,
open })` factory, the tree it builds (`tree`, `rows`, `nest`, `common_dir`), the source
pane (`source`), and the url-query bookkeeping (`owns`, `read`, `write`). Until
2026-09-28 the arrangement lived in a second file, `panels.js`, built from
[`ext/Panel`](/framework/ext/Panel/) leaves — stripped out per the owner's call (it read
as "really cluttered", and came with two stacked toolbars neither wanted). Everything
now builds synchronously in one pass; there is no dynamic `import()` left to reason
about.

## The shape: three flex columns, one call

```js
const $box = div.c("files", () => {
	div.c("files-row", () => {
		div.c("files-col files-col-tree", $col => { tree(...); grip({ from: "start", write: … }); });
		if (about) div.c("files-col files-col-about", $col => { …same… });
		div.c("files-col files-col-source", () => { source(meta, state.path); });
	});
}).ac(fill && "files-fill");
```

Two columns without `about`, three with it. Each of the first two carries its own
[`ext/grip`](/framework/ext/grip/) — the seam on ITS OWN right edge, which is what makes
dragging it resize that column and nothing else. `grip`'s `write(px)` sets a CSS
variable (`--files-col-w`) on that column alone; nothing is saved, so every visit gets
the same seeded widths (`files.css`'s `clamp(…)` defaults) — the same trade the deleted
`MemorySaver` made, just without a Panel underneath it.

## The tree: real nesting, lazy past `open`

`nest()` (unchanged) groups the flat, space-separated path list into `{ "file.js":
"full/path", dir: {…} }` — a string leaf is a fetchable path, an object is a directory.
`rows()` walks it and, new as of this rewrite, **keeps every folder past depth `open`
closed and unbuilt**: a closed folder gets its own row (so it can be clicked) but its
children are not constructed until the first click on it. This is what lets
`ext/files/fs.js` (a full directory listing, thousands of paths) hand `files()` an `open:
1` and not pay for the whole tree up front. The chain of folders holding the *selected*
file is force-opened regardless of `open`, so a deep `?file=` link is never hidden
inside a closed folder.

## `source`: an ext leaning on an ext, softly

```js
if (code.file) return code.file(meta, path);
return pre.c("code-block", () => code().append(fetch(...).then(resp => resp.ok ? resp.text() : `Error loading …`)));
```

Unchanged from before. With [`ext/highlight`](/framework/ext/highlight/) loaded
(`app.js` always loads it), `code.file()` fetches, highlights and **caches by href** —
free repaints on every click. Without it, a plain `<pre>`, and this branch DOES check
`resp.ok` (the 2026-08 audit that flagged it missing was checking a copy that had
already been fixed; the doc just hadn't caught up — fixed in this pass).

## The url query, carried over from `panels.js`

`owns()` / `read()` / `write()` are the same claim-and-write dance the deleted
`panels.js` used: only the first `files()` on a page holds `?file=`, everyone else keeps
its selection private. Simplified from the old version because there is only ever one
source column now — no more `file2` / `cols` in the query, since the multi-column
toggle bar (1 column / 2 columns / code + rendered) is exactly what step 2 of this task
deleted.

## Improvements

1. **No loading state.** `files()` builds everything synchronously now (an improvement
   over the old lazy `import("./panels.js")` gap), but the very first `source()` /
   `about()` call can still be a pending fetch with nothing shown meanwhile. A `muted`
   placeholder line would cost three. *(simple, useful)*
2. **The ancestor-force-open walk re-slices `selected` on every recursive call**
   (`to.startsWith(path)`). Fine at the sizes this module runs at; a tree with a very
   deep selected path and thousands of siblings at every level would want that
   precomputed once. *(simple, speculative — not measured as a problem)*
