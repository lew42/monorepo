<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Voice Chat  release the mic on pause  and send every sentence the moment it ends  you are a mastermind  on Sonnet  medium effort " (words: voice, chat, release, mic, pause, send, every, sentence, moment, end, you, mastermind, sonnet, medium, effort)

## Tasks (8, best first)
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-30 [Mic send delay: 2500ms to 1500ms, paragraph pause matched](/framework/ai/sessions/2026/09/30/send-delay/send-delay/) — Shorter silence before dictated words send. [ext/Chat/Mic.js](/framework/ext/Chat/Mic.js): pause_send_ms 2500 -> 1500 paragraph_pause_ms (was 2500) brought down in proportion -> 1500 STORE bumped chat.mic.settings.2 -> .3, migrating the owner's other saved va… · paths 1/1 exist
- 2026-11-02 [Chat V1.2: V1 drawn from session.messages, with a send cursor and one…](/framework/ai/sessions/2026/10/20/session-e00f55c9/v1-2/) — Chat V1.2 is merged ([8dd955cb8](/framework/ai/sessions/2026/10/20/session-e00f55c9/v1-2/walkthrough.md)); try the V1.2 chip. V1.2 beside V1, V2, V3: chip on the session page, entry in the sheet/drawer dropdown, [demo](/framework/ext/Chat/v1-2/) Send cursor: … · paths 1/1 exist
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/Chat](/framework/ext/Chat/) — used by 16 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [Text prep: what Recite sends to a voice engine (an idea, no…](/framework/audio/Recite/doc/text-prep.md) — The owner (2026-11-01): "down the road, get it working first". Relayed from the web voice session. 1. Plain English in: the text a voice en…
- [Chat V1.2: V1 drawn from session.messages, with a send curs…](/framework/ext/Chat/v1-2/readme.md) — V1.2 is V1 (../Chat.js, the bubbles you already know) fed from session.messages ([core/Session/Chat](/framework/core/Session/Chat/readme.md…
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [Chat v2: ChatV3, plus the ✓/🧠 marks and replies beside the…](/framework/ext/Chat/v2/readme.md) — class ChatV2 extends ChatV3 ([../v3/](../v3/readme.md), step 2 of [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages…
- [Surfaces — every voice and chat surface on one page](/framework/ux/Dictate/surfaces/readme.md) — page.js is the page: nine surfaces, each with a fresh screenshot (*-1920.png, sheet-400.png), where it appears, the file that renders it, w…
- [UX — the behavior tier: ui/ hands you markup, ux/ hands you…](/framework/ux/readme.md) — ## Index Every module here, and what you would use it for. - [Auth](./Auth/) — login, signup, password reset and a social-login row, as one…
- [Talk — press the mic, talk, see your words](/framework/ai/talk/readme.md) — One page, two things on it: a big microphone button, and under it one card that fills with what you say as you say it. Open it at [/framewo…

## Sessions tagged with these words
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/14 [Clarity voice connector](/framework/ai/sessions/2026/10/14/session-9a02d4eb/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/voice · $0.15
- 2026/10/13 [Dictate session duplicate buttons](/framework/ai/sessions/2026/10/13/session-e0227bd6/) — kind/owner model/sonnet mod/ux/dictate task/mastermind-repo-slim servex/voice · $2.52
- 2026/10/13 [Voice dedupe surfaces](/framework/ai/sessions/2026/10/13/session-84417412/) — kind/owner model/sonnet task/mastermind-repo-slim servex/voice · $1.02
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)

## Commits
- c25c5a394 push-to-talk: site-wide push-to-talk dictation + a hotkey manager

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Voice Chat: release the mic on pause, and send every sentence the moment it ends (you are a mastermind, on Sonnet, medium effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Voice Chat: release the mic on pause, and send every sentence the moment it ends (you are a mastermind, on Sonnet, medium effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
