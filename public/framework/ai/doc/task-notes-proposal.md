# Proposal: notes on tasks, and a session log that replays as a timeline

**Status: proposal, not built** (the owner asked to see it first, 2026-10-24, item 17 of [the brief](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-is-a-task/requirements.md)). Builds on [task-buckets.md](task-buckets.md).

## The ask

"We need to figure out how this works, look into it, write it down, move on." The finding must have a home that is **the task it came out of**, so it is found beside the work and its cost, not lost in chat. And one session's log should read as a timeline you can replay: what was asked, which task was opened, what was learned, what was done, in order.

## What already exists (so the proposal is small)

- `Task` already has a `content` list (`core/Task/Task.js`: "notes, decisions and log lines, the same `{"content":{"add":{...}}}` grammar as `Page.content`"). The replay reads `line.content`, so a note is one appended line.
- `Session extends Task` (the deputy's items 1 to 7) gives a session the same list, so a session holds notes of its own as well as its tasks.
- A task folder's `task.jsonl` already carries `{"log":{"at","msg"}}` lines (the `show:` lines), and a folder may hold a `page.jsonl` whose cards render as the task's page.

## Proposal

**1. A note is a content card added through the item tool, to the task that it belongs to.** One call, no new verb:

```
item({ path: "<task folder url>", delta: { "content": { "add": { "type": "part-text", "kind": "finding", "text": "A file READ fires fs.watch on Windows; the page reloads itself.", "source": "<prompt or file link>" } } } })
```

- `kind` is one of `note`, `decision`, `finding`, `question`. `decision` also carries `why` and `alternative`, matching the rule that the best decision is made and the alternative named (law 5).
- `source` is a link to the prompt, session or file it came from, never retyped content ("link, don't regenerate").
- The same line works on a session path, which puts the note on the session; use it for what belongs to no single task.
- A task that is finished may still receive a note (a finding found later), but a note is never an edit of history: it appends.

**2. The session log names its tasks and notes in order, by reference only.** The session record already holds `tasks.add` lines in time order, and each task folder holds its own notes with timestamps. A timeline is computed at read time by merging them on those timestamps: the session's lines, then for each task its start, notes and completion. Nothing is copied or stored, so it cannot go stale. Replaying that merge top to bottom is the timeline: prompt, task opened, note, note, task complete, the next prompt.

**3. One renderer, the existing one.** A `Timeline` view in `ai/sessions/` replays the session record and, for each task it names, reads the task folder and draws the notes in place. It is the same replay `Session`/`Task` already do (law 6: not a second reader), with the cards drawn by the page's own card classes. A play control steps through lines by timestamp; the session page's order stays "newest first", the timeline is a tab beside it.

**4. Who writes what.** The assignee writes the notes of its own task ([one writer per task](task-buckets.md#one-writer-per-task-item-16)); the mastermind writes notes on the session.

**5. Logs group under the open task, like `console.group` (the owner, 2026-10-24, session-is-a-task item 28).** Once a task is started, the session's log lines and notes go to that task until it completes: node reads which task is open (the same `open_spans` replay the tracking check uses) and files a plain log line or note under it, so no agent has to name the task each time. An agent may still write to a task by its path to override the grouping. Two tasks open at once (a child of the running one) group under the innermost. A note or card may be added to any part of a session, a prompt or a subtask included, not only the session: the `content.add` line above works on any of their paths. Nothing is built; it follows `Session extends Task`.

## Not decided, with my pick

- *Cards in `task.jsonl` or in `page.jsonl`?* Pick `task.jsonl` (`content`): one file per task, so the one-writer rule and the cost replay see everything. `page.jsonl` stays for hand-built task pages.
- *Write `ref` lines (`{"ref":{"task":"<id>"}}`) by node, to avoid reading every task file on open?* Not now: compute at read time, and add them only if a long session's timeline is slow.

## Build size

About one small `content`-kinds addition in `core/Task`, one `Timeline` view, and a test that adds a note through the item tool, reads the session back and renders it (the same proof as brief item 6). After the deputy's `Session extends Task` lands.
