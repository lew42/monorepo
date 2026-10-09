# The per-module `ai/` folders — what they are and what writes them

Many folders have an `ai/` subfolder (26 today, e.g. `ext/Session/ai/`, `ux/Dictate/ai/`, `ai2/ai/`). It is the **folder's AI memory**: a presence index plus the voice sessions that were about that folder. It is not the task log (that is the dated task folders under `framework/ai/`).

## What is inside
| File | What | Written by |
|---|---|---|
| `log.jsonl` | One line per event, three shapes only: `session`, `task`, `decision`. Presence only, never progress. | Servex (`Servex/agents/Sessions.js`, `check_dir_line()`) writes `session started` and `ended`; the smart assistant writes `task` and `decision` with the `dir_log` tool |
| `v-<id>.jsonl` | The raw voice transcript of one voice session whose home is this folder | The voice session, through Servex |
| `v-<id>.summary.json` | That session's title and summary | Servex when the session stops |
| `<date>/<slug>/` | Dated notes or handoffs about this folder | Agents, by hand |

The full contract and the three line shapes: [ext/Session/doc/sessions.md](/framework/ext/Session/doc/sessions.md#the-folder-index-dirailogjsonl). Dictation side: [ux/Dictate/doc/decisions.md](/framework/ux/Dictate/doc/decisions.md).

## Why it exists
So an agent that opens a folder can see in one small file which AI work touched it and where the detail is, without searching the whole task log. It is the folder-level counterpart of a task's own `task.jsonl`.

## Rules
- Write it only through the `dir_log` tool or Servex; never by hand (the append guard blocks hand writes).
- A line is a pointer. Detail lives in the file it names.

## Committed or not?
Today they are committed (49 `log.jsonl` and `v-*.jsonl` files are tracked). **Default: keep committing `log.jsonl`** (small, it is the index, and git is the undo). **Alternative: git-ignore the `v-*.jsonl` voice transcripts** (34 files, raw dictation: large, personal, and already summarised) while keeping their `.summary.json`. Decision left to the owner; nothing changed.

## Where this was missing
The contract lived only in `ext/Session/doc/sessions.md`, so a search for "ai folder" found nothing. This page is the entry; the System page links it.
