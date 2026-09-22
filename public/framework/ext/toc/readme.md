# toc — this page's own headings as a right-hand nav, current one marked; for any plain reading page

## Use

```js
content(){
	toc();          // first line: places the rail now, scans in a microtask
	h2("One");      // …
}
```

Opt a real component (not an example) out of the scan: `div.c("toc-skip", …)`.

## Watch out

- Only `h2`/`h3` (and `.h2`/`.h3`) outside demos, file trees, rails and `.toc-skip` count — a stat tile's big number is not a section: [`doc/skip-list.md`](./doc/skip-list.md)
- Fixed 2026-09-18: used to show nothing on any `ext/Doc` page (the tab shell mounts `toc()`'s output several levels deep, past `toc.css`'s old `.pages >`-prefixed selector) — dropping that prefix, matching `Page.css`'s own related-aside rule, reaches it at any depth: [`doc/decisions.md`](./doc/decisions.md)
- A hidden page measures every rect at 0,0, so the spy picks the last heading; the scroll listener lives on `.pages`, not `window`: [`doc/decisions.md`](./doc/decisions.md)
- Nothing re-scans — a heading appended later (`md.file()`) is not in the nav; no `h4`: [`doc/decisions.md`](./doc/decisions.md)
- `toc.css` stays ASCII, comments included — a charset-less host double-encodes UTF-8: [`doc/decisions.md`](./doc/decisions.md)
- No minimum heading count — it hides only at exactly zero, never "fewer than three": [`doc/decisions.md`](./doc/decisions.md)

## More

- [Overview](/framework/ext/toc/) — the page, with the walkthrough
- [`doc/skip-list.md`](./doc/skip-list.md) — what the scan excludes, and the two times it earned the opt-out
- [`doc/decisions.md`](./doc/decisions.md) — scan vs declare, the microtask fill, the spy without `IntersectionObserver`, `sticky` vs `fixed`, who calls it, open items
- `doc/file/*.md` — per-file notes, rendered by the page's `files:`
- Files that matter: `toc.js` (scan, spy, fill), `toc.css` (sticky grid track), `page.js` (show, don't tell)
