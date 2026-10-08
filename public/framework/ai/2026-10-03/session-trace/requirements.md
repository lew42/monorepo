# Session detail page: cost-over-time chart + "what was it doing" waste table

Owner's own words (2026-10-03, said while looking at the vscode-mastermind session): "The data is
already there: every transcript line has a timestamp and the usage of each call."
1. A cumulative cost-over-time chart per session: x = time since start, y = $ spent. Claude $ and
   OpenRouter $ in different colours. Mark each tool call as a tick, so flat stretches and steep
   climbs are visible.
2. "What was it doing": under the chart, a table of steps grouped by tool (Read / Edit / Bash /
   spawn…) with the count, $ and share of the total. Flag waste automatically: the same file read
   3+ times, chunked reads of one file, polling (the same file re-read while waiting), and long
   runs of reads with no write.
3. Use the dataviz rules (one chart, honest axes). Sessions list → click → this page.
"This is the tool that tells us whether an agent did anything unnecessary." Don't wait on the
owner for anything in here — decide and build.

Fold this into the existing `/framework/ai/sessions/` module (CLAUDE.md law 6 — one Sessions
system, not a second page). Read these first:

- [`public/framework/ai/sessions/page.js`](/framework/ai/sessions/) + `sessions.css` + `readme.md`
  + `doc/decisions.md` — the grid + `session_page()` detail view this task extends.
  `session_page()`'s `content()` already loads `load_transcript()` (a `sessions.json` snapshot +
  `transcripts/<id>.json`) and `load_cost_log(id)` (this session's `page.jsonl` `cost` lines, via
  `find_session_page_dir()`). Both stay as they are — add to them, don't replace them.
- [`Server/session-cost.mjs`](/framework/Server/session-cost.mjs) — `cost_of_transcript(path)`
  already walks a raw Claude Code transcript (`.claude/projects/<folder>/<session-id>.jsonl`) and
  groups every assistant `message.usage` under its nearest earlier real `user` line (skipping
  sidechain / `task_notification` lines). `find_transcript(session_id)` finds that file. **Don't
  change the existing grouping or its return shape — `--append`/`--append-stdin` depend on it.**
  Add a NEW exported function alongside it for the per-tool-call trace this task needs (name it
  `trace_of_transcript(path)` or similar).
- Load the `dataviz` skill before writing any chart code — it has the color/axis/accessibility
  rules this brief's item 3 is pointing at. Load the `minion` skill first regardless (the three
  laws + never-list), and the `code` skill before writing new page.js code.

## What a transcript line actually looks like (verified by reading a real file, 361c4d18's own)

