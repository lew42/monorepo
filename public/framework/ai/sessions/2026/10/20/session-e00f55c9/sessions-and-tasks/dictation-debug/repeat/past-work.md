<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  Whisper repeats the end of what was said" (words: dictation, whisper, repeat, end, wa, said)

## Tasks (8, best first)
- 2026-09-29 [Dictation: shorter wait before a sentence sends and before the assist…](/framework/ai/sessions/2026/09/29/dictate-lag/) — Two timers made dictation feel slow, and both are shorter now. Everything else takes about 10 ms. 4-5 s before the words appear in the chat: the microphone waited 4 s of quiet when the words did not end in a full stop. It now waits 2.5 s, the same as after a … · paths 2/2 exist
- 2026-10-25 [Dictation: words stay in place, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/flicker/) — Dictation: words stay in place. Ready to merge: branch worktree/dictation-flicker (6 commits). Cause and proof: [doc/flicker.md](/framework/ux/Dictate/doc/flicker.md). reproduce the flicker: a pause emptied the words, then waited for refine and the send queue…
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-21 [dictation-map](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/) — Dictation map: every piece found, five decisions for you; nothing built or moved. - ✅ "a thorough map of where every little piece is": [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md), linked from the Dictate readme - ✅ Transcriber vs Whisper explain…
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-17 [Whisper log page](/framework/ai/sessions/2026/10/16/voice-20261016/whisper-log/) — Closed by mastermind-checkup-past-work: the page /framework/audio/Whisper/log/ is on michael/dev (3cecf3724) and renders; its log shows 0 events until a dictation page writes to it, which is expected, not a bug. · paths 1/1 exist

## Docs and readmes
- [The Whisper demo: every reply from the speech server, as it…](/framework/audio/Whisper/doc/demo.md) — The demo at the top of the [Whisper page](/framework/audio/Whisper/) shows each answer whisper-server sends back, one row per answer, newes…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Dictation, per page](/framework/core/Page/ai/doc/dictation.md) — The microphone lives in the drawer — [ext/drawer](/framework/ext/drawer/) — the same component on every page, opened with the same ☰ button…
- [Refine: dictation to cards and tasks — the six subtasks, in…](/framework/ext/Refine/tasks/refine-dictation-to-cards-and-tasks/readme.md) — Source: the owner's dictations of 2026-10-16 (ext/Refine/doc/card-types.md, including the night addendum "one assistant, one pass, by sente…
- [Dictation map — every piece, where it lives, and what to do…](/framework/ux/Dictate/doc/map.md) — What this is: one page that finds any piece of the dictation system in one click: the mic, Whisper, the cleaners, the chat box, the voice s…
- [Mobile: why the phone said "socket connecting" (2026-10-09)](/framework/ux/Dictate/doc/mobile-socket-2026-10-09.md) — Short answer. Whisper is not a socket and it works from a phone. The "socket" in the old status line was the dev site's live-reload socket,…
- [The highlight — the wall on /framework/ai/](/framework/ai/AITask/doc/highlights.md) — A highlight is the one thing a task says about itself to someone who was not there. It is a single line the task appends to its own task.js…
- [AI v3 — a wall of idea cards, ranked by importance; a third…](/framework/ai/v/3/readme.md) — ## Use - Moved verbatim to [doc/views.md](./doc/views.md): the views. The chrome is ONE line, at every width (board-declutter, 2026-09-22 —…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## Commits
- 1ecd43024 dictation: clarity rewrite of the Whisper repeat brief
- 7d7e5a983 dictation-2: Whisper repeat bug brief

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation: Whisper repeats the end of what was said

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: Whisper repeats the end of what was said"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
