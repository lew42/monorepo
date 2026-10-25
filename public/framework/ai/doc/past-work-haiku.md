# Past work via a Haiku child session: a reusable search with live results (plan, not built)

The owner's ask (2026-10-24, item 5 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): finding what was already built should be a standing tool. The asker, an Opus mastermind, turns the owner's words into search terms, then hands the reading to a cheap Haiku child that reports each find the moment it has one.

## What exists

- `node Server/PastWork.mjs <words>`: the fast, computed search (tasks, modules, docs, asks, commits). Free; run it first. `--brief` prints the prompt for a Haiku searcher with the readme chain; `--task` writes `past-work.md` beside a task. The [past-work skill](../../../../.claude/skills/past-work/SKILL.md) says when.
- `node Server/ModuleLog.mjs <path>`: one module's history joined from task logs and `git log`. It is the "read the logs first" step.
- **The trial** ([findings.md](../sessions/2026/10/24/session-e00f55c9/past-work-per-file-docs/findings.md)): a Haiku search for the per-file documentation system found it (`doc/file/<path>.md`, 349 notes) in about 116k tokens of reading, and its method notes say what wasted time (the first search term matched prose, not the name). That is the working example below.

## The design

1. **The asker turns the owner's words into a search.** An Opus mastermind writes `search.json` in a task folder: the owner's sentence, 3 to 8 search terms (including other names the thing might have: the trial missed because "per-file doc" is `doc/file`), the likely modules and paths, and a budget. This is judgment, so it stays with the asker.
2. **It spawns one Haiku child session** with that file as the brief (`Budget: $N` first; a long read may pass 100k, [agent-rules.md](agent-rules.md)).
3. **The child reads the logs first**, for anything done recently: `ModuleLog` on the likely modules, `PastWork.mjs` on each term, the last week's tasks. Only then the readmes and code.
4. **Each find is reported the moment it exists**, as a result item in the child's own session, through the item tool, so the asker (and the owner on the session page) watch the list grow instead of waiting for a final report:
   `item({path: <child session>, delta: {results: {add: {where, what, kind, confidence, source}}}})`
   with `kind` one of `exists | partly | related | stale`, `where` a path or url, `what` one plain sentence, `confidence` high, medium or low (with `checked in code` or `read in a log` as the source), `source` which step found it. A first version can use the page parts that exist (`part-card`, one per find); a `SearchResult` item class comes when the list is wanted as data (queryable, sortable like the sessions grid).
5. **The session shows a check mark when the search ends**: the child completes its task (`{"complete": ...}` through the item tool), and the session's `completion` shows it done like any other task. A search that found nothing ends with a single `kind: none` result naming the readmes it read, so the next searcher skips them.
6. **The asker reads the list, not a report.** It decides: reuse, extend, or build new and say why.

## Two parts to build

- **The skill or tool.** Smallest form: a `past-work-search` mode of the existing past-work skill, plus a node helper that creates the child session's results list and the brief from `search.json`. It extends the skill that exists (law 6), it does not add a second one.
- **A read-only minion.** *Seen 2026-10-24:* a minion cannot spawn when no pool worktree is free, even for work that only reads (`Agents.spawn`, `Servex/agents/Agents.js`, the "A MINION NEVER GETS THE MAIN TREE" guard); the search had to be spawned as a task-mastermind instead. The guard is right for a minion that writes. The fix, planned: a spawn flag `read_only: true` that skips the pool redirect and instead removes the write tools (`disallowedTools`: Write, Edit, NotebookEdit; Bash only through a read-only wrapper, since a shell can write). Until the wrapper exists, a read-only search takes a pool slot, and a dry pool is the existing error. Not built: a mistake in this guard puts a minion in the main tree, which is the incident it was written for, so it gets its own task and review.

## Order

1. Wait for the trial's measured cost to be written into the Haiku rule (done: the 116k figure is in [agent-rules.md](agent-rules.md)).
2. Build the results list on a child session and the helper script; run the same question (`per-file docs`) again and compare with `findings.md`.
3. Then the `read_only` spawn.

Independent repeats of the same search, compared, are the [parallel Haiku](parallel-haiku.md) idea.
