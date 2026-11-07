# /live/truth/ — how true the session record is, counted by code

The page draws `truth.jsonl`; each line is one run of `node Server/Truth.mjs --write` (one object: `{"truth":{at, label?, all, week, twins, flat}}`). `all` and `week` (last 7 local days by the session's folder day) each hold: `sessions`, `with_record`, `with_tasks`, `no_tasks` (= needs review; `with_tasks + no_tasks = sessions`, the script refuses to write if not), `complete` (score 1, of those with tasks), `done_tasks`, `unproven` (`Task.proof_problem`), `no_commit` (no `commit` line in the session's record or any task log under it), `prompts_unfiled` / `sessions_unfiled` (owner `Prompt` lines in sessions with no task). `twins` and `flat` come from `SessionConsolidate.check`.

- **Writer:** `Server/Truth.mjs` (test `Server/Truth.test.mjs`), run daily by `TaskLoop.truth_daily()` in Servex (needs a Servex restart to start; done today = the last line's `at` is today). By hand: `node Server/Truth.mjs --write [--label "..."] [--root <repo>]`.
- **Reader:** `page.js` (`TruthLog extends JSONL`, streamed live).
- **Counts use the real classes:** `SessionFolders.homes()`, `Task.replay`/`tally()`/`completion_score()`, as `Server/session-query.mjs --report` does. They differ from a sample of the costliest sessions because they cover every session folder, most of which have no record at all.
- The first line is the baseline, measured before the truth-job fixes merged.
