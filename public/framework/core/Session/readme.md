# core/Session

**The classes on one screen** (Session, Task, Process, Chat, Prompt, as pseudocode; who writes what; completion; the line spellings): [doc/classes.md](doc/classes.md).

A `Session` is one run of an agent or a tab. **It is a Task** (`Session extends Task`, since 2026-10-24): it has Task's states, completion and `tasks` list, and adds a dated folder of its own, `<root>/YYYY/MM/DD/<slug>/`. Its tasks can be plain tasks, projects, processes and child sessions. Decisions: [doc/architecture.md](doc/architecture.md); the move to a Task: [doc/session-is-a-task.md](doc/session-is-a-task.md).

Session is mainly an AI session class (not a web login session), so it probably belongs in the framework/ai module; not moved yet. (The owner, 2026-10-23.) The proposed move and the rest of the dictation/chat/session shape: [ai/system-proposal.md](/framework/ai/system-proposal.md); how the parts fit today: [ai/system-map.md](/framework/ai/system-map.md).

**Where the session page lives.** [`ai/AISession/AISessionDetail.js`](/framework/ai/AISession/AISessionDetail.js) (`class AISessionDetail extends Page`) draws one session at its dated folder, `/framework/ai/sessions/YYYY/MM/DD/<folder>/`. Tabs: overview, timeline, chat, tasks, and More (board, coverage, cost, models, related). Its data is this class's `SessionTasks` replaying `session.jsonl` (which also lists each child session's open tasks as "child › task" through a `Ref`, live: [core/Item/doc/ref.md](../Item/doc/ref.md)); its Chat tab shows the Claude transcript or the file's `Prompt`s (chat v2/v3). Tabs and renderers: [ai/AISession/readme.md](/framework/ai/AISession/readme.md); how it relates to the chat: [system-map.md, section 3b](/framework/ai/system-map.md#3b-the-session-detail-page).

## Snapshot

```js
// Session.js (default export)
class Session extends Task                       // ../Task/Task.js (Task extends Item); registered as "Session"
  static days, slugs: Map   // id -> "YYYY/MM/DD" / folder name. A subclass declares its OWN (statics inherit by reference)
  static scanned: boolean   // true once scan() has read the tree
  static MENU, SETTINGS     // the session menu template and its settings form (doc/menu.md)
  menu(url), settings       // MENU with urls; settings is a core/Settings, groups "dictate"/"recite" (doc/menu.md)
  id                        // from the constructor, or line 1 of the log
  messages: Chat, sentences: List<Sentence>   // the chat, in order, and the owner's raw words: ./Chat/readme.md (written by Servex beside V1's {chat} lines since 2026-11-01)
  tasks: Task.List          // Task's list: add("a title"), add({title,…}), add({type: "Project"|"Process"|"Session"|"Prompt"|"Question", …}) (Prompt and Question: [core/Task/doc/prompt.md](/framework/core/Task/md/doc/prompt/)); each child knows created_at (its line's time)
  state, completion         // Task's getters; state comes from the record's own {"start"}/{"stop"} lines, completion = the average of its tasks' own completions (stopped ones left out; doc/classes.md, "Completion"). Never stored
  progress(): {done,total,stopped}  // Task.progress_of(this._tasks), the one counting code; a stopped task counts in neither done nor total
  first_at, last_at, span_ms  // from the lines' own times, never stored
  static agents_resolver    // node wires it (Servex/agents/Agents.js agents_under): dir -> [{id, parent, role, state, cost, …}], the agent sessions whose task lives in that folder
  static agents_at_resolver // node wires it (Agents.agents_at): folder url -> [{id, cost}], the agents whose task is exactly that folder (a Session entry's own cost)
  is_session: true          // Task's is false; Task.sessions_below() and `children` find child sessions by it
  children                  // computed: the Session entries anywhere in the task tree (under their cause), each with its own children. Never stored
  static replay(lines)      // Item's loop; replay_new takes the id from {"session":id}; replay_line applies one line. Two record shapes, told by the first line:
                            // {"session":…} (a tab, a voice call) is read by apply_line; {"assign":…} (a spawned agent's record) replays through Task.replay_line whole
  static root_url(): URL    // ../../ai/sessions/ ; subclasses override
  static day(first_at)      // "YYYY/MM/DD" via Day.path, or null
  static dir_url(id, day?)  // sync: the dated folder, else the old flat <id>/
  static async scan()       // node: fills days/slugs with every session's home, from SessionFolders (a filler; locate never trusts it)
  static async create({id, name?, parent?, day?, first?})  // node: MAKES the session's folder, the one creator (SessionFolders#create)
  static async locate(id, first_at?, slug?)  // node: the folder to WRITE into, asked of SessionFolders on every call; never makes a second one

// SessionFolders.mjs (node only): the store's ONE finder. at(root).of(id), .home(id, day, name), .create(id, opts), .all(id), .twins(), .url(id) (the session page url: the dated folder, the bare-uuid redirect only when no folder exists yet); static owner(dir), static url_in(repo, id) (what a node writer puts in a note or card)

// Day.js: class Day, static of(t) "YYYY-MM-DD", path(t) "YYYY/MM/DD" - the owner's LOCAL day, never UTC
```

