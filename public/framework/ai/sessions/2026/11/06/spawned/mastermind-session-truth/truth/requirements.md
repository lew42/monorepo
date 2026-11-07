# The truth page, then fold the twins

Budget: $15

Read `../brief-common.md` first.

## First, tonight, before the other fixes merge: the truth page (deliverable 6)

A node script (no AI), e.g. `Server/Truth.mjs`, computes the numbers and appends one line per run to `public/live/truth/truth.jsonl`; `/live/truth/` draws the trend from that file (a page.js that streams the jsonl; load the `page` skill for its shape). The numbers, for all sessions and for the last 7 days:

- sessions; % with any task; % complete (score 1); % "needs review" (no tasks)
- done tasks with no outcome or evidence (`Task.proof_problem`)
- twin folders (`node Server/SessionConsolidate.mjs --check`)
- sessions with no commit line
- owner asks not filed as a task (owner prompts in a session with no task for them)

Tonight's run is the baseline, measured before the other deliverables merge, and the page says so. Use the real classes (`Server/session-query.mjs`, `Task.tally()`), never a parallel count; give every number a second number that must agree (with-tasks + no-tasks = total). It runs daily: find how Servex runs a scheduled job (Heartbeat, TaskLoop, a job list) and register it there; if nothing fits, add the smallest schedule entry and document it. `/live/` belongs to the voice app: only the `/live/truth/` subpage is yours; link it from `/live/` only if that page already lists subpages. Shots at 400 and 1200 against your worktree URL.

The parent brief's sample today (200 costliest sessions since 10-24, $3,536): 149 of 185 have no tasks; 313 of 855 done tasks unproven; 1,410 sessions split across two folders; 240 of 1,321 sessions record a commit. Your full-population numbers will differ; say how.

Commit the baseline line as soon as the script works, and report it then (a short message to your parent), before you start the twins.

## Then: fold the twins (deliverable 5)

`Server/SessionConsolidate.mjs` (with its test) already finds sessions split across two folders. Dry run, commit the manifest (every old → new path), then apply. Apply only at a quiet moment: `list_agents` / `system_health` show no agent working in the folders being moved; if one is, fold the rest and leave those for the next run. Moves are scripted with a manifest, never deletes. `--check` must exit non-zero while ANY twin exists, and the truth page shows the count. Find why twins are made (`one-folder.md`) and fix the cause, or log exactly which writer still makes them. The apply moves session folders in the MAIN tree's data: do the code in your worktree, merge nothing yourself, and tell the mastermind when the code is ready; it runs the apply.
