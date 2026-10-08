# Session class — findings

Outcome: `Session.js`, the Sessions page cost cell and detail view, the audit (button, route, `audit_session` tool, CLI), `Server/session-summary.mjs`. Docs: [`sessions/doc/session-class.md`](/framework/ai/sessions/doc/session-class.md).

## 1. Does the SDK account in real time, and which source is the truth?

- **Claude, the SDK:** yes. The result message carries a cumulative `total_cost_usd` and `modelUsage`, and every assistant message carries `usage`. Servex already uses them. Evidence: `dedupe-truth.mjs` and `fit-rates.mjs` in this folder.
- **Claude, the transcript:** the truth for a session that was not run through the SDK (a VS Code tab or CLI run). Priced per message id with the last line of an id winning, it matches the SDK ledger to about 0.2% for verified models.
- **Claude, the old `session-cost.mjs`:** it priced every transcript line, so it overcounted about 2x (one block per line, each repeating the usage). Fixed: it dedupes by message id, prices the 5-minute and 1-hour cache writes separately, and includes the subagent files (which the main transcript omits and which are still billed).
- **OpenRouter:** its own ledger is the truth, shown as "$total", never added to "Claude $total". The Session class only knows Claude.

## 2. Gap against `session-cost.mjs`

The rolling total and the independent recomputation agree to rounding: 87a85cd1 gap $0.000012 on $41.03; a 12,056-message session with 90 subagent files gap $0.000075 on $1,450.06; a 199-message session gap $0.000025. The test also corrupts a total and confirms the audit names the field and the amount. The audit caught a real bug in my own rolling path on its first run (partial output tokens on the first line of a message).

## 3. Page load