- **Lines it replays:** `{"messages":{…}}` and `{"sentences":{…}}` (the chat list, [Chat/readme.md](Chat/readme.md); sentences first, so one line can add a sentence and the Prompt that holds it), `{"stop":{why}}` and `{"start":{}}` (the session's own state; a start clears the stop's why), `{"session":id}`, `{"tasks":{"add":…}}`, `{"task":"<ref>"}` (a live child task; with `"type":"Session","spawn":{…}` a Session entry, below), `{"<task id>":{…}}` (goes to that task), `{"settings":{…}}` (a `core/Settings` with groups `dictate`/`recite` — VoiceChat's plugin overrides, split by each plugin's `static group` — plus the flat `SETTINGS` fields; a later line replaces only the top-level key or group it names, [ux/Dictate/doc/settings.md](/framework/ux/Dictate/doc/settings.md)), `{"set":{…}}` (fields on the session, the browser Store's own line; since 2026-10-28), a dotted key (`{"tasks.c3":{…}}` is `{"tasks":{"c3":{…}}}`), `{"decide":{task,is}}` (the owner's Approve, Reject or Make it a project on a waiting task, [doc/prompt-tasks.md](doc/prompt-tasks.md)), and any other key is set on the session. `by`, `ts` and `at` are dropped.
- **Subclasses:** `AISession` (`ai/AISession/AISession.js`) adds cost, cache and transcript, and overrides `root_url()`. `RefineSession` is planned, not built.
- **Who calls it:** the item tool in `Servex/agents/page_tools.js` maps `session.jsonl` to `Session` and replays it; `ai/AIDashboard/SessionStore.js`, `AISessionIndex.mjs`, `AISessionLive.js`, `Server/State.mjs`, `Server/TaskDirs.mjs` and `Server/SessionDayMove.mjs` use it or `Day`.
- **How it loads:** a session's folder holds `session.jsonl`, written by `.claude/hooks/append.mjs`, `Agents.open_task` and the page tools, never by hand. Older folders are still found by `scan()` through `index.json`, `cache.jsonl` or the first `page.jsonl` line. Folder layout: [ai/sessions/readme.md](/framework/ai/sessions/readme.md).
- **Live on the page, one line at a time.** `SessionTasks` builds the Session once and applies each streamed line to it, for a record that opens with its `{"session":…}` line (a tab, a voice call); other records are replayed whole, as before. Proof that both give the same Session on all 238 such real records: `replay-compare.mjs --incremental` ([build A](/framework/core/Session/tasks/data-shapes/build/backbone/)). `new Session({id, data})` takes Item's arguments too (a `{type:"Session"}` member), not only an id.
- ⬜ A spawned agent's record (it opens with a task line, not `{"session":…}`) is still replayed whole on every streamed batch; applying only its new lines too is the next step (`SessionTasks.js` `read()`; build A's review, finding 11).
- **Times are the lines' own.** While a line replays, `Task.clock` holds its `at`/`ts`, so a nested task's `completed_at` and duration are when it happened, not when the log was read.
- **Test:** `node Session.test.mjs` (tasks, progress, replay, `Day`); `node session-task.test.mjs` (a Session is a Task, `tasks.add` with a string or an object, totals from the children). Demo page: `page.js`.

## Session.settings

`session.settings` is a [`core/Settings`](/framework/core/Settings/readme.md) instance, not a plain object: two groups, `dictate` and `recite` (named after the classes they belong to — [`VoiceChat`](/framework/ux/Dictate/VoiceChat/readme.md)'s plugin overrides, split by each plugin's own `static group`), plus the flat fields of `static SETTINGS` (`name`, `model`, `effort`, `notify`) at the top level.