- An `assistant` line's `message.content` array holds zero or more `{type:"tool_use", name,
  input, id}` blocks — one block per tool call, each with its OWN `timestamp` on the assistant
  line (several tool_use blocks can share one assistant-message timestamp if the model called more
  than one tool in the same turn). `name` is the tool ("Read", "Edit", "Bash", "Agent", a Servex
  `spawn_agent` MCP tool, etc). `input` varies by tool: `file_path` (Read/Edit/Write/NotebookEdit),
  `command` (Bash), `pattern`/`path` (Grep/Glob), `prompt`+`description` (Agent — this is "spawn" in
  the owner's own words), etc.
- The matching `user` line right after it (`message.content` holding `{type:"tool_result", ...}`)
  carries the REAL completion timestamp (when the tool call actually finished) and
  `toolUseResult` (shape varies by tool — don't depend on its shape beyond existence).
- The dollar COST only exists per `assistant` API turn (`message.usage`, same grouping
  `cost_of_transcript` already does) — never per individual tool call. A turn with 3 tool calls
  spent its $ once, for that whole turn. The chart's y-axis therefore steps up once per turn (same
  groups `cost_of_transcript` produces), and tool-call timestamps are drawn as TICKS along that
  same timeline, not as separate cost events.

## Build

1. **`Server/session-cost.mjs`: add `trace_of_transcript(path)`.** Walk the same transcript once
   more (or refactor `cost_of_transcript`'s own line-reading into a shared helper if that's a clean
   small change — don't duplicate `lines_of()`'s file-reading logic if you can share it, but DON'T
   change `cost_of_transcript`'s existing behavior or return shape while doing it). Return:
   ```
   { calls: [{ at, tool, target, usd_of_turn, model }],   // one row per tool_use block, in file order
     turns: [{ at, usd }] }                                 // same grouping as cost_of_transcript's by_prompt,
                                                             // just { at, usd } pairs for the chart's y-step
   ```
   - `target`: the one most useful string for that tool — `input.file_path` for
     Read/Edit/Write/NotebookEdit, `input.command` (first ~60 chars) for Bash, `input.pattern` for
     Grep, `input.path` for Glob, `input.prompt`'s first ~60 chars for Agent/Task, otherwise the
     tool's own name again (never throw on an unfamiliar tool's input shape).
   - `usd_of_turn`: the $ of the ENTIRE assistant turn this tool_use block belongs to (every
     tool_use in the same turn shares the same number) — so summing `usd_of_turn` per call would
     overcount; the table in step 3 below sums `turns`, not `calls`, for its dollar figures (see
     there).
   - Also export a small `PRICES`-free CLI addition: `node Server/session-cost.mjs --trace <id>`
     prints `trace_of_transcript(find_transcript(id))` as JSON, for testing the same way `--append`
     already works.
   - Prove it: run `node Server/session-cost.mjs --trace 355eb7ba-ed23-46bb-ab6f-77c073a23571`
     (this very mastermind's own session id — a real, large transcript with hundreds of tool
     calls) and log the resulting `calls.length` and `turns.length` to this task's own task.jsonl.

2. **A browser-side trace fetch.** `session_page()` in `page.js` cannot read a `.claude/projects/`
   file directly (no filesystem access from a static page) — it needs a JSON file written to disk
   by a script, the same pattern `sessions.json`/`transcripts/<id>.json`/`week.json` already use.
   Add a tiny CLI mode that writes one: `node Server/session-cost.mjs --trace-file <id> <out-path>`
   writes `trace_of_transcript(...)` as JSON to `<out-path>` (create parent dirs if missing). Then,
   in `session_page()`, alongside the existing `load_transcript()`/`load_cost_log()` calls, add a
   third fetch for `<session-dir>/trace.json` (same `find_session_page_dir(id)` this file already
   has — reuse it, don't duplicate the glob). If missing (404), the new chart/table sections simply
   don't render (same "degrade silently" rule the week line already follows) — DON'T wire this into
   the Stop hook for every session (a trace file can be large; this is an on-demand/manual-run
   artifact for now, same honesty `week.json`'s own doc comment already uses — say so in
   doc/decisions.md as an open gap, not a secret limitation). Run `--trace-file` by hand for a real
   session (same id as step 1) to produce one real `trace.json` to look at while building/proving
   the UI.

3. **The chart — `session_page()`'s `content()`, below `$costs`.** One chart (dataviz skill: "one
   chart" — don't split Claude $ and OpenRouter $ into two charts, two lines on the one chart with a
   small legend). x = elapsed time since the session's first turn (seconds or minutes, whichever
   reads cleaner for this session's own span — compute it, don't hardcode a unit). y = cumulative
   $, built by running sums over `trace.turns` (two running sums if `OR` cost lines exist anywhere
   in this session's `page.jsonl` `cost.by_model`/similar — if there's no real per-turn OpenRouter
   split in the data today, a single Claude-$ line is an honest MVP; don't invent a second series
   from nothing. Note which case applied in doc/decisions.md). Each entry in `trace.calls` draws a
   small tick (a short vertical mark or dot) on the x-axis at its own `at` time — this is what makes
   "flat stretches and steep climbs" visible (a flat $ stretch with many ticks = lots of cheap
   tool-calling; a step with no ticks nearby = an expensive single turn). Plain inline SVG is fine
   (`artifact-diagramming`-style, but this is a real page not an artifact) — no charting library
   (CLAUDE.md: no new npm dependency). Axes genuinely labeled (honest axes: don't start y above 0,
   don't truncate x).

4. **The "what was it doing" table — right under the chart.** Group `trace.calls` by `tool`. One
   row per tool: name, count, total $ (sum `turns` usd for just the turns THAT tool's calls touch,
   deduplicated per turn — see `usd_of_turn` note above; don't double-count a turn with 3 calls of
   the same tool), and % share of the session's total $. Sort by $ descending (dataviz: the thing
   that matters most comes first).
   - **Flag waste, computed, not guessed (CLAUDE.md law 7):**
     - *Same file read 3+ times*: group Read calls by `target` (the file path); any file appearing
       3+ times is flagged, with the count shown.
     - *Chunked reads of one file*: 2+ consecutive (or near-consecutive, allow other calls between)
       Read calls on the SAME file where the tool's own `input.offset`/`input.limit` differ between
       calls — note you'll need `input` itself for this, not just the derived `target` string: keep
       the raw `input` object on each `calls[]` entry too (or a deliberately-small subset of it) so
       this check and the next one can use it.
     - *Polling*: the same file (or same Bash command) re-read/re-run 2+ times with LITTLE time
       between calls (say, under 15s apart) and nothing written in between — this is "waiting for a
       background thing to finish" behavior, distinct from "re-reading a file because it actually
       changed."
     - *Long read-no-write runs*: N consecutive tool calls (pick a threshold — 5 is a reasonable
       start, note it in doc/decisions.md as a tunable, not a law) that are all
       Read/Grep/Glob/ToolSearch-shaped (read-only) with no Edit/Write/NotebookEdit/Bash-that-writes
       in between.
     - Render each flag as a short plain-sentence line under the table (file name, what happened,
       how many times) — not a scary red banner, just a fact a reader skims (CLAUDE.md law 2: plain
       sentences, explain it like I'm five). Zero flags → say so briefly ("nothing flagged"), don't
       just show an empty section (a reader shouldn't wonder if the check ran).

5. **Docs pass.** Append to `ai/sessions/doc/decisions.md` (don't rewrite existing sections): why
   `trace.json` is a manual/on-demand file today (same shape of honesty as `week.json`'s own note),
   the waste thresholds chosen (3+ same-file reads, 15s polling window, 5-call read-no-write run)
   and that they're tunable, and whether a real per-turn OpenRouter split existed in the data you
   tested with or the chart fell back to Claude-$-only. Update `ai/sessions/readme.md` with one line
   pointing at the new chart + table.

## Prove it, then land

- `node Server/session-cost.mjs --trace 355eb7ba-ed23-46bb-ab6f-77c073a23571` → log `calls.length`/
  `turns.length` in this task's task.jsonl.
- Produce one real `trace.json` for a session that actually has repeated file reads (skim a real
  transcript for one, or use this mastermind's own session — it has plenty) and confirm by eye that
  at least one waste flag fires for real data, not just a hand-built test fixture.
- Headless-check the session detail route at 1920 with the chart + table showing, zero console
  errors, before releasing any `hold.mjs`.
- Commit every file by its exact path (never `-A`). Append a landing line to THIS task's
  `public/framework/ai/2026-10-03/session-trace/task.jsonl`, then stop.

## If the worktree pool is exhausted (it was, earlier today)

Build directly in the main tree (`C:\Code\lew42\monorepo`), committing per file as you go, holding
the live reload (`node Server/hold.mjs on "..."` / `off`) only around the `page.js`/`sessions.css`
edit — this is the already-decided fallback for this exact module today (law 5: never wait on a
blocked resource). Don't retry `take_worktree`/`spawn_agent` more than once; if it's still refused,
just proceed in the main tree.
