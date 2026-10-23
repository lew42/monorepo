# Undone asks, 2026-10-17: 620 of 1,150 have no landing, and nothing joins them to the work that fixes them

The page is [/framework/ai/asks/undone/](/framework/ai/asks/undone/); the numbers come from `node Server/UndoneAsks.mjs --json` (class `UndoneAsks`, rebuilt by TaskLoop once a day), never from memory. Your words: asks 1 to 3 of [requirements-15](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-15.md) and ask 3 of [requirements-14](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-14.md).

The daily rebuild keeps verdicts and task links: `UndoneAsks.keep_owned` carries `verified*` and `task` onto each rebuilt row by ask id, and an ask that disappears moves to `retired` with its date, so nothing is lost (brief: [undone-rebuild](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-rebuild/requirements.md)).

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

## Each undone ask, checked (2026-10-17)

A Haiku checked every one of the 620 undone asks against the repo and had to show its evidence: the file and line that does it, or the places it looked and found nothing. The result: **229 verified undone, 240 found already built, 151 unclear** (229 + 240 + 151 = 620, and 620 asks carry a verdict, so the two numbers agree).

- **240 are built and nothing said so.** The hand check above was right: the count was an upper bound, and about two in five of the "undone" asks already exist. A "done" is believed only when its evidence names a path that exists; the merge script checks that, not the model.
- **151 cannot be tested.** (Second look: [the 151 unclear asks](#the-151-unclear-asks-a-second-look-2026-10-17).) They are questions, opinions or rules about how to work ("make results evident"). They stay on the page so you can say what they should become.
- **I spot-checked ten verdicts** by opening the cited files: five "done" and five "undone" were all right (one "done" rests on a doc that says the Figma page exists, not on the page itself). Evidence from the minions that admit a search they did not run is still on the page; read those rows as provisional.
- **See it:** [Undone asks](/framework/ai/asks/undone/) now has a chip row on each module: all / verified undone / found built / unclear / not checked. Each verdict shows its evidence, with a link to the file. `?v=undone` in the address opens a filter directly.
- **Rebuilds keep it.** Every ask has an id (a hash of its kind, source and text); `node Server/UndoneAsks.mjs --json` carries the verdicts over by id. Re-run the check with `node Server/UndoneVerify.mjs --batches <dir>` (only asks with no verdict) and merge with `--merge <dir>`. The batches and answers are kept in [verify-undone](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/).
- **Cost:** about $0.04 an ask, roughly $25 for all 620 (each Haiku run spends about $0.5 before it reads a single ask, so 23-ask batches were the cheaper size).

- **2026-10-17, tracked:** the 229 verified-undone asks are now 229 idle tasks in their module homes (`<module>/tasks/`), made by `node Server/UndoneToTasks.mjs --apply` through the item tool. 0 were already tracked, 0 had no module. Each ask on the [Undone asks](/framework/ai/asks/undone/) page links "its task"; the ask-to-task map is `ai/asks/undone-to-tasks.jsonl`, and the new tasks are listed on [/tasks/](/tasks/). A rebuild of `undone.json` (`UndoneAsks.mjs --json`) does not yet carry the `task` field over; the manifest keeps the map.

### The ten oldest asks that are verified still undone

1. UI: System class; /framework/ui/ library of approved blocks; class pills; masonry; sibling/child rails ([2026-09-30, source](/framework/ai/sessions/2026/09/30/ui-system/)). *Found:* Partly built: public/framework/library/readme.md:1 - "# Library — browse everything we built in three columns" (approved blocks, sibling and related rails). Missing: no `
2. Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable ([2026-09-30, source](/framework/ai/sessions/2026/09/30/inbox-ext/owner-words.md)). *Found:* Built: score floor via ?min= (Rail.js:490, Rail.js:348), Log at floor 0 (ux/Inbox readme), stalled asks as rows (ai/rail/inbox.js:231-237). Missing: the default floor is 
3. Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) ([2026-10-03, source](/framework/ai/asks/)). *Found:* Servex/pool.js:180 - "the sweep will never reclaim it" (a held slot is skipped on purpose; pool.js:289-292 skips held slots). Nothing found that releases a hold when its 
4. AI systems: git, context, cost pages collecting how we work ([2026-10-03, source](/framework/ai/sessions/2026/10/03/ai-git-context-cost/requirements.md)). *Found:* Partly built: cost pages exist (public/framework/ai/AITask/doc/cost.md, public/framework/ai/doc/tokens/context-window.md). No git or context page found for the AI systems
5. If feasible, write a script that goes through all sessions and pairs those identified as the same session data ([2026-10-09, source](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p2689)). *Found:* Built: Server/session-migrate.mjs (folder moves, merge_into at :137). Missing: no script that pairs sessions by content or same-session identity. grep 'pair' hits nothing
6. Treat session merging as order- and time-dependent chains, not a plain append of JSONL files ([2026-10-09, source](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p2689)). *Found:* Built: Server/session-migrate.mjs runs as a path move plus merge_into (order-free). Missing: no chain or time-ordered merge logic; grep 'chain' finds nothing in the migra
7. Have the AI mastermind and the page mastermind exchange session IDs so they can talk and collaborate ([2026-10-09, source](/framework/ai/sessions/7efd07d5-7a58-434d-8847-1a1d7b640390/?tab=coverage#p603)). *Found:* No exchange of session ids between the AI and page masterminds found. grep 'exchange|session id' in doc/asks/asks.md has no hit; readme has no line for it.
8. Document every path-based and per-directory convention under the page system ([2026-10-09, source](/framework/ai/sessions/7efd07d5-7a58-434d-8847-1a1d7b640390/?tab=coverage#p603)). *Found:* No single doc lists every path and per-directory convention. Built: doc/decisions.md (partial) and doc/readme-full-2026-10-12.md. Missing: a convention list. Places looke
9. Make the Figma design preview open to show the actual UI elements rendered. ([2026-10-12, source](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p3752)). *Found:* Built: the browse preview shows a Figma screenshot thumbnail (data/.../thumbs/*.jpg) and a Built page link. Missing: the preview itself does not render the built UI; it s
10. Find out whether the embeds cause the laggy clicking on Figma items. ([2026-10-12, source](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p3752)). *Found:* public/framework/ext/Figma/doc/observations.md:13 - browse clicks measured ~35 ms; observations.md:14 - "Not yet checked: Figma embed responsiveness". Embeds were never m

### The 151 unclear asks, a second look (2026-10-17)

The first pass could not tell whether 151 asks were done. Each was grouped by the reason in its evidence (`node Server/UndoneVerify.mjs --groups`), and a Haiku answered ONE question per group (`--only unclear --question path|work|concrete|look`). Asks that turned out to be work were then asked one more question, "is it built?" (`--only work-yes --question look`). The first-pass verdict is kept on each ask as `verified_first`.

**151 = 12 done + 12 undone + 92 not work (retired) + 35 need you** (sum 151, the numbers agree).

| Why it was unclear | Asks | Now done | Now undone | Retired (not work) | Needs you |
|---|---|---|---|---|---|
| no-path | 17 | 9 | 1 | 0 | 7 |
| not-work | 108 | 1 | 5 | 92 | 10 |
| vague | 18 | 0 | 4 | 0 | 14 |
| ran-out | 8 | 2 | 2 | 0 | 4 |

- The 12 undone asks became idle tasks in their module homes (`node Server/UndoneToTasks.mjs --apply`). Retired asks stay on [Undone asks](/framework/ai/asks/undone/) under the "not work" chip; nothing was deleted.

#### Questions for you (35, answer ten at a time by voice)

**ext/Figma**

- `878f5feabb` Is this still wanted, and what should it become? “Confirm whether you can access the September 2026 page.”
- `12a5b52ed0` Should each design result carry a visible label or note inside its Figma frame?
- `cc5a01b0a9` Is done a rule that every new Figma frame must reuse an existing component, checked by a list of frames with no unique parts?

**ai/sessions**

- `83b2c033e1` Should the sessions tab be called Sessions everywhere, yes or no?
- `50895c9f4a` Should the right sidebar scroll on its own, separate from the page, yes or no?
- `afdc30ec2b` Does the Haiku refine link on the chat bubble still open the wrong page, yes or no?
- `fffc8104c7` Is this still wanted, and what should it become? “Check how sessions are indexed and whether indexing is correct”
- `ff81c3fefe` Is this still wanted, and what should it become? “Surface stored session information that is not shown in the table, without redoing the task and session audits”
- `57dacfd063` Is the night mastermind session still running, and should it be stopped or resumed?
- `a9e07c29e8` Are the session cost numbers right as they show today, yes or no?
- `3a72a31aa0` Is this still wanted, and what should it become? “Remove the 'All sessions' back button on the detail page; the close button already returns to the sessions pag”
- `3a5903dc42` Is the detail page now showing only the session ID as its title, with no repeated ID line above the tabs?
- `48a22399cb` Which sessions page shows the load error after refresh, and what does the message say?
- `309613f33c` Does 'all sessions items' mean every row in the sessions data grid, with each row opening its session?
- `95b02c7b13` Is this about the sessions page only, or every page on the site?
- `36de0de1d6` Does the sessions tab look clear enough now, yes or no?
- `4e1b8d8f84` Did you see every session in the list clickable in the live site, or is a fresh check needed?
- `725a20941d` Is the goal a report of the most common asks across sessions, or something a page shows live?

**ai**

- `2bb4e4c01c` Should the AI page that shows the board be called Inbox, and the one that shows the daily log be called Log?
- `314eec080e` Is this still wanted, and what should it become? “Remove the useless 'inbox one, one new' link at the bottom”
- `c6adcf7143` Is the transcription and refinement pipeline working end to end today, yes or no?
- `99f4432968` Is this still wanted, and what should it become? “Log the backup location as a checkable AI inbox item.”

**core/Page**

- `a90087394d` Should paths resolve through the pages route even for a folder with no page.jsonl, as a new walk-up rule?
- `a35455a5f8` Is this still wanted, and what should it become? “Let inbox items be read, then archived or cleared”
- `58d91620ab` Is the shrunken page class the Template class in core/Page/Template?
- `6cab9e0155` Is a page setting persisted properly when, after a reload, the same value is read back from settings.jsonl?
- `75774baa20` Is it right that a template's mock data is rewired to real data through its expand(data) step, and should templates.md say so in writing?
- `7246c112ac` Is the top of each page now the most important content, yes or no?

**ext/Refine**

- `637b56292b` Should base updates reach extensions by copying the change into each extension, or by the extension reading the base at load time?
- `b9ec96eb3a` Which of the Refine ideas should be tested first, and what result counts as a pass?

**servex**

- `1ec7d01891` Should the headless browser run inside the Servex server rather than through the dev socket?

**core/Property**

- `f0506cbf0e` Is done a test that changes a Property and checks the bound render updates within one event, with no stale value left?

**ui**

- `8309c41534` Is the ui overhaul meant to change the four bands of components, or only the single-page layout?

**ai/models**

- `cc8bce2fc0` Are the current minion settings (model, effort, count) right as they stand, yes or no?

**ext/ai**

- `a2d01a32d6` Should the AI task system review be done now, yes or no?


## The sort pass, 2026-10-23: every open ask becomes a task, a close or a note

Crack 2 in [cracks.md](/framework/core/Task/doc/cracks.md): asks that never became tasks. The task: [ext/Refine/tasks/asks-to-tasks](/framework/ext/Refine/tasks/asks-to-tasks/).

**First, most "undone" asks were already settled.** The count did not read the verdicts above, so 625 looked undone. `UndoneAsks.settle()` now counts what became of each ask: 241 had a task (from 2026-10-17) and 344 were found built or not work. That left 40 undone asks (35 that needed you, 5 never checked) and 477 unroutable ones (no module folder). The sort pass took these, plus 2 that are new since.

**The sort.** A Haiku read 25 asks at a time with the list of 285 modules, could search the repo, and put each ask in one of four groups (`node Server/UndoneVerify.mjs --batches <dir> --question sort`, then `--run <dir>`, then `--merge <dir>`). It never answered "ask the owner". **514 asks = 259 still wanted + 77 done + 46 obsolete + 132 notes.** Eight asks sit in two rows (the ledger names them twice), so 522 rows carry a verdict. A "done" counts only if the file it cites exists; the script checks this, not the model.

| Group | Asks | What happened |
|---|---|---|
| still wanted | 259 | 241 new proposals in their module's `tasks/`, waiting on you (`UndoneToTasks --apply --proposed`). At review, 11 that asked for the same work as another were stopped with "Same ask as …" and their asks point at the one kept, so 230 wait. The other 26 already had a task with the same words |
| done | 77 | closed; the evidence (a file and line) is on the ask |
| obsolete | 46 | closed; the reason is on the ask |
| note | 132 | one line each in the module's readme under "Notes from your asks", with a link to your words. A module with more than 6 got `doc/notes-from-asks.md`, linked from the readme (`UndoneToTasks --notes --apply`): 46 files. At review, 9 lines that said the same as another line in the same file were folded into it, which now links both sets of your words ("again") |

**After:** done 70 + tasked 498 + closed 467 + noted 132 + undone 0 + unroutable 0 = 1167, and the two numbers agree. [Undone asks](/framework/ai/asks/undone/) shows the new count strip.

**Cost:** 23 batches cost $19.14 (the runs log is `sort/runs.jsonl` in the task folder), plus about $0.78 for a first test run whose answer was not parsed. That is about $0.04 an ask, the same as the first check.

**How to read it:** the proposals are the owner's to approve, improve or reject on each module's task list. A "note" is a rule or a preference, not work. If one is wrong, delete the line; git keeps it.
