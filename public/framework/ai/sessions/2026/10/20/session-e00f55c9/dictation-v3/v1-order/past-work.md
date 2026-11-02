<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "V1 chat  replies in arrival order  below everything already shown" (words: chat, repli, arrival, order, below, everyth, already, shown)

## Tasks (8, best first)
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist
- 2026-11-02 [Session chat: one real message list, dual-written](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-messages/) — A voice session's chat is one real list, session.messages, written beside V1's lines; the fast seat's {place} improves now update a sentence's text in place (merges b35ee6370, 9165c4e6c; reviewed twice, every finding answered). one List of real Items, item to… · paths 1/1 exist
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-01 [Card replies can target one specific earlier line, threaded](/framework/ai/sessions/2026/10/01/card-threaded-replies/card-threaded-replies/) — A reply can now be tied to one specific earlier thing said on a card, nested under it instead of landing at the flat bottom of the chat. card_reply(card, text, from, re) — re names the id of the prompt or reply it answers; every message now gets an id. Servex… · paths 4/5 exist, gone: framework/ai2/doc/cards/
- 2026-10-01 [Chat: fixed assistant replies drawing twice](/framework/ai/sessions/2026/10/01/chat-duplicate-messages/chat-duplicate-messages/) — Fixed: every assistant reply drew twice in the chat. [ux/Dictate/chat.js](http://monorepo.localhost/framework/ux/Dictate/) listens for new lines two ways at once (an SSE push and a file poll) and only the owner's own echoed message was ever deduped against th… · paths 2/3 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-09-30 [Dictation: live chat bubble, streamed replies, answers on silence](/framework/ai/sessions/2026/09/30/dictation-stream/dictation-stream/) — Your words now grow as a bubble in the chat, and replies type themselves out. [Walkthrough](/framework/ai/2026-09-30/dictation-stream/#1) dictation creates the message in the chat: [shot](proof/1-words-growing.png) text box kept: gear, "dictation goes into" r… · paths 3/3 exist
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 15 files

## Docs and readmes
- [ext/Chat/list — the simplest live view of a session's chat …](/framework/ext/Chat/list/readme.md) — ChatList draws session.messages ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) as bubbles, in the list's order: the owner's …
- [chat.js — notes and architecture](/framework/ux/Dictate/doc/chat-notes.md) — ## Controller factory pattern Everything this file used to do with one module-level singleton now lives in create_controller(), so it can b…
- [Ranking — owner items first, and the order the owner put th…](/framework/ai/AITask/doc/ranking.md) — Three things share one idea. Some items are waiting on the owner, and those go above everything else. Every list here can be put in an orde…
- [core/Session/Chat — a session's chat as one real list](/framework/core/Session/Chat/readme.md) — A voice session's conversation is one ordered list of real Items, session.messages, beside the owner's raw words in session.sentences. A vi…
- [The chat tab, the path bar, and the mastermind log — 2026-0…](/framework/dev/DevBar/doc/chat.md) — ⚠ STATUS after the 23:16 reset (ai/sessions/2026/09/19/reset-recovery/): the path bar and the mastermind log below are live again; the chat…
- [The ai section — a chat is a task](/framework/dev/DevBar/doc/threads.md) — <page>ai/<slug>/task.jsonl A thread is a directory next to the page it's about, holding the same task.jsonl [ext/JSONL](/framework/ext/JSON…
- [ChatPanel: design notes and removed commentary](/framework/ext/Chat/doc/ChatPanel-notes.md) — ## Panel naming and URL routing A stable name per panel on a page, in build order — the same on a reload, so a drilled-in url (#chat=panel-…
- [Chat v3: a session's chat as a card per Prompt, with every …](/framework/ext/Chat/v3/readme.md) — Chat v3 draws a session's tasks list, plus the replies written as old-style {chat} lines. It never writes and never reshapes a Prompt. It i…

## Sessions tagged with these words
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26

## Owner asks
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: V1 chat: replies in arrival order, below everything already shown

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "V1 chat: replies in arrival order, below everything already shown"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
