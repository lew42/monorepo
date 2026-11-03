<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Merge the finished branches that were never merged  you are a mastermind  on Sonnet  high effort " (words: merge, finished, branch, were, never, merged, you, mastermind, sonnet, high, effort)

## Tasks (8, best first)
- 2026-10-28 [Heartbeat: no status check for a complete task with an unmerged branch](/framework/ai/sessions/2026/10/28/spawned/mastermind-ai/) — Heartbeat stops sending "status check" to an agent whose log says complete but whose branch is unmerged: [Heartbeat.js](/Servex/Heartbeat.js), proof [Heartbeat-landed.test.mjs](/Servex/Heartbeat-landed.test.mjs), commit 4bed6f7fa. Active after the next Servex…
- 2026-11-02 [merge.mjs: commit exactly the landed paths, never leave anything stag…](/framework/ai/sessions/2026/10/20/session-e00f55c9/merge-staged/) — Landed as 21cfedbd6. Cause found: when anything was already staged, merge.mjs skipped its own commit and left its landed paths staged, so the next merge saw them as strays (a loop); reproduced in merge.test.mjs Merge commits only its own paths through a tempo…
- 2026-11-02 [You are a mastermind on Sonnet, medium effort; budget about $5. The n…](/framework/ai/sessions/2026/11/02/spawned/mastermind-in-flight-real-data/) — (no outcome logged)
- 2026-11-02 [You are a mastermind on Sonnet, medium effort; budget about $5. Two R…](/framework/ai/sessions/2026/11/02/spawned/mastermind-recite-cue-icon/) — (no outcome logged)
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-16 [AI sheet checkup: route decided, steps 2 to 4 merged, 5 to 10 queued](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/) — The AI sheet is routed at <path>/ai/ (decision d-sheet-route), recorded with its two alternatives in ext/drawer's owner doc; the layout pick (A's short head, E's live feed, A's strip) stands. Steps 2 to 4 are merged on dev, one commit each: Sheet.Panel is one…
- 2026-10-13 [PWA: manifest and icons merged; the state and next steps documented](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/pwa-check/) — The site now serves a manifest with icons (merged 1b4bc1136); lab/doc/pwa-state.md says what works today and lab/doc/next.md what is next. Landed by the mastermind from the agent's own answer and the merge commit (the agent ended its turn without a landing li…
- 2026-10-12 [Dictate: merged transcription asks, two small builds](/framework/ai/sessions/2026/10/12/session-d2954950/asks-transcription/) — Merged asks doc: [Transcription asks](/framework/ux/Dictate/doc/asks.md), 19 clusters (7 open, 4 partly, 8 done), linked from the [Dictate readme](/framework/ux/Dictate/). Two small builds: Refine keeps the latest 19,000 characters of a long prompt; the voice… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [Salvage branches: decisions, 2026-10-17](/framework/ai/doc/salvage-2026-10-17.md) — Source audit: [salvage/audit.md](../sessions/2026/10/16/voice-20261016/salvage/audit.md) (108 real unmerged branches). Full tip list kept f…
- [AI system: the owner's asks, merged (2026-10-12)](/framework/ai/doc/asks.md) — The owner's own prompts that touch the ai system, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. Open …
- [Layout architecture — a layout is a shape, never content](/framework/core/Layout/doc/architecture.md) — core/Layout is the catalogue of thirty page arrangements, each proven at seven widths. A Layout is a Page subclass (in [Layout.js](../Layou…
- [Page system: the owner's asks, merged (2026-10-12)](/framework/core/Page/doc/asks.md) — The owner's own prompts that touch the page system, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. Ope…
- [How the catalog was merged](/framework/ux/Content/catalog/doc/merge.md) — Three scouts each listed the boxes in one part of the site (101 entries in all). The same job often appeared under several names, so entrie…
- [ai/merge — the "ready to merge" list and its Merge button](/framework/ai/merge/readme.md) — Page: [/framework/ai/merge/](/framework/ai/merge/). One card per branch an agent has marked ready; the owner's one decision per project is …
- [ai2: the old address of AI 2 (merged into AI on 2026-10-09)](/framework/ai2/readme.md) — AI 2 is no longer a separate module. Its code moved into [ai/cards](/framework/ai/cards/) (a card and what it shows) and [ai/rail](/framewo…
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19
- 2026/10/14 [R2 archive Cloudflare class](/framework/ai/sessions/2026/10/14/session-e88409a1/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/tasks · $0.60

## Owner asks
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)

## Commits
- a085a6bfa brief: merge the finished branches that were never merged
- 4bed6f7fa heartbeat: no status check for a task whose log says complete but whose branch is unmerged
- ac28ba1e6 data-grid: land worktree/data-grid into michael/dev
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof
- 70aa54583 Servex: worktree clean-up — a finished worktree (merged, or its task landed) is removed after junction-check,…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,818 tokens of reading, under the 100k limit).

Question: Merge the finished branches that were never merged (you are a mastermind, on Sonnet, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Merge the finished branches that were never merged (you are a mastermind, on Sonnet, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
