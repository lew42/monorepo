# Task audit: tags, alerts and the log tool

**Tag format chosen:** a `/path` reference to the thing the task belongs to (`/framework/ext/Refine/`), falling back to `#module`. Alternative: bare module names; rejected because a path sorts and filters by file, class and system at once.

**Alerts:** `tag.mjs` adds `alert: "high" | "normal"` to open rows whose text mentions an owner decision, approval, credential or verdict. Refinement rows are `high`. It is a keyword guess, so treat it as a filter, not a verdict.

**Costs:** no SDK session was resumed to read cost. Spend comes from task logs and agent token counts (see `../spend.md`).

**Not built (queued):** the log tool that appends `{tag}`, `{note}`, `{alert}` lines to any session's `session.jsonl`. Coordinate line shapes with `2026-10-08/session-class` first. A granular `log.jsonl` per session stays optional: the tool would tail `session.jsonl` for the summary and open `log.jsonl` only on click.

**Not audited:** the 1,483 unmatched owner prompts; sessions were read through task files, not raw transcripts.

## Owner refinements (2026-10-08), queued for the next run

- **Managerial overview per task:** what was asked, what was done, what it cost, was it worth it. Questions pose options (A/B/C/D), not yes/no.
- **Weight/value per session:** useless / low / useful / high, plus why, as a `{weight}` line type via the log tool and a Sessions table column (coordinate with minion-session-class). Goal: find sessions that burned tokens and did nothing.
- **Models page gap:** `/framework/ai/models` was not found in the repo (no `models` dir or file under `ai/`), and no file mentions `claude-haiku-5-5`. Someone needs to create the page with `claude-sonnet-5-5` and `claude-haiku-5-5` rows; until then model names here stay unlinked.
- **Minions:** use `claude-haiku-5-5`; run `node Server/usage-now.mjs` before each spawn (exit 2 = spawn nothing).
