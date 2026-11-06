# Proof

| Check | Result |
|---|---|
| `node --check` on all 4 new/touched JS files | clean |
| `node public/framework/ext/Inspect/Inspect.test.mjs` | pass, 0.13s (card count 0→1→2→3 as N goes 1→4) |
| `/live/plan/settings/` at 400 | [proof/plan-settings-400.png](proof/plan-settings-400.png) — Inside (11 content cards + 1 sub-page), Methods, Fields, slider |
| `/live/plan/settings/` at 1200 | [proof/plan-settings-1200.png](proof/plan-settings-1200.png) |
| `/live/design/settings/` at 400 | [proof/design-settings-400.png](proof/design-settings-400.png) |
| `/live/design/settings/` at 1200 | [proof/design-settings-1200.png](proof/design-settings-1200.png) |
| Slider at line 1 vs line N (headless, `/live/plan/settings/`) | line 1 → "Nothing listed yet."; line 14 (all) → "content: 11", matching the live page's 11 cards |
| `node Server/smoke.mjs . /live/plan/settings/ /live/design/settings/ --base http://localhost:62990` | exit 0, no console errors (only pre-existing unrelated 404s: `page-work.json`, `tasks.json`) |

Commits in worktree `pd-inspect` (branch `worktree/pd-inspect`):
- `6be47d60c` — ItemInspector.js, DeltaHistory.js, Inspect.test.mjs, LivePage.Settings wiring
- `64e86958f` — ext/Inspect/readme.md, public/live/readme.md line
- `095696cb7` — merge of origin/compliance/dev (live-page's round 7/8, no conflicts; Settings wiring survived)
