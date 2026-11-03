<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Order fix steps 2 and 3  one clock for every bubble" (words: order, fix, step, one, clock, every, bubble)

## Tasks (8, best first)
- 2026-10-25 [Dictation: why words arrive out of order — found, failing test](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — The misordered bubble comes from the render: two clocks mixed in one sort key. [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/report.md) find the layer at fault: the render. Chat.js retag_piece gives a pie… · paths 1/1 exist
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist
- 2026-10-09 [Chat: duplicate bubbles fixed at three sources](/framework/ai/sessions/2026/10/09/session-54aa047d/dup-chat-bubbles/) — Duplicate chat bubbles fixed (b87834ba2), one shared chat component, three causes. one bubble per message, typed and voice: 2x before, 1x after, at 400 and 1920 ([doc](/framework/ext/Chat/doc/duplicate-bubbles.md), proofs in doc/proof/) text twice inside one …
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 2/2 exist
- 2026-09-30 [Review: one skill asks every system's questions](/framework/ai/sessions/2026/09/30/review/review/) — One review skill asks every system's questions, with screenshots kept in the task · [walkthrough](/framework/ai/2026-09-30/review/walkthrough/) · reviewed: 6 fixed, 1 noted ([report](/framework/ai/2026-09-30/review/review/report.md)) ![](/framework/ai/2026-09… · paths 1/1 exist

## Docs and readmes
- [Prompt — one prompt, seen at every step of its refinement](/framework/ext/Refine/doc/prompt.md) — PromptRun (ext/Refine/PromptRun.js; was Prompt until 2026-10-25, when core Prompt extends Task took that name: [core/Task/doc/prompt.md](/f…
- [Constructing a view — the four steps, in order](/framework/core/View/doc/lifecycle.md) — js constructor(...args){ this.assign(...args); this.prerender(); this.initialize(); } Four steps, no options, and every View on the site ta…
- [Duplicate text in one chat bubble](/framework/ext/Chat/doc/duplicate-bubbles.md) — Symptom (owner, 2026-10-09): one bubble, one icon, the same line twice (up to four times): the first copy ends in a green ✓, the next ones …
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [One state of everything](/framework/ai/doc/one-state.md) — What you asked for (2026-10-17, 22:50): one coherent data structure, sessions plus module tasks, that represents the current state of every…
- [List — the ordered collection that announces every change](/framework/core/List/readme.md) — Every List is live. There's one class, List — no separate event-less variant any more (the owner, 2026-10-02: "scrap LiveList everywhere… L…
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [Core — the eight classes under every page (listed under Mor…](/framework/core/readme.md) — ## Index - [App](./App/) — boot and the one container pages mount into; you construct it once in /app.js - [Item](./Item/) — one node of a …

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 2de7a31eb dictation-2: order fix steps 2-3 brief
- 9891431cc Fix review findings: variant C consistency, walkthrough counts/links, H1 order, floating nav/page sizing, rai…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Order fix steps 2 and 3: one clock for every bubble

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Order fix steps 2 and 3: one clock for every bubble"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
