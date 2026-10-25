# Session is a Task: tasks as buckets, children linked, numbers computed live

**Priority 1. The owner approved this core change ("That's definitely the right shape... make sure that gets built. High priority").** The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, the prompt after line 415). Builder: `mastermind-deputy` (items 1–7). `ai-system-mastermind` does items 8–9. Budgets are estimates.

## The shape the owner asked for

1. **`Session extends Task`** (today `core/Session/Session.js:13` extends `Item`). A session then gets Task's states and completion logic. Its `tasks` list holds tasks, processes, projects and child sessions alike.
2. **`tasks.add(x)` takes anything.**
   - A plain string becomes a Task with that title.
   - An object without a `type` becomes a Task.
   - An object with a `type` (Process, Project, Session) becomes that class.
   - One call through the item tool: `item({path: "<session>", delta: {"tasks": {"add": "Fix the tab bar"}}})`.
3. **A child session is linked to its parent.**
   - A spawn adds the child to the parent session's `tasks`, the moment it starts.
   - Its `parent` is the parent's session id, never an agent name like `vscode-mastermind`. Map the existing `vscode-mastermind` rows to `e00f55c9`.
4. **Numbers are computed live, never stored.** A session that is loaded loads its children. Its cost, duration, completion and task counts (its own tasks, and the total over all its children) are computed from them at that moment. Nothing writes a total that can go stale.
5. **Tokens are attributed to tasks.**
   - A task is a bucket. Every token a session spends between a task's `start` and its `complete` belongs to that task.
   - Tasks are buckets of meaningful work, not one per file read.
   - Tokens spent with no task open show as "untracked".
6. **Indexing is instant.** A task added to a session shows on the session page at once. Prove it with a test: add through the item tool, read the session back, and render it.
7. **One readme flow** (CLAUDE.md law 9), in `core/Task/readme.md` and `core/Session/readme.md`:
   - an AI adds a task to a session with the item tool;
   - an AI spawns a child session;
   - for each: which file is written, which class reads it, and where it shows.
   - Plus the folder rule: a session stays on the day it began, and `TaskDirs --new` never opens a second day record.

## For ai-system-mastermind

8. **Put the rule in the framework, not in a memory note.** Every agent opens a task (a bucket) for each piece of real work and closes it, and a tab files each owner ask as a task on its own session. It goes in the ai readme and `ai/doc/agent-rules.md`, with the flow from item 7 linked.
9. **Monitor it with a node script.** It checks:
   - which sessions did work with no task open, and the share of untracked tokens;
   - which child sessions have no parent link;
   - whether any session shows a stored number that its children disagree with.
   It reports on a page reachable from the AI page.

## Done when

- [ ] `Session extends Task`, with tests passing, and `tasks.add` taking a string or an object.
- [ ] This session's page (`/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/`) lists every child session and task, newest first. It shows own and total task counts, and cost and duration computed from the children. Shot at 1920, reached from the AI page.
- [ ] The readme flow is written, the rule is in the framework, and the monitor page is linked. Ready to merge; the merge is the owner's.

## Part 2: the owner's next prompt (2026-10-24, right after the sessions-page prompt)

"Let's go ahead and make session extend task... make sure that we properly transition from whatever it is now to the new state. And we do want to create unit tests or automated tests."

### For the deputy (adds to items 1–7)

10. **The transition is a planned migration, not just a class edit.**
    - Write down every caller of Session and every record shape it reads.
    - Move them over in small merges, each one smoke-tested.
    - Old records must still read correctly.
11. **Tests go in the existing test system:** `core/Test`, run by WorktreeWatch and the merge gate (the page mastermind's "five tests" task).
    - Add a few fast tests: a Session is a Task, `tasks.add` with a string or an object, a child session linked, live totals.
    - No test sprawl, and nothing that bogs down the machine.
12. **Item writes must be fast.** A write appends one line, so the file's size shouldn't matter. But a write through the item tool currently takes 60s+ on this session's record (145 KB). After appending, `item` builds and returns the whole session picture: `session_state` in `Servex/agents/page_tools.js` walks every task's cost, resolves the agents (the registry is 3 MB) and reads `cache.jsonl`.
    - Make a write return just `{ok, id, line}`; the full state is a separate read.
    - Measure the time before and after.
13. **One source of truth, in the readme.** State can live in four places: the file, the dev server, Servex and the browser. The file (the jsonl) is the only truth. Every other place replays it and never keeps edits of its own, and writes go only through the append. Pick one parent reference, session id or path, and use it everywhere.

### For ai-system-mastermind (adds to items 8–9): when to make a task

14. **The rule.**
    - If what you're doing fits the scope of the task you're on, just do it, with no child task.
    - If it's unrelated, open a sibling or child task.
    - The point is that tokens get counted against what was actually done.
    - With a plan, the tasks are made up front. In autonomous mode, the agent opens each one as it goes.
15. **Every agent starts with a task.**
    - A spawned agent is handed one already made, so the mastermind and the agent both hold its link.
    - An agent that gets a prompt with no task opens one as its first act. A node hook can enforce this.
16. **One writer per task.**
    - Once the mastermind hands a task off, only that agent updates it until it hands it back.
    - The hand-back starts the review.
    - Write down who may update what.
17. **Notes, decisions and findings belong to the task** ("we need to figure out how this works, look into it, write it down, move on").
    - Tasks can hold notes and content cards.
    - A session's log references its tasks and notes in order, so one log renders as a timeline you can replay.
    - Propose how content cards get added to tasks and sessions with the item tool. Show the proposal; don't build it yet.
