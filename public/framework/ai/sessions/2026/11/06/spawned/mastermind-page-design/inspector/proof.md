# Proof

## Round 2 (review fixes, 2026-11-06)

| Fix | Result |
|---|---|
| 1. CSS framing | `Inspect.css` added — rows/lists/chips framed like `LivePage.Files` (`item-inspector-list-body`, `-row`, `-methods`, `delta-history-list`); falls back to a plain card color outside `/live/` |
| 2. Cards + sub-pages in the History summary | `DeltaHistory.show()` now lists `content` ("cards") and `pages` rows via the shared `item_list()`, not just counts |
| 3. Proof shows the slider | Full-height shots below, one at line 1 and one at line N, for both pages at both widths |
| 4. Index line | `public/framework/ext/readme.md`'s `## Index` now lists Inspect |
| 5. One method walk | `own_methods()` lives only in `ItemInspector.js` (exported); `live/design/ui/MethodMap.js` imports it and adds its `forwarder` flag on top |
| 6. Heading cards' label | `label_of()` falls back to a part's `text` (truncated) when it has no `title` |
| 7. Skip `_`-prefixed lists | ItemInspector's Inside filters `Object.keys(lists)` to drop `_pages` etc. |
| 8. `$list` capped + scrollable | Log lines now append into `$list` (was a bug: they landed in `$box` instead); `.delta-history-list` is `max-height: 14rem; overflow-y: auto` |
| 9. Settings passes the real class | `LivePage.Settings` now builds `DeltaHistory` with `Class: of.constructor`; `DeltaHistory` uses it instead of guessing from line 1 when given |
| 10 (optional) | Noted in readme's Watch out: Methods lists every method, not only callable ones; no per-method comment (not cheap to recover at runtime) |
| 11 (optional) | `ext/Inspect/page.js` added: a Doc page with a live `ItemInspector` demo over an in-memory sample page |

Verified headless, `/live/plan/settings/`:
- No `_pages (1)` row anywhere (fix 7)
- A part-heading row reads `h0xklxte — Four classes, each one builds on the last` (its text), not just the id (fix 6)
- `.item-inspector-list-body` exists and frames the rows (fix 1)
- `.delta-history-list` computed style: `max-height: 224px`, `overflow-y: auto` (fix 8)
- `/live/design/settings/` (a `DesignPage`, 141 lines, 15 `removed` + 31 `content`): Methods shows `DesignPage (4)` first (its own 4 methods), confirming `Class: of.constructor` is used, not the `Page` fallback (fix 9)

`node --check` clean on all 6 touched/new files. `node public/framework/ext/Inspect/Inspect.test.mjs` passes, 0.13s. `node Server/smoke.mjs . /live/plan/settings/ /live/design/settings/ --base http://localhost:62990` exits 0 (only pre-existing unrelated 404s: `page-work.json`, `tasks.json`, present before this task too).

| Shot | Path |
|---|---|
| plan/settings, 400, line N (all 14 lines) | [proof/plan-settings-400-lineN.png](proof/plan-settings-400-lineN.png) |
| plan/settings, 400, line 1 | [proof/plan-settings-400-line1.png](proof/plan-settings-400-line1.png) |
| plan/settings, 1200, line N | [proof/plan-settings-1200-lineN.png](proof/plan-settings-1200-lineN.png) |
| plan/settings, 1200, line 1 | [proof/plan-settings-1200-line1.png](proof/plan-settings-1200-line1.png) |
| design/settings, 400, line N | [proof/design-settings-400-lineN.png](proof/design-settings-400-lineN.png) |
| design/settings, 400, line 1 | [proof/design-settings-400-line1.png](proof/design-settings-400-line1.png) |
| design/settings, 1200, line N | [proof/design-settings-1200-lineN.png](proof/design-settings-1200-lineN.png) |
| design/settings, 1200, line 1 | [proof/design-settings-1200-line1.png](proof/design-settings-1200-line1.png) |

## Round 1 (initial build)

| Check | Result |
|---|---|
| `node --check` on all 4 new/touched JS files | clean |
| `node public/framework/ext/Inspect/Inspect.test.mjs` | pass, 0.13s (card count 0→1→2→3 as N goes 1→4) |
| Slider at line 1 vs line N (headless, `/live/plan/settings/`) | line 1 → "Nothing listed yet."; line 14 (all) → "content: 11", matching the live page's 11 cards |
| `node Server/smoke.mjs . /live/plan/settings/ /live/design/settings/ --base http://localhost:62990` | exit 0, no console errors (only pre-existing unrelated 404s) |

Commits in worktree `pd-inspect` (branch `worktree/pd-inspect`):
- `6be47d60c` — ItemInspector.js, DeltaHistory.js, Inspect.test.mjs, LivePage.Settings wiring
- `64e86958f` — ext/Inspect/readme.md, public/live/readme.md line
- `095696cb7` — merge of origin/compliance/dev (live-page's round 7/8, no conflicts; Settings wiring survived)
- `1f756a1db` — proof.md and round-1 shots
