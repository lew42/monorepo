<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Voice prompts  log every one verbatim  by code" (words: voice, prompt, log, every, one, verbatim, code)

## Tasks (8, best first)
- 2026-10-19 [Voice prompts: log every one verbatim, by code](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/voice-logging/) — (no outcome logged)
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-10-12 [Refine asks: per-prompt Refine button, Things you mentioned, importan…](/framework/ai/sessions/2026/10/12/session-d399581f/refine-asks/) — Asks #7 and #10 are closed: three points built, the rest written up with the real blocker. Merged as a66e3b2dd; the voice walk after the merge is clean. Refine button on each of your prompts: proof button-proof.png in [STATE](/framework/ai/2026-10-12/refine-a… · paths 1/2 exist, gone: framework/ai/doc/asks/
- 2026-10-10 [Refine: prompts stored in the session log](/framework/ai/sessions/2026/10/09/session-48083d9d/refine-session-log/) — Each Refine prompt is now kept in its session's own log, in stages. [Session log doc](/framework/ext/Refine/md/doc/session-log-2026-10-10/) raw (immutable), then clean (final, numbered), then refined (cards citing indexes): proven with real model calls, 4 lin… · paths 1/2 exist, gone: framework/ext/Refine/md/doc/session-log-2026-10-10/
- 2026-10-09 [Refine and Dictate: one compact VoiceStrip, voice class map, phone an…](/framework/ai/sessions/2026/10/09/session-48083d9d/refine-dictate-ui/) — Phases 1 and 2 landed (2e237e3f8): one compact dictation panel, [VoiceStrip](/framework/ux/Dictate/VoiceStrip.js), now serves Refine and the Dictate demo. class architecture first: [voice-architecture](/framework/ux/Dictate/md/doc/voice-architecture/) one com… · paths 1/3 exist, gone: framework/ux/Dictate/md/doc/voice-architecture/ framework/ux/Dictate/md/doc/mobile-socket-2026-10-09/

## Modules that exist now (files outside the module that import it)
- [ext/catalog](/framework/ext/catalog/) — used by 7 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 3 files
- [ui/dialog](/framework/ui/dialog/) — used by 6 files

## Docs and readmes
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/readme.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Prompt — one prompt, seen at every step of its refinement](/framework/ext/Refine/doc/prompt.md) — Prompt (ext/Refine/Prompt.js) is the class the owner asked for in [the vision](vision-2026-10-08.md): one object per prompt that holds what…
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [Every prompt kept in its session's log (2026-10-10)](/framework/ext/Refine/doc/session-log-2026-10-10.md) — What: a prompt refined on the Refine page is saved in the session's own folder, in prompts.jsonl, in stages. Nothing is ever overwritten. |…
- [Quotation — one owner prompt: words, time, how, and a link](/framework/ux/Content/Quotation/readme.md) — A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: prompt — [shapes](/framework/ux/Conten…
- [Whisper log: every event, numbered (2026-10-16)](/framework/audio/Whisper/doc/whisper-log.md) — What it is. [WhisperLog](/framework/audio/Whisper/log/) (WhisperLog.js) writes one line for everything between the microphone and the Clean…
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [demo — show the code and run it from one source; the site's…](/framework/ext/demo/readme.md) — ## Index [shell](./shell/) — the page.demo() shell that every demo page on the site wears ## Use js import { demo } from "/app.js"; import …

## Sessions tagged with these words
- 2026/10/19 [Ultracode](/framework/ai/sessions/2026/10/19/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)

## Commits
- e04916ea5 sessions: commit the untracked records (session prompts/page, module files.jsonl and inbox.jsonl); ignore ai/…
- 03d19d718 session-dup: measure owner-prompt duplication against SDK files; stop council/crawl writing the retired day f…
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,892 tokens of reading, under the 100k limit).

Question: Voice prompts: log every one verbatim, by code

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Voice prompts: log every one verbatim, by code"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
