<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "One mastermind role plus a path  agent base items 11 and 13 " (words: one, mastermind, role, plu, path, agent, base, item)

## Tasks (8, best first)
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [AI Inbox: one ranking rule, importance plus recency, with a debug view](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-ranking/) — The Inbox now ranks by importance and recency (Inbox.rank), marks new rows with their age, and shows each row's score beside the live rail. Merged into michael/dev (07497fefb, review fixes 93460a038). Landed by the mastermind from the agent's own answer (the … · paths 1/1 exist
- 2026-10-13 [Models page: every role and agent with its model, provider and source…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/model-switch/) — /framework/ai/models now shows which agent runs on what (2,602 rows, counts agree), the OpenRouter spend in the last 24 h is $0, and the wall switch is documented in the openrouter readme. Landed e33baa3f1 (Server/models-now.mjs). Caveat: now.json is a snapsh… · paths 2/2 exist
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-09 [core/Page: agents add tabs to any page live; docs cleaned](/framework/ai/sessions/2026/10/09/session-060cdfff/page-mastermind/) — Agents can now reshape any page live: add a tab, change its layout, all without a reload. a delta adds a tab and changes layout: [the tool page](/framework/core/Page/tool/) a session's page.jsonl renders live on its template: [demo shot](/framework/ai/2026-10… · paths 1/1 exist
- 2026-10-09 [AI system: docs checked, page-path injection, docs consolidated](/framework/ai/sessions/2026/10/09/session-a27774cd/ai-mastermind/) — AI docs checked, agents learn their own page, docs consolidated readme chain checked and stale claims fixed: [note card](/framework/ai/2026/10/09/note-ai-docs-checked-stuck-sessions-expl/) stuck sessions explained: [doc](/framework/ai/sessions/doc/asks/stuck-…
- 2026-10-02 [page-on-item](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/page-on-item/) — 1 PageLog extends Item, on/emit/set routed through Item+Events, id=folder name, bubbles()=false -- shipped, plus a real bug fixed (naming() now actually sets this.id) ✓ · 2 Page keeps add/move/open/walk/find, only set+store collided and both are resolved (set… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 42 files
- [core/Role](/framework/core/Role/) — used by 2 files
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [One stream for the UI, node and the agents: a design (not b…](/framework/core/Item/doc/one-stream.md) — Status: design, 2026-10-22, by the system architect. Building waits: the owner put the full nested-items work behind sessions, tasks and pr…
- [Roles, processes, skills and sessions: how one becomes a sp…](/framework/ai/doc/role-process-skill-session.md) — The owner's questions (2026-10-24, items 12 and 13 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements…
- [The agent base: why ai/agents.md, and how it reaches an age…](/framework/ai/doc/agent-base-proposal.md) — Decided (the owner, 2026-10-24): [ai/agents.md](../agents.md) holds the short, vendor-neutral instructions every agent reads. CLAUDE.md sta…
- [The task queue: a session's tasks plus a priority, worked b…](/framework/ai/doc/task-queue.md) — The decision (2026-10-23): there is no new queue system. A mastermind's queue is its tasks, each with a priority. The mastermind starts the…
- [Skills — plain readmes that tell an agent how to do one kin…](/framework/ai/skills/readme.md) — A skill here is a folder of readmes, not a feature of Claude's own skill tool (the owner, 2026-10-24: stop leaning on Claude's skill system…
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…
- [The page tool: any agent changes any page by path + delta (…](/framework/core/Page/doc/page-tool-2026-10-09.md) — Dictated in VS Code tab 7efd07d5. Shared by the page system and the AI system (linked from both readmes). ## The owner's ask - Any agent (a…
- [Role: one Servex role as an object](/framework/core/Role/readme.md) — Role is one row of ROLES in [Servex/agents/roles.js](/framework/servex/fs/agents/roles.js) (the one source of the rows) as a plain object: …

## Sessions tagged with these words
- 2026/10/13 [Core Item architecture](/framework/ai/sessions/2026/10/13/session-5d65b684/) — kind/agent model/haiku mod/core/item task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Dictate-next-4 review](/framework/ai/sessions/2026/10/14/session-eadb28a6/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19
- 2026/10/14 [Voice-connector review](/framework/ai/sessions/2026/10/14/session-e5bbf063/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.62
- 2026/10/14 [Tasks dashboard review](/framework/ai/sessions/2026/10/14/session-e1115e59/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/tasks · $0.76

## Owner asks
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Mentions: / path references, one map, opt-in processing (task-mastermind-mentions, building)
- 2026-09-30 Mentions: / path references, one map, opt-in processing (task-mastermind-mentions, landed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)

## Commits
- 64bc83039 task-queue.md: storage decided with mastermind-page (the role's own task folder named once; sessions referenc…
- 6d394871d ai-system-mastermind: second review fixes (never compacted, renew past 100k; readme sections for the one-id m…
- d87f7f673 ai-system-mastermind: the role renamed by script (pointer left), a singleton row (one id, a second spawn reac…
- 62071719f docs rule: context everywhere; readmes are the conclusive index and the site the human one (index step); vsco…
- 4bda99041 ai docs: where AI code lives (proposal: core shared, ai/ front end, Servex host plus agents/ as the AI part w…
- a1a3c1684 mastermind: close the pre-existing clarity task dirs (heartbeat chase); todo: sustain keeper restart, clarity…
- 35d61270b Figma: page-layout rule (1920 wrapper, page components, Index), MCP desktop vs remote, mastermind role
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,755 tokens of reading, under the 100k limit).

Question: One mastermind role plus a path (agent-base items 11 and 13)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "One mastermind role plus a path (agent-base items 11 and 13)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
