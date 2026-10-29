# Build I: the item tool, generic over every class (plan step 1e), from build D's branch, NOT merged

**The owner (ask 42):** the item tool is "one tool that could then call any method or set any property on anything", and with each class's readme that is the whole API. "The AI could essentially call any method or set any property on any item."

**What the plan review found** ([../plan-review/review.md](../plan-review/review.md), finding 4): the grammar is already generic (a method name calls it, a child name walks into it, anything else assigns), but the tool isn't.
- Only Task, Session and Process files get a live root (`Servex/agents/page_tools.js:738-750`).
- A page write replays the whole page plus the new line, every time (`:988`).
- `target` walks only `_tasks` (`:945`).
- About ten special cases rewrite or intercept a delta before it becomes a line: `tasks.add` slugs and folders (`:1125-1160`), move (`:1089-1098`), `pages`/`folder` on disk (`:1109`), reinforce (`:1085`), verdict strings (`:1076`).

Build D (`worktree/one-writer`) has since put every record write through one entry point, `core/Item/RecordWriter.js`.

## Setup

`git worktree add C:/Code/lew42/worktrees/item-tool -b worktree/item-tool worktree/one-writer`, then lock it. Start its dev server through Servex and log the url.

## Scope

1. **One live root per file, for any registered class.** A page, a task, a session, an improvements file: whatever `Item.types` registers. A page write applies one line to its live root instead of replaying the whole page.
2. **The tool's address is the dotted path** (the owner's decision: [../../ids-and-paths.md](../../ids-and-paths.md), DECIDED). `target` walks any list, through each level's own `get`, not only `_tasks`.
3. **Move the special cases into class verbs:** `Task` or `Session` verbs for adding a task with its folder, moving a task, and the verdict strings; `Page` verbs for subpages on disk. Do as many as fit by about 21:00, cleanly, each its own commit. Then list the rest, with where each one goes. The tool keeps calling a verb when one is named; it stops rewriting deltas itself.
4. **Ids:** the tool stops making ids from titles. A new agent-made id is 8 random characters ([../../ids-and-paths.md](../../ids-and-paths.md) §5). Existing ids are untouched.
5. **Tests:** the item tool test suite passes (`Servex/agents/*.test.mjs`, import this worktree's own `page_tools.js`, as the plan review says). Add:
   - a page set and a page add through a live root;
   - a task added by verb;
   - a dotted-path set three levels deep;
   - an agent-made id that is random.

## Fences

- **Don't merge.** Don't restart Servex or the main dev server.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>`, answer every finding, and land with the branch, url, tests, the list of special cases still left, and the review phrase.
- **Budget:** about $40. Spawn no one but the reviewer. **Finish by about 21:15:** the usage window resets at about 21:40, and nothing should still be running heavily then.
