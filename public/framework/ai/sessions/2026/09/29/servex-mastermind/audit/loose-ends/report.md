# System-design loose ends, 2026-09-22 .. 09-29

| Task | $ | State | Last sign of life | Next step |
|---|---|---|---|---|
| [prompt-refine](/framework/ai/2026-09-29/prompt-refine/) | 47.29 | unlanded | 09-29 15:51, review answered | finish smoke test, merge worktree |
| [recursive-pairs](/framework/ai/2026-09-25/recursive-pairs/) | 29.19 | unlanded | 09-28 14:16, waiting on 3 minions | resume session by its id |
| [waiting-on-you](/framework/ai/2026-09-28/waiting-on-you/) | 14.17 | unlanded | 09-28 14:28, worktree needs-you open | resume, check worktree, land |
| [module-experts](/framework/ai/2026-09-29/module-experts/) | 11.18 | unlanded | 09-29 15:52, review running | finish review, merge, restart |
| [decide-tool](/framework/ai/2026-09-29/decide-tool/) | 10.17 | unlanded | 09-29 15:36, review answered | apply review fixes, merge |
| [page-system](/framework/ai/2026-09-29/page-system/) | 7.69 | unlanded | 09-29 15:52, waiting on 2 merges | wait for merges, then land |
| tooling-gaps | 0 | never-launched | dispatch row 15, no task.jsonl | dispatch it or drop it |
| task-placement | 0 | never-launched | row 16, dispatch called it "LANDED" | verify claim, dispatch or drop |
| harness-spike | 0 | never-launched | row 20, waits on one key file | check if the key file exists now |
| restart-outside-tree | 0 | never-launched | row 28, a real restart bug | dispatch — it's a safety fix |
| node-modules-guard | 0 | never-launched | row 29, crash-loop protection | dispatch — it's a safety fix |
| readme-system | 0 | never-launched | row 31, "next free slot" | dispatch when a slot opens |
| sidebar-structure-study | 0 | never-launched | row 27, brief was card-only | write it a requirements.md |
| [check-consensus](/framework/ai/2026-09-28/check-consensus/) | ? | unlanded | 09-28, took a worktree, stalled | resume, finish or drop |
| [chat-merge](/framework/ai/2026-09-25/chat-merge/) | 0.99 | unlanded (says "landed") | 09-25 15:39 | append the missing landed_at line |
| [chat-ext-extract](/framework/ai/2026-09-24/chat-ext-extract/) | 0.98 | unlanded | 09-24 21:48, "before screenshots" | check state, close or finish |
| [chat-ext-scroll](/framework/ai/2026-09-24/chat-ext-scroll/) | 0.57 | unlanded (says "landed") | no timestamp | append the missing landed_at line |

Non-system (page/visual) tasks left hanging the same way: **1** (mobile-nav, $26.19, still mid-review).

## Three plain findings

1. Six tasks on the dispatch table were never launched at all — no task folder for them exists, not even a start — including two safety fixes for real bugs (a restart that kills every agent, and a crash loop that empties node_modules) and the readme documentation pass.
2. Three sessions (recursive-pairs, waiting-on-you, check-consensus) got stuck mid-worktree on 2026-09-28 and were never resumed, even though the dispatch table already wrote out the exact prompt to resume each one.
3. Three small tasks say "landed" in their own log but never wrote the `landed_at` line the dashboard checks for, so they still show as open work even though nothing is actually left to do on them.

