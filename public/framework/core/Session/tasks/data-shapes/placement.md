# Who puts things where: code-made placement, a light schema, sessions vs tasks

The owner's points (2026-10-28), after [pages-children-content.md](pages-children-content.md):

- References may come from the UI or from an AI.
- Getting the nesting right matters, and leaving it to the AI risks things in the wrong place, and stale references everywhere once things move. Flows driven by code are better.
- Maybe a schema per class: what may go where. But not so strict that it becomes a whitelist of every instance.
- A reference may point at an arbitrary endpoint (a cloud store), not only a file.
- Sessions form their own tree (`session.sessions`). Tasks don't hold sessions; a task can become a session.

A proposal to react to. Nothing is built.

## 1. The AI picks the verb; code picks the place

**Rule:** structure is made only by **class verbs**, never by raw list adds.

| The intent | The verb (on the class that owns the structure) | What the code does, so nobody has to remember it |
|---|---|---|
| start an agent for a task | `session.spawn({for: <task path>, role, model})` | adds a `SessionRef` to `session.sessions`; the child's line 1 records its parent and task; the task shows a live link |
| turn an ask into work | `session.file({ask, under})` | adds the task under its core task; marks the ask's outcome |
| put a page here | `page.create(…)` · `page.place(ref)` · `page.move_here(ref)` | owned in `pages`, a `Ref` in `content`, or a move with a forward (the drop rule) |

- **The item tool offers these verbs to agents.** An agent says *what* it wants ("spawn for this task"). It never writes `{"sessions":{"add":…}}` by hand.
- **The readme of each class lists its verbs.** That's the "documented in the readmes" part. The verb is also the code, so the two can't disagree.
- **A raw add stays possible** for plain containers (a page's content, a card's rows), where there's no structure to protect.

## 2. A light schema: each list says what it takes

Not a whitelist of instances: **one rule per list, declared on the class**. `List` already has `of` (what a plain object becomes on add, `core/List/List.js`), so this extends it.

```js
class Session extends Item {
  static lists = {
    sentences: { of: Sentence },
    chat:      { of: [Message, Ref] },
    tasks:     { of: Task,       via: "file"  },   // add only through session.file()
    sessions:  { of: SessionRef, via: "spawn" },   // add only through session.spawn()
  }
}
class Page extends Item {
  static lists = {
    pages:   { of: Page },
    content: { of: Item },                          // anything: an open container
  }
}
```

- **The one writer checks every add** against the list's rule, and refuses with a reason the agent can act on: "`sessions` takes a `SessionRef`; use `session.spawn()`".
- **`of: Item`** means anything goes. Most containers stay open, so the schema only guards the few lists where a wrong placement hurts.
- **A subclass can widen or narrow its own lists.** That's the same "each level decides" rule as `get`.

## 3. Stale references: prevent them, then catch the rest

1. **Prevent:** a move is a verb that updates referrers through backlinks within a file, and leaves a forward across files ([ids-and-paths.md](ids-and-paths.md) §6).
2. **Catch:** a node check walks every reference and reports the broken ones: a link checker for items. It's computed, never hand-kept, and its report lists each broken ref with where it points.

## 4. A reference points at an endpoint, not necessarily a file

The `url` in `{url, path}` is **the address of a Store**. The Store decides what's behind it: a `.jsonl` file today, a Durable Object, a database row, a cloud endpoint. The streaming seat's six-method store interface (append, read, subscribe, stat, list, snapshot) is what makes that swap possible. References don't change when the backend does.

## 5. Sessions and tasks: two trees, linked by references

**The owner's shape:**

- **`session.sessions` is the session tree.** Every child session sits under the session that spawned it, and each child has its own `sessions`. You can browse all sessions from the root down, and a child session is never hidden or collapsed inside a task.
- **A task has no `sessions` list.** A task may *reference* a session (drawn as a link card), for "the work happens over there", or "something similar was done there".
- **A project** (a Task subclass) that spans several sessions holds references to them, nothing more.

**A task "becoming" a session: two ways to do it**

| | **Promote** (recommended) | **Morph** |
|---|---|---|
| What happens | `session.spawn({for: task})` makes a child session with the task's title. The task stays in the plan, and its row shows the session live (state, cost) as a link | the task is removed from `tasks` and replaced by the session in `sessions` |
| The plan (core tasks) | still readable: the row is there, now linked | loses a row; the plan is incomplete |
| Completion | the task completes when its session's work is done; the parent's completion stays correct | the parent's task count changes under it |
| Where the session shows | in the session tree, and linked from the task | in the session tree only |

Promote keeps both trees whole and links them. That fits "sessions on a different level than tasks" without losing the task.

**This changes decision [D] in the synthesis:** the task keeps no copy of the child, only a reference (`worked_by: Ref`). The child's `SessionRef` records `for: <task path>`.

## 6. A finding that contradicts this shape today

**Spawned sessions write their record inside task folders.** This project's own seats did: `core/Session/tasks/data-shapes/seats/design-1/session.jsonl`, and the same for each seat, inside a module's task folder. Under the owner's shape, a session's record lives in the session tree, `ai/sessions/<date>/<parent session>/<child>/`, and the task folder holds a reference to it.

That's for later and scripted, like any move. Servex's spawn with a `task: {dir}` is what places it there.

## 7. Questions for the owner

1. Is "agents call verbs; raw adds only into open containers" right?
2. A list rule per class (`static lists`), checked by the writer: enough of a schema?
3. Promote or morph, when a task becomes a session?
4. Should spawns stop writing `session.jsonl` into task folders?
