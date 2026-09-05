# tabs-panel — fix brief (Sonnet)

Read first: the repo's `CLAUDE.md` (law 2), `../mastermind-night/requirements.md` (the night's rules), `../../2026-09-04/mastermind-platform/minion-rules.md`, then the proposal you are applying: `../paging-mechanisms-v2/ext-tabs-proposal.md` (the diff for `ext/tabs`), and the working version it came from: `public/imagine/paging/paging.css` (`.paging-tabs .paging-tab-bar .paging-tab .paging-tab-panel`) with `/imagine/paging/mechanisms/swap/` as the reference picture. Skills: `new-task` (this dir, group `paging`), `code`, `css` (read `ext/tabs/tabs.css` and `framework.css`'s layers first), `ui-test`, `documentation`, `finish-task`.

## The owner's words

> the tabs do this well... active tab, active tab content. however, the current underline tabs (with underline becoming orange (--prim) when active..) don't really illustrate their tab content area, it's transparent, and so the link below the tab area stays, but there's no visual boundary between them.

## Deliverables (numbered)

1. **Apply the proposal to `public/framework/ext/tabs/`** so every tab strip on the site shows its panel: the panel is a bounded surface, the selected tab wears the panel's surface and joins it (no line between them), the unselected tabs sit outside. Keep the current underline look reachable by one word on the strip (`.tabs.underline` or whatever the census says — run `new-css-class`), so a page that wants the old look can ask. Every rule in its layer; tokens, not hex; the `css` skill's caveat about the theme's button rule at (0,2,0) applies here too.
2. **Find every user of `ext/tabs`** (`rg -l "ext/tabs" public --glob '*.js'` — the Doc pages are many) and shoot six of them before and after at 1280 and 3440: a `Doc` module page (`/framework/ext/Panel/`), `/framework/core/Page/`, `/imagine/mag/`, one blog post, `/imagine/paging/mechanisms/swap/` (the reference; it has its own classes — say whether it should now drop them for the ext's), and one more. The panel's edge must be traceable in every "after"; nothing overflows; the layout skill's three invariants.
3. **Docs:** `ext/tabs/readme.md` gains the one line (what the panel looks like now, the word for the old look) and `ext/tabs/doc/decisions.md` (if it exists; else the readme) records the change with the date and the owner's sentence.

## Prove it

`ui-test`: click three tabs on a Doc page → the panel rect stays, its content changes, the selected tab's bottom edge matches the panel surface (read both computed background colours). Zero console errors on the six pages at four widths.

## Fences and budget

Write: `public/framework/ext/tabs/` (css, readme, doc), `css-scopes.txt` via the skill, this task dir; optionally `public/imagine/paging/paging.css` + `mechanisms/swap/` ONLY to remove duplicated tab rules now covered by the ext (say so). Never `core/`, `framework.css`, or other exts. Private server only; scratch under `scratchpad/tabs-panel/`; never spawn agents; never `git stash`/commit. Budget ~150k tokens. Report in ≤ 10 lines: the rule as applied, the word for the old look, the six before/after shot paths, the count of tabs users, tokens.
