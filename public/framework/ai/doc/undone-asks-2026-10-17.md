# Undone asks, 2026-10-17: 620 of 1,150 have no landing, and nothing joins them to the work that fixes them

The page is [/framework/ai/asks/undone/](/framework/ai/asks/undone/); the numbers come from `node Server/UndoneAsks.mjs --json` (class `UndoneAsks`, rebuilt by TaskLoop once a day), never from memory. Your words: asks 1 to 3 of [requirements-15](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-15.md) and ask 3 of [requirements-14](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-14.md).

## The count

- **1,150 asks** exist: 1,080 refined from your prompts ([asks-by-module](asks-by-module.md)) and 70 routed to masterminds ([the ledger](/framework/ai/asks/)).
- **65 are provably done:** 42 landed and 3 dropped in the ledger, 19 judged done by AskTally, 1 matched to a complete task.
- **620 are undone**, each in a module: 610 are recorded as sent to a module inbox (596 found there, unread; 14 not found), 9 are open ledger asks, 1 matches a stopped task.
- **465 cannot be placed:** the refiner called them "site" or gave a name with no folder (449), or a ledger title names no module (16). No inbox can hold them.
- The two numbers agree: 1,150 counted at the sources, and 65 + 620 + 465 = 1,150 after sorting.

## Where they sit

Most undone asks are in five modules: [ext/Figma](/framework/ext/Figma/) 203, [ai/sessions](/framework/ai/sessions/) 138, [ai](/framework/ai/) 61, [core/Page](/framework/core/Page/) 60, [ext/Refine](/framework/ext/Refine/) 46. Figma alone holds a sixth of them; its inbox is the biggest pile no mastermind has read yet.

## Read this number as an upper bound

I checked five rows by hand against the repo (the log has them). Two of five were wrongly undone: "dark-mode sidebars in the dev shell, Ctrl+\" already exists as [DevShell](/framework/dev/DevShell/), and "apply the code-driven loop principle" is already a law at the bottom of `CLAUDE.md`. So some undone asks are done but nothing says so. The method can say "done" only when a record or a complete task with the same wording proves it, and it never guesses done.

## The ten oldest still open (all routed 2026-09-30, ledger titles; the brief each links to holds your words)

1. Merge candidates: one minion per core dir (later, when tokens allow): [ai-page](/framework/ai/sessions/2026/09/30/ai-page/)
2. UI: `/framework/ui/` overhaul (later): [ui-skills](/framework/ai/sessions/2026/09/30/ui-skills/)
3. AI 2 merges into `/framework/ai/` (later): [ai2-inbox-read](/framework/ai/sessions/2026/09/30/ai2-inbox-read/)
4. Inbox: core/Page/ext/Inbox extension, AI 2 Inbox to `/framework/ai/`, Needs you as a filter: [owner-words](/framework/ai/sessions/2026/09/30/inbox-ext/owner-words.md)
5. Merges: approval for foundational merges, reversible from the card
6. Templates: weight per use, a use-template skill or tool, one library
7. Logs: `page.jsonl` curated, `log.jsonl` everything
8. UI: System class, a library of approved blocks, class pills, masonry: [ui-system](/framework/ai/sessions/2026/09/30/ui-system/)
9. Selection: tap to select and drill down on mobile: [owner-words](/framework/ai/sessions/2026/09/30/selection/owner-words.md)
10. Task pages: grey checkboxes, full-width bars, reports as free content: [owner-words](/framework/ai/sessions/2026/09/30/selection/owner-words.md)

Refined asks only reach back to 2026-10-09, when the refiner started, so the older half of everything you asked is not in this count. The refined ones are summaries; your verbatim prompt is one click from each row.

## What makes the number go down

- **Tasks carry their ask.** `AskIndex.make_tasks` stamps a `source` on new tasks, but none of the 238 existing tasks has one, so the join falls back to matching words and found one. Once new asks become tasks, a complete task will close its ask by itself.
- **The item tool marking tasks complete.** A task that ends without a `complete` line looks open forever.
- **Cards landing.** The ledger marks 45 asks landed or dropped; the other 25 never got a status after "routed" or "queued".
- **Inbox lines closed.** All 607 inbox lines are unread: no module review has ever written an outcome. `ModuleReview --run` is the next slice ([module-inbox](/framework/servex/doc/module-inbox.md)).
