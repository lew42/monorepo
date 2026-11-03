# The line format: data, `name()` and `#id` (D13)

A saved line tells three things apart by how a key is spelled. The owner decided this on 2026-10-30 (research `design/decisions.json` D13). Tests: `line-format.test.mjs` (Item reads and writes both), `line-readers.test.mjs` (every other reader).

**Marked keys are real properties, not pseudo properties.** The key's spelling picks the namespace: bare is a data field, `name()` is a method call, `#id` is a list member. So a method and a data field of the same name never clash.

**Backward compatibility.** Old files keep their bare lines forever, and every reader reads both spellings, so nothing on disk changes. Only the tools outside core needed a fix, and they now share one helper, `LineKey` (`Item/LineKey.js`).

| Key | Means | Example |
|---|---|---|
| `name` | data, or a step into a child Item | `{"title": "Hi"}` |
| `name()` | call the method `name` with the value as its one argument (several arguments: one object) | `{"start()": {}}` |
| `#id` | the list item with that id | `{"tasks": {"#c3": {"set": {"title": "x"}}}}` |

A `name()` with no such method, or a `#id` with no such item, is **refused with a warning and never stored as data**. Both nest, and a line may mix them: `{"tasks": {"#c3": {"start()": {}, "title": "x"}}}`.

## What reads which shape

`Item.set_one` reads **all** of it, always: the new keys, and every old shape (a bare method name, a bare id hop, a dotted path). Old bare hops still count in `Item.old_hops`. `Task.replay_line` and `Session.replay_line` read their line's top-level keys by bare name, so they first call `Item.unmark(line)` (`start()` becomes `start`, `#c3` becomes `c3`); everything below the top level goes through `set()`, which understands the marks itself.

## What writes which shape

One switch, **`Item.Store.marked_lines`** (`Store.js`), is `true` since 2026-11-02:

| Writer | `marked_lines = false` | `marked_lines = true` (today) |
|---|---|---|
| `Item.act("start")` (`Item.js`) | `{"start": {}}` | `{"start()": {}}` |
| a change inside a list item (`Store.hops`) | `{"tasks": {"c3": {"set": {…}}}}` | `{"tasks": {"#c3": {"set": {…}}}}` |
| `Item.as_call` ([call.md](./call.md)) | `{"sort_by()": "title"}` | the same: it is new, so it was never bare |
| a plain field change (`set_one`) | `{"set": {"title": "x"}}` | the same (the `set` wrapper stays: see below) |
| `Item.unset("k")`, or `set({k: undefined})` | `{"unset": ["k"]}` | `{"unset()": ["k"]}` |
| a list verb (`List.announce`) | `{"add": {…}}`, `remove`, `move`, `order`, `clear` | the same (not changed) |

## Clearing a field: `unset`

`item.unset("color")` (several keys, or an array, are fine) deletes the keys from `data` and saves one line, `{"unset":["color"]}`; a replay calls `unset` again. `set({color: undefined})` does the same, because JSON has no `undefined`: before 2026-11-02 it saved `{"set":{}}` and the old value came back on reload (spec T5). A key that is not in `data` is skipped, and if none was there no line is written. Readers: `Item.set_one` (it is a method), `Task.replay_line` (a top-level `unset`, so a session or task record), the item tool (a method, so its key check passes). It deletes from `data` directly, not through the `get_one`/`put` seams, so a class that keeps a key elsewhere (a Panel mirror's shared keys, a `Ref`'s change count for `path`/`url`) is not told; such a class overrides `unset`. `Template` (core/Page/Template) already has its own `unset(name)`, which wins: a Template's cleared value is not saved this way (Templates are not stored in a log today). A `set_<key>` hook is **not** run by `unset`; a hook that stores `undefined` itself is saved as an unset. Alternative not taken: run the hook with `undefined` (its own save would add a second, empty line). Test: `unset.test.mjs`.

## A line that names something that is not there

A `name()` with no such method, or a `#id` with no such member, is refused (above). A **bare** key cannot be refused: a plain key is data, and old logs are full of them. So since 2026-11-02 a read line (a replay, or a live line from another tab) is **reported, never refused** (spec T6) when it puts an object under a key nothing knows, outside a method call:

- **on a List,** an id that is no member: a stale edit after a move or a remove (`{"todo":{"c1":{"set":{…}}}}` after `c1` moved to `done`);
- **on a list member,** a key that is no method, field, child, data key or `data_keys` entry: a newer writer's verb read by an older checkout (`{"todo":{"c2":{"archive":{…}}}}`).

