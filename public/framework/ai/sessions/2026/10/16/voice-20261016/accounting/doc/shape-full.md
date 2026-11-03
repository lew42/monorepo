# One session folder: proposed shape

A proposal for requirements R1–R17 ([requirements.md](../requirements.md)). Nothing is built until the owner approves it. It builds on the owner's earlier decisions in [sessions/doc/data/data-architecture.md](/framework/ai/sessions/doc/data/data-architecture.md) (§9, §11 and §12) and on the line kinds already defined in [record-spec.md](/framework/ai/sessions/doc/data/record-spec.md). mastermind-page (core/Page) agreed to every point here on 2026-10-16. Facts and counts are in [facts.md](../facts.md) and [answers.md](answers-full.md).

## 1. The folder

```
sessions/2026/10/16/
  index.json                         ← the day's rows (a cache, AISessionIndex)
  voice-20261016/                    ← a ROOT session; folder name = its agent id (R12)
    session.jsonl                    ← the session's record: Session's own log (R15, R16)
    page.jsonl                       ← what agents draw on the session's page (Session HAS a page)
    index.json                       ← this session's snapshot, a cache rebuilt from session.jsonl
    requirements.md  answers.md ...  ← human-facing documents
    accounting/                      ← a TASK: has task.jsonl
      task.jsonl  requirements.md
    helper-accounting/               ← a SUB-SESSION: has session.jsonl, the same shape, recursively
      session.jsonl  page.jsonl  index.json
```

- **The raw SDK transcript (`~/.claude/projects`) is the one record of what was said and spent (R14).** Nothing in the folder copies it. Every number is derived from it by a script.
- **Children are plain child folders,** with no `subsessions/` or `tasks/` folder in between (the owner's §11). A child folder with a `session.jsonl` is a sub-session, and one with a `task.jsonl` is a task. The `sessions` and `tasks` Lists on the `Session` are filtered views over the child folders, the way `Page.pages` works.
- **Name trap:** a child folder must not be named like a method or field of `Session` (`content`, `cost`, `tag`, ...). The member would shadow it when a delta walks into it.
- **A child stays under its root's day,** even after midnight.

## 2. `session.jsonl`: one line per fact, each a `Session` method

`class Session extends Item` (it runs in node, unlike `Page`, which imports `View`), with `static file = "session.jsonl"`. Every line is an `Item.set` delta: its key names a `Session` method. So a blind append and a server-side instance replay to the same state. Replay is pure: a method only records its line and never makes a folder or does other I/O.

| Line | Holds | Written by |
|---|---|---|
| `session` | line 1: SDK session id, agent id, parent, model, provider, kind (`servex`, `vscode`, `cli`, `cloud`) | spawn code (`Agents.js`), or the transcript backfill for a tab |
| `req` / `check` | a numbered requirement, quoted or linked to `requirements.md`; then its status (`met`, `open`, `missed`) with an evidence link (R16) | the agent through the item tool; checked at landing (`finish-task`) |
| `tag` | the core files and modules worked on: `module/core/Page`, plus the existing `kind/`, `model/` and `work/` tags (R6, R16) | a script that reads the Edit and Write calls in the transcript |
| `child` | a task or sub-session made inside this session (R3, R16) | spawn code and `new-task`, after the folder exists |
| `cost` | the running total so far: `{claude_usd, openrouter_usd, tokens, through: <transcript line>}`. The two currencies are never added together (R1, R2, R10). | the Digest (`AISessionDigest`), run by Servex after each result over the newer part of the transcript |
| `prompt` | a link to an owner prompt: `{line: <transcript line>}`, with no text | the prompt hook |
| `note` `alert` `question` `closed` `links` `weight` | as in record-spec.md | agents, through the item tool |

- **Every writer is code.** That means `append.mjs`, `append_log`, `log_session` and the `item` tool. The item tool refuses agent writes of `session`, `child` and `cost`, which only spawn code, new-task and the Digest may write (law 7).
- **None of these line names collides with an `Item` member** (`set`, `get`, `apply`, `find`, `walk`, `remove`, `save`, ...).
- **Roll-up is a tree walk.** A session's total is its latest `cost` line plus its child sessions' totals, kept separately for Claude and OpenRouter. A grid reads `index.json` and never re-sums transcripts. The detail page re-runs the Digest over the transcript as a live audit, and a mismatch is a bug (R10).
- **Recommendation for raw prompts: link, do not copy (R16).** A `prompt` line points at the transcript line, and the page shows the text by reading the transcript (`/ai-logs/<id>#<line>`). Skip prompt refinement for now. The one exception is a cloud session, which has no transcript on this PC: its MCP log keeps the text, because that log is the only record ([cloud-voice-log.md](../cloud-voice-log.md)).

## 3. When to open a task

A task is a named piece of work with an end: a slug, a brief, a log, and a landing line. Open one when the work changes files, takes more than a few minutes, or is something the owner will want to find again. A question, a status check or a lookup is not a task; those turns are already in the transcript.

## 4. The rename, `task.jsonl` → `session.jsonl` (R15, decided)

- **What moves:** the 757 `task.jsonl` files that sit directly in a day folder are session logs and get renamed. The 876 deeper ones are tasks and keep the name. No folder has both files, and 588 session folders already have a `session.jsonl`.
- **Four commits, each tested first:**
  1. **One lookup.** `TaskDirs.log(dir)` returns `session.jsonl`, falling back to `task.jsonl`. Switch the readers to it: TaskDirs, SessionIndex, TaskLoop, the six hooks, AISession and AITask.
  2. **The writers.** `open_task()` (`Agents.js`) and `TaskDirs --new` write `session.jsonl` for a session folder.
  3. **The move.** A script (`Server/SessionRename.mjs`) runs a dry run, writes a manifest, does `git mv` on the 757 files, adds the moves to `task-moves.jsonl`, and can `--undo`.
  4. **Skills and readmes.** Update the 16 skills and the current readmes; dated history docs stay as they are.
- **Folder names follow the agent id from then on (R12).** Old folders keep their names and resolve through `task-moves.jsonl`.

## 5. What goes away (R14)

Each of these goes in its own scripted, reversible commit, after the step above it works:

- the agent logs `agent-<id>.jsonl`, once the dashboard stream reads the transcript or streams from memory
- the registry's `cost` and `turns`
- the AISession snapshot's own cost tally
- the remote door's chat copies
- the prompt-relay `Prompt` text
- the `owner-prompts` and `words` copies

Detail: [answers.md#r14](answers-full.md#r14).
