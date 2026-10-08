# Session record spec

A session's record is one append-only file: `sessions/<session-uuid>/session.jsonl`. Each line is one JSON object. Nothing is ever edited or deleted; a later line wins. The Sessions page reads this record, so write what you know in these shapes and nothing else.

**Goal state:** for every session from the past few days, a clean record with name, cost, runtime, model and effort, tags, core links and alerts. Cost, runtime and model are computed by `Session.js` from the transcript, so you never write them. You write the judgment: tags, links, alerts, notes.

## Line types

Every line carries `at` (time), `by` (author) and `session` (the uuid); the writer stamps all three. You supply exactly one of these keys:

| Key | Shape | Meaning |
|---|---|---|
| `tag` | `{"tag":"refactor"}` (1 to 40 chars) | A short label. One tag per line. |
| `note` | `{"note":"Built the audit button; merge is pending."}` | A plain sentence for the next reader. |
| `alert` | `{"alert":"asked for X, never followed up","level":"warn"}` | Needs attention. `level` is `info`, `warn` or `error` (default `info`). |
| `weight` | `{"weight":7}` (0 to 10) | How important the session was. Drives sort order. |
| `closed` | `{"closed":true}` or `{"closed":false}` | Done (rubber stamp) or reopened. Closed sessions hide by default. |
| `question` | `{"question":"Keep the old table?","options":["yes","no"]}` | Two or more options for the owner. |
| `links` | `{"links":[{"path":"/framework/ai/sessions/","label":"Sessions"}]}` (1 to 3) | The core classes, files or pages the session created or edited, most important first. `path` is required. |

## How to write a line

The log tool is not built yet. Until it is, use the script, which checks the shape and stamps the line:

```
SESSIONS_ROOT=C:/Code/lew42/monorepo/public/framework/ai/sessions \
node C:/Code/lew42/worktrees/session-class/Server/session-summary.mjs \
  --log <session-uuid> '{"tag":"refactor"}' --by mastermind-task-audit
```

`SESSIONS_ROOT` makes it write into the main tree's `sessions/` folder (the file is gitignored, so it never conflicts). A bad shape exits with code 2 and says why. After the branch merges, the same command runs as `node Server/session-summary.mjs --log ...` without `SESSIONS_ROOT`. The Servex tool will wrap the same function (`Session.log`); the arguments will be `session`, `line`, and your agent name as `by`.

Required: the session uuid (36 characters, the Claude session id), `by`, and one valid key. Never write `at`.

## For an old session that lacks something

- No tag: add one to three tags that say what kind of work it was.
- No core links: add one to three `links`, most important first.
- An unclear or unfinished thing: add an `alert`; if the owner must choose, add a `question`.
- Finished and unremarkable: add `closed`.
- Never write a cost, runtime or model. If the numbers look wrong, run `node Server/session-summary.mjs <uuid> --audit` and note the mismatch.

More about the class: [session-class.md](session-class.md).
