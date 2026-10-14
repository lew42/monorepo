# Landing audit: every michael/* and worktree/* branch ahead of michael/dev, checked by file content

90 branches, 55 with any missing file, 37 with missing code/doc files, **8 real findings** (missing code/doc files and the task has a landing line).

## Real findings

| branch | task | code files missing |
|---|---|---|
| worktree/ai2-real-pages | [ai2-real-pages](/framework/ai/sessions/2026/09/25/546c308f-a944-4905-95a1-68d84991524f/ai2-real-pages/) | 10: public/app.js, public/framework/ai/2026-09-25/servex-mastermind/dispatch.md, public/framework/ai/2026-09-28/collab-rounds/collab-format.md, public/framework/ai/2026-09-28/commit-live-system/requirements.md … |
| worktree/ai2-row-vanish | [ai2-row-vanish](/framework/ai/sessions/2026/09/25/546c308f-a944-4905-95a1-68d84991524f/ai2-row-vanish/) | 17: public/app.js, public/framework/ai/2026-09-25/quickfix-worktrees/pool/proof.mjs, public/framework/ai/2026-09-25/recursive-pairs/requirements.md, public/framework/ai/2026-09-25/servex-mastermind/dispatch.md … |
| worktree/ai2-workspace | [ai2-workspace](/framework/ai/sessions/2026/09/25/546c308f-a944-4905-95a1-68d84991524f/ai2-workspace/) | 17: public/app.js, public/framework/ai/2026-09-25/recursive-pairs/interface.md, public/framework/ai/2026-09-25/servex-mastermind/dispatch.md, public/framework/ai/2026-09-28/collab-rounds/collab-format.md … |
| worktree/local-ai | [local-ai](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/) | 1: public/framework/ai/page.js |
| worktree/mentions | [mentions](/framework/ai/sessions/2026/09/30/mentions/mentions/) | 2: public/framework/ai/2026-09-30/mentions/build/requirements.md, public/framework/ai/2026-09-30/mentions/owner-words.md |
| worktree/mobile-nav | [mobile-nav](/framework/ai/sessions/2026/09/29/mobile-nav/mobile-nav/) | 8: .claude/skills/every-prompt/page-assistant.md, public/framework/ai/2026-09-29/voice-sheet/requirements.md, public/framework/ext/drawer/menu.js, public/framework/ext/drawer/rail.css … |
| worktree/page-system | [page-system](/framework/ai/sessions/2026/09/29/f5150091-9c1e-4500-90b0-7313b19a36a9/page-system/) | 3: public/framework/ai/2026/09/25/cards-that-show-the-thing/about.md, public/framework/ai/2026/09/25/route-test/about.md, public/framework/ai2/card.js |
| worktree/quick-merge | [quick-merge](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) | 1: .claude/skills/minion/improvements.md |

## All branches

