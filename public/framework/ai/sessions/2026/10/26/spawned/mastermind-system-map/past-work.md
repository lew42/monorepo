<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The owner  Michael  relayed by the cloud voice agent  2026 10 26  Investigation plus docs only  Do NOT change code  and" (words: owner, michael, relayed, cloud, voice, agent, 2026, investigation, plu, doc, only, not, change, code)

## Tasks (8, best first)
- 2026-10-26 [The owner (Michael), relayed by the cloud voice agent, 2026-10-26. In…](/framework/ai/sessions/2026/10/26/spawned/mastermind-system-map/) — (no outcome logged)
- 2026-10-20 [updates: a cloud agent gets only what changed since its last call](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/updates-tool/) — updates tool landed and merged (restart Servex to go live). one tool updates, a cursor per caller, peek, cap 50 with more: External.updates(), test Servex/ext/remote/RemoteMCP.test.mjs passes one sentence in RemoteMCP.INSTRUCTIONS, plus follow({path, agent:"v…
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-15 [voice session: factual maps of the AI and page systems](/framework/ai/sessions/2026/10/15/voice-20261015/) — Voice session 2026-10-15 closed; a new voice session (voice-20261016) took over at 19:06. Landed: /live/ as a one-screen presentation surface that voice-app writes and clears on a topic change (1b96fb2b4), plus /live/ reloading itself, editing items in place …
- 2026-10-13 [Figma to code: 36 pages inventoried, 6 have code, 17 only a doc, 13 n…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/figma-to-code/) — The round-trip inventory is on the Figma pages: 36 Figma pages and 36 inventory rows (counts agree); 6 have a code page, 17 only a doc, 13 nothing yet. Landed a1129ce8d. Landed by the mastermind from the agent's own log line and merge commit (the agent ended …
- 2026-10-26 [Agent-name links in chat go to a page that does not exist. ext/Mentio…](/framework/ai/sessions/2026/10/25/session-15fa7f56/mastermind-agent-name-links-resolve/) — Landed on michael/dev (ea637bcb4 + follow-up commit): agent-name links resolve to the agent's real dated task folder through AgentUrl (ai/index.json, no second index); /sessions/<name>/ redirects there; names with no record show 'Session not found'. Opened /s…
- 2026-10-25 [WakePolicy: sentence_count only counts finished sentences](/framework/ai/sessions/2026/10/25/session-d3ed399d/minion-wake-count/) — Fixed the comma-chunk wake bug. sentence_count (Servex/agents/WakePolicy.js) now counts only finished sentences (ending .!?…, optional closing quote/bracket); an unfinished tail counts 0 instead of 1, so every=1 no longer flushes on a comma chunk. It still fl…

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ui/doc](/framework/ui/doc/) — used by 5 files, no readme
- [ux/doc](/framework/ux/doc/) — used by 3 files, no readme

## Docs and readmes
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — > Superseded 2026-10-26 (the owner): a task now stays in the session that files it; a module folder only with an explicit home. Read [the r…
- [Owner notes, 2026-10-16: a full voice conversation (dictate…](/framework/audio/Voice/doc/owner-2026-10-16-voice-conversation.md) — Not a plan, not approved. The owner's words condensed so a later session can find them. Past work on voice output: this module (Voice.js, b…
- [The page tool: any agent changes any page by path + delta (…](/framework/core/Page/doc/page-tool-2026-10-09.md) — Dictated in VS Code tab 7efd07d5. Shared by the page system and the AI system (linked from both readmes). ## The owner's ask - Any agent (a…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Owner notes, 2026-10-16 (night): seeing tasks (dictated; ca…](/framework/core/Task/doc/owner-2026-10-16-ui.md) — Fourth note of the day. The point of the task system: see what was asked for, see what is done, keep working on what is not. Read the three…
- [Owner notes, 2026-10-16: indexing and finding past work (di…](/framework/ai/doc/owner-2026-10-16-indexing.md) — Not a plan, not approved. The owner's words condensed. Related: past-work-index.md (by task), readmes.md, module-homes.md. ## Every directo…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…

## Sessions tagged with these words
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27
- 2026/10/15 [Clarity voice session](/framework/ai/sessions/2026/10/15/session-cbce90d6/) — kind/agent model/sonnet work/read-only task/voice-20261015. framework/ai · $0.23
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14

## Owner asks
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, dropped)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Servex docs as flowcharts: ON HOLD (the owner) (?, dropped)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: The owner (Michael), relayed by the cloud voice agent, 2026-10-26. Investigation plus docs only. Do NOT change code, and

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The owner (Michael), relayed by the cloud voice agent, 2026-10-26. Investigation plus docs only. Do NOT change code, and"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
