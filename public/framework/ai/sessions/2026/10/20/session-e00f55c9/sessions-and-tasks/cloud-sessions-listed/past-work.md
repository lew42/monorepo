<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Record only sessions  cloud voice  show on the sessions pages" (words: record, only, session, cloud, voice, show)

## Tasks (8, best first)
- 2026-10-20 [Record-only sessions (cloud voice) show on the sessions pages](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/requirements.md
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-17 [Sessions: voice assistant becomes the default seat (follow-up)](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-wake/) — Landed, live after a Servex restart — the voice assistant is now the default; fast is the escape hatch. default voice: unit tests pass (21 checks) survives a restart: the file session-assistant.txt in the Servex home folder wins, then the env var, then voice …
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-15 [voice session: factual maps of the AI and page systems](/framework/ai/sessions/2026/10/15/voice-20261015/) — Voice session 2026-10-15 closed; a new voice session (voice-20261016) took over at 19:06. Landed: /live/ as a one-screen presentation surface that voice-app writes and clears on a topic change (1b96fb2b4), plus /live/ reloading itself, editing items in place …
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 11 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [AI — the folder where the AI system's records live and the …](/framework/ai/readme.md) — ai/ holds (1) the AI system's records: the session store, the asks ledger, the cards index, the usage logs, index.json; (2) the classes tha…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Voice to session page](/framework/ext/Refine/stages/doc/voice-to-page.md) — Task: ai/sessions/2026/10/12/session-0e99727c/voice-to-session-page/ (requirements.md, STATE.md). ## Flow Browser RefineSystem.stream(text)…
- [Voice sessions: the file, the routes, the two assistants](/framework/ext/Session/doc/sessions.md) — ## The file One session is one append-only file, public<home>ai/<session>.jsonl. The browser reads it at the same path on the site (<home>a…
- [One rolling voice session, or many](/framework/ux/Dictate/doc/sessions.md) — The browser voice chat is one session shared by every page (chat.js, kept in sessionStorage under lew42-voice-session). The question: shoul…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67

## Owner asks
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)

## Commits
- 7af667a82 Tab session record: scope to the SessionStart session.jsonl only; leave the prompt log as it was (DRY)
- 572118400 sessions buckets: an open bucket's sessions sit under it; month-index rows never hidden; review records
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- aa61cc4d5 ai/sessions: docs pass for the cost-over-time chart + waste table
- f5a5f3a88 sessions: docs pass for the session-cost build
- 73147e319 recursive-pairs fix2: second review's findings — tools, id validation, posture, docs
- d20996944 Servex pairs: one root assistant, landings reach it, recorded parents in policy, one assistant text (recursiv…
- 8d499717b Mobile bottom rail: ✦ AI listening sheet, ☰ reaches the drawer's tabs

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: Record-only sessions (cloud voice) show on the sessions pages

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Record-only sessions (cloud voice) show on the sessions pages"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
