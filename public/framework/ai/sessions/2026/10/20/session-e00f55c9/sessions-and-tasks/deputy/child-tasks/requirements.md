# A child session is a task in its parent's record; recompute only what changed; one read gives completion

Budget: $8. Load the `minion` skill first. Work in the worktree Servex gives you, committing at every working step. The deputy (`mastermind-deputy`) reviews and merges. Never kill or restart the dev server or Servex, never `git stash`, never drive the owner's tabs. Write records only through `node .claude/hooks/append.mjs`.

**The owner's words:** [session-is-a-task requirements.md, Part 6](../../session-is-a-task/requirements.md#part-6-the-owner-2026-10-24-the-prompt-starting-for-any-session-we-should-be-able-to-just-use-an-item-tool-to-check-the-sessions-completion), items 24–26. The plan for 24 is [slow-write.md, 12c point 2](../../session-is-a-task/slow-write.md#12c-the-owners-model-against-what-exists). Start with `public/framework/core/Session/readme.md`, "How work gets into a session".

## 24. A child session is a task in its parent's `session.jsonl` (do this first)

**Today:**
- At spawn, `open_task` (`Servex/agents/Agents.js`, about line 1027) calls `SessionRecord.link_parent` (`Server/SessionRecord.mjs`). That writes `{"task":"<child folder url>"}` on the nearest log above the child's folder, inside the parent's session folder.
- A child whose folder lives elsewhere gets no line in the parent session's record. Examples: `mastermind-page` in `core/Page/tasks/`, and children under `ai/sessions/2026/10/23/spawned/`.
- Those children are found only by scanning the registry (`Agents.agents_under`, by `parent_session`).

**Build:**
- (a) At spawn, when the child's folder is not inside the parent session's folder, also append `{"task":"<child folder url>","as":"<agent id>"}` to the parent session's record.
  - Find that record from the registry row's `parent_session` with `Session.locate` (or `AISession.locate`).
  - Never twice: `SessionRecord.add_ref` already refuses a url it has.
- (b) Write `Server/ChildLinks.mjs`, a backfill for the children that already exist: every registry row with a `parent_session`, plus, for e00f55c9, the older rows that `agents_under` matches by name.
  - It is a dry run by default and prints a manifest (one line per child: session, url, agent).
  - `--apply` appends the lines.
  - Run the dry run on the main tree and put the counts in your report. The deputy runs `--apply` after the merge.
- (c) The parent's numbers then come from its own references. `Session.replay` already reads `{"task": url}` as a subtask, so the parent's completion includes the child.

**Test** (a `*.test.mjs` beside the code, using `core/Test`'s `Test` class), on scratch records, never the live tree:
- spawn, through `open_task` or the function it calls, then check the parent's `tasks` has the child;
- complete the child, then check the parent's completion moves.

## 25. Recompute only what changed

- **Today:** `live_root` (`Servex/agents/page_tools.js`) rebuilds a session's whole replay when its file, or any child file it read, changes. A session with 100 child records replays all 100 again when one of them gets a line.
- **Build:** keep each child record's replay cached by its own file signature (size and mtime), so one changed child re-replays only that child. Its ancestors' totals still update, because they are computed on read.
- **Measure** before and after: the time to answer `{"summary":{}}` on `/framework/ai/sessions/2026/10/20/session-e00f55c9/` right after one child file changes. Do this on a copy of the tree or in a separate process, never by writing to the live records.
- **Readme:** state the rule in plain words in `core/Session/readme.md`.

## 26. One item read gives any session's completion

`item({path: <any session folder or /framework/ai/sessions/<uuid>/>, delta: {"completion": {}}})` should answer at once: the tally of its tasks' current states (done, total, stopped) and the completion number. It must work for this session and for any past one. Add `completion` to the queries if it is not one. Say the call in the readme. Auditing every past session is later: write one line about it in the readme's open items, nothing more.

## Report (one screen, as your task's `complete` outcome)

The commits; the test output; the dry run's counts (children found, lines it would append); the before and after times for 25; the exact call for 26 and its answer on e00f55c9.
