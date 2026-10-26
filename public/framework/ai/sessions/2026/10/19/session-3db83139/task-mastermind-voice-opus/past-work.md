<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "You are an Opus mastermind standing by for voice session v timqv56  the owner speaks by voice from the site  home page  " (words: you, opu, mastermind, stand, voice, session, timqv56, owner, speak, site, home)

## Tasks (8, best first)
- 2026-10-19 [You are an Opus mastermind standing by for voice session v-timqv56 (t…](/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/) — (no outcome logged)
- 2026-10-15 [voice-mastermind](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-mastermind/) — Each voice session now gets its own Opus mastermind (loads the voice-mastermind skill): the gateway mints an Mcp-Session-Id, spawns on the first question, reuses it, keeps the map in remote.sessions.json, logs chat lines and a remote_mcp line with session and…
- 2026-10-15 [voice session: factual maps of the AI and page systems](/framework/ai/sessions/2026/10/15/voice-20261015/) — Voice session 2026-10-15 closed; a new voice session (voice-20261016) took over at 19:06. Landed: /live/ as a one-screen presentation surface that voice-app writes and clears on a topic change (1b96fb2b4), plus /live/ reloading itself, editing items in place …
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-13 [Session data: owner prompts are duplicated (8 MB in git, ~185 MB loca…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-dup-check/) — Yes, our logs duplicate the owner's prompts: 8.05 MB in git and about 185 MB on disk also live in the SDK session files. The words and voice test logs are now ignored, the council and crawl writers go to the store, and the two stray folders were moved by scri…
- 2026-10-03 [Sessions: no duplicate transcripts, date-path homes, Start/Stop/Durat…](/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-date-homes/) — Reconciled the Sessions tab with three decisions made since it shipped. [/framework/ai/sessions/](/framework/ai/sessions/) no duplicate data — the 110-file transcripts/ copy is gone; prompts load live through /ai-logs/<id> a session's home is its date path — …
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-09-29 [Reply-latency trace: the ✦ sheet's 3-second wait, hop by hop](/framework/ai/sessions/2026/09/30/reply-latency/reply-latency/) — What landed: a hop-by-hop timing table for the mobile ✦ sheet's reply (~4.4s cold, ~2.8-3.7s warm), measured live and posted to the owner's card, with the 3 biggest fixes. one table, hop -> ms cold/warm -> cause: [the card](/framework/ai/2026/09/29/mobile-nav…

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Session](/framework/core/Session/) — used by 9 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ext/Session](/framework/ext/Session/) — used by 9 files
- [ux/Understand](/framework/ux/Understand/) — used by 2 files

## Docs and readmes
- [Try it on your phone — voice to session page](/framework/ux/Dictate/doc/try-it.md) — You talk (or type); five stages appear live on a page, one under another. That page is the feedback loop. ## Steps 1. On the phone, open ht…
- [Session — one ✦ press is one voice session, answered by a f…](/framework/ext/Session/readme.md) — A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one file: <home>ai/<session>.jso…
- [Session accounting: what was decided, and where each ask st…](/framework/ai/AISession/doc/accounting-decision.md) — Decision (2026-10-16 18:53, voice-app, owner delegated): the one-folder shape.md is not built as its own project. The task system (Task ext…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — Decided by mastermind-task-folders (session e456f109), brief: [requirements.md](../sessions/2026/10/12/session-e456f109/task-folders/requir…
- [Owner notes, 2026-10-16: a full voice conversation (dictate…](/framework/audio/Voice/doc/owner-2026-10-16-voice-conversation.md) — Not a plan, not approved. The owner's words condensed so a later session can find them. Past work on voice output: this module (Voice.js, b…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…
- [Using the space: fluid first, no voids, no clipping (owner,…](/framework/design/layout/doc/space.md) — Suggestions, not laws. Each one has a reason, and a good reason to break it wins. They apply the same way in the browser and in Figma. The …
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…

## Sessions tagged with these words
- 2026/10/19 [Ultracode](/framework/ai/sessions/2026/10/19/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $643.06
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/13 [Review site pages](/framework/ai/sessions/2026/10/13/session-e81b9703/) — kind/owner model/opus mod/ext/figma mod/ai/sessions mod/ux/content task/mastermind-repo-slim · $10.44
- 2026/10/13 [AI pages review and rebuild](/framework/ai/sessions/2026/10/13/session-b6236021/) — kind/owner model/opus mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $9.82

## Owner asks
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-13 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (?, queued)
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)

## Commits
- 35d61270b Figma: page-layout rule (1920 wrapper, page components, Index), MCP desktop vs remote, mastermind role
- d0407ba5a skills/sub-mastermind: drop 'never write code by hand' (contradicted its own 'do the task yourself'), retired…
- b2ef0ed02 skills/minion: commit your own files (was: never commit), no hand-started servers (server-guard blocks them),…
- 35666f92d mastermind skill: never wait on the owner; merge finished work yourself; park unaffordable work as a readme T…
- ceb45959f drawer inbox: each author with its icon (the M for a mastermind), 'you' for the owner
- 1fc8be0b2 servex-mastermind: announce your id to running task masterminds on takeover
- b7ddf5c42 AI 2 groups: all seven always in view; no agent id in a card's head

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,881 tokens of reading, under the 100k limit).

Question: You are an Opus mastermind standing by for voice session v-timqv56 (the owner speaks by voice from the site; home page /

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "You are an Opus mastermind standing by for voice session v-timqv56 (the owner speaks by voice from the site; home page /"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
