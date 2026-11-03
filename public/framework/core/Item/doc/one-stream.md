# One stream for the UI, node and the agents: a design (not built)

**Status: design, 2026-10-22, by the system architect. Building waits:** the owner put the full nested-items work behind sessions, tasks and processes. The owner's words are the last section of [owner-2026-10-21-items-hold-items.md](owner-2026-10-21-items-hold-items.md). The aim is that **a JSONL file is the truth, and everyone who cares about an item in it hears when it changes**: a browser tab, a node class, an agent.

## What exists today: three readers, two processes

| Reader | Where it runs | How it hears a change | What it gets |
|---|---|---|---|
| A browser tab | the dev server (`Server/`) | `Server/plugins/SocketServer/Tail.js` keeps a byte offset per file and pushes new lines to every socket subscribed to that file | raw lines; `core/Item/Store.js` replays them into the page's items (`ext/JSONL/live.js`) |
| An agent | Servex | `Servex/Follow.js` (chokidar) watches the paths it follows; a child's log is gathered over 60 seconds into one message | raw lines, batched |
| A node class (the item tool, ProcessRunner) | Servex | it does not hear. `live_root` in `Servex/agents/page_tools.js` re-replays the whole file the next time someone asks, when the file's size or time changed. ProcessRunner is woken by the item tool's hook and a 5-minute tick | a live instance, rebuilt on demand |

So the same append is noticed three ways, and a write the item tool did not make (a git pull, `append.mjs`, the browser) reaches node only by a re-read.

## The design

```
JSONL file  ──append──▶  Tail (one per process: byte offset per file, chokidar)
                              │ new lines
                              ▼
                       Item.Store.for(file)          core/Item/Store.js — the SAME class in browser and node
                         host: the live instance      replay once, then advance line by line (no re-read)
                              │ emits "change" on the item each line touched, and on each parent up to the root
              ┌───────────────┼──────────────────────────┐
              ▼               ▼                          ▼
        browser socket   node class (on("change"))   agent subscription (Follow, batched per turn)
        raw line, as     ProcessRunner, Respawn…     the changed item's CURRENT STATE, as one readable line
        today
```

1. **One tail per process, feeding the Store.** Servex's tail (Follow's chokidar watch, made general) hands every new line to `Item.Store.for(file)`. If the Store has a live instance, the line advances it (the `advance()` the item tool already uses after its own writes), so the instance is never stale and never re-replayed.
2. **Create the instance on first interest, not on every change.** A Store builds its instance the first time something reads or subscribes. A file nobody watches is not replayed. This answers the owner's open question: instantiating first simplifies the code paths, but only for files someone cares about. Thousands of idle session logs stay plain files.
3. **Granular subscriptions are item events.** Items already emit `change` (Task's `adopt_child` listens to it). To subscribe to `k2` inside a parent's file, or to `k2.answers`, find that item in the instance and listen to it. It does not matter whether the item lives in its own file (a reference, `Task.from_ref`) or nested in its parent's file: the Store owns the file, and the item owns its events. Recursion comes free: a change bubbles up to every parent.
4. **Agents subscribe through the item tool and get state, not deltas.** A proposed argument: `item({path, follow: true})`, not a delta key, because `watch` is already a Task method. Node then queues one line per changed item at the agent's next turn boundary, batched the way Follow batches today. The line is the item's state at that moment: `"<title>": running → complete, outcome "…" (3 of 5 children done)`. A coordinating agent never has to reassemble raw deltas from many writers.
5. **Browser and Servex keep their own tail.** They are two processes, and the site is static in production. The shared part is the code (`Store` plus each class's `replay`), not one watcher. Moving the browser's socket into Servex is possible later (Servex already fronts the sites through its proxy), but it is not needed for one stream.

## The owner's other two points

- **Three homes for a task becomes two.** A task is either nested in its parent's file or in its own folder (`<name>/task.jsonl`). The middle step, its own `name.jsonl` beside the parent, buys nothing: once a task leaves its parent, a folder is as cheap and holds its files. Today's item tool already does exactly these two: it nests by default, and `{"folder": id}` or a module home gives a folder. A named list file such as `improvements.jsonl` is a list of items, not one task's home.
- **Changing an item's class** (a task upgraded to a project) can be a replay rule. A `{"<id>": {"type": "Project"}}` line makes the parent replace that child with `new Project({...its data})`, keeping its children and its place. `Task.replay_line` already swaps a nested child for its own-file version (`{"file": …}` uses `tasks.replace`), so the swap has a precedent. For an item in its own file, line 1's `class` already picks the class (`Task.from_ref`). A class change in its own file is a `{"class": "Project"}` line, read the same way.

## Build order, when it is time

1. Servex's tail feeds `Item.Store` (advance on every append), and the item tool stops re-replaying on change. This is the smallest step, and it makes every node reader current.
2. ProcessRunner and Respawn listen to `change` instead of being woken by hooks and ticks. The tick stays as the safety net.
3. `item({path, follow})` for agents, delivering state lines through Follow's batching.
4. The class-change replay rule, with the task-to-project upgrade in the UI.

Related: [map.md](map.md) (every class, store and writer of items) · [Servex/agents/doc/messaging.md](/Servex/agents/doc/messaging.md) (requests are logged items) · [Servex/doc/follow.md](/Servex/doc/follow.md).
