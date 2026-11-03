# Old branches: 1 landed, 26 superseded, 17 set aside, nothing lost

Run 2026-10-14. 141 branches now have a file missing from michael/dev (the earlier landing check counted 54; the branch list has grown since). Classified by `classify.mjs` (kinds: records = anything under ai/, files.jsonl, png, json, scratch; docs = .md; code = js/mjs/css/skills), then `moved.mjs` asked, for each code/docs file, whether dev has edited it since the branch base. No branch was deleted or rewritten.

## Branches with code or docs missing (44)

| branch | missing | verdict | reason | commit |
|---|---|---|---|---|
| _tmp_cards_and_logs_check | 4 records · 5 docs · 8 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| audio/chat-revision-pairs-wip | 13 records · 2 docs · 10 code | salvage | WIP; its Dictate variants/sheet page is gone from dev, the other 11 files were edited on dev since (2026-09-29). |  |
| michael/bags-misc | 9 records · 0 docs · 4 code | set aside | Four root-level .cjs scratch scripts (assemble, conv, smoke, sub). |  |
| michael/figma-guide | 0 records · 0 docs · 2 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| salvage/qf-3-2026-09-29 | 3 records · 1 docs · 4 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| salvage/qf-3-2026-10-09 | 0 records · 1 docs · 4 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| salvage/qf-6-2026-10-07 | 3 records · 3 docs · 6 code | superseded | Dev edited these files after the branch base (dev: 8 moved, 1 unchanged); salvage/ branches are kept. |  |
| salvage/qf-6-2026-10-10 | 18 records · 0 docs · 6 code | set aside | Absent files are dry-run/merge output .txt; Servex.js and session-cost.mjs were edited on dev since. |  |
| salvage/qf-7-2026-09-29 | 213 records · 0 docs · 1 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| salvage/qf-9-2026-09-29 | 25 records · 5 docs · 7 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| salvage/qf-9-2026-09-30-2 | 1 records · 0 docs · 1 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| salvage/qf-9-2026-09-30-3 | 4 records · 0 docs · 2 code | superseded | ext/Mention on dev has its own architecture.md and a newer Mention.js; registry.js was not kept. |  |
| worktree/ai2-base2 | 30 records · 4 docs · 13 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/ai2-real-pages | 48 records · 0 docs · 3 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/ai2-resurface | 31 records · 4 docs · 12 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/ai2-row-vanish | 31 records · 4 docs · 10 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/ai2-static | 0 records · 0 docs · 4 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/ai2-workspace | 57 records · 2 docs · 7 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/check-consensus | 9 records · 2 docs · 4 code | salvage | Server/check.mjs, consensus.mjs, Servex/agents/check-tools.js are absent from dev and self-contained, but landing registers tools needing a Servex restart and a skill sentence claiming check() auto-runs that nothing wires. Kept on the branch (2026-09-28). |  |
| worktree/dictate-marks | 59 records · 0 docs · 2 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| worktree/dictate-onewidget | 0 records · 1 docs · 0 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| worktree/fix-label | 8 records · 1 docs · 5 code | salvage | Intentionally broken eval fixtures for Servex/ext/openrouter/evals; kept for the evals owner, not a site feature. |  |
| worktree/mobile-nav | 5 records · 2 docs · 5 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/mobile-nav-live | 0 records · 1 docs · 10 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |
| worktree/orphans | 1 records · 2 docs · 4 code | landed | Server/OrphanCheck.mjs + the merge.mjs warning + opt-in `children: "... auto"` were absent from dev; loads, node --check ok, merge smoke clean. Page-word 'auto' is opt-in, nothing uses it yet. | 1d2ebd6d4 |
| worktree/page-system | 11 records · 0 docs · 1 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| worktree/probe-p22vkh | 60 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p25a52 | 59 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p2o2q9 | 59 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p2oo1g | 61 records · 2 docs · 2 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p3wyez | 62 records · 1 docs · 3 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p43vgu | 62 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p44yt9 | 62 records · 1 docs · 3 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p48xwa | 69 records · 3 docs · 3 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p4fv8y | 62 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p4hnh7 | 64 records · 1 docs · 3 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p4lonn | 64 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/probe-p4o7n3 | 62 records · 1 docs · 1 code | set aside | Eval-probe output pages under sandbox/probe/ (generated by openrouter evals); scratch. |  |
| worktree/quick-merge | 63 records · 1 docs · 0 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| worktree/readmeaudit | 4 records · 1 docs · 0 code | superseded | Every touched code/doc file was edited on dev after this branch's base; dev's version is newer. |  |
| worktree/ui-system-clean-land | 1 records · 3 docs · 8 code | superseded | core/System no longer exists on dev: core/Shell is the answer (Shell.js, doc/); the other touched files (app.js, section page.js files) were rewritten since 2026-10-03. Not landed because System.js would re-add a deleted class. |  |
| worktree/ui-system-land2 | 5 records · 5 docs · 9 code | superseded | core/System no longer exists on dev: core/Shell is the answer (Shell.js, doc/); the other touched files (app.js, section page.js files) were rewritten since 2026-10-03. Not landed because System.js would re-add a deleted class. |  |
| worktree/ui-system-land3 | 2 records · 4 docs · 9 code | superseded | core/System no longer exists on dev: core/Shell is the answer (Shell.js, doc/); the other touched files (app.js, section page.js files) were rewritten since 2026-10-03. Not landed because System.js would re-add a deleted class. |  |
| worktree/waiting-on-you | 1 records · 7 docs · 6 code | superseded | ai2 and the drawer rail were rewritten on dev since (every touched file edited after the branch base); only docs/waiting.js/decisions.md are absent, an old design record. |  |

