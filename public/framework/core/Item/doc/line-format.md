# The line format: data, `name()` and `#id` (D13)

A saved line tells three things apart by how a key is spelled. The owner decided this on 2026-10-30 (research `design/decisions.json` D13). Tests: `line-format.test.mjs` (Item reads and writes both), `line-readers.test.mjs` (every other reader).

| Key | Means | Example |
|---|---|---|
| `name` | data, or a step into a child Item | `{"title": "Hi"}` |
| `name()` | call the method `name` with the value as its one argument (several arguments: one object) | `{"start()": {}}` |
| `#id` | the list item with that id | `{"tasks": {"#c3": {"set": {"title": "x"}}}}` |

A `name()` with no such method, or a `#id` with no such item, is **refused with a warning and never stored as data**. Both nest, and a line may mix them: `{"tasks": {"#c3": {"start()": {}, "title": "x"}}}`.

## What reads which shape

`Item.set_one` reads **all** of it, always: the new keys, and every old shape (a bare method name, a bare id hop, a dotted path). Old bare hops still count in `Item.old_hops`. `Task.replay_line` and `Session.replay_line` read their line's top-level keys by bare name, so they first call `Item.unmark(line)` (`start()` becomes `start`, `#c3` becomes `c3`); everything below the top level goes through `set()`, which understands the marks itself.

## What writes which shape

One switch, **`Item.Store.marked_lines`** (`Store.js`), is `false` today:

| Writer | `marked_lines = false` (today) | `marked_lines = true` |
|---|---|---|
| `Item.act("start")` (`Item.js`) | `{"start": {}}` | `{"start()": {}}` |
| a change inside a list item (`Store.hops`) | `{"tasks": {"c3": {"set": {…}}}}` | `{"tasks": {"#c3": {"set": {…}}}}` |
| `Item.as_call` ([call.md](./call.md)) | `{"sort_by()": "title"}` | the same: it is new, so it was never bare |
| a plain field change (`set_one`) | `{"set": {"title": "x"}}` | the same (the `set` wrapper stays: see below) |
| a list verb (`List.announce`) | `{"add": {…}}`, `remove`, `move`, `order`, `clear` | the same (not changed) |

## Switching it on

**Why it is still off.** Nothing blocks it any more: every reader below now reads both spellings, and the test runs the main flows with the switch on. It stays off by default so that today's logs keep one spelling until the owner decides.

**To switch on:** set `Item.Store.marked_lines = true` (`Store.js`, one line). Check first: `node public/framework/core/Item/line-readers.test.mjs` (all PASS, including its "with Store.marked_lines ON" test), `node Servex/agents/item_tool.test.mjs`, and `node public/framework/core/Test/TestRunner.mjs public/framework/core`. Then open a session page and a task page in the browser, press Start on a task, and check the new line in its `.jsonl` reads `{"tasks": {"#c3": {"start()": {}}}}` and the board still shows it running.

**The helper.** [`LineKey.js`](../LineKey.js) takes the marks off a line: `LineKey.bare(key)`, `LineKey.unmark(line)` (top level, what `Item.unmark` calls), `LineKey.deep(line)` (every level; returns the same object when nothing is marked). It imports nothing, so a server script and a browser view share it. A reader that looks up verbs or ids by bare name calls `LineKey.deep` once, where it parses a line.

| Reader | How it reads both | Test |
|---|---|---|
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
