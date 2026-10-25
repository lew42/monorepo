<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Voice sessions  filed in the dated session store  indexed  costed  the smart agent upgraded to Opus" (words: voice, session, filed, dated, store, indexed, costed, smart, agent, upgraded, opu)

## Tasks (8, best first)
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-20 [dated-queries: sessions read through DatedFiles, in-flight page](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-queries/) — Merged 07cdd8eb5; needs a dev-server restart before it is live. CLI and sessions source read DatedFiles.sessions (tasks source left on SessionIndex: different record set) In-flight page built: [/framework/ai/now/](/framework/ai/now/) Query check.mjs passes ch… · paths 1/1 exist
- 2026-10-17 [Sessions: voice assistant becomes the default seat (follow-up)](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-wake/) — Landed, live after a Servex restart — the voice assistant is now the default; fast is the escape hatch. default voice: unit tests pass (21 checks) survives a restart: the file session-assistant.txt in the Servex home folder wins, then the env var, then voice …
- 2026-10-05 [Sessions: voice falls back to OpenRouter on a Claude login failure too](/framework/ai/sessions/2026/10/05/auth-fallback/auth-fallback/) — Voice sessions now switch to OpenRouter on a Claude login failure, not just a usage-limit refusal. treat auth failure like usage refusal, switch at once, tell the owner: Sessions.js's woken() checks AUTH_FAIL_RE too — [proof](prove-auth-fallback-results.txt),…
- 2026-09-30 [Voice sessions: a fast and smart pair per ✦ session](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/) — Press ✦ and talk: one session follows you across pages, a fast reply in about 1 s, a smart one after. Live after the held Servex restart. fast + smart pair per session: fast 1.1 s, smart 4 s, live test resume within the hour, older session as one line: [shot]… · paths 1/1 exist
- 2026-09-29 [Voice sessions: the roles table, the echo link, and which log agents …](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/c-roles/) — Landed in worktree qf-9, commit c65ce26c — not yet merged into michael/dev, so these links aren't live on the site yet. Names reconciled into [one roles table](/framework/ai/2026-09-22/tiers-design/doc/roles.md): fast/smart assistant, directory mastermind, ta… · paths 1/1 exist
- 2026-10-24 [Sessions page: a named agent's row opens a working page](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/named-rows/) — A named agent's row on the sessions page opens a working page (10613c206). the page resolves the agent's name to its session through Servex's agent list, and asks only for files its folder holds: 0 failed requests live on /framework/ai/sessions/reviewer-sessi…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 14 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Session — one ✦ press is one voice session, answered by a f…](/framework/ext/Session/readme.md) — A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one dated folder: /framework/ai/…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Voice to session page](/framework/ext/Refine/stages/doc/voice-to-page.md) — Task: ai/sessions/2026/10/12/session-0e99727c/voice-to-session-page/ (requirements.md, STATE.md). ## Flow Browser RefineSystem.stream(text)…
- [Voice sessions: the file, the routes, the two assistants](/framework/ext/Session/doc/sessions.md) — ## The file One session is one append-only file, public<home>ai/<session>.jsonl. The browser reads it at the same path on the site (<home>a…
- [One rolling voice session, or many](/framework/ux/Dictate/doc/sessions.md) — The browser voice chat is one session shared by every page (chat.js, kept in sessionStorage under lew42-voice-session). The question: shoul…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Voice component refine and audit](/framework/ai/sessions/2026/10/15/session-9afd8738/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.88
- 2026/10/15 [Refine-audit review](/framework/ai/sessions/2026/10/15/session-96266d4e/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.91
- 2026/10/15 [Voice refine audit review](/framework/ai/sessions/2026/10/15/session-8e081544/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.79

## Owner asks
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)

## Commits
- cb5445e3d ai: brief, voice sessions filed in the dated store + indexed + costed; session-smart to Opus medium with mast…
- 96997dcaa remote MCP: owner_words on every tool, filed verbatim into the day's voice session; every call logged; cloud …

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,755 tokens of reading, under the 100k limit).

Question: Voice sessions: filed in the dated session store, indexed, costed; the smart agent upgraded to Opus

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Voice sessions: filed in the dated session store, indexed, costed; the smart agent upgraded to Opus"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
