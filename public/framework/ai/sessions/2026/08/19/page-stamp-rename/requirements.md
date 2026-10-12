# page-stamp-rename — `.page-<name>` → `.page--<name>`, site-wide

**Laws first** (CLAUDE.md): less is more — ASAP; clarity is the one exception; prioritize. **Length budget:** the diff is the deliverable; your report is ≤ 10 log lines in `task.jsonl` + the landing line. Load the `code` skill before editing JS.

## Why (the owner, 2026-08-19)

> convert all `.page-<pagename>` to `.page--<pagename>`, so that `.page-previews` doesn't clash with a page named "Previews".

`Page.render()` stamps `page-<name>` on every page's view. Component classes share the prefix (`page-preview`, `page-previews`, `page-link`, `page-title`, `page-catalog-pages`, …), so a page whose directory is `previews/` wears the wall's CSS. A double dash makes a stamp unmistakable.

## Fences

- You own: `core/Page/Page.class.js`, `ext/Doc/Doc.js`, and the selector/stamp edits in any other file EXCEPT `ext/Panel/**` (another session is editing Panel today — `ext/Panel/demo/page.js:108` and `ext/Panel/Workspace/page.js:55` also stamp `"page-" +`: DO NOT EDIT, log them as one follow-up line) and `core/new/**` (a sandbox; leave it).
- Another agent is moving `core/Page/{overview,nav,children,previews,shell,flow}/` → `core/Page/old/…` and editing `core/Page/page.js` RIGHT NOW. If a file is not where grep said, re-grep. Use the **Edit** tool (string replace), never Write a whole file outside your own task dir.

## Steps

1. **Stamp sites.** Find every `"page-" +`, `'page-' +` and `` `page-${ `` in `public/framework/**/*.js` (skip `core/new`, `ext/Panel`). Change each to `page--` (`"page--" + this.name`, `.ac("page--files")`, …). Known: `core/Page/Page.class.js` `render()`; `ext/Doc/Doc.js` ×3 (`section()`, `overview_section()`, `files_section()`); `styles/layouts/page.js` `render()`; find the rest.
2. **Selectors that target a stamp.** Inventory: `grep -rhoE '\.page-[a-z][a-z0-9-]*' public/framework --include=*.css --include=*.js | grep -v core/new | sort | uniq -c`. For each token, find who EMITS it. Emitted by a module as a class string (`div.c("page-preview")`, `.c("page-catalog-pages")`, `page-column-*` from columns.js, `page-content`, `page-frame` …) → **component, keep**. Emitted only by the stamp — i.e. it is a page's directory name (`intro`, `files`, `api`, `docs`, `framework`, `report`, `account`, `notifications`, `optimistic`, `sealed`, `chrome`, `columns`, `vision-browse`, `in-full`?, …) → **stamp, rename the selector** to `.page--<name>`. Ambiguous → keep, and log it. Put the classification in ONE `log` line: `token → stamp|component → files`.
3. **Prose that names the stamp.** Search `*.md` and `page.js` under `public/framework` (skip `core/new`) for prose that says `page-<name>` or "stamps `page-`" — `core/Page/readme.md` (the Watch-out bullet about `previews/`), `core/Page/doc/decisions.md`, `ext/Doc/Doc.js:10` comment, `ext/catalog`, `ext/demo`: update the wording to `page--<name>`; the readme bullet becomes the one-line reason a double dash exists. Minimal.
4. **Verify headless** — never drive the owner's live tabs. Use the `site` MCP tools (`ToolSearch` for `mcp__site__shot` / `mcp__site__eval`; `shot` loads a url in a fresh headless chromium) or Playwright from the scratchpad (script named `page-stamp-rename-probe.mjs`; an import path must be `file:///C:/...`). Load `/framework/core/View/`, `/framework/core/View/api/append/`, `/framework/ext/catalog/`, `/framework/core/Page/` and assert: (a) every `.page` element carries exactly one `page--*` token and no bare `page-<its own name>` token; (b) for every selector you renamed, at least one element matches the NEW selector on the page it was written for, and `getComputedStyle` shows that rule's declaration applied. **Two numbers that must agree:** selectors renamed vs selectors verified. Paste both.
5. Log as you go (`now`, `log` lines). A skill that misled you → one line via `skill-improvement`. `documentation` skill for the readme bullet; land with `finish-task`.
