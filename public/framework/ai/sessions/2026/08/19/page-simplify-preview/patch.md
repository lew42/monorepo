# patch — the opt-in grid, exact

Previewing [`../page-layout-audit/proposal.md`](../page-layout-audit/proposal.md) §5. This is what "yes" applies — not applied here. The 5 Page.css rules are in [`patch.css`](patch.css); everything else is below.

## The 5 `--measure: none` → `100%` lines

`none` breaks `min(none, …)` silently; `100%` reaches the same "no cap" and lets a region's `--measure` finally inherit into its pages (proposal.md §5, "Dodging the `min(none)` trap").

| file:line | before | after |
|---|---|---|
| `ext/tabs/tabs.css:68` | `.tab-panel { padding-top: 3em; min-width: 0; --measure: none; --page-pad: 0; }` | `.tab-panel { padding-top: 3em; min-width: 0; --measure: 100%; --page-pad: 0; }` |
| `ext/demo/app.css:58` | `--measure: none; --page-pad: 1.2em;` | `--measure: 100%; --page-pad: 1.2em;` |
| `ext/DesignTool/DesignTool.css:77` | `.page.dt-page { --measure: none; --page-pad: 2.5em clamp(1.5em, 3%, 3.5em); }` | `.page.dt-page { --measure: 100%; --page-pad: 2.5em clamp(1.5em, 3%, 3.5em); }` |
| `styles/layouts/layouts.css:19` | `--measure: none; --page-pad: 1.5em;` | `--measure: 100%; --page-pad: 1.5em;` |
| `ext/Doc/Doc.css:14` | `--measure: none;` | `--measure: 100%;` |

## The 2 deletions (+ 1 that stays)

| file:line | rule | verdict |
|---|---|---|
| `Page.css:112` | `.page.solo { align-self: stretch; overflow: auto; min-height: 100%; }` | **deleted** — 0 call sites site-wide (proposal.md §5) |
| `Page.css:240` | `.page.full { --gutter-x: 0px; --pad-y: 0px; }` | **deleted** — "no gutters" is not having the grid, once it's opt-in |
| `Page.css:241` | `.page.fill { align-self: stretch; overflow: auto; min-height: 100%; }` | **unchanged** — height/scrolling is orthogonal to the grid |

## The 7 call sites that gain `standard`

Every page that opted out with its own `classes:` but still wants the grid. (`Doc.js:220`, the module root's own `page doc-page`, is **not** one of the 7 — `Doc.css:11` already sets `display: flex`, so `standard`'s `display: grid` would never win there; adding the word would be a no-op.)

| file:line | before | after |
|---|---|---|
| `ext/Doc/Doc.js:52` | `div.c("page doc-section", () => this.tabs().ac("vertical"))` | `div.c("page standard doc-section", () => this.tabs().ac("vertical"))` |
| `ext/Doc/Doc.js:76` | `div.c("page doc-section", () => this.content())` | `div.c("page standard doc-section", () => this.content())` |
| `ext/Doc/Doc.js:103` | `div.c("page doc-section doc-files", () => doc.browser())` | `div.c("page standard doc-section doc-files", () => doc.browser())` |
| `ext/DesignTool/audit/page.js:33` | `classes: "dt-page",` | `classes: "standard dt-page",` |
| `ext/DesignTool/audit/taste/page.js:16` | `classes: "dt-page",` | `classes: "standard dt-page",` |
| `ext/DesignTool/vision/page.js:11` | `classes: "dt-page",   // full width WITH a gutter; .page.full would zero it and strand the title` | `classes: "standard dt-page",   // full width WITH a gutter; .page.full would zero it and strand the title` |
| `ext/DesignTool/library/entry.js:27` | `classes: "dt-page",` | `classes: "standard dt-page",` |

## A discrepancy, resolved

proposal.md §5 point 2 quotes the Doc.js edit as `c("page doc-page")` → `c("page standard doc-page")` and counts it "×3" — but that literal string exists exactly **once** in Doc.js (line 221, the root render, which is excluded above). The three real edits are the `"page doc-section"` sites at lines 52, 76, 103 — confirmed against `Doc.css:65 .doc-section { --pad-y: 1.5em; }`, which (unlike `.doc-page`) never sets `display`, so it's the one relying on `.page`'s grid. 3 + 4 (`dt-page`) = the 7 the proposal totals. Table above reflects the resolved reading, not the literal quote.
