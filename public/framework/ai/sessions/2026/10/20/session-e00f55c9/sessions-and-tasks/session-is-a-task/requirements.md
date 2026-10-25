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

## Part 3: the 60-second write, investigated properly (the owner, 2026-10-24, the next prompt)

"I don't know what the heck 60 seconds is taking. Make sure we're looking into this properly, doing a thorough investigation of the problem and potential solutions, and solving it in a way that makes sense to our system." This replaces item 12's quick fix with a proper one.

12b. **Measure first.** Time each step of one `item` write on this session's record: the replay, the append, `session_state`, `agents_resolver` (it reads Servex's registry of every agent ever started, 2,000+ rows and 3 MB, to find the child sessions), the per-task cost lookups, and `cache.jsonl`. Write the numbers in `slow-write.md` here.

12c. **The owner's model, so build to it:**
- **A session is built from its own `session.jsonl` alone,** and that file names its child sessions. No scan of a global registry to find them.
- **Indexes are per scope.**
  - `ai/sessions/index.jsonl` lists the years.
  - Each year's index lists its months, each month's its days, and each day's its sessions.
  - Some `index.json` and `index.jsonl` files already exist (in `2026/` and in each day). Find what writes them and extend those; don't add another set.
- **Servex keeps a live instance cached.** It builds a session once, keeps it in memory, and tails its files. Later reads and writes use that instance, so a write is one append plus an in-memory update.

12d. **Then fix it.** Write the plan in `slow-write.md` and get it reviewed, build it, and measure again. The target: a write in under a second, and a full read of this session in a few seconds at most.

## Part 4: what a session log holds, and how masterminds follow it (the owner, 2026-10-24, the prompt about "show lines")

The tab has been asking agents for `show:` log lines. That's a loose convention (mastermind.md:131, vscode-mastermind.md, the documentation skill), not a system, and the owner doesn't want a special system for it.

18. **(ai-system-mastermind) Retire "show:".**
    - A finished piece of work is the task's `complete`, with its `outcome` and `links` (the finish-task landing). That's what the tab relays.
    - **The session log holds only the major states:** a task added, started, waiting or complete, and a pointer line when a file the owner should know about was written (its path and a one-line synopsis).
    - **Decisions and design go into the module's own docs** (`architecture.md`, `doc/*.md`), where they'll be found. The session log only points to them.
    - Update `task-buckets.md`, the mastermind and vscode-mastermind role readmes, and the documentation skill.
    - Also make task-buckets.md say ONE WRITER for owner asks: the prompt splitter files them, and the tab takes the splitter's task and never adds its own (task-mastermind-session-closeout is changing the code).
19. **(ai-system-mastermind) Masterminds follow their children through the files.**
    - Use the existing `follow` tool (Servex) on each child's session log, reading only the state lines from item 18. No polling, and no relaying of chat between agents.
    - Measure what following costs in tokens. If a child's log is noisy, fix what the child logs, rather than stop following.
    - Check that `/framework/ai/tracking/` is linked from the AI page.
20. **(deputy, adds to 12c) A long session reads fast, with no history lost.**
    - The owner's gut is right that replaying a 4-day log shouldn't take 60s. Measure (12b) whether the time goes on the replay or on the extra work after the append.
    - If the replay itself is slow, add checkpoint lines, so a replay starts from the latest checkpoint while every older line stays in the file. Nothing is deleted or rewritten.


## One subscription system (the owner, 2026-10-24, the next prompt)

"We want to basically use the same system everywhere... the same way an agent subscribes to a sub-agent session log, an agent can subscribe to a certain module, and just by subscribing it automatically gets test errors or browser errors... lean into our one solid system rather than redesigning a subscription system for every new use case."

- **The one system is Servex `follow`.** It watches a file or a folder (module level), and a `.jsonl` file's new lines arrive verbatim, batched every 2 seconds.
- **So a test failure or a page error is just a line appended to a log in the module's own folder** (data lives with its module). Whoever follows that module gets it. No direct `send` from the watcher, and no second subscription mechanism.
- **The builder follows the modules it is changing,** the mastermind follows its children's session logs, and both use the same tool.
- **The noise rule still applies:** report a failure only if it still fails after a quiet spell. Passes are logged as one "clear" line.
- **`ai/errors/` (one global folder) moves toward per-module logs.** Say how in your outcome.

## Part 5: prompts are tasks too (the owner, 2026-10-24, the prompt starting "I'm getting kind of confused on the structured content thing")

21. **(deputy) `Prompt extends Task`.**
    - Each owner prompt is a Prompt in `session.tasks`, and the asks made from it are nested in the Prompt's own `tasks`. The owner likes this picture: tasks sit in context, under the words that asked for them.
    - Completion and cost roll up: task → prompt → session, all computed at read time.
    - **The tab's decision (the alternative was a flat task list with prompt references): nest.** A reference breaks when its target moves or is renamed; a nested child has no reference to keep in sync.
    - **When the work for an ask moves** (to a module's `tasks/` folder, or to an agent's folder), the task stays under its prompt as the record of the ask. It keeps one `path` pointer to where the work is, and the work folder points back with its parent. Moves are scripted with a manifest, as with any move.
    - **Cheap first step:** the prompt records in `prompts.jsonl` (raw, clean sentences, parts with `cites`) become Prompt instances with no data lost. The cites stay, so the chat view and the coverage score (prompt-breakdown brief) come straight from them.
22. **(ai-system-mastermind) Approval defaults to "do".**
    - The owner often doesn't read replies, so asks are done without waiting for approval, unless the owner says "plan" (or "propose"). The owner will try to say "plan" or "do".
    - Write it into `ai/doc/task-buckets.md`.
    - Name the open question, one kind of task done at once and another that needs a sign-off, and leave it open.
23. **(ai-system-mastermind) 100% completion is a top priority for every session.**
    - A task ends one of three ways: done properly; reworded so it can be done properly; or stopped as no longer needed, with the reason (the owner can reverse a stop).
    - Nothing is deleted, ever.
    - Add each session's completion to the tracking page (`/framework/ai/tracking/`), and put this rule in task-buckets.md.
    - This session (e00f55c9) is goal number one. The closeout is in `../session-closeout/`, and its write waits for the fast write.

21b. **(deputy) Name it so it reads plainly.** "Session extends Task, and its tasks are prompts" is a mouthful (the owner). Write the shape in the readme in plain words, and consider a clearer list name, e.g. a session's `prompts`, while it is still a Task list underneath. Pick one and say why. **Moving tasks out of a session into a module is NOT in scope.** It's a note in core/Task's inbox, for a later shape discussion that the owner signs off.
