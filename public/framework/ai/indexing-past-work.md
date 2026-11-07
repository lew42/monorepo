# Indexing past work: how we find what was asked, done and decided

The owner asks "didn't I ask for this?" often, and the answer has to come from the files, never from memory. This page is the one place that says how to find anything we've worked on, and what has to be logged for that to work. (Moved here from `ai/sessions/doc/finding.md`, 2026-11-06.)

**Rules.**
- The session logs are the source of truth ([ai/readme.md](readme.md)).
- A search that misses or takes more than one try gets its working query added here.
- A search that can't work, because the event was never logged, adds that event to "The logging contract" and files a task to start logging it.

## 1. Search the session logs with `git grep`

Logs live in `public/framework/ai/sessions/YYYY/MM/DD/<session folder>/*.jsonl`. **The folder path is the date and the session. A line's first key is what happened.**

`rg` is **not installed** on the owner's shells. `git grep` is built in, takes regex, and skips `node_modules`. Timed 2026-11-06 over every session file: about 0.1 s for an exact key, about 2.5 s for a regex over all of `ai/`.

```sh
S=public/framework/ai/sessions
# 1. count first
git grep --untracked -c '"queued":' -- "$S/**"
# 2. too many? narrow by day
git grep --untracked -l '"queued":' -- "$S/2026/11/06/**"
# 3. words: regex anchored on a key
git grep --untracked -lEi '"title":"[^"]*tools' -- "$S/**"
```

`--untracked` goes **before** the pattern. Use `git grep -n` to get the line number, then read only that line.

## 2. The owner's own words

| Channel | Where the words are | Search |
|---|---|---|
| VS Code tab | `Prompt` lines in `session.jsonl`, written by the `UserPromptSubmit` hook (`.claude/hooks/prompt-relay.mjs`) | `'"type":"Prompt","text":"[^"]*word'` |
| Browser voice (Dictate) | `sentences:[{n,text}]` per turn, plus `sections` (the asks, citing sentence numbers) | `'"sentences":\[[^]]*word'` |
| Claude app voice | `"from":"owner (voice)"` chat lines; `"k":"prompt"` in `essence.jsonl` | `'owner (voice)[^}]*word'` |
| SDK agents | never hear the owner directly, only relays ("From Michael: …"), which are lossy | don't treat these as the owner's words |

**Planned:** one shape for every channel. The VS Code hook also writes `sentences` (one per sentence, raw), so `'"sentences":'` finds the owner's raw words everywhere. Asks are then derived from the sentences (the `sections` model), not retyped by an agent. Owner: mastermind-session-truth.

## 3. The raw transcripts (the full story)

`~/.claude/projects/C--Code-lew42-monorepo/<session id>.jsonl` holds every prompt, reply, tool call and cost. That's 9,523 files and 9.5 GB, flat, with no date folders. **Filter by modified time first**, then grep only those files. Timed 2026-11-06: 577 files changed in 7 days, listed in 0.6 s; the grep took 7.7 s.

```sh
P=~/.claude/projects/C--Code-lew42-monorepo
find $P -name '*.jsonl' -mtime -7 -print0 \
 | xargs -0 grep -l '"type":"user".\{0,400\}footprint'
```

`"type":"user"` lines also carry tool results, so treat hits as candidates. **Planned:** archive older transcripts compressed, never delete them; they're the record of every ask.

## 4. Git history: what changed, when and why

```sh
# every commit to one file (follows renames)
git log --follow --oneline -- Servex/agents/page_tools.js
# commits that ADDED or REMOVED a string
git log -S'live_root' --oneline
# commits whose diff matches a regex
git log -G'tool(\"page_' --oneline
# a string in an old version of the repo
git grep 'live_root' <commit> -- Servex/
```

Session logs only grow, so old versions of them add nothing; history is for code and docs. **Gap:** only about 1 in 10 commits names its session today. Planned: every commit logs `{"commit":…}` to its session (mastermind-session-truth).

## 5. What each event looks like

| To find | Search for | Status |
|---|---|---|
| An agent's session | `"agent":"<id>"` in `session.jsonl` | works |
| Today's VS Code tabs | `"kind":"vscode-tab"` | works |
| A task by its title | `"title":"[^"]*word` in `task.jsonl` / `session.jsonl` | works |
| A finished task | `"complete":{"outcome":` | works |
| Who started process 1234 | `git grep --untracked -n '"pid":1234' -- 'public/framework/ai/sessions/**'`; how it ended: `"pid_exit":1234`; Servex's own (no agent): `%LOCALAPPDATA%/lew42/servex/logs/spawns.jsonl`. Fields: `started` / `ended` (a line from the 10 s sample also has `"seen":"sample"`, `code: null`). Every start with no end (a leak): `node Servex/leaks.mjs` | works since 2026-11-06 21:50 (processes Servex starts); the processes an agent's claude.exe starts, since the sampler landed ([Servex/doc/processes.md](/Servex/doc/processes.md), "Who started this pid") |
| A queued spawn | `"queued":{` in the parent's `session.jsonl`, then `"started":{` | works since 2026-11-06 21:50 |
| Which session made a commit | `"commit":"abc123"` | planned (mastermind-session-truth) |
| A caught error | `"error":` | planned (mastermind-resources) |

## 6. The logging contract

One event, one line, **one fixed first key**, plus `by` and `ts`. The same event is always written the same way, whoever writes it.

```js
{ "sentences": [{ "n": 1, "text": "…" }] }
{ "queued": { "agent": "x", "commit_pct": 82 } }
{ "pid": 1234, "cmd": "…", "why": "…", "agent": "…", "session": "…", "started": "<stamp>" }
{ "pid_exit": 1234, "ended": "<stamp>", "code": 0, "signal": null }
{ "commit": "abc123", "files": ["…"] }
{ "error": "…", "where": "file:line" }
```

## 7. What already exists (the map)

Similar things live in several places. Each one should point to the others, and some should be merged.

| What | Where | Note |
|---|---|---|
| Search past work before building | `Server/PastWork.mjs`, the `past-work` skill (`.claude/skills/past-work/`) | writes `past-work.md` per spawn; exact words only; its index (`ai/past-work-index.md`) is stale since 10-14 |
| Find sessions by tag, system, cost or day; one session's completion | `Server/session-query.mjs` ([record-spec.md](sessions/doc/data/record-spec.md), "Asking about past sessions") | completion calls `session.completion_score()` |
| One row per task, agent, card, ask | `Server/doc/ai-index.md` (AIIndex) | |
| Every task in memory, plain JS queries | `Server/doc/session-index.md` | |
| Work since 10-20, by area | [doc/built-index.md](doc/built-index.md) | hand-written, 11-01 |
| Asks vs. outcomes | [doc/asks-outcomes.md](doc/asks-outcomes.md), [doc/audits.md](doc/audits.md) | |
| How readmes work, what each role reads | [doc/readme-system.md](doc/readme-system.md), [agents.md](agents.md) | **also** `Servex/agents/roles/` (one readme per role). Two homes for agent docs: to be cross-linked, then merged into `framework/ai` |

**Readmes are the first index.** A folder's `readme.md` is short. It names everything directly inside the folder (or links a sub-doc that does) and says how to search its data. When a search was hard, the folder's readme gets the query that worked ([doc/readme-system.md](doc/readme-system.md)).
