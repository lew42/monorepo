<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "updates  a cloud agent gets only what changed since its last call" (words: updat, cloud, agent, get, only, changed, since, last, call)

## Tasks (8, best first)
- 2026-10-20 [updates: a cloud agent gets only what changed since its last call](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/updates-tool/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/updates-tool/requirements.md
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-20 [AISessionIndex: record-only sessions get a title from session.summary…](/framework/ai/sessions/2026/10/20/voice-20261020/index-record-sessions/) — Record-only (cloud voice) snapshots already landed in 6a86a5de4; this adds the title lookup (e04f922fd). Needs a dev server restart to index the cloud voice folder.
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist
- 2026-10-03 [Prompt hook: only your words get refined](/framework/ai/sessions/2026/10/04/prompt-relay-skip-agents/prompt-relay-skip-agents/) — A subagent's report is no longer logged as your prompt. The hook skipped nothing before, so four hand-backs in this tab were saved as your Prompts and refined at about $0.35 each, and your real prompt waited behind them. skip hand-backs and background notices… · paths 1/1 exist
- 2026-09-29 [PageFiles: a folder that arrives by a git merge now gets its own log](/framework/ai/sessions/2026/09/29/page-files-merge-fix/page-files-merge-fix/) — A folder that arrives all at once (a git merge) now gets its page.jsonl too. handle() calls ensure() on the containing folder of any surviving event, not just the changed entry, so one lucky event anywhere inside a new subtree backfills the whole thing via a … · paths 1/1 exist

## Docs and readmes
- [site-diff — one command that shows what changed on the site…](/framework/ext/DesignTool/diff/readme.md) — Before this, a shared CSS change was proven by opening six pages by hand and hoping. This script shoots a set of real pages headless, twice…
- [Only what changed — the chain diff](/framework/core/Router/doc/chain-diff.md) — js const shared = this.shared_depth(from, to); from.slice(shared).reverse().forEach(p => p.deactivate()); // deepest first to.slice(shared)…
- [DesignTool — measures a layout numerically: what is BROKEN,…](/framework/ext/DesignTool/readme.md) — ## Index [audit](./audit/) — the whole site measured and ranked worst-first; use it to pick which layout to fix next [diff](./diff/) — one …
- [Cloudflare: what we would use, what it costs, what you give…](/framework/ai/doc/cloudflare.md) — The ask (2026-10-14, the owner): "What would you need from me" to let the agents configure Cloudflare, without the risk of spending hundred…
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [Follow-up: every task of the last 10 days](/framework/ai/doc/follow-up-full.md) — 1035 tasks, flagged first. Summary: [follow-up.md](follow-up.md). | task | group | session | model | started | last log | step | state buck…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/15 [Clarity refine audit](/framework/ai/sessions/2026/10/15/session-f2708f57/) — kind/agent model/sonnet work/read-only task/refine-audit framework/refine · $0.14
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-e94bf72b/) — kind/agent model/opus work/read-only task/spawn-policy servex/policy · $0.60

## Owner asks
- 2026-09-30 Monitor: a Playwright agent on main; template changes get console + screenshot + stall ch… (mastermind-servex (10 PM, first in the task), queued)
- 2026-10-18 Monitor: a Playwright agent on main; template changes get console + screenshot + stall ch… (?, tracked)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Page inbox for necessary agent coordination (task-mastermind-page-inbox, building)

## Commits
- 4df68f3c8 Task docs: one ai/doc/tasks.md (homes, tooling, cloud voice agent, verified state), indexes updated, tasks pa…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: updates: a cloud agent gets only what changed since its last call

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "updates: a cloud agent gets only what changed since its last call"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
