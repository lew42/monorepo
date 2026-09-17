# tools — the three Node scripts that fill the corpus

Run from the repo root. Never in the browser: they drive a headless Chromium and write files.
Playwright is a global install, imported by absolute path in `lib.mjs`.

| command | writes |
|---|---|
| `node public/websites/tools/shoot.mjs <url> <name>` | `site/<name>/400 1280 1920 3440 long.jpg`, and creates or merges `site/<name>.json` with `url`, `title`, `captured_at`, `shots`, `embed` |
| `node public/websites/tools/scan.mjs <url> <name>` | merges `scan` and `responsive.queries` into `site/<name>.json` — landmarks and their computed layout at all four widths, the stylesheets, every media and container query |
| `node public/websites/tools/index.mjs` | `site/index.json` — the manifest the pages read: `sites`, `tags`, and `sections` (every layout id used inside a page, not just as its whole layout). Run it after every shoot, scan or hand-edit |

`lib.mjs` is shared and exports nothing to the browser: the record paths, `read_record` /
`write_record` (merge by whole top-level key, so a re-run never touches the half a person
wrote), `launch()`, `visit()` and the four widths.

What each one measures, and the traps: [`../doc/tools.md`](../doc/tools.md).
The record's fields: [`../doc/schema.md`](../doc/schema.md).
