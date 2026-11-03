<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Integration 2  every build on one branch  fixed and tested together  NOT merged into michael dev" (words: integration, every, build, one, branch, fixed, tested, together, not, merged, into, michael, dev)

## Tasks (8, best first)
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-09 [AI: merged AI 2 into AI with shims at every old path](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/) — AI 2 is now part of AI, nothing deleted. cards and rail moved by one script (git mv, manifest, reversible): [cards](/framework/ai/cards/), [rail](/framework/ai/rail/); old docs in [ai/doc/ai2](/framework/ai/doc/ai2/history.md) every old /framework/ai2/... imp… · paths 3/3 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-28 [Commit the live system: 326 uncommitted files into 12 named commits o…](/framework/ai/sessions/2026/09/29/1a4ab710-89f0-45d1-88ca-1f929880a2d1/commit-live-system/) — Landed — 326 uncommitted files went from git status --short down to about 10-12 (that count keeps moving; other agents are writing live), in 12 commits on michael/dev, none pushed. Groups + reasoning: [groups.md](/framework/ai/2026-09-28/commit-live-system/gr… · paths 1/1 exist
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/

## Docs and readmes
- [Layouts — every whole-page layout as a class string, on one…](/framework/styles/layouts/readme.md) — ## Index - [catalog](./catalog/) — every layout ranked, with use count, what content it suits and when not to; [content → layout](./catalog…
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [Router — everything between "a url changed" and "the DOM re…](/framework/core/Router/readme.md) — ## Use html <a href="/docs/intro/">Intro</a> That is the whole API. Each url segment is one page.child(name), a miss is an import, and a ur…
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [DevBar — a right-docked rail of dev chrome on every page, b…](/framework/dev/DevBar/readme.md) — ## Use js import devbar from "./framework/dev/DevBar/DevBar.js"; // public/app.js — the one caller render(){ …; devbar(this); }, navigated(…
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [Tree — nested rows you can open, drag and drill into. One c…](/framework/ux/Tree/readme.md) — Rows from a plain array, or straight from a Page's children. The keyboard is always on. Drag, the drill-down and the row buttons are proper…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Integration 2: every build on one branch, fixed and tested together, NOT merged into michael/dev

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Integration 2: every build on one branch, fixed and tested together, NOT merged into michael/dev"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
