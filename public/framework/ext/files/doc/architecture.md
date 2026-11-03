# files architecture — real files, fetched, beside the one you clicked

`files(import.meta, names, opts)` in [`files.js`](./files.js) draws a tree of real files on disk next to the source (and optionally prose) of the one selected. It serves pages that teach a directory. The full-screen browser at `<any path>/fs/` is built on it: [`explorer.js`](./explorer.js) (default) and [`fs.js`](./fs.js) (the older shell).

## Files are fetched, never pasted
**Decided:** the source shown is the real file, fetched at view time.
**Why:** string literals rot unchecked, read as a wall, and cannot show structure.
**Instead:** literals (rot); a build-time generator (no build step); a JSON manifest of contents (a hand-kept second copy).
**Detail:** [doc/fetched.md](./doc/fetched.md)

## Example files are not routes
**Decided:** an example `page.js` is shown, never reachable, because a page exists only once its parent's `children:` names it.
**Why:** nothing crawls the filesystem.
**Instead:** register examples as pages (pollutes the site).
**Detail:** [doc/fetched.md](./doc/fetched.md)

## The tree is built from paths, selection by `data-path`
**Decided:** the caller passes flat paths; `nest()` makes the tree, a long common prefix is shortened for display, and a folder past `open` depth builds its rows on first click.
**Why:** callers may hand over thousands of paths.
**Instead:** a caller-built nested structure; building every row eagerly.
**Detail:** [doc/tree.md](./doc/tree.md)

## Plain flex columns with `ext/grip`
**Decided:** tree, optional prose, and source are flex columns resized by `grip`.
**Why:** `ext/Panel` was a heavy dependency for two or three columns.
**Instead:** Panel (the 1/2-column and code-plus-rendered switcher went with it; it can return on request).
**Detail:** [doc/columns.md](./doc/columns.md)

## Prose is a hook, not a built-in
**Decided:** passing `about(path)` adds a middle prose column; without it the widget has two columns.
**Why:** only `ext/Doc`'s Files tab needs prose.
**Instead:** a per-file readme column always on.
**Detail:** [doc/about.md](./doc/about.md)

## `/fs/` is one seam in core, the view lives here
**Decided:** `Page.child()` recognises `fs` and loads `explorer.js` (or `fs.js` for v1), which lists files from `/directory.json`.
**Why:** one seam in core; `directory.json` already lists every file.
**Instead:** a `route()` in every page.
**Detail:** [doc/decisions.md](./doc/decisions.md)

## The explorer shell is a reusable responsive switcher
**Decided:** [`switcher.css`](./switcher.css) is a generic shell (columns on wide screens, a switcher on mobile); the explorer is built on it.
**Why:** other split views need the same behaviour.
**Instead:** explorer-only CSS.
**Detail:** [doc/switcher.md](./doc/switcher.md)

## Line marks live in the url
**Decided:** with `lines: true`, `#L42` / `#L40-L48` scroll to and highlight lines.
**Why:** a line must be linkable and survive reload.
**Instead:** in-memory selection.
**Detail:** [doc/decisions.md](./doc/decisions.md)
