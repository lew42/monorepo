<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Card kinds 75 to 36  the next merges  one merge at a time  each proven with before after shots and zero console errors" (words: card, kind, next, merg, one, merge, time, each, proven, before, after, shot, zero, console, error)

## Tasks (8, best first)
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-10-01 [Card body shows the refined dictation (merge 5); ai2.css census for m…](/framework/ai/sessions/2026/09/30/inbox-ext/card-body/) — Merge 5 is built and proven: a card shows its own refined dictation, points first. Card.chat(line) draws summary/edit lines as the card's own points, clean folds underneath closed — 03db3de0 proof: a fixture card shot at 400/1920 on /framework/ai/ and /framew… · paths 3/3 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-29 [AI 2 cards on a phone: no more /ask/turn console error](/framework/ai/sessions/2026/09/29/ask-turn-quiet/) — Landed — an AI 2 card opened from a phone on the LAN no longer logs POST /ask/turn -> 400 on load. find the caller: ext/Ask/Ask.js's ask_probe fired on import, on every page. only call it when the user asks something: ask_probe is now lazy, called only from a… · paths 2/2 exist
- 2026-09-29 [Decisions: a node tool walks each one, the card shows them ranked and…](/framework/ai/sessions/2026/09/29/c6354c23-7d9e-484d-886f-06b14540473b/decide-tool/) — A decision is now made by a node tool, step by step, and the brain card shows the OpenRouter decisions ranked and nested. ![the card's Decisions tab](/framework/ai/2026-09-29/decide-tool/shots/live-card-1920.png) a node process walks the decision so the AI ca… · paths 1/2 exist, gone: framework/ai2/2026/09/29/openrouter-brain-a-knowledge-base-that-o/decisions/
- 2026-09-29 [Card-page phone load: before/after the page.jsonl fix](/framework/ai/sessions/2026/09/29/page-files-log/page-files-log/measure/) — Measured before/after; found a regression worth a look. [result.md](/framework/ai/2026-09-29/page-files-log/measure/result.md) has the full table. Probe built (pfl-measure.mjs, Playwright + CDP throttling) BEFORE on http://monorepo.localhost: Fast 3G never sh…
- 2026-09-25 [Quick-fix worktrees: a warm pool, and a smoke test before every merge](/framework/ai/sessions/2026/09/25/quickfix-worktrees/) — One quick-fix worktree is always warm, and nothing merges without a smoke test. Call take_worktree, write, then node Server/merge.mjs <path> <pages>, then return_worktree. ![Live card with the pool](/framework/ai/2026-09-25/quickfix-worktrees/live-1920.png) s… · paths 0/1 exist, gone: framework/ai2/live/

## Modules that exist now (files outside the module that import it)
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 3 files
- [ext/Shots](/framework/ext/Shots/) — used by 2 files
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/card](/framework/ui/card/) — used by 23 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files
- [ux/Card](/framework/ux/Card/) — used by 3 files

## Docs and readmes
- [Card plan — how 75 kinds of box shrink to 36](/framework/ux/Content/plan/readme.md) — The plan for step 1 of the card consolidation, drawn live. It names eight target kinds (card, frame, region, preview, pill, row, fold, popo…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Masonry — a ragged wall with no gaps at the column bottoms,…](/framework/styles/layouts/masonry/readme.md) — ## Index - [packed](./packed/) — the same wall, reading left to right (no readme yet) ## Use js div.c("masonry", () => site.notes(24)).styl…
- [Asks about cards: 2 open, 0 done](/framework/ai/cards/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Asks about Dictate: 16 open, 0 done](/framework/ux/Dictate/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…
- [Templates — one layout, rendered many times, bound to live …](/framework/core/Page/doc/templates.md) — A template is a page that knows one layout and can draw it as many times as you like, each time with its own data. Instead of hand-building…

## Sessions tagged with these words
- 2026/10/13 [Page templates binding merge](/framework/ai/sessions/2026/10/13/session-21449a90/) — kind/owner model/sonnet work/read-only task/page-templates-binding-merge · $0.51
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Live today voice feed](/framework/ai/sessions/2026/10/15/session-8f02ad12/) — kind/owner model/sonnet task/live-today page/live-cards · $1.20
- 2026/10/15 [Live-post helper agent](/framework/ai/sessions/2026/10/15/session-8853d8d6/) — kind/owner model/sonnet task/live-post page/live-cards · $0.98
- 2026/10/15 [Live post review](/framework/ai/sessions/2026/10/15/session-4a77ddf9/) — kind/agent model/sonnet mod/ai/sessions task/live-post page/live-cards · $0.23

## Owner asks
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex-9, routed)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex (proposal-flow, 10 PM), queued)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)

## Commits
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Card kinds 75 to 36, the next merges: one merge at a time, each proven with before/after shots and zero console errors

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Card kinds 75 to 36, the next merges: one merge at a time, each proven with before/after shots and zero console errors"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