It is still stored as data, exactly as before, so every record replays the same (`ReplayCompare`: 4046 of 4046 identical). It is counted in `Item.unknown_keys` (`"<Class>.<key>"` -> lines) and, in node only, warned once per key (in a browser it would be noise on every page that reads an old log, and the merge smoke counts warnings). Not reported: a string or number value, anything stored while a line's method call runs (`Item.calling`; that includes an explicit `{"set":{…}}`), a key already in data, a static `fields` name, a class's `static data_keys` (Task lists its line fields). On every record on 2026-11-02 it found 4 real ones: a `stop` sent to a task no longer in its list, a `log` object under a task, and `start`/`complete` sent to a plain Item that has no such methods. Alternative not taken: refuse these keys (T6's "ideal"); it would change what old records replay to. Test: `unknown-key.test.mjs`.

## Switching it on

**Switched on (2026-11-02).** Every reader reads both spellings (`line-readers.test.mjs`), `ReplayCompare` was 4071/4071 identical with it on, and the 10 core test files that asserted the bare spelling now expect the marked one. Old files keep their bare lines and still replay; nothing on disk changed.

**To switch it off again:** set `Item.Store.marked_lines = false` (`Store.js`, one line); before it was on, the check was: set `Item.Store.marked_lines = true` (`Store.js`, one line). Check first: `node public/framework/core/Item/line-readers.test.mjs` (all PASS, including its "with Store.marked_lines ON" test), `node Servex/agents/item_tool.test.mjs`, and `node public/framework/core/Test/TestRunner.mjs public/framework/core`. Then open a session page and a task page in the browser, press Start on a task, and check the new line in its `.jsonl` reads `{"tasks": {"#c3": {"start()": {}}}}` and the board still shows it running.

**The helper.** [`LineKey.js`](../LineKey.js) takes the marks off a line: `LineKey.bare(key)`, `LineKey.unmark(line)` (top level, what `Item.unmark` calls), `LineKey.deep(line)` (every level; returns the same object when nothing is marked). It imports nothing, so a server script and a browser view share it. A reader that looks up verbs or ids by bare name calls `LineKey.deep` once, where it parses a line.

| Reader | How it reads both | Test |
|---|---|---|
| `Servex/CloseLoop.js` | `lines()` passes each line through `LineKey.deep` | `line-readers.test.mjs` |
| `Servex/agents/page_tools.js` (the item tool) | `unmark_delta` strips the marks at the door, so it writes bare even with the switch on | `item_tool.test.mjs`, `line-readers.test.mjs` |
| `core/Session/Session.js`, `core/Task/Task.js` (`replay_line`), `Process.js`, `Prompt.js` | `Item.unmark` for the top level; `set()` for the rest | `line-format.test.mjs` |
| `ext/Chat/v3/ChatV3.js` | `LineKey.deep` on each line before `wanted` / `replay_line` | `ChatV3.test.mjs` (browser, check "a marked line") |
| `ext/Chat/v2/ChatV2Model.js` | `LineKey.deep` in `apply` | `line-readers.test.mjs` |
| `ai/AISession/SessionTimelineRows.js` | `LineKey.deep` in `row` and `titles` | `line-readers.test.mjs` |
| `Server/AIIndex.mjs` | `LineKey.deep` in `parse` (so `SessionIndex`, `ProposalTriage`, `StaleClose`, the walk follow) and in `fold` | `line-readers.test.mjs` |
| `Server/PromptAudit.mjs` `read` | `LineKey.deep`; so `PromptRecords` (`tasks`, `task_state`, `parent_for`) | `line-readers.test.mjs` |
| `Server/UndoneAsks.mjs` `task_state` | `LineKey.deep` per line | `line-readers.test.mjs` |
| `Server/DatedFiles.mjs` `lines` | `LineKey.deep` | `line-readers.test.mjs` |
| `Server/TaskMigrate.mjs` `parse` | `LineKey.deep` (old task logs are bare; kept so a new one cannot be misread) | `line-readers.test.mjs` |
| `Servex/TaskLoop.js` `read_task` | `LineKey.deep` (`approved_by` looked for `l.approve`) | `line-readers.test.mjs` |
| `Server/CloseoutWalk.mjs`, `Servex/Dropped.js` | already correct: they decide through `Task.replay`, which reads marks. Tested, unchanged | `line-readers.test.mjs` |
| `Server/PromptsToSession.mjs` | reads only `tasks.add` (a list verb, never marked). Unchanged | |
| `Server/Steps.mjs` | reads only `assign` and `log` lines. Unchanged | |

**Writers that stay bare** (`Server/*.mjs`, `Servex/agents/*`: `StaleClose`, `TaskMigrate`, `PromptsToSession`, `SessionConsolidate`, `TaskMove`, the item tool's own `write_line`): they write the bare spelling and keep doing so; every reader takes it.

**Not checked.** `AskFold` and the asks readers (`ai/asks/`, `ai/rail/Needs.js`, `inbox.js`) read ask records (`asks.jsonl`, `inbox.jsonl`), plain data lines that `act()` and list hops never write; `ChatV2Model` still ignores a browser write shaped `{"tasks": {"c3": …}}` in both spellings (it only reads the older `{"c3": …}` shape).

## Alternatives not taken

- **Drop the `set` wrapper too** (`{"tasks": {"#c3": {"title": "x"}}}`, the table's first row). D13 rule 1 says a plain key is data, but the readers above all look for `line.set`, and a bare key that names a method is still a call (old lines), so a data field named like a method (`add`, `sort`) could not be stored anyway. Kept `set`.
- **Read a bare key as data now.** `Item.bare_calls = false` does exactly this (tested), and finally lets a field be named `add`. It is `true` until the old logs are migrated (D16): about 1,810 `{"at": …}` lines and every bare verb line in history would stop working.
- **Spell the mark `$name`** (MongoDB style): dropped by D13; `$name` is the owner's view convention.
- **One flat op per line** (path string, `do`, `arg`): flatter to grep, but throws away the nested design and every reader.
- **Dotted paths with `#`** (`tasks.#c3`): not needed. A dotted key is split into nested levels first, so each level reads its own `#id`; `get()` and `Ref` paths stay unmarked (`Store.address`).
