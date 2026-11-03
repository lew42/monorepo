<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat  one short doc of how a chat is made  end to end" (words: chat, one, short, doc, made, end)

## Tasks (8, best first)
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Figma to code: 36 pages inventoried, 6 have code, 17 only a doc, 13 n…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/figma-to-code/) — The round-trip inventory is on the Figma pages: 36 Figma pages and 36 inventory rows (counts agree); 6 have a code page, 17 only a doc, 13 nothing yet. Landed a1129ce8d. Landed by the mastermind from the agent's own log line and merge commit (the agent ended …
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-10-12 [Refine: Haiku by default, one chat input, live refine while you talk](/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/) — Refine runs on Haiku, the outline grows while you talk, and every chat area uses one input. Clean + refine on Haiku, OpenRouter only by the switch: RefineCall.model(); write openrouter in session-backend.txt to flip ([models.md](/framework/ai/doc/models.md)) … · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/Chat](/framework/ext/Chat/) — used by 13 files
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ui/doc](/framework/ui/doc/) — used by 5 files, no readme
- [ux/doc](/framework/ux/doc/) — used by 3 files, no readme

## Docs and readmes
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [Duplicate text in one chat bubble](/framework/ext/Chat/doc/duplicate-bubbles.md) — Symptom (owner, 2026-10-09): one bubble, one icon, the same line twice (up to four times): the first copy ends in a green ✓, the next ones …
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [ErrorLog architecture — one static class appends errors and…](/framework/ext/ErrorLog/doc/architecture.md) — ErrorLog turns an error on the page into one log line a session can follow. Entry: [ErrorLog.js](../ErrorLog.js). The error and a state sna…
- [Saver architecture — one write queue under three methods, b…](/framework/ext/Saver/doc/architecture.md) — Saver is where a JSON document goes: save(item), load(), delete(). The base class holds only the write queue ([Saver.js](../Saver.js)); eac…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…

## Sessions tagged with these words
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26
- 2026/10/15 [Minion handoff messages visibility](/framework/ai/sessions/2026/10/15/session-cce1ac2c/) — kind/owner model/haiku mod/ai/sessions task/loose-ends · $0.53
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/15 [README claims clarity check](/framework/ai/sessions/2026/10/15/session-799faa1d/) — kind/agent model/sonnet work/read-only task/page-system docs/readme · $0.15

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)

## Commits
- 4963c7c6f Dictate: fix duplicate chat bubbles — drop a stale Whisper answer instead of committing it
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel
- a34539f98 ai2/ext/drawer: card measure edge, phantom chat-column void, inspect-mode gate

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat: one short doc of how a chat is made, end to end

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat: one short doc of how a chat is made, end to end"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
