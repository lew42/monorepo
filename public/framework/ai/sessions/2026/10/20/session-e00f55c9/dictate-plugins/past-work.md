<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Voice Chat  every feature is a plugin you can switch on and off  you are a mastermind  on Opus  an architecture decision across Dictate  Recite and the chat views " (words: voice, chat, every, feature, plugin, you, can, switch, off, mastermind, opu, architecture, decision, acros, dictate, recite, view)

## Tasks (8, best first)
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-26 [Task (owner, 2026-10-25): voice sessions in the "Switch session" drop…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-names/) — (no outcome logged)
- 2026-10-25 [Session page: voice sessions no longer stall Overview/Timeline/Tasks/…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-page-blank/) — Voice session pages now load: Overview, Timeline, Tasks, Board and Coverage fill in, and the empty white strip is gone. Overview, Timeline, Tasks no longer blank: Overview shows 2 child sessions / 23 tasks, Timeline 229 events (f4e929097) Board and Coverage p…
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist
- 2026-10-20 [Chat data model: one list drives every view](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/) — Chat model, steps 1 to 8 landed on michael/dev (last merge d10a91a95, pushed), each step reviewed. Item/List phase-0 fixes 1 to 5, with tests that run (step 1) one list (session.messages) Servex writes beside {chat}: [core/Session/Chat](/framework/core/Sessio…
- 2026-10-19 [You are an Opus mastermind standing by for voice session v-timqv56 (t…](/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/) — (no outcome logged)

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/View](/framework/core/View/) — used by 338 files
- [ext/Chat](/framework/ext/Chat/) — used by 16 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ui/decision](/framework/ui/decision/) — used by 4 files
- [ux/Dictate](/framework/ux/Dictate/) — used by 34 files

## Docs and readmes
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [Item system status](./core/doc/status.md) — what's built of the save-and-stream plan, what isn't, the check that sessions and t…
- [Tree — nested rows you can open, drag and drill into. One c…](/framework/ux/Tree/readme.md) — Rows from a plain array, or straight from a Page's children. The keyboard is always on. Drag, the drill-down and the row buttons are proper…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [Talking to the mastermind through the Claude app's voice mo…](/framework/ux/Dictate/doc/voice-bridge.md) — ## What is exposed today (checked 2026-10-17) - Everything. POST /mcp/remote (Servex/ext/remote/RemoteMCP.js) serves the whole Servex tool …
- [Tree architecture — one class, and everything else is a swi…](/framework/ux/Tree/doc/architecture.md) — ux/Tree turns an array of nodes (or a Page's children) into nested rows that you can open, drag and drill into. Its one class is [Tree.js](…
- [Decisions](/framework/core/Page/layout/switcher/doc/decisions.md) — ## Open - CSS namespace reservation, not yet written to css-scopes.txt. That file is outside this task's fence (core/Page/layout/switcher/ …
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [chat.js — notes and architecture](/framework/ux/Dictate/doc/chat-notes.md) — ## Controller factory pattern Everything this file used to do with one module-level singleton now lives in create_controller(), so it can b…

## Sessions tagged with these words
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/13 [Dictate session duplicate buttons](/framework/ai/sessions/2026/10/13/session-e0227bd6/) — kind/owner model/sonnet mod/ux/dictate task/mastermind-repo-slim servex/voice · $2.52
- 2026/10/13 [Layout architecture documentation](/framework/ai/sessions/2026/10/13/session-abc4b9cc/) — kind/agent model/haiku mod/core/layout task/mastermind-repo-slim docs/architecture · $0.19
- 2026/10/13 [Repo size plan review](/framework/ai/sessions/2026/10/13/session-8c0d50e5/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim docs/architecture · $0.57
- 2026/10/13 [Core view architecture documentation](/framework/ai/sessions/2026/10/13/session-84fff8e8/) — kind/agent model/haiku mod/core/view task/mastermind-repo-slim docs/architecture · $0.29
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- 5ede801de chat-model steps 5+6: Sentence.at confirmed, Prompt.raw, Prompt as a card, sent marks on the message
- 10b1c466b chat-model s1: fix 5's add-envelope live-reference bug (review round 2)
- 7ba1dafac Sessions across tabs: join the latest voice session used in the last 30 min (JOIN_IDLE_MS) instead of startin…
- b945747cb ai: map pseudo-properties, voice session structure and every refinement system; proposal changes 24-31 (hones…
- 9b4fe7c98 Voice sessions: real titles, folder tracks the title, no more "no session undefined"
- 494e754de chat round 4: fix inverted cursor semantics, had_speech_q queue misalignment, stale text/docs
- 7217da3b5 chat round 3: two moving cursors replace the per-prompt stamp; fix the paragraph-gap renderer bug
- 71d2d7d48 chat round 2: fix review findings, moving cursor mark replaces standing ticks/per-node dots

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Voice Chat: every feature is a plugin you can switch on and off (you are a mastermind, on Opus: an architecture decision across Dictate, Recite and the chat views)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Voice Chat: every feature is a plugin you can switch on and off (you are a mastermind, on Opus: an architecture decision across Dictate, Recite and the chat views)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