## Records only: nothing to land (97)

Old task logs, `files.jsonl` indexes, screenshots and scratch. Left untouched; the branches stay as the archive.

- follow/clean (1)
- michael/bags-rail (1)
- michael/models-asks (6)
- michael/task-folders (269)
- salvage/qf-1-2026-10-09 (2)
- salvage/qf-1-2026-10-09-2 (1)
- salvage/qf-1-2026-10-10 (1)
- salvage/qf-1-2026-10-11 (1)
- salvage/qf-1-2026-10-12-2 (1)
- salvage/qf-1-2026-10-13-97 (1)
- salvage/qf-1-2026-10-13-98 (1)
- salvage/qf-1-2026-10-13-99 (1)
- salvage/qf-2-2026-09-29 (1)
- salvage/qf-2-2026-09-29-2 (1)
- salvage/qf-2-2026-09-30 (1)
- salvage/qf-2-2026-10-09 (1)
- salvage/qf-2-2026-10-10 (2)
- salvage/qf-2-2026-10-12 (1)
- salvage/qf-2-2026-10-12-2 (1)
- salvage/qf-2-2026-10-13 (9)
- salvage/qf-2-2026-10-13-10 (9)
- salvage/qf-2-2026-10-13-11 (9)
- salvage/qf-2-2026-10-13-12 (20)
- salvage/qf-2-2026-10-13-13 (8)
- salvage/qf-2-2026-10-13-14 (8)
- salvage/qf-2-2026-10-13-15 (7)
- salvage/qf-2-2026-10-13-16 (5)
- salvage/qf-2-2026-10-13-17 (5)
- salvage/qf-2-2026-10-13-18 (5)
- salvage/qf-2-2026-10-13-19 (5)
- salvage/qf-2-2026-10-13-2 (5)
- salvage/qf-2-2026-10-13-20 (5)
- salvage/qf-2-2026-10-13-21 (17)
- salvage/qf-2-2026-10-13-22 (6)
- salvage/qf-2-2026-10-13-23 (4)
- salvage/qf-2-2026-10-13-24 (18)
- salvage/qf-2-2026-10-13-25 (9)
- salvage/qf-2-2026-10-13-26 (2)
- salvage/qf-2-2026-10-13-27 (2)
- salvage/qf-2-2026-10-13-28 (2)
- salvage/qf-2-2026-10-13-29 (3)
- salvage/qf-2-2026-10-13-3 (8)
- salvage/qf-2-2026-10-13-30 (1)
- salvage/qf-2-2026-10-13-31 (2)
- salvage/qf-2-2026-10-13-32 (2)
- salvage/qf-2-2026-10-13-4 (6)
- salvage/qf-2-2026-10-13-5 (4)
- salvage/qf-2-2026-10-13-6 (4)
- salvage/qf-2-2026-10-13-7 (4)
- salvage/qf-2-2026-10-13-8 (4)
- salvage/qf-2-2026-10-13-9 (10)
- salvage/qf-3-2026-10-11 (10)
- salvage/qf-3-2026-10-12 (1)
- salvage/qf-3-2026-10-12-2 (1)
- salvage/qf-3-2026-10-12-3 (1)
- salvage/qf-3-2026-10-13 (1)
- salvage/qf-3-2026-10-13-2 (1)
- salvage/qf-4-2026-09-29 (6)
- salvage/qf-4-2026-09-29-2 (5)
- salvage/qf-4-2026-10-12 (1)
- salvage/qf-4-2026-10-12-2 (1)
- salvage/qf-4-2026-10-13 (1)
- salvage/qf-4-2026-10-14 (1)
- salvage/qf-4-2026-10-14-2 (1)
- salvage/qf-5-2026-10-09 (58)
- salvage/qf-6-2026-09-29 (155)
- salvage/qf-6-2026-09-30 (50)
- salvage/qf-6-2026-09-30-2 (6)
- salvage/qf-6-2026-10-13 (1)
- salvage/qf-6-2026-10-13-2 (1)
- salvage/qf-6-2026-10-14 (1)
- salvage/qf-6-2026-10-14-2 (1)
- salvage/qf-7-2026-10-09 (10)
- salvage/qf-7-2026-10-14-2 (1)
- salvage/qf-8-2026-10-14 (1)
- salvage/qf-8-2026-10-14-2 (1)
- salvage/qf-9-2026-09-30 (12)
- salvage/server-query-builder (6)
- salvage/sessions-layout-old (2)
- worktree-agent-a3c7fdb6298cb9b59 (1)
- worktree/ai2-overview (2)
- worktree/ai2-rhythm (2)
- worktree/cards-and-logs (66)
- worktree/claude-md-consolidate (1)
- worktree/content-list (719)
- worktree/data-grid-4 (1)
- worktree/dictate-without-claude (6)
- worktree/local-ai (77)
- worktree/mentions (56)
- worktree/page-mm (1)
- worktree/prompts-live (71)
- worktree/refine-demo (1)
- worktree/refine-session-log2 (1)
- worktree/refine-v3 (1)
- worktree/relay-2 (1)
- worktree/voice-asks-2 (8)
- worktree/voice-verify (2)
