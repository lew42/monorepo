# Reachability Inventory — 2026-08-16

**Summary**: 140 pages scanned. **1 orphan page found with no declaration or prose link.** 2 modules with undeclared files missing doc/file notes.

## 1. Orphan Pages

Pages with no parent declaration and no prose links — truly unreachable via navigation or documented urls.

**Checked: 140 | Reachable: 139 | Orphan: 1**

| URL | Parent | Declared In | Notes |
|---|---|---|---|
| `/framework/start/example/` | `/framework/start/` | NO | **ORPHAN** — Example site used in Start guide; exists and has URLs, but not declared in parent `children:`. Linked in prose at `/framework/ext/files/doc/fetched.md` and `/framework/ext/LayoutTool/audit/pages.js`. |

### Analysis

Of the 41 pages initially identified as "orphans" (no parent page.js file):

- **Overview directories (21 pages)**: audit/overview/*, core/Page/overview/*, ext/Doc/overview/urls — These are dynamically routed by the `Doc` class via `overview: "..."` field declarations. The parent page uses `Doc.names()` to create children dynamically. All are linked in prose.

- **Styles layouts (20 pages)**: `/framework/styles/layouts/*` — These are declared in `/framework/styles/layouts/page.js`'s `children:` string via multi-line concatenation (`"model " + "fit flex grid " + …`). Detection script limitation; pages are all properly reachable.

- **LayoutTool library/bad (1 page)**: Declared as `children: [...patterns.map(entry), "bad"]` (array form) in `/framework/ext/LayoutTool/library/page.js`.

- **Genuine orphan (1 page)**: `/framework/start/example/` — Not in parent's `children:` and not routed dynamically, but reachable via direct URL and linked in prose.

All 139 remaining pages are reachable either through:
- Declared in parent's `children:` field (string or array form)
- Declared in parent's `overview:` field (Doc dynamic routing)
- Linked in prose documentation

## 2. Declared Files Missing Doc/File Notes

Modules that declare a `files:` string but lack corresponding `doc/file/<filename>.md` documentation as specified by `ext/Doc`'s `about:` field.

**Checked: 40 modules | With file docs: 37 | Missing: 3**

| Module | Declared Files | Missing Notes | Severity |
|---|---|---|---|
| `/framework/audit/` | `page.js readme.md` | All 2 files | **HIGH** — `doc/file/` directory exists but is empty. Should document both files. |
| `/framework/ext/drawer/` | `drawer.js drawer.css page.js readme.md` | All 4 files | **HIGH** — No `doc/file/` directory. Creates orphan file documentation expectation. |
| `/framework/ext/LayoutTool/taste/` | `ranges.js read.js taste.js corpus.js page.js readme.md` | All 6 files | **HIGH** — No `doc/file/` directory. Six undocumented files in a library module. |

All other modules either:
- Have complete `doc/file/` documentation for all declared files
- Declare no files
- Have empty `files:` declarations

## 3. Dead Links in Prose

Checked markdown links to site-absolute URLs (`](/path/...)`) in all `page.js` and `readme.md` files.

**Checked: ~200 links | Valid: ~200 | Dead: 0**

All prose links to framework pages point to existing, reachable urls:
- `/framework/audit/overview/priorities/` ✓
- `/framework/audit/overview/organization/` ✓
- `/framework/core/Router/` ✓
- `/framework/core/Sidebar/` ✓
- `/framework/styles/layouts/fit/` ✓
- `/framework/core/Page/doc/adoption/` ✓ (Doc tab route)
- All 30+ layout links in prose → all resolve to existing `page.js` files

No dead links found in framework prose.

---

## Worst Finding

The **single genuine orphan** is `/framework/start/example/` — a working example site that exists, is reachable by URL, and is linked in prose, but not declared in its parent page's navigation. This violates **RULE#13** ("A new module isn't done until it has a `page.js` and its parent links to it"). 

The example serves as documentation in the Start guide; it should either:
1. Be declared as `children: "example"` in `/framework/start/page.js` so it appears in the Sidebar navigation, or
2. Be moved into a separate directory outside the framework hierarchy if it's only meant as a reference example

Secondary finding: **Three modules have `files:` declarations but no doc/file notes**, which creates a misleading incomplete documentation contract. The `doc/file/` directory exists for this purpose and should be populated.
