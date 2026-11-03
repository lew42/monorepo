<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "ProcessRunner  two build processes are stuck between steps  fix why  you are a mastermind  on Sonnet  high effort " (words: processrunner, two, build, process, stuck, between, step, fix, you, mastermind, sonnet, high, effort)

## Tasks (8, best first)
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-09-30 [Processes section on the Live card, with two CSS traps found and fixed](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/process-monitor/graph/) — A Processes section now lives on the Live card — RAM/CPU graph, by-task sparklines, orphans and the worktree count, from Servex's new /api/processes. "Running now" rows gained their real process (pid/MB, or "no process"). Shots at 400/1200/1920, light and dar… · paths 0/1 exist, gone: framework/ai2/live/
- 2026-09-28 [core/Page docs: Make a page + Layout tabs, tab order fixed](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/rewrite/) — Landed: [core/Page](/framework/core/Page/) has two new top tabs — [Make a page](/framework/core/Page/make/) (the four ways to build a page, code then live result) and [Layout](/framework/core/Page/layout/) (Choosing a layout: five shapes as icon items, each l… · paths 7/7 exist
- 2026-09-24 [Every dashboard ask on one page, two layout breaks fixed](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-dashboard/) — Every dashboard ask you made this week is on one page, and the two layout breaks it found are fixed on AI 2. - The record: [What you asked of the AI dashboards](/framework/ai2/doc/owner-asks.md). It holds 92 asks from 17–24 Sep, word for word, grouped by topi… · paths 3/4 exist, gone: framework/ai2/overview/
- x [ai-highlights](/framework/ai/sessions/2026/09/08/ai-highlights/) — The AI front page is a wall of 81 highlights, grouped by day — [/framework/ai/](/framework/ai/): what is running, the usage windows, then a card for every thing worth going back to, newest day first. Every task of every day moved to [/framework/ai/log/](/fram… · paths 3/6 exist, gone: framework/ext/AITask/doc/highlights/ framework/ext/AITask/doc/manifest/ framework/ai/effort/websites/
- 2026-10-01 [llama-server as a local model provider: chat page, test ladder, two f…](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/build/) — Servex runs a model on this machine's own GPU — proven with real replies, not just wired up. start/stop/swap one llama-server model, idle unload: Servex/ext/local/llama.js a local provider for the SDK (local/<slug>): Servex/ext/local/provider.js, Agents.js, t… · paths 2/2 exist
- 2026-09-30 [AI 2: two redraw hot spots cached (Groups.members, the Live card's la…](/framework/ai/sessions/2026/09/30/inbox-ext/ai2-hang/) — The freeze is fixed, plus four owner follow-ups, all in the worktree, ready to merge. Fix the freeze — two redraw hot spots cached. Commit 6db94ad4, [profile.md](./profile.md) The × button's stretched shape and dead hover — commit a3303915 A pinned Now card a… · paths 2/3 exist, gone: framework/ai2/now/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [Fixtures, and what "approved" means](/framework/core/Layout/doc/fixtures.md) — A layout owns no content. The fixtures are what goes in its slots instead, and they *are* the separation between layout and content: pour t…
- [The flicker — why your words vanished and came back, and th…](/framework/ux/Dictate/doc/flicker.md) — The rule (the owner, 2026-10-24): while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are…
- [past-work: look before you build](/framework/ai/skills/past-work/readme.md) — The owner (2026-10-12): "We don't want to set off and build something that's already been built, especially if it's stable and used everywh…
- [Nested or full — and why alternating between them is tricky](/framework/core/Page/doc/layout.md) — > Open question — not settled guidance. This note states a problem the owner has not > resolved. Read it as evidence, not as a rule to foll…
- [Process — a task whose children are named steps, and node r…](/framework/core/Task/doc/process.md) — The name's scope: here a process is a *way of working* (a Task subclass). Not Servex/Process.js (one supervised child program, such as a de…
- [Past work: what the catalog builds on](/framework/styles/layouts/catalog/doc/past-work.md) — Run node Server/PastWork.mjs layout catalog colour schemes on 2026-10-12. Nothing already ranked the layouts against content, so the catalo…
- [twin — a card that is two screens](/framework/styles/layouts/doc/twin.md) — The long form behind twin: true: ten of the layouts render one content object (web.js) and each card shows the layout at both extremes at o…
- [Layouts — every whole-page layout as a class string, on one…](/framework/styles/layouts/readme.md) — ## Index - [catalog](./catalog/) — every layout ranked, with use count, what content it suits and when not to; [content → layout](./catalog…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Mentions: / path references, one map, opt-in processing (task-mastermind-mentions, building)
- 2026-09-30 Skills: structure for content, layout, UI and navigation (proposal first) (mastermind-servex-9, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: ProcessRunner: two build processes are stuck between steps; fix why (you are a mastermind, on Sonnet, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "ProcessRunner: two build processes are stuck between steps; fix why (you are a mastermind, on Sonnet, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
