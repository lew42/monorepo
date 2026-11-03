# Deputy mastermind: the owner's queue, one thing at a time

Budget: about $60 this run (Opus, extra-high effort). Parent: `vscode-mastermind` (the owner's VS Code tab). That tab now stays free to answer the owner, who dictates by voice. You do the investigating and the building: spawn builders, review, merge, and restart Servex yourself (`restart_servex`; restart-revive is verified). Log to `session.jsonl` here at least every ~10 minutes, and log "show: <url> — <one line>" whenever there is something the owner can open.

The owner's own words are the two prompts of 2026-10-23 evening (about 18:30 and 19:00) in `../../prompts.jsonl` (logged verbatim by the prompt hook). Read them first. The essence:

## How to work (the owner)
- **Slow down. One thing at a time, in priority order.** Don't chase rabbits; only the top priorities.
- **Build things the owner can see.** Never wait on the owner's approval for non-dangerous work: decide, record the alternative, keep going.
- **Big picture for the owner, subtasks hidden.** The owner doesn't know branch or session slugs (mobile-picks, task-chase…). Name the 1–3 big things in plain words and group everything else inside them.
- **Model choice is an experiment.** The owner suspects the Opus-medium mastermind plus Sonnet builder split gives poor results, especially for planning and design. Try one Opus high-effort builder that designs *and* builds a whole slice; let Sonnet only debug and test. Compare cost and result on the first slice, and write the verdict in `public/framework/ai/models/readme.md`.

## The queue
0. **Finish the merge in flight.** `task/merge-approvals` (worktree `C:/Code/lew42/worktrees/merge-approvals`): the Merge-button page `/framework/ai/merge/`. It is reviewed and answered (1 fixed, 4 noted) in the worktree's copy of `process-system/merge-approvals/session.jsonl`, but `merge.mjs` in the main tree refuses with "no review": the review lives in the worktree's task folder and the gate reads the main tree's. Fix that flow (the gate should read the branch's task record), merge, restart Servex, and shoot the page at 1920 with real cards.
1. **The owner's review page: priority 1.** The owner has asked for this "forever":
   - **One page per day** that indexes every session created that day; a multi-day session lives on the day it was created.
   - **Inside a session, a time filter:** a pill-shaped dropdown reading "Today", with Week, Month and Year (Year means all for now). Use the existing dropdown widget, and build it as a reusable filter-pill system.
   - **Approve in chunks.** A session isn't complete until the owner checks it off. Approving a session approves its tasks. One working demo can validate everything under it. No inbox of 1,000 micro-tasks.
   - **Every dollar accounted for.** Every session, prompt and dollar rolls up to an approved, useful task. Work and spend that never gets approved is flagged red as a leak.
   - **The Merge list** (`/framework/ai/merge/`) folds into this page, so the owner sees what's ready in the same place.
   - Use what exists: the sessions store, the AIDashboard, the phone pages under `sessions/v/mobile/`, and `core/Session` with its Approve verb (`decide`). Don't build a second version.
2. **The 230 proposed tasks from old asks** (`node Server/UndoneToTasks.mjs`; they live in modules' `tasks/` folders and wait on the owner). The owner must not approve them one by one. Group them under the priorities. Auto-accept the ones that plainly serve a top priority into that priority's queue. Move the rest to a backlog state that stays recorded but out of the inbox. The owner sees one summary card with an "approve all" option.
3. **Process names: decided.** The owner said not to wait. Adopt the proposals in `core/Task/doc/process-names.md` (*step*, not *phase*; one subclass per template; handoff by moving the task). Mark them decided, then do the scripted phase→step rename.
4. **The documentation system**, written as a rule every mastermind follows (the documentation skill, `ai/doc/readme-system.md`, and the mastermind role readme):
   - Unify where things go. `readme.md` is the core index. Sibling `<topic>.md` files sit beside it for important pages. `doc/` is a namespace for notes, topics and subfolders, dated notes allowed. Pick the rule, then make the docs follow it.
   - **No dated logs in readmes.** The exception is a rule that keeps being violated; it may be marked as extra important and recent.
   - **Don't write things down just because the owner said them.** Read what the doc already says, then write the clearest message for future agents, capturing the intent without over-specifying.
   - The **mastermind** owns the documentation, since it has the overview. A builder that builds a whole system documents it.
   - Each mastermind reviews the docs of the area it works in.
5. **Leaks:** `public/framework/ai/sessions/ready-to-merge.jsonl` lists 19 branches whose worktrees closed with 1–2 commits not on michael/dev. Merge each one or set it aside with a reason.
6. **priority.md** gets 1–3 big things at the top, in plain words, with everything else grouped inside them. Keep it current as work lands.

Per branch: run the review from its worktree, answer every finding, merge with `node Server/merge.mjs <worktree>` under `node Server/hold.mjs`, and smoke the site. Usage: report it as the `node Server/usage-now.mjs` first line. Stay under pace.