- **Read with `.get(key)`**, never a bare property: `session.settings.get("model")`, `session.settings.dictate.own` (the group's own overrides, plain `{Name: {enabled?, config?}}`).
- **A `{"settings":{…}}` line replaces only the top-level key it names** — a whole group (`dictate` or `recite`), or one flat field — and leaves everything else as it was; a later line for the same key wins. Replay merges this shallow onto a raw object first (so the keys the line never mentions survive) and then loads the WHOLE accumulated object into `settings` (`core/Settings.load()` itself replaces everything it is given).
- **Session never persists this itself.** Replay only calls `settings.load(...)`; saving is Servex's job (`Servex/agents/Sessions.js` `settings()` appends the line; [ux/Dictate/doc/settings.md](/framework/ux/Dictate/doc/settings.md) is the Chat-settings side of the same mechanism, including who reads and writes each group).

## How work gets into a session

**An AI adds a task.** `item({path: "<session url>", call: "tasks.add", args: "Fix the tab bar"})` (a string, or an object with fields).
- The item tool (`Servex/agents/page_tools.js`) appends one line, `{"tasks":{"add":{"type":"Task","title":…,"id":…}}}`, to the session's `session.jsonl`, and answers `{ok, ids, line, now}` in milliseconds. It never returns the whole picture; a read (no delta) does that.
- `Session.replay` reads it. The session page's Overview (`SessionOutlineView` in `ai/AISession/`) streams the same file, so the task shows at once.
- Test: `node Servex/agents/session_tasks.test.mjs`.

**An AI spawns a child session.** `spawn_agent` (Servex) makes one **Session entry** on the parent's record (next section):
- `open_task` (`Servex/agents/Agents.js`) writes the child's line 1 into its task folder: `{"assign":{session_id, agent, role, model, effort, role_readme, brief, …}}`.
- `SessionRecord.link_parent` appends the entry to the parent's record (the spawner's task folder, else the nearest record above the child's folder).
- A child whose folder is **outside** the parent session's folder gets its entry from `ChildLinks.link` (`Server/ChildLinks.mjs`, called by `open_task`) on the parent session's record, found by `parent_session` (`ChildLinks.session_dir`: a record's session id, its first 8 hex, or its folder name, so a voice record `v-<id>/` is found as `parent_session: "v-<id>"`; a folder made a moment ago is looked for by name in today's and yesterday's day folders before a full rescan). `SessionRecord.add_ref` never writes the same reference twice. So the parent's numbers come from its own entries, and a finished child moves its completion.
- `node Server/ChildLinks.mjs` is the older backfill (a plain reference per registry child); `--entries` is the Session-entry backfill (next section).
- Tests: `node Servex/agents/child-links.test.mjs`, `node Servex/agents/session-entries.test.mjs`.
- The registry row records `parent_session`, the parent's session id at spawn.
- `Agents.agents_under` finds the child for the parent's cost and children. It matches `parent_session` exactly, and older rows by the parent's name within the parent's span.
- The child shows on the parent's page as the task it carries, with its model, cost and a link to its own session page.

## Asks: the owner's turns (every channel)

Every owner prompt, on every channel, leaves the same line on that session's record, written by code:
`{"refined":{"at","re":<the turn's at>,"sentences":[{n,text}],"sections":[],"via","by":"code","v":2}}`, `at` local time with ms and offset on every channel.
- **Writer: `Server/Ask.mjs`** (`Ask.write(text, via, re, put, opts)`: skip, redact, shape and the write, for every channel; `put` is that channel's own door, sync or async). It skips empty text, slash commands and harness turns, withholds anything that looks like a secret, and splits the words with ext/Refine `quick_clean` (no AI). Callers: the VS Code hook (`.claude/hooks/prompt-relay.mjs`, also adds the counted `Prompt` item that is the turn), `Sessions.say` (SDK agents, V1, the phone sheet), `RemoteMCP.record` (Claude-app voice). The browser voice model writes the same line with sections.
- **Reader: `Session.refine_turn`** (called from `apply_line`). A turn is one open `Prompt` task, id `Session.turn_id(re)` (`Session.turn_id` is the only copy; `Ask` calls it); each `sections` item becomes a child task `<turn>-<item id>` with `cites` ("a1 a2") and `section`. A turn with no sections is one open item. It counts until an agent closes it with an outcome, or `{"<id>":{"no_action":"why"}}`.
- **Sections for a VS Code turn** come from Echo (`Servex/agents/Echo.js`), which writes a second `refined` line with the same `re`. Echo runs only when `SERVEX_ECHO=on`.
- A later `refined` line with the same `re` adds its items; ids already filed are kept. Only a line stamped `v: 2` by the writer makes a turn; older `refined` lines make no task (they still fill a turn that exists).
- Search: `git grep '"sentences":'`. Tests: `node Server/Ask.test.mjs`, `node public/framework/core/Session/Session.test.mjs`, `node Servex/ext/remote/RemoteMCP.test.mjs`.

## Session entries

A session's `tasks` is the one list of everything to be done: prompts, tasks and child sessions. A child session is an entry in that list, and `children` is a view of those entries, never a second list (session-is-a-task items 31-33).

- **The shape:** one line on the parent's record, nested under the task that caused the spawn:
  `{"<cause id>": {"task": "<child folder url>", "type": "Session", "spawn": {role, model, effort, role_readme, brief, session_id, agent, at, placed}}, "by": "Servex", "ts": …}`.
  Its id is the folder name, because an agent id is reused across spawns and two entries with one id replace each other on replay. `role_readme` is a path, never the text.
- **The cause** (`cause_of` in `Servex/agents/Agents.js`; `placed` records which rule chose it): (a) `task.cause` given to `spawn_agent`, when that task is on the record; (b) a handoff: the spawn names an existing task on the parent's record (`spawn_agent` with `task: {from: <record url>, id: <task id>}`), and that task moves into the child's folder with its history (`move_item` in `page_tools.js`). The moved task is upgraded in place: the line left behind keeps its id and becomes the entry, `{"task", "as": <its id>, "type": "Session", "spawn"}`; (c) the record's most recently started task that is still running, among the tasks written inline on the record (a task with its own folder is a reference whose state lives in that folder, so this rule does not look into it; a spawner whose tasks each have a folder gets its entries at the top); (d) none of these: the top level.
- **The writer:** `SessionRecord.add_ref` and `entry_line` (`Server/SessionRecord.mjs`), called by `link_parent` and `ChildLinks.link` from `open_task`.
- **The reader:** `Task.from_ref(ref, as, entry)` (`core/Task/Task.js`) builds a `Session` when the entry says `type: "Session"`, or when the child's record is a session's (a `{session}` line 1, or a spawn's `{assign}` line anywhere), and keeps `spawn` on it. `Task.children` lists them at any depth.
- **The three costs** (`session_state` in `Servex/agents/page_tools.js`, computed on read):
  - `own`: the tab's `cache.jsonl`; for a spawned agent's record, the agents whose task is its folder.
  - `children`: the sum of each child entry's total. A child's total is its own agents' logged cost (`Session.agents_at_resolver`) plus its own children's totals.
  - `total`: own + children.
  - An agent with no entry still counts through `agents_under`, but only once: its id is skipped when an entry already counted it. That is an agent spawned before this and not backfilled, or a reviewer or clarity agent node started with no folder.
  - `children` rows say `linked: true` (an entry) or `linked: false` (the registry fallback), and `counts.children` is `{entries, unlinked}`.
- **The backfill:** `node Server/ChildLinks.mjs --entries [--names <session id>] [--root <repo>] [--list] [--apply]`.
  - Dry run by default. `--apply` appends the lines and writes its manifest to `public/framework/ai/sessions/session-entries.jsonl`.
  - It plans every folder below the session's day folders, and every registry child outside them. The actions:
    - `upgrade`: a plain reference to a session folder gets a later line with the same id that adds `type` and `spawn`.
    - `add`: the folder has no reference yet.
    - `ref` or `entry`: nothing to do.
  - Entries go at the top level: with 100+ open tasks, a guessed cause would often be wrong.
  - It also prints item 33's check: the folders that are neither a session nor a project. It only lists them: `--apply` writes the `upgrade` and `add` lines and never moves or changes those folders.
- **Numbers on session-e00f55c9** (2026-10-25 00:50; dry run on the live tree, then `--apply` on a copy):
  - The plan: 97 upgrades, 0 adds, 25 plain task folders.
  - Child sessions from entries, at every depth: 128 before, 135 after.
  - Agents with no entry: 97 before, 95 after; nearly all are reviewers and clarity agents that node started with no folder.
  - Cost: own $293.26, children $862.31, total $1155.57, the same before and after (nothing counted twice).

**References.**
- A session is named by its **session id**: its page is `/framework/ai/sessions/YYYY/MM/DD/<folder>/`, and a child names its parent by `parent_session`.
- A task is named by its **path**: `{"task": "<folder url>"}`.
- `Session.locate(id)` turns an id into its folder, by asking `SessionFolders` (`SessionFolders.mjs`, node only): the store's one finder, checked on disk every call ([one-folder.md](/framework/ai/sessions/doc/one-folder.md)).

**A session stays on the day it began.** `DatedFiles.session_dir` asks `SessionFolders`, which finds the session's folder on any day, slug-named too, before it names a new one (until 2026-11-01 it knew only `<uuid>` and `session-<id8>` names, so a slug-only session got a second folder). `TaskDirs --new` uses it, so it never opens a second day's record. The session page also reads a session's folders on later days.

**One source of truth: the file.**
- The `.jsonl` record is the only truth.
- The dev server, Servex and the browser each replay it, and keep no edits of their own.
- Every write is an append: through the item tool, or `append.mjs` for a hook.
- A number (cost, counts, completion) is computed from the records when it is read, and never written down.

## What item() answers for a session

`item({path: <session url>})` replays the folder's `session.jsonl` as a `Session` (any record whose line 1 is `{"session":{…}}`, so VS Code tabs too), and `session_state` in `Servex/agents/page_tools.js` adds what node can compute. Nothing here is stored; every field is read from records on each call. An older folder with no `session.jsonl` gets the one-line record `{"session":{id,kind,at}}` from its `index.json` the first time a query (`summary`, `cost`, `children`…) asks for it, from `/sessions/<id>/` or the dated url; a query is never written into `page.jsonl`. Test: `node Servex/agents/session-query-record.test.mjs`.

| Field | What it is | Read from (written by) |
|---|---|---|
| `cost.own` | the session's own Claude spend: `usd`, `parts` (in, out, cache read, cache write), `active_ms`, `models`, `through` (last transcript line's time), `read_to` (bytes read), `at` | the newest `{"summary"}` in the folder's `cache.jsonl` (`AISessionIndex` reads the transcript's new bytes, `ai/AISession/AISession.js`). `null` until that cache exists |
| `children` | child sessions as a tree: first the Session entries (`{id, title, state, path, agent, role, session_id, spawn, cost, total, children, linked: true}`), then the registry's agents with no entry (`linked: false`); `total` = its own plus everything under it | the entries in the replayed record ("Session entries" above); for the fallback, the Servex registry: every agent whose task folder is inside this folder, plus every agent the session spawned since it began (by `parent_session`, else its name and span) and their descendants (`Agents.agents_under`, wired as `Session.agents_resolver`), nested by `parent`. An agent's cost counts only its turns since the session began |
| `cost.children`, `cost.total` | the children's spend; own plus children | the agents' own logs (`turn_cost` lines, `Agents.logged_cost`) |
| `cost.tasks`, `biggest` | spend per task folder (each folder once), and the five costliest tasks | `Task.cost` (the agents of the task's `path`) |
| `counts.direct`, `counts.all` | `{created, started, complete, stopped}` for the session's own tasks, and for every task below it | the replayed tasks |
| `progress`, `completion` | done of total, stopped tasks left out | `Task.progress_of` |
| `first_at`, `last_at`, `span_ms` | when the record began and last changed | the lines' own times |
| `messages.count`, `messages.last` | how many chat messages (`core/Session/Chat`); the last 20, each `{id, type, by, at, text, title?, icon?, content?}` (`content` is the lines under a card, a Ref's own label included) | `message_view` in `page_tools.js`, over the replayed `session.messages` list |

**A message older than the last 20** is read by id: `item({path, delta: {messages: {"<id>": {}}}})` answers `{messages: {"<id>": {...}}}`, the same shape as one row of `messages.last` — a bare `{}` is the query; any other field (`title`, `content: {add: …}`) runs as the write it is instead (`walk_queries`'s `messages` branch, `page_tools.js`). The whole list is already in memory, so this costs nothing past the last-20 slice above.

**Recompute only what changed.** A child record's parsed lines are kept by file and reused while the file keeps the same size and modified time (`lines_of` in `page_tools.js`, used by the node resolver). So a read re-reads and re-parses only the child files that changed. Every replay still builds fresh task objects from those lines, because a kept object would have the parent's lines addressed to it (`{"<child id>":{…}}`) applied again on each re-replay; the parent's totals (progress, completion, counts) are added up on every read from the children it holds. Time to answer `{"summary":{}}` on session-e00f55c9 (101 child records) right after one child file changed, measured back to back in the same conditions: about 140-285 ms without the cache, 76-99 ms with it. Keeping whole child objects measured 12-20 ms when the machine was quiet, but was dropped for the double-apply bug; it could return if a parent line that addresses a child evicted that child's entry. The cache holds at most 4000 files. Test: `node Servex/agents/ref-cache.test.mjs` (it builds a scratch tree in the OS temp folder: `SERVEX_PUBLIC` points the item tool's `public/` at it).

**Completion at once, for any session.** `item({path: "/framework/ai/sessions/YYYY/MM/DD/<folder>/", get: "completion"})`, answers `{ok: true, read: "completion", value: {...}}`: the tally of its tasks' current states (`Task.tally`: done, total, stopped, finished without proof) and the one number, `Task.completion_score()`. It only reads and writes nothing. It works for a past session too, as long as its folder holds a record; a folder with no record is refused. The same number is printed by `node Server/session-query.mjs --report <agent id | session id | folder name>` (also `--recent N`, `--root <repo>`), with prompts, tasks created/finished/stopped/open, finishes without proof, unlinked children and cost. On session-e00f55c9 (2026-11-04): 64.8%.

**The one formula** (`Task.completion_score`, [Task readme](../Task/readme.md)): a task scores 1 if the owner checked it; otherwise the mean of its parts' scores, recursing to any depth; a task with no parts scores 1 if complete, else 0. Parts are its subtasks that are not stopped, each child session (nested in this session's folder, one part each) and each counted owner prompt. Why this one, when e00f55c9 showed three numbers: 299 of 527 top-level parts complete is 56.7% because a half-finished part counts 0; 299 of 599 is 49.9% because it also counts stopped parts; finished/created (571/1196, 47.7%) counts every nested task flat. The mean credits partial progress and leaves dropped work out, and a parent can only reach 1 when everything under it does.

**Owner prompts count** (new ones only; `prompt-relay.mjs` writes `counted: true`): an unresolved counted prompt is a part that scores 0. It is resolved when an agent files a task under it (the part then scores that task's own score) or marks it `no_action` with a reason. Old prompts carry no flag and are not counted. **Finished without proof** (`Task.proof_problem`: a `complete` with no outcome or evidence) still counts as complete; the report and the stats bar say how many.

Test: `node Servex/agents/session-state.test.mjs`.

## Rules (the owner, 2026-10-20, 16:15)

1. **A session has tasks**, plain tasks or projects (a project is a task with subtasks). A session gets a folder; a task is lines in the session's log. *Built:* `session.tasks`, and since 2026-10-24 a session is itself a Task.
2. **Its completion is computed from its tasks**, never typed in: `completion` is `Task.completion_score()`, the recursive mean under "The one formula" above (nested subtasks, child sessions and counted owner prompts count; stopped parts do not), shown in the session page's stats bar (`ai/AISession/SessionStats.js`) and by `node Server/session-query.mjs --report`. Tests: `node public/framework/core/Task/completion.test.mjs`, `node Server/session-query.test.mjs`. With nothing to score it reads `null`, shown as "needs review" (`Task.show`), never 0 or 1. Closing a session under 100% files one task waiting on the owner that lists what stayed open (`Task#closeout_line`, applied by `Servex/OpenItems.js` after any closing line; [completion doc](../Task/doc/completion.md)).
3. **A session is never marked complete while a loose end exists.** If something is left over, add a task for it instead of closing. *Not built yet:* no code refuses a close. Queued as step 5, "Task as a line", in [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md).
4. **The session system should be portable** (the owner, 2026-10-20, session-e00f55c9 prompt line 1931): "a reusable, portable system, closer to a dev server than a Servex thing". *Not built yet:* `Session` and `Day` need only `Item` and a dated folder, but the writers (the SessionStart hook, `prompt-relay.mjs`, the item tool) live in this repo's `.claude/hooks` and `Servex/`, so another project cannot use it on its own.
5. **Nothing is misattributed, lost or counted twice** (the owner, 2026-10-24). *Checked by* `Server/SessionIdentity.mjs`; the open items are in [doc/identity.md](doc/identity.md#open--each-small).

## Open items

- Auditing the completion of every past session is later.

## Map

| File | What it does |
|---|---|
| `Session.js` | the class: `Session extends Task` (`Session.js:22`), its `MENU` (`:55`), `replay_new()` (`:86`), `locate()` (`:238`); `completion_score()` is inherited from `Task` |
| `SessionFolders.mjs` | node only: the one finder of which dated folder holds a session (`at`, `of`, `home`, `record_of`, `create`, `homes`); its saved map is `ai/sessions/session-folders.json` |
| `Day.js` | the one rule for "which day is it": the owner's local calendar day, no imports, shared by browser, server and hooks |
| `SessionTasks.js` | a session's tasks drawn live on its page, with Approve / Reject / Make it a project on proposed ones |
| `InFlight.js`, `InFlightView.js`, `InFlight.css` | the in-flight dashboard: `InFlight.pick(session)` chooses (DOM-free), the view draws it, the css styles it ([doc/in-flight.md](./doc/in-flight.md)) |
| `SessionMenu.js`, `SessionMenu.css` | the button at the right end of a session's name line and its menu rows ([doc/menu.md](./doc/menu.md)) |
| `SessionSettings.js` | the Settings sub-page, a form drawn from `SETTINGS`; each change appends one `{"settings":…}` line to `session.jsonl` |
| `page.js` | the Session class page (`Doc`) |
| `*.test.mjs` | `Session.test.mjs`, `SessionFolders.test.mjs`, `InFlight.test.mjs`, `InFlight.real.test.mjs`, `session-task.test.mjs` |
| `Chat/` | a session's chat as one list of real Items ([Chat/readme.md](./Chat/readme.md)) |
| `doc/` | the design docs (below), plus `method/` and `file/` (one note per method and file, drawn by the class page) and `in-flight-real-400.png` (the screenshot in in-flight.md) |
| `fixtures/` | `agent.jsonl`, `complete.jsonl`, `process.jsonl`: sample session logs the tests replay |
| `tasks/` | this module's own task folders (`data-shapes/`, `do-not-move-the-ai-session-class-now-wri/`) |
| `files.jsonl`, `improvements.jsonl` | the file census (written by its tool) and skill-improvement notes (appended by agents) |

**How it connects**
- `SessionFolders.at(store).of(id)` / `.record_of(id)` / `.create(id, {first})` (`./SessionFolders.mjs:30`, `:165`, `:118`, `:198`) ← called by `Servex/agents/Agents.js:345` and `:1137`, `Server/ChildLinks.mjs:14`, `Server/Truth.mjs:56`, and `Session.locate` (`Session.js:208`–`:211`). It calls nothing but the disk
- `session.completion_score()` (`../Task/Task.js:326`; a `Session` inherits it from `Task`, `Session.js:22`) → read by `Server/Truth.mjs:60`, which replays every record and counts the complete sessions; the truth page `/live/truth/` draws that ([readme](/live/truth/readme.md))
- `Session.replay(lines)` (`../Item/Item.js:752`) → `Server/session-query.mjs --report` makes the same replay, so the CLI and the truth page agree
- `Session.MENU` (`Session.js:55`) → `session.menu(url)` (`:68`) → `SessionMenu.entries()` → one row per entry; `SessionSettings` is the first entry's page
- `ChildLinks.link(child_dir, parent_session, agent)` (`../../../../Server/ChildLinks.mjs:84`) ← `Servex/agents/Agents.js:1148`: a child session becomes a `{"task":url,"as":agent}` line in its parent's record
- Cloud voice records: `RemoteMCP.voice_session()` (`../../../../Servex/ext/remote/RemoteMCP.js:209`) ← `:184`, `:261`; it calls `session_folders().create(…)` (`:233`). The scripts and the records are mapped in [ai/sessions/readme.md](../../ai/sessions/readme.md#map)

**Design:** [`doc/architecture.md`](./doc/architecture.md) (decisions, first) · [`doc/identity.md`](./doc/identity.md) (ids, folders, the check) · [`doc/classes.md`](./doc/classes.md) (the classes on one screen) · [`doc/session-is-a-task.md`](./doc/session-is-a-task.md) · [`doc/one-replay-plan.md`](./doc/one-replay-plan.md) (plan, not built) · [`doc/prompt-breakdown.md`](./doc/prompt-breakdown.md) · [`doc/prompt-tasks.md`](./doc/prompt-tasks.md) · [`doc/in-flight.md`](./doc/in-flight.md) · [`doc/menu.md`](./doc/menu.md)

## Search terms

The words that find this module's past work (counts: `sessions N files · M commits`, from `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` and `git log --oneline -S '<term>' | wc -l`; raw output in [terms.txt](/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/readme-maps-sessions/terms.txt)). The folder, record and voice terms are in [ai/sessions/readme.md](../../ai/sessions/readme.md#search-terms).

- `Session.replay` (sessions 74 files · 129 commits) — rebuild a session from its log lines
- `SessionFolders` (sessions 59 files · 45 commits) — the one finder of a session's folder
- `Session.locate` (sessions 47 files · 54 commits) — the older lookup, now a thin caller of `SessionFolders`
- `session entries` (sessions 33 files · 11 commits) — a child session as a typed line in its parent's log
- `completion_score` (sessions 21 files · 29 commits) — the recursive mean the truth page counts
- `record_of` (sessions 15 files · 15 commits) — the folder that holds a session's record, nested for a spawned agent
- `Truth.mjs` (sessions 14 files · 9 commits) — the daily truth numbers
- `adopt_nested` (sessions 10 files · 9 commits) — claims a record folder nested inside its parent's

## More

- [doc/identity.md](doc/identity.md): which session owns each line, dollar and task; every way an id changes (compaction, resume, fork, renewal); the check `node Server/SessionIdentity.mjs <id>`
- [doc/one-replay-plan.md](doc/one-replay-plan.md): plan (not built): every line of `session.jsonl` applied through `set()`, why Chat V2 is broken, the pseudo-property table and the migration
- [Pseudo-property lines, how each is replayed and read today](/framework/ai/system-map.md) (section 3e) and the proposed replacements ([system-proposal.md](/framework/ai/system-proposal.md), change 24); the owner decided on 2026-10-26 to move away from them
- [doc/in-flight.md](doc/in-flight.md): the simplest dashboard (in flight, waiting on you, next, done) at the top of a session page and of `/framework/ai/` (`InFlight.js`, `InFlightView.js`)
- [doc/prompt-tasks.md](doc/prompt-tasks.md): each owner prompt's work arrives as proposed tasks on the session page, live, with Approve and Reject (`SessionTasks.js`, Servex's `PromptTasks`)
- [doc/prompt-breakdown.md](doc/prompt-breakdown.md): a prompt files as one outcome task with its asks as subtasks (`PromptRecords.file()`), the measure, and the gap in what the tab sees
- [doc/menu.md](doc/menu.md): the session menu, a template (`Session.MENU`, settings first) drawn at the right end of the session's name line; settings saved as lines in `session.jsonl`
- [doc/architecture.md](doc/architecture.md): decisions and why
- [Dated folders shared by sessions and projects](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md)
- [Design decisions 2026-10-27](/framework/ai/design-decisions-2026-10-27.md) — the chat as one stored list on the session, and how a `session.jsonl` is created today (node only) and what would change.

## Does the task system work? Findings of 2026-11-05

Proved with two throwaway Haiku children, the item tool on real folders, and scripts over the store (`public/framework/ai/sessions/2026/11/04/session-5132a480/task-system-check/report.md`).

- **Where a no-`path` item call lands.** `own_page()` in `Servex/agents/page_tools.js`: a spawned agent that has a task folder writes its `session.jsonl` (so its tasks count in its completion and the parent's tree); an agent with no task folder gets `/framework/ai/sessions/YYYY/MM/DD/<folder>/`, which makes a stray `session-<id8>/` holding only `page.jsonl` (a page, not a record: `tasks: 0`, `kind` wrongly `vscode-tab`); a VS Code tab (no agent id) is refused with the reason, never the site's root `public/page.jsonl` (fixed 2026-11-05; tests in `page_tools.test.mjs`). A tab passes its session url as `path`.
- **Completion reads.** A session with no tasks reads `completion: null`, "needs review", whether or not it finished. A session with tasks reads the mean of its tasks' own completions, not done/total: `mastermind-voice-system` is 27 of 44 done, 5 stopped, and reads 0.614, not 27/39. Both are by design, but the page should say which it shows.
- **Unlinked children are not shrinking.** `e00f55c9`: `counts.children` = `{entries: 288, unlinked: 345}` (the handover's 170 of 186 was an older, smaller count). An unlinked child is a registry row with no entry on its parent's record; run `node Server/ChildLinks.mjs --entries --names e00f55c9` to see the plan.
- **Asks filed as tasks.** Over the last 7 days, of 170 tab session folders with prompts (8,367 user turns in their `cache.jsonl`, which overcounts), 3 filed any task (9 tasks). Of the 62 tabs that have owner `Prompt` lines in `session.jsonl` (67 prompts), 1 filed any. The law "file each ask" is almost never followed by tabs.

## Open question: logging a computed value (the owner, 2026-11-06)

`completion` is computed on demand, never stored: `{"completion":{}}` (a query) calls `completion_score()` and writes nothing. To keep a history of what it was, without a second source of truth, write a **reading** that replay skips:

```js
// the call: computes, logs nothing
{ "completion": {} }
// a reading: a past value, never replayed into state
{ "measured": { "completion": 0.22 } }
```

Rejected: `{"completion": 0.22}` (reads like a call with an argument) and a magic prefix such as `=completion` (one more rule to remember). Not built yet.

**Closed gap (2026-11-06):** a session with no tasks used to read `1` when complete and `0` otherwise. It now reads **no score / needs review** (`null`): no tasks means the work was never recorded, not that it was done. The session page and dashboard show it through `Task.show`; the page's Score stat reads the item tool's `summary`, so it shows "needs review" once Servex restarts with this change.
