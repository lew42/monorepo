<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Test  tests run on save  WorktreeWatch  and at merge  merge mjs  and report only a pass to fail change" (words: core, test, run, save, worktreewatch, merge, mj, report, only, pas, fail, change)

## Tasks (8, best first)
- 2026-09-30 [probes.mjs: score a model's probe run on six fixed checks, label a/b/…](/framework/ai/sessions/2026/09/30/probe-tasks/runner/) — Built Servex/ext/openrouter/evals/probes.mjs per probes.md/probes.json's design, and ran it for real. --dry-run prints model/probe/prompt/dir and spawns nothing — shown for page-blog and log-line. One real run each of page-blog and log-line on claude-haiku-4-… · paths 1/1 exist
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [updates: a cloud agent gets only what changed since its last call](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/updates-tool/) — updates tool landed and merged (restart Servex to go live). one tool updates, a cursor per caller, peek, cap 50 with more: External.updates(), test Servex/ext/remote/RemoteMCP.test.mjs passes one sentence in RemoteMCP.INSTRUCTIONS, plus follow({path, agent:"v…
- 2026-10-13 [asks tally re-run: what changed today](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/asks-tally-rerun/) — Page /framework/ai/doc/asks-outcomes leads with What changed today. 316 features in the data and on the page; before 101 done, 118 partly, 90 not done; after 86 done, 137 partly, 93 not done. 5 moved to done, 101 re-judged, 58 asks added from today's dictatio… · paths 0/1 exist, gone: framework/ai/doc/asks-outcomes
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…
- 2026-10-12 [Smoke gate passes on core pages](/framework/ai/sessions/2026/10/12/session-9098993a/smoke-gate/) — Smoke on core pages: 6 FAIL to 0 FAIL (commit 1eacb8fd3, on michael/dev). Causes fixed, allow-list untouched. Landed by the night mastermind: the session merged but ended before writing this line.
- 2026-10-04 [Local model hunt: Qwen3-8B passes tool calls, recommend it as the new…](/framework/ai/sessions/2026/10/05/local-ctx-fix/local-model-hunt/) — Downloaded and tested 2 new local models against the current default (qwen2.5-coder). Recommendation: switch to local/qwen3-8b — it's the only one of the three that actually calls tools. web research: picked top 2 from HF model cards + benchmarks — Qwen3-8B a… · paths 1/1 exist
- 2026-10-04 [Models tab: added a one-row-per-model catalog with live pricing and o…](/framework/ai/sessions/2026/10/04/models-page/models-page/) — Live on /framework/ai/ → System → Models, above the fold. A 17-row sortable table — provider, context window, $/M in/out/cached, our docs/reasoning/refine test scores, seconds, tokens in/out, and a "typical minion $" column — plus five notes on why reads are … · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Test](/framework/core/Test/) — used by 0 files
- [ext/Saver](/framework/ext/Saver/) — used by 19 files

## Docs and readmes
- [Test — node tests that run when the code they cover changes…](/framework/core/Test/readme.md) — ## Index - [Test.js](./Test.js) — class Test: ok, eq, throws, done; portable, no DOM, no node imports - [TestRunner.mjs](./TestRunner.mjs) …
- [List architecture — every list announces its own changes, b…](/framework/core/List/doc/architecture.md) — List is the ordered collection behind an Item's children, for example item.items or page.pages. It is one class, [List.js](../List.js), tha…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [List — the ordered collection that announces every change](/framework/core/List/readme.md) — Every List is live. There's one class, List — no separate event-less variant any more (the owner, 2026-10-02: "scrap LiveList everywhere… L…
- [page/query: finding past work (what exists, what is stale, …](/framework/core/Page/doc/query.md) — Anchor: this doc lives under core/Page because a generic "ask the system for rows" thing has no better home yet (the owner, 2026-10-16: "pa…
- [Only what changed — the chain diff](/framework/core/Router/doc/chain-diff.md) — js const shared = this.shared_depth(from, to); from.slice(shared).reverse().forEach(p => p.deactivate()); // deepest first to.slice(shared)…
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…

## Sessions tagged with these words
- 2026/10/16 [Past-work pilot classifier](/framework/ai/sessions/2026/10/16/session-289010e0/) — kind/owner model/haiku work/read-only task/past-work · $1.86
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/13 [Page templates binding merge](/framework/ai/sessions/2026/10/13/session-21449a90/) — kind/owner model/sonnet work/read-only task/page-templates-binding-merge · $0.51
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 AI 2 merges into /framework/ai/ (later) (ai/todo.md, parked)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)

## Commits
- 527b66c83 core/Page: plan.md v2 - navigation, items and pages, tests, build order
- a80ea6173 core/Test: first full run on michael/dev (86/100), review record, improvements, page shot
- a673d7949 core/Test review fixes: Test declared as a core child (page 404), code rule moved out of the hidden-process b…
- ffae918e5 core/Test: TestRunner; core/Task: child-verb test
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- 648a05b65 task-folders: TaskMove.mjs moves day folders into the sessions store
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- 089ec8205 core/Item: a field colliding with a method now throws, not silently skips

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Test: tests run on save (WorktreeWatch) and at merge (merge.mjs), and report only a pass-to-fail change

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Test: tests run on save (WorktreeWatch) and at merge (merge.mjs), and report only a pass-to-fail change"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
