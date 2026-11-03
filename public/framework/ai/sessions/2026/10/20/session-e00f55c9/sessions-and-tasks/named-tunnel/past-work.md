<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "A permanent hostname for the Servex MCP  servex lew42 com through a named Cloudflare tunnel" (words: permanent, hostname, servex, mcp, lew42, com, through, named, cloudflare, tunnel)

## Tasks (8, best first)
- 2026-10-20 [A permanent hostname for the Servex MCP: servex.lew42.com through a n…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/named-tunnel/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/named-tunnel/requirements.md
- 2026-10-20 [Servex keeps the tunnel up; connector URL shown](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tunnel-keeper/) — Servex now keeps the tunnel up. keeper at boot and every 60 s, adopts a live tunnel: node Server/Tunnel.test.mjs ok; after a Servex restart Tunnel.mjs status says up, edge answers 405 (not 502/404) URL findable: handover NOW block shows Connector: library-tri…
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Scripts census: 193 scripts under Server and Servex classified; 1 sta…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-census/) — Every script under Server/, Servex/ and the hooks is listed with what it is, who calls it and its verdict: 193 scripts, 1 stale, 26 misnamed (classes in lowercase files or function bags), the rest live or hand-run tools. Committed 66b6b048e on michael/dev; th…
- 2026-10-12 [Servex relay: owner messages reach a mastermind through the assistant](/framework/ai/sessions/2026/10/12/session-ac44c638/relay-2/) — Owner and tab messages to a mastermind now go through the root assistant; @name or direct: true still goes straight. Read the bypass log by script: it held 0 lines because Policy.kind() missed mastermind-* ids (fixed) Route through the assistant, direct kept …
- 2026-10-07 [Docs-vs-code audit: two stale MCP tool-count claims, one found-and-fl…](/framework/ai/sessions/2026/10/08/docs-vs-code-audit/docs-vs-code-audit/) — What landed: checked 12 concrete claims from doc/systems-overview.md, doc/autonomy.md, todo.md and asks.jsonl against the live Servex + site MCP tool catalogs and the agent lifecycle code (Agents.js, tools.js). 9 held up exactly: dormant-agent lifecycle, the …
- 2026-09-30 [Servex: idle agents go dormant, 5 working at most, auto-compaction](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/dormant-idle/) — Idle agents go dormant; at most 5 work; big agents compact (106a51a1, live). idle 3 min: the process exits, the session is kept: [proof.txt](proof.txt), 4 agents to 1 process a dormant agent answers within 15 s, context intact: [proof.txt](proof.txt) working …
- 2026-09-28 [Commit the live system: 326 uncommitted files into 12 named commits o…](/framework/ai/sessions/2026/09/29/1a4ab710-89f0-45d1-88ca-1f929880a2d1/commit-live-system/) — Landed — 326 uncommitted files went from git status --short down to about 10-12 (that count keeps moving; other agents are writing live), in 12 commits on michael/dev, none pushed. Groups + reasoning: [groups.md](/framework/ai/2026-09-28/commit-live-system/gr… · paths 1/1 exist

## Docs and readmes
- [Porting the July 2026 comp](/framework/styles/layers/theme/lew42/doc/port.md) — Frame 14643, the five app-class-* comps (overview / api-reference / source-code / tabbed ×2). ## The comp is a screen. What of it is a them…
- [Draggable architecture — grab a View, hit-test the registry…](/framework/ext/Draggable/doc/architecture.md) — Draggable is grab-and-move for any View; Sortable reorders a collection, across lists and into nested containers, on the same code path. En…
- [Cloudflare: what we would use, what it costs, what you give…](/framework/ai/doc/cloudflare.md) — The ask (2026-10-14, the owner): "What would you need from me" to let the agents configure Cloudflare, without the risk of spending hundred…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [Two component tokens, and everything else is color-mix](/framework/core/Sidebar/doc/tokens.md) — This file used to hardcode color: #fff plus six rgba(255,255,255,…) values — correct on a dark panel, invisible on a light one. The lew42 c…
- [Two Figma MCP servers: when to use which (measured 2026-10-…](/framework/ext/Figma/doc/mcp-servers.md) — | | Desktop (figma-desktop, 127.0.0.1:3845) | Remote (mcp.figma.com, the mcp__figma__* tools) | |---|---|---| | Sees your selection | yes: …
- [Talking to the mastermind through the Claude app's voice mo…](/framework/ux/Dictate/doc/voice-bridge.md) — ## What is exposed today (checked 2026-10-17) - Everything. POST /mcp/remote (Servex/ext/remote/RemoteMCP.js) serves the whole Servex tool …

## Sessions tagged with these words
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35
- 2026/10/13 [Worktree cleanup](/framework/ai/sessions/2026/10/13/session-5dd9cad2/) — kind/owner model/opus mod/server mod/ai/sessions mod/servex task/mastermind-repo-slim · $8.50
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12

## Owner asks
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: A permanent hostname for the Servex MCP: servex.lew42.com through a named Cloudflare tunnel

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "A permanent hostname for the Servex MCP: servex.lew42.com through a named Cloudflare tunnel"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
