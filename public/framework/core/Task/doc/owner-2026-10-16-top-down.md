# Owner notes, 2026-10-16 (night): the task system read top-down (dictated; decisions by voice-app where the owner left them open)

> **Superseded 2026-10-26 (the owner):** a task now stays in the session that files it; a module folder only with an explicit `home`. Read [the rule](/framework/ai/doc/tasks.md) first; what follows is the earlier module-primary decision.

Third note of the day; read `owner-2026-10-16-task-system.md` and `owner-2026-10-16-composition.md` first. Where the owner said "I'm not sure", voice-app decided (marked **decided**) so the build never waits.

## Classes

- Nothing on the AI side extends Page to be a task. `AITask extends Page` was a viewer; the page over a task is `TaskPage extends Page` and it HAS a `task`. The AI system uses `core/Task` directly; an `AITask extends Task` exists only when AI work needs something a project-management task would not. **Decided:** no `AITask extends Task` until a concrete need appears.
- `Task` stays generic enough to run a plain project-management list outside the AI system.

## Names are the code

Use the property and method names from the code when talking about tasks; the code is the truth. The plan's amendment carries a Names table (field, type, one line) and that table is the vocabulary.

## expected

Outcomes are statements the review tests at the end ("was this satisfied?"). "Requirements" is too strong a word; "expected" works. **Decided:** `expected` is a string or an array of strings for the MVP; a List of cards (drill in, comment per item) later. Each string is checked at `complete()`, by the reviewer, as a yes/no.

## The task's own data, and its page

- A task has `content` (a List), like a page, so a note, a decision, a log line, a form can sit on it.
- That content is stored in the task's own log (`task.jsonl`), never in a page's `page.jsonl`. A task's page is a view over the task; the data lives with the task.
- Tags: hierarchical; a parent's tags apply to its children, so not every task repeats them. `module` is the first tag.

## Item, not Task, owns replay

Loading an item, applying its deltas, firing change events and saving must be the same for every Item: the delta system pages have (`Item.Store.for(url)`, one store per JSONL file, streamed on localhost by `ext/JSONL/live.js`) is the universal one. **Decided:** `replay` lives on `Item` / `Item.Store`; `Task` only adds the legacy field mapping for old `task.jsonl` folders. If a specialised store is needed it is `class JSONLStore extends Item.Store`, not a page.

## Creating

A new item is the parent's job: `parent.add({type, ...props})` makes a child of that class. Through the item tool: `item({path: <parent>, delta: {"tasks": {"add": {"type": "Task", "title": …, "expected": …}}}})`. The item tool does not need a separate create.

## Where tasks live, and no duplicate data

- **Decided:** the primary home is the module folder, `<module>/tasks/<slug>/`, when the task names a module; a session folder only when no module fits. One copy of the data.
- A session REFERENCES the tasks it worked on (a `task` line with the app path), and the session page shows their live state through that reference. No copy.
- Every new task logs its app path (the same path on server and client) so a node-written index (`ai/tasks/`, from the logs, fast, no LLM) can find it. An index that node rebuilds from the logs is acceptable; one that must be kept in sync by hand is not.

## Lifecycle

- A Proposal is a Task in `waiting`; on approval it is the same data, now running. **Decided:** approval starts the task at once unless a resource queue delays it; "begin as soon as possible" is the default.
- Plan small: an MVP is planned, approved and launched; step two is planned once step one has landed and works. The process is iterative, not a big plan up front.
- Liveness vs state: a task's state is the truth in its log; whether its agent is alive is read live from the agent registry. TaskState shows both; it never guesses state from timestamps.

## The view

A task is a string with a checkbox. Click: it expands in place when it has children; it opens its page when its name is not enough ("what is this actually doing?"). `Task.View` (step 4) is that row.

## Streaming

A `tasks.jsonl` or `task.jsonl` tailed on the client is the same mechanism pages use (one store per file). Whether a page and its tasks should share one socket channel is open; one store per file is fine for the MVP.

## Refine (filed to ext/Refine's inbox)

- A placement step per sentence after cleaning: append to the previous paragraph or start a new one; when unsure, the previous paragraph.
- The input box shows Whisper typing; it clears when the sentence is sent, so you can see where Whisper ends and the LLM begins.

## Page vs view: does a task need its own page? (owner, later; floated, not settled)

What a page gives a task: a route (a path of its own you can click to), and a place to add more. What a view gives it: rendering. A task is an Item, so it already persists and can be added to any parent item; most objects need a view, not a page. Option floated by the owner: no task page class at all. `Task.View` renders the task everywhere (a row in a list, expanded in place, or full-size at its own route); the task's route is its app path; a page for it exists only on demand, when someone adds page content. **Decided for the build:** no task-specific logic in any page class. `TaskPage` is kept only as the route that mounts `Task.View` full-size, because routing today goes through Page subclasses; the day routing can resolve any item path to its view, `TaskPage` goes.