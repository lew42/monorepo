# Finding things in session logs

Every session log is a `.jsonl` file under `public/framework/ai/sessions/YYYY/MM/DD/<session folder>/`. The **folder path is the date and the session**; the **line's first key is what happened**. Finding past work is one `git grep` over those files. No index, no database.

Read this before searching. Add to it after any search that took more than one try (see "Keep this page honest").

## The tool: `git grep`

`rg` (ripgrep) is **not installed** on the owner's PC shells; `git grep` is built in, takes regex, and searches only tracked files, so it never wanders into `node_modules`. Timed 2026-11-06 over every session file: an exact key ~0.1 s, a regex over all of `ai/` ~2.5 s.

```sh
S=public/framework/ai/sessions
# --untracked goes BEFORE the pattern
git grep --untracked -l '"agent":"mastermind-page-design"' -- "$S/**/session.jsonl"
```

## Three steps, every time

```sh
# 1. count first: how many hits?
git grep --untracked -c '"queued":' -- "$S/2026/11/**"
# 2. too many? narrow by date folder
git grep --untracked -l '"queued":' -- "$S/2026/11/06/**"
# 3. words: regex on one key's text
git grep --untracked -lEi '"type":"Prompt","text":"[^"]*tools' -- "$S/**"
```

- **Many hits:** the path is the date, so narrow the glob (`2026/11/06/**`) before reading anything.
- **Regex:** `-E`. Anchor on the key (`"title":"[^"]*word`) so a word in unrelated text doesn't match.
- **Read one hit:** `git grep -n` gives the line number; read just that line.

## What each event looks like today

| To find | Search for | Notes |
|---|---|---|
| An agent's session | `"agent":"<id>"` in `session.jsonl` | line 1 of a spawned agent's record |
| Today's VS Code tabs | `"kind":"vscode-tab"` | the SessionStart hook writes it |
| An owner prompt (VS Code tab) | `"type":"Prompt","text":"` | in `session.jsonl`; only ~224 folders have one |
| An owner prompt (voice) | `"from":"owner (voice)"` in `session.jsonl`, `"k":"prompt"` in `essence.jsonl` | a different shape for the same event |
| A task, by its title | `"title":"[^"]*word` in `task.jsonl` / `session.jsonl` | |
| A finished task | `"complete":{"outcome":` | |
| Who started process 1234 | `"pid":1234` (start line); `"pid_exit":1234` (how it ended) | `git grep -n '"pid":1234' -- 'public/framework/ai/sessions/**'`; a pid with no agent is in the Servex `spawns` log, `%LOCALAPPDATA%/lew42/servex/logs/spawns.jsonl` |
| A queued spawn | `"queued":{` (and `"started":{` when it began) | `git grep -n '"queued":{' -- 'public/framework/ai/sessions/**'`; in the parent's `session.jsonl`, with `commit_pct` and `page_file_mb` |
| Which session made commit abc123 | `abc123` | only ~240 of 1,321 session logs record any commit |

## The logging contract (what to aim for)

One event, one line, **one fixed first key**, plus `by` and `ts`. The same event is always written the same way, whoever writes it, so one search term finds every instance.

```js
{ "ask": "owner's words", "via": "voice" }
{ "queued": { "agent": "x", "commit_pct": 82 } }
{ "pid": 1234, "cmd": "…", "why": "…" }
{ "commit": "abc123", "files": ["…"] }
{ "error": "…", "where": "file:line" }
```

Today an owner ask has three shapes (Prompt content, voice `chat`, `essence` prompt), so no single search finds them all. That's the first thing to unify.

## Worked example: "how many times did the owner ask to cut the Servex tools?"

```sh
git grep --untracked -lEi '(100 tools|hundred tools|too many tools|number of tools|tool count|reduce[^"]{0,40}tools|fewer tools|one item tool)' -- 'public/framework/ai/**'
```

2.5 s. Hits: the voice sessions of 10-15 and 10-16, the ask audits of 10-12 (two sessions), 10-13, and 10-20, plus `ai/doc/tool-collapse.md`, `ai/doc/readme-system.md`, `ai/system-map.md`. A relay on 10-16 (`voice-20261016/session.jsonl:67`) recorded "Tool collapse … Do NOT build now. Record the recommendation", which is where that ask stopped.

## Keep this page honest

- A search that **missed, or took more than one try**: add the query that finally worked to the table above.
- A search that **couldn't work because the event was never logged**: add the event to "The logging contract", and file a task to start logging it.
- A recipe here that **stops working**: fix it here first.
