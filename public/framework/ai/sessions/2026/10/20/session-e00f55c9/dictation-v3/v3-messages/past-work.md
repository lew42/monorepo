<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat V3 draws  session messages   step 1 of the views plan " (words: chat, draw, session, messag, step, view, plan)

## Tasks (8, best first)
- 2026-11-02 [Session chat: one real message list, dual-written](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-messages/) — A voice session's chat is one real list, session.messages, written beside V1's lines; the fast seat's {place} improves now update a sentence's text in place (merges b35ee6370, 9165c4e6c; reviewed twice, every finding answered). one List of real Items, item to… · paths 1/1 exist
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-01 [Chat: fixed assistant replies drawing twice](/framework/ai/sessions/2026/10/01/chat-duplicate-messages/chat-duplicate-messages/) — Fixed: every assistant reply drew twice in the chat. [ux/Dictate/chat.js](http://monorepo.localhost/framework/ux/Dictate/) listens for new lines two ways at once (an SSE push and a file poll) and only the owner's own echoed message was ever deduped against th… · paths 2/3 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-10-26 [Session page: fixes from the v-9dvbbrn review](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-page-tasks/) — Landed on michael/dev ([requirements](requirements.md), [review](review.md), [shot](shots/framework-ai-AISession-3440.png)): Sort button: now a Cost / Newest pair Child heading: "Child sessions (N)" White strip under title: gone (.sov-stats[hidden] rule) Cons…
- 2026-10-26 [System map and proposal: dictation, sheet, chat, session, task, prompt](/framework/ai/sessions/2026/10/26/spawned/mastermind-system-map/) — Investigation and docs only, no code changed (commit 9ca35fb11). Map what exists: dictation, sheet, chat, session, task, prompt: [system-map.md](/framework/ai/system-map.md), a table of every part with its folder, class and writer Say what it should be: [syst…
- 2026-10-20 [chat-one-session-one-view](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-one-session-one-view/) — (no outcome logged)

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 21 files
- [core/View](/framework/core/View/) — used by 337 files
- [ext/Chat](/framework/ext/Chat/) — used by 15 files
- [ext/drawer](/framework/ext/drawer/) — used by 16 files
- [ext/Session](/framework/ext/Session/) — used by 16 files

## Docs and readmes
- [Plan: Chat V2 and V3 on session.messages (plan only, nothin…](/framework/core/Session/Chat/doc/views-on-messages.md) — The goal (the owner, 2026-11-01, 21:18): one real list of messages, prompts and sentences by id, so every chat view draws the same data and…
- [ext/Chat/list — the simplest live view of a session's chat …](/framework/ext/Chat/list/readme.md) — ChatList draws session.messages ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) as bubbles, in the list's order: the owner's …
- [Chat v2: a session's chat, drawn from its tasks list](/framework/ext/Chat/v2/readme.md) — - ⬜ Goal: the owner calls the whole experience "chat": the first view ([ux/Dictate](/framework/ux/Dictate/readme.md)) and Chat v2 become on…
- [core/Session/Chat — a session's chat as one real list](/framework/core/Session/Chat/readme.md) — A voice session's conversation is one ordered list of real Items, session.messages, beside the owner's raw words in session.sentences. A vi…
- [Pseudo properties: V1's {chat} and {place} lines](/framework/core/Session/Chat/doc/pseudo-properties.md) — A pseudo property is a line in a voice session's session.jsonl whose top-level key (chat, place) is not a real field of the Session class. …
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Chat v3: a session's chat as a card per Prompt, with every …](/framework/ext/Chat/v3/readme.md) — Chat v3 draws a session's tasks list, plus the replies written as old-style {chat} lines. It never writes and never reshapes a Prompt. It i…

## Sessions tagged with these words
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Drawer architecture documentation](/framework/ai/sessions/2026/10/13/session-32afe0f6/) — kind/owner model/haiku mod/ext/drawer mod/ai/sessions task/mastermind-repo-slim docs/architecture · $0.30
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/voice-20261016/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)

## Commits
- 28189ccf3 Session chat list: session.messages (Chat of Prompt, Reply, Message) and session.sentences, dual-written by S…
- 33f9695a1 ai/AISession: session-page fixes from the v-9dvbbrn review
- f8b89c74e Resync chat.js with michael/dev's landed session-switcher redesign
- 48edf5b6e Review fix round 2: wire the renamed SSE event to a live redraw
- 727f0e475 Dictate: session switcher review fixes (stale wording, mid-read close)
- 8ede86afc chat-split-fixes: one shared cursor pair per bubble, Prompt-closed merge, shared cursors.js
- df173833f Dictate: one session switcher (dropdown + plus), mobile sheet and drawer
- 6e640ddc7 Chat: the open bubble stays last, never split by what lands in between

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Chat V3 draws `session.messages` (step 1 of the views plan)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat V3 draws `session.messages` (step 1 of the views plan)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
