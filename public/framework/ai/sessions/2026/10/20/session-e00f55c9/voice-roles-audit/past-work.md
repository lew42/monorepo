<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Voice Chat roles  who are the voice agents  and are they defined properly " (words: voice, chat, rol, who, agent, they, defined, properly)

## Tasks (8, best first)
- 2026-10-25 [Voice sessions: filed in the dated store, costed, Opus 5.5 smart agen…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/voice-sessions/) — Voice sessions are filed, indexed and costed; the smart agent is Opus 5.5 and keeps its own record. Filed, indexed, shown with cost: v-dwlaoin, 2 child agents, $0.24 total: [shot at 1920](proof/sessions-list-1920.png) Backfill by script: 61 records moved, [ma…
- 2026-10-25 [Chat scroll: locked and pinned to the bottom, no jumps](/framework/ai/sessions/2026/10/25/session-53d50878/task-mastermind-3/) — Chat scroll fix is merged (e8476f1b3, reviewed: 5 fixed/answered, 2 noted) — [what it does](/framework/ext/Chat/doc/scroll.md) Locked and pinned on every update, live whisper line included: prove-scroll.mjs, pinned through growth Unlocks only on a deliberate …
- 2026-10-19 [Cloud voice agent: guide, cloud-voice-<name> sessions, cloud_voice_log](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — Slice 3 landed (02a37b41d). Guide Servex/ext/remote/doc/cloud-voice-agent.md; the server instructions carry one pointer line; sessions are cloud-voice-<title> with a null cost field; the owner's correction applied: one cloud-only cloud_voice_log tool replaces…
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-09-29 [Voice sessions: the roles table, the echo link, and which log agents …](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/c-roles/) — Landed in worktree qf-9, commit c65ce26c — not yet merged into michael/dev, so these links aren't live on the site yet. Names reconciled into [one roles table](/framework/ai/2026-09-22/tiers-design/doc/roles.md): fast/smart assistant, directory mastermind, ta… · paths 1/1 exist
- 2026-10-26 [Agent-name links in chat go to a page that does not exist. ext/Mentio…](/framework/ai/sessions/2026/10/25/session-15fa7f56/mastermind-agent-name-links-resolve/) — Landed on michael/dev (ea637bcb4 + follow-up commit): agent-name links resolve to the agent's real dated task folder through AgentUrl (ai/index.json, no second index); /sessions/<name>/ redirects there; names with no record show 'Session not found'. Opened /s…

## Modules that exist now (files outside the module that import it)
- [core/Role](/framework/core/Role/) — used by 2 files
- [ext/Chat](/framework/ext/Chat/) — used by 16 files
- [ui/controls](/framework/ui/controls/) — used by 16 files

## Docs and readmes
- [Voice agents: who talks to whom when the owner speaks](/framework/ai/doc/voice-agents.md) — There are two separate voice systems. The Claude app on the phone (the cloud voice agent) and the website's own dictation (Whisper in the b…
- [Chat — a scrolling chat log, composer, and conversation wid…](/framework/ext/Chat/readme.md) — Follows new messages while scrolled to bottom, formats Markdown bubbles with avatar icons, and supports threading and reactions. Chat.js is…
- [One rolling voice session, or many](/framework/ux/Dictate/doc/sessions.md) — The browser voice chat is one session shared by every page (chat.js, kept in sessionStorage under lew42-voice-session). The question: shoul…
- [What every agent reads, the roles, and a readme audit (prop…](/framework/ai/doc/readme-system.md) — The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owne…
- [Smart scroll](/framework/ext/Chat/doc/scroll.md) — Proof: node ext/Chat/doc/proof/prove-scroll.mjs <site> (fill, growth, shrink, wheel-up unlock, the newest button, a bar over the bottom edg…
- [The fast and smart seats: who does what in the dictation ch…](/framework/ux/Dictate/doc/fast-and-smart.md) — Now: the fast seat stays on (the owner, 2026-11-01: it "might be doing half of the work", placement and refinement; "put them to work"; [th…
- [Built index — dictation, voice, chat and session work since…](/framework/ai/doc/built-index.md) — Generated by node Server/PastWork.mjs --built [since] from the landed task logs and git log (never edit by hand). Commit = the newest commi…
- [Context drift: why a long-running agent forgets its role, a…](/framework/ai/doc/context-drift.md) — Context drift is what happens to a long session. The instructions it started with (its role readme, its rules) sit hundreds of thousands of…

## Sessions tagged with these words
- 2026/10/15 [Clarity voice session](/framework/ai/sessions/2026/10/15/session-cbce90d6/) — kind/agent model/sonnet work/read-only task/voice-20261015. framework/ai · $0.23
- 2026/10/14 [Clarity voice connector](/framework/ai/sessions/2026/10/14/session-9a02d4eb/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/voice · $0.15
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79

## Owner asks
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)

## Commits
- 494e754de chat round 4: fix inverted cursor semantics, had_speech_q queue misalignment, stale text/docs
- 7217da3b5 chat round 3: two moving cursors replace the per-prompt stamp; fix the paragraph-gap renderer bug
- 71d2d7d48 chat round 2: fix review findings, moving cursor mark replaces standing ticks/per-node dots
- 88765fcf9 sheet step 10: the dictation redesign, mocks first
- 0fa85bdb0 one-input: composer() textarea shape (1→5 lines), mic→refine wiring, Refine demo onto composer
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- 60900e3f4 Voice-session fixes from 2026-10-01, committed as they stand in main

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Voice Chat roles: who are the voice agents, and are they defined properly?

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Voice Chat roles: who are the voice agents, and are they defined properly?"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
