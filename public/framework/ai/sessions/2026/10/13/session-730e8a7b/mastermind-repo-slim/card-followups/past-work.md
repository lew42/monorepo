<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Two small card follow ups  the plan page reads each merge s done field  and the health check drops the retired fold class" (words: two, small, card, follow, up, plan, read, each, merge, done, field, health, check, drop, retired, fold, clas)

## Tasks (8, best first)
- 2026-10-12 [Dictate: merged transcription asks, two small builds](/framework/ai/sessions/2026/10/12/session-d2954950/asks-transcription/) — Merged asks doc: [Transcription asks](/framework/ux/Dictate/doc/asks.md), 19 clusters (7 open, 4 partly, 8 done), linked from the [Dictate readme](/framework/ux/Dictate/). Two small builds: Refine keeps the latest 19,000 characters of a long prompt; the voice… · paths 1/1 exist
- 2026-10-02 [Framework cards: size follows weight, unread badges scaffolded](/framework/ai/sessions/2026/10/02/framework-home/weight-badges/) — Landed. /framework/ cards now size by weight (core/Page/weight/weight.js, reused): a heavy module shows its readme's own live ## Architecture excerpt, everything else is icon + name only. big card shows live architecture excerpt — [Page/Item/List cards](/fram…
- 2026-10-18 [Follow-up: counted by the one state](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/followup-state/) — FollowUp now reads the one state. Server/FollowUp.mjs takes its tasks, buckets and agents from State (ai/state.json when under a minute old, else a fresh snapshot); its own folder walk and its own "landed" test are gone. each kind mapped to the state, in this…
- 2026-10-17 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist
- 2026-10-14 [Scripts: the last four function bags are classes; two Servex cores ha…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-5/) — AskEach, Browser, Collab, Decide are classes (merged fe2728518, case fix after); callers relinked, outputs identical to the old files, undo proven on a copy; Agents.js and directory.js have a plan in Servex/agents/doc/class-plan.md, decision d-agents-director…
- 2026-09-30 [AI 2: two redraw hot spots cached (Groups.members, the Live card's la…](/framework/ai/sessions/2026/09/30/inbox-ext/ai2-hang/) — The freeze is fixed, plus four owner follow-ups, all in the worktree, ready to merge. Fix the freeze — two redraw hot spots cached. Commit 6db94ad4, [profile.md](./profile.md) The × button's stretched shape and dead hover — commit a3303915 A pinned Now card a… · paths 1/3 exist, gone: framework/ai2/now/ framework/ai/now/
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-10-17 [Your undone asks, each one checked](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/) — All 620 undone asks checked against the repo by Haiku: 229 verified undone, 240 found already built, 151 unclear (the two numbers agree). Ten spot-checked verdicts all right. The undone-asks page has verdict chips and evidence links; the verdict doc has the n…

## Modules that exist now (files outside the module that import it)
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 5 files
- [ui/card](/framework/ui/card/) — used by 23 files
- [ui/field](/framework/ui/field/) — used by 18 files
- [ux/Card](/framework/ux/Card/) — used by 3 files

## Docs and readmes
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/readme.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [Card plan — how 75 kinds of box shrink to 36](/framework/ux/Content/plan/readme.md) — The plan for step 1 of the card consolidation, drawn live. It names eight target kinds (card, frame, region, preview, pill, row, fold, popo…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [UX — the behavior tier: ui/ hands you markup, ux/ hands you…](/framework/ux/readme.md) — ## Index Every module here, and what you would use it for. - [Auth](./Auth/) — login, signup, password reset and a social-login row, as one…
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Config words — ui-contrast and ui-compact, two classes that…](/framework/ui/words/readme.md) — A config word is a class you put on a section, never on a component: it sets custom properties, and every template inside is already readin…
- [Util — small plain helper functions: is, source, markup.](/framework/util/readme.md) — ## Index [is](./is/) — fifteen one-line type checks that answer true or false [markup](./markup/) — turns an element's children into readab…
- [Auth — login, signup, reset and a social row, as one class](/framework/ux/Auth/readme.md) — The first ux/ workflow: view switching is the state a template can't hold, so it's a class, not a component — [/framework/ux/](/framework/u…

## Sessions tagged with these words
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Live-feed](/framework/ai/sessions/2026/10/15/session-132c71e9/) — kind/owner model/sonnet work/read-only task/live-feed page/live-cards · $0.55
- 2026/10/15 [Clarity live page](/framework/ai/sessions/2026/10/15/session-102f6de5/) — kind/agent model/sonnet work/read-only task/live-page page/live-cards · $0.14
- 2026/10/15 [AI 2 clarity review after merge](/framework/ai/sessions/2026/10/15/session-06cf299a/) — kind/agent model/sonnet work/read-only page/live-cards · $0.18
- 2026/10/15 [Live-page](/framework/ai/sessions/2026/10/15/session-0002ebc5/) — kind/owner model/sonnet work/read-only task/live-page page/live-cards · $1.31

## Owner asks
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex-9, routed)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex (proposal-flow, 10 PM), queued)

## Commits
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof
- e7d08a933 one-dictation/minion-core: review fixes — revert core Router nav change for a smaller rail.js fix, close a st…
- 9c55a38c8 Add ux/Understand and ux/Rename: HITL clarification marks and rename-by-dropdown
- 8b76ccc71 Fix round 2, Part Y: loading strip on the Overview, page_work() walks the real page tree
- 2f2cf44fd core/Page/navigation/: review fixes + connect-the-dots + familiar-structure pass
- a4d3b79a0 Dictate: real mic feedback + subclassable variants (deliverables 3-4)
- 8d499717b Mobile bottom rail: ✦ AI listening sheet, ☰ reaches the drawer's tabs
- 2b8f1091b Add /layouts/explorer/: every layout on the site walked as one 3-region tree

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Two small card follow-ups: the plan page reads each merge's done field, and the health check drops the retired fold class

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Two small card follow-ups: the plan page reads each merge's done field, and the health check drops the retired fold class"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
