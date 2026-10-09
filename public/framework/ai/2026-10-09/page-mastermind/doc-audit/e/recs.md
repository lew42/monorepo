# Doc audit recommendations

## declaring.md: keep
- why: comprehensive and unique. Covers three distinct jobs (discovery, presentation, laziness) that no other doc addresses. Well-organized and extensively reasoned. The supersession note at line 139 is correctly noted as history, not current guidance.
- linked from: readme.md (line 113) and navigation.md (line 5)
- stale: none found. `depth`, `leaf`, and the lazy-loading pattern are all current. The `.md` file fallback is correctly noted as superseded by `md/` route.

## previews.md: rename or relocate
- why: the file covers "Borrowing a page" (importing and rendering pages elsewhere) — a specific pattern using `import()` and `preview()` / `preview_card()`. But it is linked from layout/readme.md lines 16 and 25 expecting it to cover "how a child looks on its parent's page" and "preview cards" (the `previews()` method). The title and actual content do not match what callers expect. Method docs for `previews()`, `preview()` and `preview_card()` exist separately in `method/`. Layout/readme is pointing to the wrong place.
- into: move to `doc/borrowing-pages.md` or similar, and update the links in `layout/readme.md` to point to `method/previews.md` (for "Previews on the parent") and either `method/preview_card.md` or a new focused doc on card rendering (for "Preview cards").
- linked from: layout/readme.md lines 16 and 25 (incorrectly); findings.md (in the context of card rendering)
- stale: none found. The content is current and the pattern still works.

## watch-out.md: keep
- why: serves its purpose as a quick-reference index of 23 traps, each linked to deeper docs. Well-maintained and accurate. Properly described in readme.md line 121 as "the traps, one line each."
- linked from: readme.md (line 121)
- stale: none found. All 23 linked docs exist and traps are current (verified spot checks on lines 6, 13, 18, 20).

## labels.md: keep
- why: comprehensive and unique. Covers the decision history and current structure of titles, labels, icons and card sizing. Four rounds of reversals are well-documented. No overlap with other docs; property/icon.md is tiny by comparison (28 lines vs 110).
- linked from: readme.md (line 113) and navigation.md (line 6)
- stale: none found. The four-part history and the verdict (icon on the page, not parent) are current. Property/icon.md correctly defers to this file for context.
