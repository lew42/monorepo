# Widths — the meter for `styles/layouts/400/`: ten urls read at 400/1280/1920/3440, for anyone checking the width tier holds

## Use

Open [/framework/ext/DesignTool/widths/](/framework/ext/DesignTool/widths/) and press a width button. The same call, from code:

```js
import { measured, finding } from "/framework/ext/DesignTool/library/entry.js";
import urls from "/framework/ext/DesignTool/widths/urls.js";

for (const { label, url, root } of urls)
	console.log(label, finding(await measured(url, 1280, root)));
```

## Watch out

- A perfect row with `—` under `measure`/`used` is a false clean: `frame()`'s `root` fell back to `doc.body` before the app booted — Sections did this once. [doc/decisions.md](./doc/decisions.md)
- A width-tier `/full/` url that renders empty, nothing thrown: the nested `layout()` return lost `.ac("default")`. [doc/decisions.md](./doc/decisions.md)
- Measure the ten urls one at a time; parallel iframes drift the numbers. [doc/decisions.md](./doc/decisions.md)
- A 404 or timeout shows as `error` in its own cell; nothing here throws.

## More

- [doc/decisions.md](./doc/decisions.md) — the ten rows, the `/full/` seam, the 2026-08-15 measured table, and why Sections is F/D not A100.
- Page: [/framework/ext/DesignTool/widths/](/framework/ext/DesignTool/widths/)
- Files: `page.js` (buttons, results table) · `urls.js` (the ten rows, derived) · `../library/entry.js` (`measured`, `finding`)
