<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Servex keeps the Cloudflare tunnel up  the connector URL is always findable" (words: servex, keep, cloudflare, tunnel, connector, url, alway, findable)

## Tasks (8, best first)
- 2026-10-20 [Servex keeps the Cloudflare tunnel up; the connector URL is always fi…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tunnel-keeper/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tunnel-keeper/requirements.md
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-18 [servex-small-3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/servex-small-3/) — Both fixes merged to michael/dev (6dcdc47f3, 0ab5016c1; todo strike ae492c45e). The second boot was the keeper restarting a Servex that crashed with exit 0xC0000409 (53 such exits in sustain.log), not a double launch; revive() now runs once per process and a …
- 2026-10-15 [Servex: file and shell tools for the voice app](/framework/ai/sessions/2026/10/16/voice-20261016/remote-tools/) — The voice app can read, write and edit files and run shell commands once Servex restarts. Six tools (read_file, write_file, edit_file, list_dir, glob, shell) sit in the one Servex tool registry, rooted at the monorepo or a named worktree; .jsonl writes are re…
- 2026-10-08 [Cache: keep 1-hour, plus a costed next-steps plan](/framework/ai/sessions/2026/10/08/cache-ttl-and-plan/cache-ttl-and-plan/) — Keep the 1-hour prompt cache (5 minutes everywhere would cost about 7% more over 7 days). [recommendation](/framework/ai/2026-10-08/cache-ttl-and-plan/recommendation.md) · [proposal](/framework/ai/2026-10-08/cache-ttl-and-plan/proposal.md) 5m or 1h: the Claud…
- 2026-10-03 [Browser launches: tagged, reaped, and one warm one Servex can check p…](/framework/ai/sessions/2026/10/03/0df64c47-b244-4a73-babb-16d86535c9b8/playwright-reap/) — Every chrome.exe Playwright starts is recognisable and reaped; Servex can check a page's console for you. launcher logs pid/started/closed — fixed a real pid bug, proved live (913212e6) recognisable as ours by its ms-playwright path (user-data-dir is refused … · paths 0/1 exist, gone: framework/ai/live/
- 2026-10-03 [Servex: the phone site (port 8137) is always up, started by Servex](/framework/ai/sessions/2026/10/03/phone-server/) — public/framework/ai/2026-10-03/phone-server/requirements.md
- 2026-10-03 [Servex: free 4 stuck landings, keep agents alive through restarts, an…](/framework/ai/sessions/2026/10/03/restart-keeps-agents/) — public/framework/ai/2026-10-03/restart-keeps-agents/requirements.md

## Docs and readmes
- [roles.md](/framework/servex/doc/roles.md) — you ├── this VS Code tab ............ the root mastermind today (routes, merges, settles disputes) │ └── Servex (always on) ├── master assi…
- [Servex](/framework/servex/readme.md) — The always-on process on this machine (port 80). It runs the Claude agents, starts the dev servers, and owns every log file. It is not the …
- [Cloudflare: what we would use, what it costs, what you give…](/framework/ai/doc/cloudflare.md) — The ask (2026-10-14, the owner): "What would you need from me" to let the agents configure Cloudflare, without the risk of spending hundred…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [content is always a List: step 1, as built (2026-10-12)](/framework/core/Page/doc/content-list-step-1.md) — Step 1 of [content.md](content.md), "Design: content is always a List". Steps 2 and 3 (children) are not built. Live: [/framework/core/Page…
- [How a url becomes a page](/framework/core/Page/doc/loading.md) — Every url is resolved one folder name at a time — never all at once. A url like /framework/core/Page/doc/ asks for framework, then core, th…
- [Page storage: one page system, many places to keep its lines](/framework/core/Page/doc/storage.md) — A page is a list of changes (deltas), one JSON line each. Where those lines are kept can change; the page never knows. Today they are kept …
- [Path extensions — every module that hands a page an extra u…](/framework/core/Page/ext/doc/path-extensions.md) — An extension (the readme one level up) turns on *inside* one page's own box — a page.jsonl line, a render hook. It never changes what urls …

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27

## Owner asks
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, dropped)
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)
- 2026-09-30 Servex docs as flowcharts: ON HOLD (the owner) (?, dropped)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,013 tokens of reading, under the 100k limit).

Question: Servex keeps the Cloudflare tunnel up; the connector URL is always findable

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Servex keeps the Cloudflare tunnel up; the connector URL is always findable"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
