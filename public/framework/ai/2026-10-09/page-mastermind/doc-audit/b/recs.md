# core/Page doc audit: minion b recommendations

## columns.md: keep

- why: comprehensive, current, and extensively linked from readme and other docs. Covers width words, even columns, measured tradeoffs, mechanisms, pitfalls, and open questions. No overlaps with other docs.
- linked from: readme.md, decisions.md, findings.md, layout-overview.md, layout.md, markdown.md, method/columns.md, method/crumbs.md, navigation.md, roles.md, watch-out.md, and 35+ AI session requirements files.
- stale: none found. Method names (columns, default_column, etc.), CSS properties (--page-column-flex, --page-column-max), and layout behavior are all current. The 2026-09-24 tuning is the latest state.

## more-features.md: condense

- why: five short feature summaries moved verbatim from the readme; each one is a sketch, not a complete doc. The page.jsonl example references `place()`, which exists but is documented more thoroughly in jsonl.md. The data-children section links to data-children.md which is the real doc. The markdown section repeats material from markdown.md. The related links section mentions related.md but not related-aside.md. The file reads as a transition piece — reminders for the readme, not independent reference.
- into: merge into doc/words.md (the six page words already live there; these five features are the "smaller words" around them), or delete and let jsonl.md, markdown.md, data-children.md, and the related doc pages stand alone, with the readme pointing directly to them.
- linked from: readme.md only, under "Reference" as part of a bullet list.
- stale: none found. The `place()` method, data-children, `md/`, `open_link()`, and `related:` are all current.

## api.md: move or archive

- why: this file is an index of links to `/framework/core/Page/api/child/`, `/framework/core/Page/api/meta/`, etc. — but those routes do not exist as folders. The page.js file (line 118) references these paths and says "the rail already answers `api/<name>/` for every one of these names", implying dynamic routing through Doc's api_section(). However, the links point to nonexistent static directories. The actual docs are at `doc/method/child.md` and `doc/property/meta.md`, which is where the method/ and property/ folders live. This file is a broken pointer to a routing system that either is not yet built, or exists only in page.js's api_section() and never as static pages.
- into: Either (1) delete and let each method/property doc be found via the property/ and method/ folders plus Doc's internal rail renderer, or (2) rewrite to link to the actual `doc/method/` and `doc/property/` pages instead of the nonexistent `/api/` paths. The page.js comment says the rail "answers `api/<name>/`", so the current api.md is aspirational — it will work once routing is built. Until then, it points nowhere.
- linked from: readme.md (line 121, as part of a reference bullet list).
- stale: all links. The paths `/framework/core/Page/api/child/`, etc., do not exist. The actual structure is `doc/method/` and `doc/property/`.

## open.md: keep

- why: clear, concise, and current. Explains the `open_link()` seam and the three cases (navigate, next column, in-place swap), with a live demo and watch-outs. Unique content not covered elsewhere.
- linked from: readme.md (line 113, under "Navigation"), markdown.md, more-features.md, and navigation.md.
- stale: none found. The `open_link()`, `swap_link()`, `md_files()`, `md_dir()`, and `Page.of()` methods and the routing behavior are all current. The swap url pattern (`<page>/md/<doc>/`) and Back button behavior are correct.
