# The address is a path, not an index

⚠ **A walk index is not stable across page loads.** A page whose content arrives
asynchronously — a Doc tab, a fetched markdown file — walks in a different
order next visit, and every issue then points at the wrong element. Each node
carries a `:nth-child()` path from the analysis root instead, which is exact,
survives async, and doubles as a human-readable address in the report.

That is what makes `mirror.js` possible: it reloads the page, resolves the
path, and clones the offending element **twice at its own size** — once as it
is, once with the fix applied inline. The whole-page version answers "is it
different"; at 0.5× on a 1280px screen the difference is a few pixels
somewhere. The element answers *what exactly is wrong, and what exactly fixes
it.*

## Two ways to get this wrong

Both cost a real bug, not a hypothetical one — see
[`doc/file/mirror.js.md`](./file/mirror.js.md) and
[`knowledge/false-positives.md`](../knowledge/false-positives.md#an-index-is-not-an-address)
for the incidents:

- A **walk index** shifts under async content, so the same node number points
  at a different element on the next load.
- A **page-relative path resolved against the wrong root** finds a real
  element at the wrong address — silently, because the result still renders as
  a plausible answer. `mirror.js` cloned the sidebar once and captioned it
  "cramped card."

That second failure is why the report carries `root_path` alongside every
issue's `path`: a `:nth-child()` chain is only exact relative to the root it
was walked from, and anything resolving it later — `mirror.js`, a future
tool — has to find that same root first.

## ⚠ Having the root is not enough — the path needs `:scope`

`root.querySelector(path)` does **not** anchor `path` at `root`.
`Element.querySelector` matches its selector against the whole tree and only
then keeps the results that are descendants, so a bare `:nth-child()` chain
finds the first element *of that shape anywhere under the root*, in document
order. The sidebar is near the top of every page on this site, so that is
usually where a floating chain lands.

Measured on 13 pages: **5 of 209 live findings resolved to the wrong element**,
including the top-ranked finding on `/framework/` — the dev rail's before/after
rendered the site's nav rail twice and captioned it a padding fault on
`div.panel-workspace`. `root.querySelector(":scope > " + path)` resolved all
209 correctly.

## The root travels with the report

A caller that still holds the analysed element passes it — `report(data,
{ root })` hands it to `mirror(issue, { root })`, which resolves the path
against that element in this document and clones from it directly. Only a
caller with nothing but a url — the audit page, reporting on a frame that is
long gone — reloads the page and guesses the root back from `root_path`. Two
documents is the fragile path, so it is the fallback, not the default.
