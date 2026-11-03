# The AITask tree, lanes, outline and flow views: what they are, what they are wired to, where they should be used

Budget: $10. Load the `sub-mastermind` and `page` skills first. The owner's raw words: `../requirements-10.md`, ask 3 ("this AI task tree and the lanes and outline and flow, I'm clicking through these and there's actually some really cool visualizations that we could and should be using… I don't think these are properly wired into anything… I don't remember the specific request"). Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything; show the class; link every mention; past work before building.

## What exists

- `public/framework/ext/AITask/` (`AITask.js`, `readme.md`, `doc/`, and the view files: find `lanes`, `outline`, `flow`, `tree`, `board.js`, `feed.js`, `replay.js`, `plan.js`, `rank.js`). Importers: `ai/AISession/*`, `ai/cards/*`. `node Server/PastWork.mjs "AITask lanes outline flow"` tells when and why each was built; link those tasks. A sibling task (`ai-modules-home`, Opus) may move `ext/AITask` to `ai/AITask` today: coordinate by `send_to_agent`; your edits go in after its move, or in files it will carry over unchanged (ask it).

## Deliverable

1. **The map** (`ext/AITask/doc/views.md`, one screen): every view the module offers: name, what it shows (one line), which page or card uses it today (computed: grep importers and calls), a screenshot of each on a real task (this run's own task, `mastermind-repo-slim`, has 70+ lines, 19 child tasks and decisions: a good subject), and the task that built it with its date. "Wired to nothing" is said plainly where true.
2. **Use them where they help** (the owner's "could and should be using"): the task detail page (where a task's card opens, `AITask.js`'s own page) gets the views as tabs or a view switcher (reuse the Session detail's tab pattern), default = the view that explains a task fastest (your call, say why); the mastermind run task and the card page show the flow of child tasks. One page, one minion at a time, four widths, `merge.mjs`, screenshots on the card.
3. **Retire nothing**; a view that is useful nowhere is listed as a candidate with the reason, not deleted.
4. Report on your card: the view count, which are wired now, the page with the switcher, the screenshots.

Fence: `ext/AITask/**` (or its new home after the move; ask the sibling), the task detail page component, this task dir. Sonnet.