The Sessions page already loads about 16.8 MB in 839 requests (before). With the Session class: 840 requests, about 16.9 MB. The grid adds one file, `session-index.json` (about 106 KB at the server's compression; 302 KB raw), and the detail view adds `session-tree.json` (148 KB raw) plus one small `/ai-logs/<id>/session` call. The old grid still loads `sessions.json` and `spend-tree.json`; retiring them is the next saving.

## 4. Open items (Note: cards)

- The opus-5-5 and sonnet-5-5 rates are fitted, not confirmed by a published price list.
- `Servex/agents/tools.js` gained `audit_session`, so Servex needs a restart to offer it.
- Unlinked spawned agents: 809 registry agents have no recorded parent; the page counts them as a defect. Servex should write `parent` on every spawn.
- Grid nesting (children indented under the parent) is not built; the grid shows "own + N children" and the detail view shows the tree. Reason: the grid sorts and filters flat.
- Effort for VS Code and CLI sessions comes only from the file; the registry covers Servex agents.

## 5. Recommendation: sessions that create things (owner note, 2026-10-08)

When a session creates a task or request that is later filed in a page's `page.jsonl`:

- The session keeps its own cost untouched. It also keeps a reference `{path, id}` to what it created. The content is stored once, in the page's file. Cost is never moved out of the session.
- Referencing ONE item without loading the whole file: **a sidecar index file** beside it (`page.index.json`: id to byte offset and length). A reader seeks to the offset and parses one line. It is rebuilt by a script from the file, since the file is append-only and offsets never move. Instantiating the page and asking by id loads everything; offsets inside the line references themselves would break if a file were ever rewritten.

## 6. Recommendation: session files and the index (mastermind relay, 2026-10-08)

Plan form only. Nothing here is built, and nothing is deleted. The owner's thinking is in [`sessions/doc/data-architecture-2026-10-08.md`](/framework/ai/sessions/doc/data-architecture-2026-10-08.md).

**Default: one derived index per session.** `sessions/<id>/index.json` holds only what a list row needs: title, path, cost, runtime, state, tags, model and effort, and a small inbox of the highest-priority alerts. It is derived, so a script rebuilds it from the logs and nobody edits it by hand. Whatever appends a line that matters (the tags/alerts tool, the audit) also rewrites the index in the same code path. The Sessions list loads indexes, never a whole `session.jsonl`. The grid's `session-index.json` is already this idea in one combined file; the per-session file is its next step.
*Alternative:* keep the single combined grid file and add tags and alerts to it. It is simpler and one request, but it grows with every session and it cannot preview a page.

**Load rule:**
- **Always:** the index.
- **Sometimes:** `session.jsonl` (when a session's detail view opens), and `page.jsonl` (when its page opens).
- **Rarely:** an optional `log.jsonl` (only for a deep audit).
Anything that must be seen without opening a file (an alert, a total) is promoted into the index.

**Reference, don't duplicate.** Data is appended to one file and the other holds `{path, id}`. This matches section 5. Prompts are the one accepted duplicate for now.

**Dynamic routes.** `/sessions/<id>/tasks/<n>`, `/questions/<n>`, `/prompts/<n>`, `/messages/<n>` are routes on the session page, not directories. They read one line through the sidecar byte-offset index from section 5.

**Not built** because the index shape depends on the tags/alerts addendum, which is queued for budget. The index is small once that shape is fixed.

## 7. The owner's review of the Sessions page (2026-10-08)

Item 4 is fixed and committed in worktree `session-class`. Items 1 to 3 and 5 are decided here and not built (over budget); they are the next minion's list.

**4. The "CLI" tag was wrong. Fixed.** `panel2-sessions/sessions.mjs` guessed the source from the last prompt's `turnOrigin` (`human` meant VS Code, anything else meant CLI). Any SDK-spawned session got tagged CLI. It now reads the file's own `entrypoint`: `claude-vscode` is VS Code, `sdk-*` is a new **SDK** source, `cli` is CLI, and only a file with no entrypoint falls back to the old guess. The row also carries `entrypoint` so it can be shown as it is. `page.js` has the SDK label and an "SDK runs" role. `sessions.json` is rebuilt by hand, so labels change on the next run of `node .../sessions.mjs`.

**1. The dashboard tiles and freshness.**
- *Claude this week*, *OpenRouter this week*, *Plan used this week*, *Per 1% of your weekly plan* all come from `week.json`, written by `Server/week-cost.mjs` by hand. It is a point-in-time snapshot, not live: the copy I read ends at 2026-10-08T02:59Z. The page's "updates every 20s" only re-fetches that file, so the tiles can be stale. The honest fix is a visible "as of <time>" on every tile and having `Server/session-summary.mjs --index` refresh `week.json`.
- *Sessions shown* is the count after the filters are applied. Fresh.
- `sessions.json` (the rows) was last generated 2026-10-06, two days old. The same fix applies.
- Rule: every tile gets a one-line meaning and an "as of" stamp. A tile with no real source is removed rather than left blank.

**2. Layout.** Default: a card per session, stacked with no gap, no white page background; filters in one row at the top; the by-role breakdown becomes a row of clickable chips inside that filter row (clicking one sets the role filter), so it never sits on its own line on a wide screen. Check at 400, 1200, 1920, 3440. Alternative: keep the table and widen it.

**3. Paging.** Default: filter and sort over the whole index in memory (the grid file already holds all rows as short arrays, 302 KB for about 7,400), then render a window of about 60 rows with a spacer above and below, not "show 200 more". That keeps it fast and filters apply to all 4,000. Alternative: a "show more" button, which is simpler but renders thousands of nodes over time.

**5. Don't regenerate existing text.** Rows show the prompt as a text link to the session and, later, to the specific prompt route (see section 6), never a pasted copy. Embedded previews wait until the per-session index exists.

## 8. The owner's Sessions-table specifics (2026-10-08). Decided, not built (over budget)

1. **Toolbar:** one compact row directly under the Sessions tab, no padding between it and the tab content, basic filters only (search, source, role, tag, needs attention).
2. **Default sort: recent and expensive first.** Score = `cost_usd * 0.5 ^ (age_hours / 24)`, with age counted from the last update. A session costing $40 a day ago scores the same as one costing $20 now. Big tasks sink as they age, and a cheap new one cannot jump above an expensive recent one. The 24-hour half-life is one constant. Alternative: sort by cost within today's group, then by recency. Clicking a column header still overrides it.
3. **Columns, in order:** Name and Cost (largest, at the front), Updated (relative time of the last update, replacing both Start and Stop), Duration, then source, model, tags. Start and stop times stay in the row's tooltip.
4. **By role / by trigger:** each becomes a titled chip row ("Role: click to filter"). A chip shows its count and sets that filter; clicking it again clears it. The counts are computed from the same rows the table shows, so they cannot disagree with it. They read stale today only because `sessions.json` is two days old (see section 7).
5. **Session icon:** one icon constant exported from `Session.js`'s view file (`SessionView.js`), used by the table, the detail page and the inbox session-context card, so a session looks the same everywhere. The glyph is a pick (`forum`); changing it later means editing one line.

**Freshness check:** `sessions.json` was generated 2026-10-06 and `week.json` ends 2026-10-08 02:59Z. The page polls, but the files behind it are written by hand. The fix to build first: have `session-summary.mjs --index` (and Servex, on a timer) regenerate both files, and show an "as of" time on the toolbar.

## 9. Why three numbers disagree for the same agent (mastermind relay, 2026-10-08)

| Number | Where | Verdict |
|---|---|---|
| Session file (deduped by message id, with subagents) | `Session.js` / `session-cost.mjs`, the Sessions grid | **The truth.** |
| `spend.json` `total` | `Server/task-cost.mjs` | **About 2x too high, same cause as my 2x fix.** |
| Registry `cost` | `Servex/agents/Agents.js` (`cost: 0` at spawn) | **Resets on a Servex restart.** |

**spend.json.** `task-cost.mjs` prices an agent through `cost_of_transcript(path).by_prompt` in `Server/session-cost.mjs`. On main, that function still prices every transcript line, and a Claude transcript writes one line per content block, each repeating the message's `usage`. That is the 2x. My fix (dedupe by message id, last line wins) is committed in worktree `session-class` and goes live when it merges. Then `node Server/task-cost.mjs <task-dir>` regenerates a correct `spend.json`. Nothing else in `task-cost.mjs` needs changing for the 2x, since it already trusts the transcript over the agent log. One gap remains: it prices only the main transcript, so subagent files (billed, but in `<session>/subagents/`) are missed. Switching it to `cost_of_session` would close that; I did not do it because `by_prompt` has no subagent breakdown and the change needs a test.

**Registry.** `Agents.js` starts `cost` at 0 and adds the SDK result's cumulative `total_cost_usd`, which is per process. A Servex restart or revive starts a fresh process, so the number starts again from zero (the three disagreements $3.16, $4.14, $0.12 against file truth fit that). Document it, don't fix it: the registry cost is a "since this process started" figure. Anything that wants lifetime cost reads the session file, which the Sessions cell now does. The registry's number stays as a fallback when there is no transcript.

**The Sessions table** already shows the session-file number wherever `session-index.json` has the row, and falls back to the old cost only when it doesn't.

## 10. What is left, for whoever lands this

Built and committed in worktree `session-class` (not merged): Session class, audit, `session-summary.mjs`, cost cell and detail view, entrypoint labels, close/reopen lifecycle, docs. Needs, in order: docs-check, `review.mjs` from MAIN, `merge.mjs`, Servex restart (for `audit_session`), then `node Server/session-summary.mjs --index` and `node Server/task-cost.mjs` to refresh the numbers. Not built: live refresh of `week.json`/`sessions.json`, table redesign (toolbar, recency sort, columns, chips, icon), tags and alerts, per-session index, subagents in `task-cost.mjs`.

## 11. Old sessions and core links on the card (owner, 2026-10-08). Plan, not built

**Old sessions.** Today `Session.js` reads one shape: a Claude transcript (`~/.claude/projects/.../<id>.jsonl`, plus `subagents/`). The default is a small **adapter per old shape**, each one a function that returns the same plain facts (id, first and last time, cost if known, prompts, model) and says honestly what it cannot know. The shapes to cover: SDK and CLI transcripts (done), the Servex launch lines in each task's log, the daily log, and the legacy `session.json` (read-only). A session with no transcript shows cost as "not measured", never 0. The loader picks the adapter by what exists for the id, so nothing old is rewritten or deleted. The task-audit mastermind will say which old shapes it meets; those adapters get added to the list one at a time, each with a test on a real old file.

**Core links on the card.** Two or three links per card (a class, file or page the session made or edited) are read from the tag lines the task audit writes into the session's own log through the tags tool from the addendum. The class does not work them out. The grid's index file carries a short `links` list per row (at most three, most important first), and the card renders them as text links. Until the tags tool and the audit's first writes exist, the card shows none.

**Alternative:** compute the links from the transcript's edited paths. Rejected, because the owner said to consume the audit's tags, and computing them twice makes two answers.

## 12. Recommendation: the session index (mastermind relay, 2026-10-08). Plan, first item of the build

**Default: an append-only index of one line per session update, partitioned by day.** A new session folder alone shows nothing on the dashboard; the index is what the dashboard reads.

- **Where:** `sessions/index/<YYYY>/<MM>/<DD>.jsonl`, the same year/month/day shape the site's dated folders already use. The partition is the day of the update, not the day the session began, so a session that ran for three days has a line in each of three partitions.
- **One line:** `{"id","name","icon","usd","cost_complete","state","started","updated","tags":[],"links":[],"alerts":0,"model","effort","closed"}`. `cost_complete` is false when the transcript could not be found or a subagent file is missing, so a partial number is never shown as a whole one. `links` holds at most three.
- **Latest line per id wins.** The dashboard keeps a map as it reads. Nothing is ever edited.
- **Filtering:** a date filter loads only the partitions in range (a week is seven small files, not 4,000 sessions). Tag, role, source and needs-attention filters run over those lines in the browser. The list shows these lines only; a session's own `session.jsonl` and transcript load on click.
- **Live:** today's partition is tailed with the existing `live()` JSONL tail, so a new line appears on the dashboard without a refresh and the "as of" time is the last line's time. This also fixes the stale `sessions.json` and `week.json`.
- **Derived, never hand-edited:** a writer appends a line whenever something that matters changes (a refresh of the cost, a tag, an alert, `closed`), in the same code path as that change. `node Server/session-summary.mjs --index --rebuild` recreates every partition from the transcripts and each `session.jsonl`, so losing the index loses nothing. The audit action adds one more check: the newest index line for the session must equal the recomputed preview, and a difference is recorded like any audit mismatch.
- **Directory deltas:** the day folders' `page.jsonl` files already carry `{"file":"28/"}` lines. I have not confirmed which process writes them. They can say which partitions exist, so the dashboard needs no directory listing.

**Alternative: one `sessions.jsonl` for everything.** It is simpler to write and tail, but every visit reads the whole history, which grows forever, and a date filter cannot skip anything. At about 7,400 sessions a month this becomes the very problem the index is meant to solve.

**Build order:** (1) the line shape and `Session.index_line()` from `preview()`; (2) the append in `refresh`, `log` and `close`; (3) `--rebuild`; (4) the dashboard reads partitions and tails today's; (5) the audit check. The current `session-index.json` stays until step 4 replaces it. Not built: it needs the tags and alerts fields settled first.
