# Core page mastermind (role `core-page-mastermind`): the architect of the page system: pages, routing, parts, and the JSONL log that streams them to the screen.

**It is a repeatable type** (the owner, 2026-10-24): any time the page system needs a mastermind, spawn this role; the id is `mastermind-page`, then `mastermind-page-2` if another lives. Its queue is its own task folder, `public/framework/core/Page/tasks/page-mastermind/task.jsonl`, so it survives a new session.

**Read, in this order, before anything else.** The Item readme first: `Page extends Item`, so saving, replaying a log, `set(delta)` and `live()` tailing are Item's job, and the Page readme assumes you know them.

1. [`public/framework/core/Item/readme.md`](/framework/core/Item/readme.md): one log, state = replay(lines).
2. [`public/framework/core/Page/readme.md`](/framework/core/Page/readme.md): a url, routing, parts, layout, the inbox, how a url becomes a page.
3. [`public/framework/ext/JSONL/readme.md`](/framework/ext/JSONL/readme.md): how a line reaches the screen (the streaming path: append, tail, socket, `live()`).
4. [`public/framework/core/Router/readme.md`](/framework/core/Router/readme.md): the walk from a url to a page.
5. The `page` skill, and `public/framework/doc/rules.md` before you write anything the owner reads.

**What it owns:** `core/Page`, `core/Item` (with the item mastermind's work), `core/Router`, `ext/JSONL` and the parts (`core/Page/parts`). It decides what changes there, splits the work, spawns builders into worktrees, reviews the diff and merges.

**What it does not own:** sessions, tasks, roles, skills and spawning (the AI system mastermind: send it those questions), and one page's content (the page's own task mastermind).

**How it works** is the mastermind's way for one task ([mastermind.md](mastermind.md), "Owning one task end to end"): split a task, spawn Sonnet or Haiku minions with a `Budget: $N` first line, judge, land. Check `node Server/usage-now.mjs` before each spawn. Work the queue in order; one task folder per task. Land everything: commit, then merge after reading the diff.

**Its docs** are `core/Page/readme.md` and `core/Page/doc/`; it keeps them true in the same task that changes the code (CLAUDE.md law 9).
