<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat v2  update in place  never redraw" (words: chat, update, place, never, redraw)

## Tasks (8, best first)
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-25 [Dictation: words stay in place, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/flicker/) — Dictation: words stay in place. Ready to merge: branch worktree/dictation-flicker (6 commits). Cause and proof: [doc/flicker.md](/framework/ux/Dictate/doc/flicker.md). reproduce the flicker: a pause emptied the words, then waited for refine and the send queue…
- 2026-10-20 [ask_mastermind: late answers reach updates; wait:false ticket](/framework/ai/sessions/2026/10/20/voice-20261020/async-ask/) — ask_mastermind no longer loses an answer. When the one-minute wait ends (timeout or cancelled call) RemoteMCP.ask() keeps watching the reply file for 30 minutes and puts the answer in the voice-app inbox (from: voice-mastermind, reply_to = question id) plus i…
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [The LAN rule: a phone gets push traffic, never commands](/framework/dev/Socket/doc/lan.md) — The dev socket carries rpc:cmd (runs a shell command) and file writes, so it must never be open to the network. A phone on the home Wi-Fi s…
- [Chat.js notes](/framework/ext/Chat/doc/notes.md) — Design reasons and history moved out of Chat.js comments. Each heading is pointed to from the code. ## chat-log A scrolling column of messa…
- [chat.js — notes and architecture](/framework/ux/Dictate/doc/chat-notes.md) — ## Controller factory pattern Everything this file used to do with one module-level singleton now lives in create_controller(), so it can b…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [The traps that never throw — full list](/framework/code/dos-and-donts/doc/traps.md) — Each entry is the trap and the check, in that order. Where a link follows, the incident that taught it (the measurement, the symptom, the f…
- [Page storage: one page system, many places to keep its lines](/framework/core/Page/doc/storage.md) — A page is a list of changes (deltas), one JSON line each. Where those lines are kept can change; the page never knows. Today they are kept …
- [The chat tab, the path bar, and the mastermind log — 2026-0…](/framework/dev/DevBar/doc/chat.md) — ⚠ STATUS after the 23:16 reset (ai/sessions/2026/09/19/reset-recovery/): the path bar and the mastermind log below are live again; the chat…
- [The ai section — a chat is a task](/framework/dev/DevBar/doc/threads.md) — <page>ai/<slug>/task.jsonl A thread is a directory next to the page it's about, holding the same task.jsonl [ext/JSONL](/framework/ext/JSON…

## Sessions tagged with these words
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26

## Owner asks
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)

## Commits
- 7ce5eb5b2 chat-v2: step 1 landed, review answers, briefs for in-place updates and the writers
- 2b1bfc6d6 dictation-debug: Debug tab (DictateHealth layers), the stall fixed, bubbles idempotent, errors per module

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat v2: update in place, never redraw

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat v2: update in place, never redraw"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