| branch | ahead | files changed | missing (all) | missing code/doc | task landed | verdict |
|---|---|---|---|---|---|---|
| michael/bags-misc | 1 | 13 | 13 | 4 | - | MISSING |
| michael/bags-rail | 1 | 1 | 1 | 0 | - | logs only |
| michael/figma-guide | 1 | 5 | 2 | 2 | - | MISSING |
| michael/models-asks | 1 | 6 | 6 | 0 | - | logs only |
| michael/property-of | 4 | 8 | 0 | 0 | - | landed |
| michael/task-folders | 1 | 283 | 269 | 0 | - | logs only |
| worktree/ai2-base2 | 2 | 580 | 47 | 22 | - | MISSING |
| worktree/ai2-overview | 1 | 7 | 2 | 0 | yes | logs only |
| worktree/ai2-real-pages | 2 | 1008 | 51 | 10 | yes | MISSING |
| worktree/ai2-resurface | 5 | 589 | 47 | 21 | - | MISSING |
| worktree/ai2-rhythm | 3 | 13 | 2 | 0 | - | logs only |
| worktree/ai2-row-vanish | 3 | 682 | 45 | 17 | yes | MISSING |
| worktree/ai2-static | 1 | 7 | 4 | 4 | - | MISSING |
| worktree/ai2-workspace | 3 | 913 | 66 | 17 | yes | MISSING |
| worktree/architecture-md | 18 | 42 | 0 | 0 | - | landed |
| worktree/cards-and-logs | 12 | 307 | 66 | 0 | yes | logs only |
| worktree/check-consensus | 4 | 15 | 15 | 9 | no | MISSING |
| worktree/claude-md-consolidate | 1 | 1 | 1 | 0 | yes | logs only |
| worktree/clean-test-page | 5 | 8 | 0 | 0 | yes | landed |
| worktree/collab-facts | 9 | 90 | 0 | 0 | yes | landed |
| worktree/collab-rounds | 9 | 187 | 0 | 0 | yes | landed |
| worktree/content-list | 1 | 719 | 719 | 0 | yes | logs only |
| worktree/data-grid | 12 | 19 | 0 | 0 | yes | landed |
| worktree/data-grid-4 | 1 | 1 | 1 | 0 | - | logs only |
| worktree/design-code | 8 | 84 | 0 | 0 | yes | landed |
| worktree/dictate-marks | 1 | 239 | 61 | 2 | - | MISSING |
| worktree/dictate-onewidget | 3 | 8 | 1 | 1 | - | MISSING |
| worktree/dictate-without-claude | 1 | 49 | 6 | 0 | yes | logs only |
| worktree/dictate-workbench | 14 | 10 | 0 | 0 | - | landed |
| worktree/drawer-close | 1 | 3 | 0 | 0 | no | landed |
| worktree/dup-bubbles | 7 | 25 | 0 | 0 | - | landed |
| worktree/figma-roundtrip | 4 | 16 | 0 | 0 | - | landed |
| worktree/file-system | 17 | 38 | 0 | 0 | yes | landed |
| worktree/fix-label | 5 | 21 | 14 | 7 | - | MISSING |
| worktree/fixer | 4 | 19 | 0 | 0 | yes | landed |
| worktree/follow-tail | 2 | 4 | 0 | 0 | - | landed |
| worktree/framework-home | 19 | 28 | 0 | 0 | yes | landed |
| worktree/fresh-eyes-review | 8 | 7 | 0 | 0 | yes | landed |
| worktree/grip-everywhere | 5 | 8 | 0 | 0 | no | landed |
| worktree/inspect | 5 | 23 | 0 | 0 | yes | landed |
| worktree/layout-check | 1 | 4 | 0 | 0 | yes | landed |
| worktree/layout-gate | 1 | 3 | 0 | 0 | yes | landed |
| worktree/local-ai | 16 | 277 | 77 | 1 | yes | MISSING |
| worktree/mentions | 1 | 244 | 56 | 2 | yes | MISSING |
| worktree/mobile-nav | 3 | 12 | 12 | 8 | yes | MISSING |
| worktree/mobile-nav-live | 4 | 17 | 11 | 11 | - | MISSING |
| worktree/one-dictation | 9 | 10 | 0 | 0 | yes | landed |
| worktree/onewidget-serve | 4 | 8 | 0 | 0 | - | landed |
| worktree/orphans | 2 | 202 | 7 | 6 | - | MISSING |
| worktree/page-extends-item | 19 | 102 | 0 | 0 | yes | landed |
| worktree/page-inbox | 1 | 12 | 0 | 0 | yes | landed |
| worktree/page-mm | 1 | 1 | 1 | 0 | - | logs only |
| worktree/page-system | 7 | 13 | 12 | 3 | yes | MISSING |
| worktree/part-link-run | 1 | 4 | 0 | 0 | yes | landed |
| worktree/probe-p22vkh | 1 | 240 | 62 | 2 | - | MISSING |
| worktree/probe-p25a52 | 1 | 239 | 61 | 2 | - | MISSING |
| worktree/probe-p2o2q9 | 2 | 239 | 61 | 2 | - | MISSING |
| worktree/probe-p2oo1g | 2 | 243 | 65 | 4 | - | MISSING |
| worktree/probe-p3wyez | 3 | 245 | 66 | 4 | - | MISSING |
| worktree/probe-p43vgu | 1 | 242 | 64 | 2 | - | MISSING |
| worktree/probe-p44yt9 | 1 | 245 | 66 | 4 | - | MISSING |
| worktree/probe-p48xwa | 3 | 254 | 75 | 7 | - | MISSING |
| worktree/probe-p4fv8y | 1 | 242 | 64 | 2 | - | MISSING |
| worktree/probe-p4hnh7 | 1 | 246 | 68 | 4 | - | MISSING |
| worktree/probe-p4lonn | 1 | 244 | 66 | 2 | - | MISSING |
| worktree/probe-p4o7n3 | 1 | 242 | 64 | 2 | - | MISSING |
| worktree/prompts-live | 1 | 289 | 71 | 0 | yes | logs only |
| worktree/property-of-serve | 7 | 8 | 0 | 0 | - | landed |
| worktree/proposal-flow | 5 | 6 | 0 | 0 | yes | landed |
| worktree/quick-merge | 1 | 245 | 64 | 1 | yes | MISSING |
| worktree/quickfix-worktrees | 14 | 14 | 0 | 0 | yes | landed |
| worktree/readmeaudit | 2 | 198 | 5 | 3 | - | MISSING |
| worktree/refine-demo | 1 | 1 | 1 | 0 | yes | logs only |
| worktree/refine-session-log2 | 1 | 1 | 1 | 0 | - | logs only |
| worktree/refine-v3 | 1 | 1 | 1 | 0 | yes | logs only |
| worktree/relay-2 | 1 | 1 | 1 | 0 | yes | logs only |
| worktree/review-turns | 22 | 19 | 0 | 0 | yes | landed |
| worktree/sessions-next | 1 | 3 | 3 | 3 | - | MISSING |
| worktree/sessions-tab-polish | 12 | 7 | 0 | 0 | yes | landed |
| worktree/sheet-regression | 3 | 13 | 0 | 0 | no | landed |
| worktree/slow-card-fix | 3 | 5 | 0 | 0 | yes | landed |
| worktree/source-library | 11 | 66 | 0 | 0 | yes | landed |
| worktree/ui-system-clean-land | 8 | 12 | 12 | 11 | - | MISSING |
| worktree/ui-system-land2 | 12 | 19 | 19 | 14 | - | MISSING |
| worktree/ui-system-land3 | 12 | 15 | 15 | 13 | - | MISSING |
| worktree/voice-asks-2 | 1 | 8 | 8 | 0 | yes | logs only |
| worktree/voice-fixes | 4 | 19 | 0 | 0 | - | landed |
| worktree/voice-verify | 1 | 2 | 2 | 0 | yes | logs only |
| worktree/vscode-session-cost | 2 | 5 | 0 | 0 | yes | landed |
| worktree/waiting-on-you | 3 | 14 | 14 | 13 | no | MISSING |
