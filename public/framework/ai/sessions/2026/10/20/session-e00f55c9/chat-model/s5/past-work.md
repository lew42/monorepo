<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "chat model steps 5 6  Sentence at  Prompt raw  Prompt kind items  marks on the Prompt message" (words: chat, model, step, sentence, prompt, raw, kind, item, mark, message)

## Tasks (8, best first)
- 2026-10-20 [chat-model steps 5+6: Sentence at, Prompt.raw, Prompt kind/items, mar…](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/s5/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/builder.md
- 2026-11-02 [Session chat: one real message list, dual-written](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-messages/) — A voice session's chat is one real list, session.messages, written beside V1's lines; the fast seat's {place} improves now update a sentence's text in place (merges b35ee6370, 9165c4e6c; reviewed twice, every finding answered). one List of real Items, item to… · paths 1/1 exist
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-01 [Chat: fixed assistant replies drawing twice](/framework/ai/sessions/2026/10/01/chat-duplicate-messages/chat-duplicate-messages/) — Fixed: every assistant reply drew twice in the chat. [ux/Dictate/chat.js](http://monorepo.localhost/framework/ux/Dictate/) listens for new lines two ways at once (an SSE push and a file poll) and only the owner's own echoed message was ever deduped against th… · paths 2/3 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-09-29 [Chat HITL: /api/hitl (per-sentence marks + title rename)](/framework/ai/sessions/2026/09/29/audio/audio/next-chat-hitl/hitl-api/) — Landed: POST /api/hitl — the smart assistant's two small model calls for the human-in-the-loop chat, built exactly like /api/tidy. per-sentence purpose + ok/unclear mark, with a concrete two-reading question when unclear — [Servex/agents/hitl.js](/Servex/agen…
- 2026-11-02 [Budget: $5. Load the minion skill first. You build STEP 3 ONLY of pub…](/framework/ai/sessions/2026/11/01/session-9d491f36/minion-minion-chat-model-s3/) — (no outcome logged)
- 2026-10-26 [System map and proposal: dictation, sheet, chat, session, task, prompt](/framework/ai/sessions/2026/10/26/spawned/mastermind-system-map/) — Investigation and docs only, no code changed (commit 9ca35fb11). Map what exists: dictation, sheet, chat, session, task, prompt: [system-map.md](/framework/ai/system-map.md), a table of every part with its folder, class and writer Say what it should be: [syst…
- 2026-10-20 [v3-messages](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/v3-messages/) — Chat V3 draws session.messages (step 1 of the views plan). ✅ Replies sit under the Prompt holding their re.to: placement.test.mjs 18/18. ✅ List order and live append: ChatV3.test.mjs 16/16. ✅ A pause starts a paragraph (PARAGRAPH_GAP_MS). ✅ Smoke shows no FAI… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 59 files
- [ext/Chat](/framework/ext/Chat/) — used by 15 files
- [ext/drawer](/framework/ext/drawer/) — used by 16 files
- [ext/markdown](/framework/ext/markdown/) — used by 57 files
- [ext/sprawl](/framework/ext/sprawl/) — used by 1 files
- [ui/item](/framework/ui/item/) — used by 12 files

## Docs and readmes
- [Chat v2: ChatV3, plus the ✓/🧠 marks and replies beside the…](/framework/ext/Chat/v2/readme.md) — class ChatV2 extends ChatV3 ([../v3/](../v3/readme.md), step 2 of [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages…
- [Chat v3: a session's chat as a card per Prompt, with every …](/framework/ext/Chat/v3/readme.md) — Chat v3 draws session.messages (core/Session/Chat/readme.md): one card per Prompt, in the chat list's own order, with the Replies that answ…
- [Plan: Chat V2 and V3 on session.messages (plan only, nothin…](/framework/core/Session/Chat/doc/views-on-messages.md) — The goal (the owner, 2026-11-01, 21:18): one real list of messages, prompts and sentences by id, so every chat view draws the same data and…
- [Card catalog — every kind of box, drawn live](/framework/ux/Content/catalog/readme.md) — One wall of tiles, grouped by family. Each tile draws the kind by running its render snippet, and says its padding, whether it bleeds, and …
- [core/Session/Chat — a session's chat as one real list](/framework/core/Session/Chat/readme.md) — A voice session's conversation is one ordered list of real Items, session.messages, beside the owner's raw words in session.sentences. A vi…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [Prompt — one prompt, seen at every step of its refinement](/framework/ext/Refine/doc/prompt.md) — PromptRun (ext/Refine/PromptRun.js; was Prompt until 2026-10-25, when core Prompt extends Task took that name: [core/Task/doc/prompt.md](/f…
- [Why Raw highlights, even though nothing marked it](/framework/ext/Refine/doc/raw-match.md) — clean.md numbers its own sentences (S1, S2, …), because Server/refine.mjs writes them that way on purpose — later files cite [S3, S7] again…

## Sessions tagged with these words
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26
- 2026/10/13 [Core Item architecture](/framework/ai/sessions/2026/10/13/session-5d65b684/) — kind/agent model/haiku mod/core/item task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/13 [Markdown module architecture](/framework/ai/sessions/2026/10/13/session-42593586/) — kind/agent model/haiku mod/ext/markdown task/mastermind-repo-slim docs/architecture · $0.17
- 2026/10/13 [Drawer architecture documentation](/framework/ai/sessions/2026/10/13/session-32afe0f6/) — kind/owner model/haiku mod/ext/drawer mod/ai/sessions task/mastermind-repo-slim docs/architecture · $0.30

## Owner asks
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)
- 2026-10-18 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (?, tracked)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)

## Commits
- 5f52687b8 chat-model s4 review fix: one keyed-placement loop, resolvable demo Ref
- a5ab51bf6 chat-model s4: List.View keyed reconcile for add/remove/move/order; Ref members via RefView
- e89cd12e3 chat-model: step 3 review answered; two improvements filed
- b68400cbc chat-model: step 2 complete, step 3 builder started
- 0b48d2fae chat-model: step 2 review answered, F7 add() default filed as an owner task
- 9cd0b7816 chat-model s2: List.ref guards (unattached, storeless foreign tree) + tests; plan step 2 text matches decisio…
- 574b85f3b chat-model: step 2 goes non-breaking (List.ref), decision logged
- 26a173603 chat-model: step 1 landed, budget decision for steps 2-8

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: chat-model steps 5+6: Sentence at, Prompt.raw, Prompt kind/items, marks on the Prompt message

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "chat-model steps 5+6: Sentence at, Prompt.raw, Prompt kind/items, marks on the Prompt message"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
