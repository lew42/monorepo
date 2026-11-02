<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat V2 becomes a subclass of Chat V3  step 2 of the views plan " (words: chat, becom, subclas, step, view, plan)

## Tasks (8, best first)
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-16 [Task view: step 4 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/task-view/) — Landed on michael/dev as 9deda921e.
- 2026-10-20 [chat-one-session-one-view](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-one-session-one-view/) — (no outcome logged)
- 2026-10-20 [ai: prompt breakdown — brief loosened, outcomes, chat view, refinemen…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-breakdown/) — requirements.md
- 2026-10-16 [TaskPage, the thin route: step 11 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/task-page/) — Landed on michael/dev as 07f860988.
- 2026-10-16 [Task replay: steps 1-2 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/task-replay/) — Landed on michael/dev as 8935e1c77. core/Task gains Task.replay(lines) and a waiting state, and TaskLoop and TaskState read each task's state through it: only running tasks are chased, and a task waiting on the owner gets one reminder after 2 h, then one a da…
- 2026-10-16 [See the tasks: step 15 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/task-rows/) — Landed on michael/dev as 6d60fb7d2.

## Modules that exist now (files outside the module that import it)
- [core/View](/framework/core/View/) — used by 337 files
- [ext/Chat](/framework/ext/Chat/) — used by 15 files

## Docs and readmes
- [Plan: Chat V2 and V3 on session.messages (plan only, nothin…](/framework/core/Session/Chat/doc/views-on-messages.md) — The goal (the owner, 2026-11-01, 21:18): one real list of messages, prompts and sentences by id, so every chat view draws the same data and…
- [Constructing a view — the four steps, in order](/framework/core/View/doc/lifecycle.md) — js constructor(...args){ this.assign(...args); this.prerender(); this.initialize(); } Four steps, no options, and every View on the site ta…
- [ext/Chat/list — the simplest live view of a session's chat …](/framework/ext/Chat/list/readme.md) — ChatList draws session.messages ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) as bubbles, in the list's order: the owner's …
- [view.bind: keep a view in step with data (decision D7)](/framework/core/View/doc/bind.md) — js view.bind(item, "title", v => view.text(v)) // fn runs now, then when "title" changes view.bind(item, "title") // no fn: view.text(value…
- [Chat v2: a session's chat, drawn from its tasks list](/framework/ext/Chat/v2/readme.md) — - ⬜ Goal: the owner calls the whole experience "chat": the first view ([ux/Dictate](/framework/ux/Dictate/readme.md)) and Chat v2 become on…
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [Chat v3: a session's chat as a card per Prompt, with every …](/framework/ext/Chat/v3/readme.md) — Chat v3 draws session.messages (core/Session/Chat/readme.md): one card per Prompt, in the chat list's own order, with the Replies that answ…
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [Item system status](./core/doc/status.md) — what's built of the save-and-stream plan, what isn't, the check that sessions and t…

## Sessions tagged with these words
- 2026/10/13 [Core view architecture documentation](/framework/ai/sessions/2026/10/13/session-84fff8e8/) — kind/agent model/haiku mod/core/view task/mastermind-repo-slim docs/architecture · $0.29
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Chat V2 becomes a subclass of Chat V3 (step 2 of the views plan)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat V2 becomes a subclass of Chat V3 (step 2 of the views plan)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
