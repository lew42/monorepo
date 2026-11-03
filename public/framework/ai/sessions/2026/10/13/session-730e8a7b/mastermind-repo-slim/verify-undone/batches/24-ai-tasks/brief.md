# Check 17 asks against the repo: ai/tasks

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/24-ai-tasks/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ai/tasks`, folder `public/framework/ai/tasks` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ai/readme.md`, `public/framework/ai/tasks/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ai/tasks/readme.md`)

# Tasks — what is in flight, queued and landed today, live

See it: **[/framework/ai/tasks/](/framework/ai/tasks/)**. One list, three groups: **In flight** (a ⚠ when an agent has been quiet over 5 minutes), **Queued**, **Landed today** (its landing line's first sentence). Click a row and its task card opens beside the list.

- **Where the numbers come from:** `Server/TaskState.mjs` reads Servex's agent registry and every `task.jsonl`, and appends one line to `state.jsonl` when the picture changes. The page tails that file; nothing is counted by hand or by timer in the browser.
- **Run it:** `node Server/TaskState.mjs --watch` (nothing starts it yet: run it beside the dev server; a Servex hook is the next step); `--print` shows one snapshot.
- **Two views, same state:** the [List](/framework/ai/tasks/) (a `Browse`) and the [Lanes](/framework/ai/tasks/lanes/) (three columns side by side).
- **I recommend the List.** It keeps the detail beside you and reads in time order; Lanes is better only on a very wide screen, where all three groups fit at once.

## Watch out

- `state.jsonl` is machine state (gitignored); if the last line is over 3 minutes old the page says it is not live instead of showing stale counts; the watcher writes at least one line a minute.
- The registry has no push, so `--watch` re-checks it every 5 seconds and writes only on a change.

## More

- [doc/architecture.md](doc/architecture.md): the classes and how they connect.


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/24-ai-tasks/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 17 asks

1. `27c704e58c` (4 days old): Make the refinement loop: screenshot, read, change, reread, compare to the prior run, and judge whether it improved.
2. `e2f85cfcc5` (4 days old): Find out whether Haiku can do the reading and refinement, or whether it only recommends changes.
3. `1a1ed3a50d` (4 days old): Have the mastermind read all the images and weigh in on whether each change is better or worse.
4. `c6954fe70f` (4 days old): Run parallel agents that each refine a layout, then compare the results.
5. `71015c55f0` (4 days old): Make the task process structured: the AI designer chooses the right procedure and task count.
6. `82b5d9c4ce` (4 days old): Automate the process so it does not depend on the mastermind remembering to do the steps.
7. `bf055744be` (4 days old): Nudge the agent through every step of the approved process, including strongly prompting UI testing tools when UI is built.
8. `c7de8bf520` (4 days old): After a task's time estimate passes without a check-in, ask the minion how it is going.
9. `41a0fffb78` (4 days old): Double the task time limit before prompting a check-in, so the minion has enough time to finish.
10. `d1ab4c55b9` (4 days old): Nudge the minion within a minute or two if that matches the expected window for the task.
11. `57b654e5d3` (4 days old): Attach special instructions to task types, such as UI, that involve screenshots.
12. `12856e0590` (4 days old): Have the mastermind orchestrate Playwright and the screenshots, making sure they are the right ones and saved to the right place.
13. `e74e1d5156` (4 days old): Decide who runs UI testing and whether to spawn a new agent or use existing ones.
14. `50697317c6` (4 days old): Build a named system that defines its own requirements and keeps a log of everything it does.
15. `00edbf0b55` (4 days old): Decide whether the system is documented by AI or by Node.
16. `4eac29e984` (4 days old): Let Node handle procedural and clerical work once approved, with AI helping only where judgment is needed.
17. `3e6c180e5d` (4 days old): Look into whether the AI can work reliably as the mastermind's image judge over time, tracking outcomes to see what works.
