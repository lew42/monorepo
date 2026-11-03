<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  the placement assistant never writes a placement" (words: dictation, placement, assistant, never, writ)

## Tasks (8, best first)
- 2026-10-20 [writers](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-v2/writers/) — The assistants write the conversation — fd32ba0f4 on michael/dev, live since the 04:02 Servex restart. - ✅ one Prompt per spoken thought in the session's session.jsonl, written live while the owner talks (Servex/agents/Sessions.js say → PromptLines.js) - ✅ bo…
- 2026-09-29 [Dictation: shorter wait before a sentence sends and before the assist…](/framework/ai/sessions/2026/09/29/dictate-lag/) — Two timers made dictation feel slow, and both are shorter now. Everything else takes about 10 ms. 4-5 s before the words appear in the chat: the microphone waited 4 s of quiet when the words did not end in a full stop. It now waits 2.5 s, the same as after a … · paths 2/2 exist
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-21 [dictation-map](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/) — Dictation map: every piece found, five decisions for you; nothing built or moved. - ✅ "a thorough map of where every little piece is": [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md), linked from the Dictate readme - ✅ Transcriber vs Whisper explain…
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-15 [core/Page: subpages are page.jsonl lines, never page.js edits](/framework/ai/sessions/2026/10/16/voice-20261016/subpages/) — core/Page: subpages are page.jsonl lines, never page.js edits — closed out by mastermind-task-closeout: the task's own log says it finished and names its commit, but no landing line was written. Cost $1.34 (session 0c3e83dd). The log has the details.

## Docs and readmes
- [The LAN rule: a phone gets push traffic, never commands](/framework/dev/Socket/doc/lan.md) — The dev socket carries rpc:cmd (runs a shell command) and file writes, so it must never be open to the network. A phone on the home Wi-Fi s…
- [Refine: dictation to cards and tasks — the six subtasks, in…](/framework/ext/Refine/tasks/refine-dictation-to-cards-and-tasks/readme.md) — Source: the owner's dictations of 2026-10-16 (ext/Refine/doc/card-types.md, including the night addendum "one assistant, one pass, by sente…
- [Dictation map — every piece, where it lives, and what to do…](/framework/ux/Dictate/doc/map.md) — What this is: one page that finds any piece of the dictation system in one click: the mic, Whisper, the cleaners, the chat box, the voice s…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Writing for the owner: the detail behind CLAUDE.md](/framework/ai/doc/writing.md) — The root [CLAUDE.md](/CLAUDE.md) keeps the rules on how to write pages, replies and reports. The extra detail and examples that used to sit…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…
- [The fast assistant, per page](/framework/core/Page/ai/doc/assistant.md) — [Servex](/framework/servex/doc/roles/) runs one card assistant for every card — a small, fast, low-effort session that answers the owner ri…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)

## Commits
- bde2ad201 ai: dictation part 8, fast assistant (Haiku, persistent, placement + titles + cards) feeds the Opus smart ass…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation: the placement assistant never writes a placement

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: the placement assistant never writes a placement"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
