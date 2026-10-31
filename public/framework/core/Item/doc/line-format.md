# The line format: data, `name()` and `#id` (D13)

A saved line tells three things apart by how a key is spelled. The owner decided this on 2026-10-30 (research `design/decisions.json` D13). Test: `node public/framework/core/Item/line-format.test.mjs`.

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

**Why the switch is off.** The writers are cheap to flip; the readers are not. These read only the bare spelling today, so a marked line would be misread (a task shown as not started, a dashboard missing a completion, a hook not fired). Update them first, then flip the switch:

- `Servex/agents/page_tools.js`: the item tool checks verb names and ids bare, and fires `body.complete` / `body.approve` hooks (`tell_parent_caveats`, `hooks.approved`). **Updated now:** `unmark_delta` strips the marks at the door (`run_item_now`), so a tab's `{"start()": {}}` is accepted and written bare. So even with the switch on, a record file (task, session) still gets the bare spelling from the tool; raw appends (`page.jsonl`, the fallback `FsFile.send`) get the marked one.
- `core/Session/Session.js` `apply_line`, `core/Task/Process.js`, `core/Task/Prompt.js`: read through `Task.replay_line` / `Item.unmark` for the top level. Updated.
- Not updated, bare only: `ext/Chat/v3/ChatV3.js` (`line.start`, `line.stop`, `line.tasks`), `ext/Chat/v2/ChatV2Model.js`, `ai/AISession/SessionTimelineRows.js`, `Server/PromptRecords.mjs`, `Server/CloseoutWalk.mjs`, `Server/UndoneAsks.mjs`, `Server/AIIndex.mjs`, `Server/DatedFiles.mjs`, `Servex/Dropped.js`, `Servex/TaskLoop.js`, `Server/TaskMigrate.mjs`, `Server/PromptsToSession.mjs`. About a dozen files: "stop at the reader side" (the brief's rule), so they are listed, not edited.
- Scripts that append lines (`Server/*.mjs`, `Servex/agents/*`: `StaleClose`, `TaskMigrate`, `PromptsToSession`, `SessionConsolidate`, `TaskMove`, the item tool's own `write_line`) write the bare spelling and keep doing so; the readers take it.

## Alternatives not taken

- **Drop the `set` wrapper too** (`{"tasks": {"#c3": {"title": "x"}}}`, the table's first row). D13 rule 1 says a plain key is data, but the readers above all look for `line.set`, and a bare key that names a method is still a call (old lines), so a data field named like a method (`add`, `sort`) could not be stored anyway. Kept `set`.
- **Read a bare key as data now.** `Item.bare_calls = false` does exactly this (tested), and finally lets a field be named `add`. It is `true` until the old logs are migrated (D16): about 1,810 `{"at": …}` lines and every bare verb line in history would stop working.
- **Spell the mark `$name`** (MongoDB style): dropped by D13; `$name` is the owner's view convention.
- **One flat op per line** (path string, `do`, `arg`): flatter to grep, but throws away the nested design and every reader.
- **Dotted paths with `#`** (`tasks.#c3`): not needed. A dotted key is split into nested levels first, so each level reads its own `#id`; `get()` and `Ref` paths stay unmarked (`Store.address`).
