<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Context alerts to the parent  agent base item 12 " (words: context, alert, parent, agent, base, item)

## Tasks (8, best first)
- 2026-10-22 [agent-context](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/) — Agent context mapped; plan written (no code changed). [Roles and logging](/framework/ai/doc/agent-context.md) · [tools map](/Servex/doc/tools-map.md) · [item system](/framework/core/Item/doc/map.md) · [plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/…
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-25 [Budget: $6. Work in a NEW worktree (git worktree add C:/Code/lew42/wo…](/framework/ai/sessions/2026/10/24/session-7c6c8d93/minion-agent-base/) — (no outcome logged)
- 2026-10-24 [minion-context-alerts](/framework/ai/sessions/2026/10/24/session-7c6c8d93/minion-context-alerts/) — requirements.md
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-12 [Page: open-work line on every page, weight on any object](/framework/ai/sessions/2026/10/12/session-a2bdd14b/page-context-asks/) — Every page now shows its open tasks, and any object can carry a weight. #6 open tasks per page: a "N open tasks on this page" line on every Page and Doc page, from computed ai/page-work.json — [page-work-line.md](/framework/core/Page/ai/doc/page-work-line.md)… · paths 1/1 exist
- 2026-10-03 [Content rows: a row can BE a page reference, drawn as its dark class …](/framework/ai/sessions/2026/10/03/list-events/ref-content-rows/) — Landed: a content row with ref draws as that page's own dark class card (#Mention's exact look, reused), linking to it, with the row's own text under it. the look + link: proven live on the Now card's new "Page" row text under the card: same row, same screens… · paths 1/1 exist
- 2026-10-03 [Ref row: always dark, header-only link, body nested inside the card](/framework/ai/sessions/2026/10/03/list-events/ref-row-context-card/) — Landed: a ref row is now the inline #Page chip upgraded to a full-width card, per the owner's correction. whole row always dark (class-card look), never conditional on entry.class_card header links (icon+name chip, same as an inline mention); body does not li…

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 42 files
- [ui/alert](/framework/ui/alert/) — used by 5 files
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [The agent base: why ai/agents.md, and how it reaches an age…](/framework/ai/doc/agent-base-proposal.md) — Decided (the owner, 2026-10-24): [ai/agents.md](../agents.md) holds the short, vendor-neutral instructions every agent reads. CLAUDE.md sta…
- [Agent context: what each agent is given, and what is logged…](/framework/ai/doc/agent-context.md) — A map, checked against the code on 2026-10-22; nothing changed. Plan to make it visible: [the plan](/framework/ai/sessions/2026/10/20/sessi…
- [Compaction: when a Servex agent's context is summarized, an…](/framework/ai/doc/compaction.md) — See also [context.md](context.md): what a context window is and how its size is read live. Compaction means /compact. The CLI replaces the …
- [Context: what an agent knows right now, what it costs, and …](/framework/ai/doc/context.md) — An agent only knows what is in its context window: the system prompt, every message so far, every file it read, every tool result. Nothing …
- [Context drift: why a long-running agent forgets its role, a…](/framework/ai/doc/context-drift.md) — Context drift is what happens to a long session. The instructions it started with (its role readme, its rules) sit hundreds of thousands of…
- [One stream for the UI, node and the agents: a design (not b…](/framework/core/Item/doc/one-stream.md) — Status: design, 2026-10-22, by the system architect. Building waits: the owner put the full nested-items work behind sessions, tasks and pr…
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [core/Item + core/List](/framework/audit/doc/core-Item-List.md) — Two files, 175 lines of JS together, and they are the base of the whole persistence stack — ext/Saver, ext/editor, ext/Panel, ext/Draggable…

## Sessions tagged with these words
- 2026/10/13 [Ui alert architecture](/framework/ai/sessions/2026/10/13/session-f60f7cb0/) — kind/agent model/haiku mod/ui/alert task/mastermind-repo-slim docs/architecture · $0.14
- 2026/10/13 [Core Item architecture](/framework/ai/sessions/2026/10/13/session-5d65b684/) — kind/agent model/haiku mod/core/item task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/15 [Clarity refine audit](/framework/ai/sessions/2026/10/15/session-f2708f57/) — kind/agent model/sonnet work/read-only task/refine-audit framework/refine · $0.14
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 Page inbox for necessary agent coordination (task-mastermind-page-inbox, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)

## Commits
- 94dc8795a ai: briefs, detail page opens on Overview with chat as a tab; refinement as principles + formatting + tab see…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,755 tokens of reading, under the 100k limit).

Question: Context alerts to the parent (agent-base item 12)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Context alerts to the parent (agent-base item 12)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
