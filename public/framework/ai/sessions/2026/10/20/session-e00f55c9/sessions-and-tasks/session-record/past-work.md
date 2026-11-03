<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "A spawned agent s folder starts as session jsonl  slice 3 " (words: spawned, agent, folder, start, session, jsonl, slice)

## Tasks (8, best first)
- 2026-10-20 [A spawned agent's folder starts as session.jsonl (slice 3)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-09-29 [Voice sessions: no leaks, fast first, titles, folder log](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/b-slice2/) — Voice sessions slice 2, in two commits on worktree/qf-9: 2df659cf (merged, live) and 0ac19ab2 (waits for merge and a Servex restart). ![The demo at 400px](session-400.png) Nothing spawns until you speak; idle pairs stop after 5 min; at most 2 run at once: pro… · paths 1/1 exist
- 2026-10-18 [Load the clarity skill, then check this proposal: public/framework/ai…](/framework/ai/sessions/2026/10/18/spawned/clarity-restart-sweep/) — Checked the restart-sweep proposal: text-check clean, verdict clear, logged in clarity/flags.jsonl. No edits.
- 2026-10-17 [Sessions: voice assistant becomes the default seat (follow-up)](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-wake/) — Landed, live after a Servex restart — the voice assistant is now the default; fast is the escape hatch. default voice: unit tests pass (21 checks) survives a restart: the file session-assistant.txt in the Servex home folder wins, then the env var, then voice …
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 10 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 45 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Page — a folder with a page.js or a page.jsonl is a page: a…](/framework/core/Page/readme.md) — class Page extends Item (Page.class.js, the 23 small files beside it are its parts, listed in [doc/classes.md](doc/classes.md)). A page is …
- [Sessions vs docs — what goes where (the owner, 2026-10-19)](/framework/ai/doc/sessions-vs-docs.md) — Two places, two jobs. Putting a thing in the wrong one is how work gets lost. ## The session folder — log level, may be purged public/frame…
- [Sessions and the SDK](/framework/core/Page/ai/doc/sessions.md) — What a session id is. Every agent is one Claude session, held open by the @anthropic-ai/claude-agent-sdk package's query() call — the same …
- [Page — a folder with a page.js or page.jsonl is a page: a u…](/framework/core/Page/doc/readme-before-2026-10-19.md) — How a page renders (code with helper functions, page.jsonl deltas, or both; markdown; live updates): [doc/how-a-page-renders.md](doc/how-a-…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…

## Sessions tagged with these words
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/15 [Voice component refine and audit](/framework/ai/sessions/2026/10/15/session-9afd8738/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.88
- 2026/10/15 [Refine-audit review](/framework/ai/sessions/2026/10/15/session-96266d4e/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.91
- 2026/10/15 [Voice refine audit review](/framework/ai/sessions/2026/10/15/session-8e081544/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.79
- 2026/10/15 [Past-work discovery landing check](/framework/ai/sessions/2026/10/15/session-7620fac2/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.24

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Page inbox for necessary agent coordination (task-mastermind-page-inbox, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 45,847 tokens of reading, under the 100k limit).

Question: A spawned agent's folder starts as session.jsonl (slice 3)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "A spawned agent's folder starts as session.jsonl (slice 3)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
