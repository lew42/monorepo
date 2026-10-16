# past-work: discovery round + one cheap pilot

You are the task mastermind for this round (load `sub-mastermind`). This round is discovery plus one cheap pilot. Do NOT build the past-work system yet.

- Asked by: the owner, by voice, question ca6b155b. The ask is logged in the voice task log, `../task.jsonl`.
- Parent: mastermind-voice-20261016.
- Model: Sonnet, high effort. Budget: $20.

Read `../owner-words.md` first, topics 6-14.

## 1. Inventory every piece that queries, indexes or audits past work

Check each of these, and anything else you find:

- `Server/SessionIndex.mjs`: in-memory, live through fs.watch, the "tasks" QueryServer source, module tags taken from touched files, parent-matching.
- ext/Query (`Query.js`, `QueryServer.mjs`).
- `Server/PastWork.mjs`.
- `ai/past-work-index.md` (Oct 14).
- The Oct 8 snapshots: `sessions/session-index.json`, `session-tree.json` and `sessions.json`.
- `task-manifest.json` (Oct 10).
- `asks.jsonl` and `ai/doc/asks-outcomes.md`.
- `ai/audits`, `ai/review` and `verdicts.jsonl`.
- The DataGrid class behind the sessions UI.
- `.claude/skills/past-work`.
- Earlier prompt and task audits.
- Stale ai2/dashboard leftovers.

For each piece, record:

- its path;
- what it does;
- its writer and its reader;
- when it was last modified (from git);
- whether it is live or a one-time snapshot.

Let a node script gather the dates and sizes. Don't read big files whole.

## 2. Write it up as page/query

Write the doc at `public/framework/core/Page/doc/query.md`. The owner wants it anchored as "page/query".

- Link it from the Page readme's docs index.
- End it with a keep / merge / scrap verdict for each index.
- Close with the owner's open decisions.

## 3. Pilot: one Haiku minion on one session log

1. Spawn one `claude-haiku-5-5` minion at low effort, with `parent` set to you.
2. Give it ONE mid-size session task.jsonl from the last two days. Pick it by size with a script, and keep it well under 100k tokens of context.
3. Ask it for three things:
   - a 2-3 sentence summary;
   - the module path tags the session touched;
   - the existing systems it saw.
4. Record the context size and the cost from the Servex registry.
5. Judge whether the output is good enough to run on every session.

## 4. Prompt logging and the naming rule

(a) The voice agent is the Claude app over MCP, so its transcript never reaches disk. Propose how it should log the owner's raw prompts into Servex. First check whether `append_prompt_event` or `log_session` already does this, by reading their code in `Servex/`.

(b) Add exactly one line to the root `CLAUDE.md`. The owner asked for this, so it is approved:

> every new module or task settles its name and home location first.

Put it where it fits; the Laws or `make` are likely spots.

## Landing

- Commit each step.
- Land with `finish-task`.
- Report back to your parent (mastermind-voice-20261016) in under 15 lines:
  - what exists;
  - what's stale;
  - the pilot's quality and cost;
  - the one decision needed.
