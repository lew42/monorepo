# F1: where the one live instance per root should run

A study, not a build (data-shapes [plan](../../plan.md), step 1c). Written 2026-10-28 on `worktree/backbone`.

**The question.** Every change to a record (a click in a tab, an agent's `item()` call, a hook's append) should go through one live object per file: it checks the line, appends it, and every reader replays it. Where should that object live: in **Servex** (one process for every project), or in **each project's dev server**?

**The answer: each project's dev server.** Servex keeps what is about agents; the dev server keeps what is about the project's files. The deciding fact is below: a live instance must run the same classes as the files it guards, and only the project's own server has them.

## What each server owns today

| | Servex (port 80, one for the machine) | The dev server (one per project and worktree, e.g. 3104, 52917) |
|---|---|---|
| **Runs which code** | the main tree's `public/framework/` classes, for every project (`Servex/agents/page_tools.js` imports `../../public/…`) | its own checkout's classes: a worktree's server runs the worktree's `Item`, `Task`, `Session` |
| **Live roots** | yes: the item tool keeps one replayed root per file (`live_root`, `page_tools.js:738`), advances it one line per write, and replays the whole file again when anything else changed it (size or mtime) | none: it only streams bytes |
| **Writes** | `task.jsonl`, `session.jsonl`, `improvements.jsonl`: the browser `Store` POSTs them to `/api/item` (`Store.js` `post_to_tool`, `Servex.js:676`); agents' `item()` calls | every other `.jsonl` (`page.jsonl`…) through the dev socket's `append` (`Server/plugins/SocketServer/Append.js`); the browser's fallback when Servex does not answer |
| **Reads, live** | none | the one `fs.watch` on `public/`, and `Tail.js`, which streams each appended line to every subscribed tab |
| **Refuses** | a worktree page's write: answered `stubbed` and written nowhere (`Servex.js:637`, `:680`), so the browser falls back to the dev socket | nothing outside `public/` and `.jsonl` |
| **Other jobs** | agents, sessions, the registry, the MCP door, cards, the proxy, starting servers | live reload, the dev bar, listings, `files.jsonl` |

So today there are **two writers per project** (Servex for task and session files, the dev server for the rest), plus the hooks, which append raw (`prompt-relay.mjs`, `ledger.mjs`). And the **one live root that exists runs the wrong code for a worktree**: this branch's new `Item` cannot be exercised through Servex's item tool until it is merged, because Servex imports the main tree's.

## Why the dev server wins

1. **Same code as the files.** A live root must replay with the classes that wrote the lines. The dev server of a checkout has exactly those; Servex has one version for all of them. (ESM cannot unload a module, so Servex cannot load a second `Item.js` for a worktree in the same process without a loader per project.)
2. **It already holds the read half.** The watch and the tail are there; the live root sits beside them, so the line it accepts is the line it streams. Servex would have to tail files it does not watch.
3. **One project's failure stays in that project.** A bad line or a slow replay on one site does not stall every agent on the machine (the owner's doubt about one Servex for many projects).
4. **It removes the worktree stub.** A worktree page would write to its own server's live root, checked by its own classes, instead of being stubbed and falling back to a raw append.

**When Servex would win:** if projects shared one data store across checkouts (they don't: each has its own `public/`), or if dev servers were short-lived and often down while agents write. They do restart (live reload of `Server/` changes, crashes): see the caveat below.

**Rejected, a hybrid:** Servex keeps the roots but forwards each replay to the project's server. That is the move below with an extra hop and two caches to keep in step.

## What moving it would take (in order; each step works alone)

1. **A `/api/item` on the dev server** (a new `Server/plugins/Item.js`): `item({path, delta})` against a live root per file, built from the project's own classes. Lift `live_root`, `advance`, `try_line`, `validate`, `expand_dots` and `write_line` out of `page_tools.js` into a module both can import (for now Servex keeps its copy). About a day; the item tool's tests (`item_tool.test.mjs`, `session_tasks.test.mjs`) run against it unchanged.
2. **The browser `Store` posts to its own origin** (`/api/item` on the page's host), not to Servex. One line in `Store.post_to_tool`; the worktree stub disappears.
3. **Servex's item tool forwards** an agent's call to the project that owns the path (it knows each project's port, `list_servers`), and keeps answering `session_state` queries (cost, children) itself, because those need the agent registry, which only Servex has. Fallback: if the project's server does not answer, Servex writes as it does today, so an agent is never blocked.
4. **Hooks post too** (`prompt-relay`, `ledger`), with the raw append as the fallback. After this, every write goes through one live root, and no outside append invalidates it (today each hook write makes the next item call replay the whole file: about 200 ms on the voice session after this branch, 2 s before).
5. **One writer per file, proven:** a test that two tabs, an agent and a hook writing one file in the same second end with every line once and one replayed state.

## Caveats

- **The dev server restarts.** Its live roots are rebuilt on the first call after a restart: one replay per file, now fast (all 5,083 real records replay in 0.44 s together). The tail already recovers (`jsonl_reset`, resubscribe).
- **Production is static.** No server, so no writes off localhost, as today (`Store.writable`).
- **The phone.** It reaches the dev server through Servex's proxy, so step 2 needs nothing new for it.
- **Servex's queries** read records, never write them; they can keep replaying files (cheap now) or ask the project's server for its live root.

## Sources

- [plan.md](../../plan.md), F1 row; [streaming seat §7](../../seats/streaming/notes.md) (one writer); [delta-flow.md](../../seats/delta-flow/delta-flow.md) §2 (the item tool's path).
- `Servex/agents/page_tools.js` (`live_root`, `write_line`), `Servex/Servex.js` (`/api/item`, the stubs), `Server/plugins/SocketServer/Tail.js`, `Append.js`, `core/Item/Store.js` (`post_to_tool`, `via_tool`).
