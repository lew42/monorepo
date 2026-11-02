# Is the task system working? No: tasks get made, and most are never finished

Numbers computed by [census.mjs](census.mjs) (output: [census.md](census.md), [census.json](census.json)), 2026-11-02. Rerun: `node census.mjs [days]`.

## The numbers

- **2,114 task records** exist; 822 landed (39%), 692 stalled (no line for 24 h), 459 abandoned (closed by `StaleClose`), 134 stopped, 5 open.
- **Last 14 days: 415 created, 26 landed.** One day, 2026-10-23, made 286 (a bulk filing of one-line asks into module `tasks/` folders); no tasks at all were made 10-27 to 10-30.
- **Who creates them (all time):** tabs 1,293 (30% landed), minions 380 (31%), masterminds 344 (76%), other agents 85, voice 4, Servex 6. The voice agent makes almost none; its session pages open but say "No tasks or child sessions recorded".
- **Session completion:** the 7 sessions with 2+ tasks active in the window: 22 of 63 landed = 35%. The big one (session-e00f55c9) is 14 of 47 = 30%.

## What is broken

1. **Minions do the work and never close their task.** 255 minion tasks were closed by `StaleClose` as "abandoned"; 224 of them have 3 or more log lines, so they did work. Only 5 have a `report.md`. This is the same defect `mastermind-item-phase1` reported (minion says "done", own task stays open), and it is the main reason sessions sit under 100%. The "has commits but not landed" count is small (10), so the loss is the missing `complete` line, not the missing work.
2. **Asks are filed and never started.** 923 tasks live in module `tasks/` folders, nearly all by tabs; 683 tab tasks stalled, 370 of the 415 recent ones have no log or commit line at all. 41 of them are a bare folder called `tasks`, and 5 groups are the same ask filed in two modules (`explore using darken and lighten…` in `ai/tasks` and `design/color/tasks`).
3. **Too few, and too many at once.** Too many: the 10-23 spike (286) and duplicates. Too few: `ai/asks.jsonl` stopped recording real owner asks around 2026-10-18 (one line since, from Servex), and `node Server/PromptAudit.mjs --days 7` crashes on a transcript over 512 MB (`Cannot create a string longer than 0x1fffffe8 characters`, `Server/PromptAudit.mjs:93`, `readFileSync`). So no ask-versus-task comparison can be computed today; it was not guessed.
4. **Process is built, tested and nearly unused.** `core/Task/Process.js` (`Process extends Task`) is real: 16 of 16 checks pass, `Servex/ProcessRunner.test.mjs` 43 pass, `Servex/processes.test.mjs` pass. Live: 7 tasks ever carry `process: build/steps/investigate` and one `build` landed (readmes-page); 5 `live` session records carry the word for a different purpose. It works when used; nothing makes agents use it.
5. **Session pages for light sessions work; heavy ones time out.** Voice sessions (`cloud-voice-app-20261101`, `cloud-voice-latency-probe`, `cloud-voice-live-page`) open and show Overview, Timeline, Tasks; two heavy session pages (`session-e3fd9043`, `session-e00f55c9`) did not reach network-idle in 30 s in the headless shot (not proven broken: a slow page versus a page that never settles is unmeasured).
6. **Task is already generic.** `core/Task/Task.js` imports only Item and List; AI is injected through static resolvers (cost, turns, session). `AITask` is `extends Page`, a viewer, not a Task subclass. The AI-ness is in the habit and the paths (`ai/sessions/...`), not the class. The two readmes said otherwise; fixed.

## Ranked fixes (each a child task of this one)

1. **Close the loop at the minion.** A minion's last act is `complete {outcome}` on its own task; the harness (`Agents` on agent stop) completes the task when the agent ended cleanly and the log has an outcome, instead of `StaleClose` marking it abandoned. Biggest single lift to completion %.
2. **Stop bulk-filing asks into module folders.** Per the 2026-10-26 rule, tasks stay in the filing session; a filed ask needs a first log line within a day or is dropped by a sweep that says so, and a `tasks` folder with no task is an error.
3. **Repair the ask ledger and `PromptAudit`.** Stream transcripts instead of `readFileSync`; resume `asks.jsonl`; then compute "owner asks with no task" per day.
4. **Core Task, any folder, no AI wording.** Move the legacy mappings and owner-ask proof (`is_owner_ask`, `proof_problem`, `Servex:` source tags) behind a subclass or hook so `core/Task` reads as human-or-AI; keep `AITask` as the viewer. Do not move files before fix 1 lands.
5. **Process: use it or retire it.** Make `build` the default shape for any multi-step ask (the mastermind role already says so), then recount in two weeks.
6. **Voice seat files tasks.** Voice sessions record no tasks; have `RemoteMCP` file the ask as a task on its session record.
7. **Measure heavy session page load** headless with a longer wait before judging it broken.
