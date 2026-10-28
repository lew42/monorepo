# Plan review: is this the right shape, and the right order?

**Your job:** a fresh, critical read of the data-shapes design and plan, before two builders get far. You didn't write any of it. The owner wants to know: "are we doing this the right way?" Name what's wrong, what's missing, and the forks that matter. Don't just restate it.

Read, in order:
1. [../../plan.md](../../plan.md): the plan and its forks F1–F5;
2. [../../synthesis.md](../../synthesis.md);
3. [../../ids-and-paths.md](../../ids-and-paths.md);
4. [../../pages-children-content.md](../../pages-children-content.md);
5. [../../placement.md](../../placement.md);
6. [../../flow-and-ids.md](../../flow-and-ids.md);
7. the owner's asks 21–45 in [../../requirements.md](../../requirements.md).

Then check the claims that matter against the code: `core/Item/Item.js`, `core/Item/Store.js`, `core/List/List.js`, `core/Page/Page.class.js`, `core/Task/Task.js`, `core/Session/Session.js`, `Servex/agents/page_tools.js` (the item tool) and `Server/plugins/SocketServer/Tail.js`.

## Answer these

1. **The backbone:** is "one live instance per root on the server, every change through it" right? Where should it run (fork F1: Servex or each project's dev server)? What breaks in each? Is the item tool really one tool that can set any property or call any method on any item, as the owner intends (ask 42)?
2. **Dotted paths with each level's `get`:** any trap? Think about ids that look like property names, a List subclass with its own lookup, a path through a reference, and replaying old lines.
3. **References and moves:** is "absolute refs, backlinks computed in memory, forwards across files" sound, given the owner's new lean (ask 35) that a task's subtasks move into the child session?
4. **The View in storage** (asks 32, 39): `content` is a slot of View instances, and the AI adds `{type: "View", tag, content}`. Does `core/View` serialize and deserialize today? What must change?
5. **The order:** is backbone, then default view, then the session shape right? What would you do first, and what's missing?
6. **The three things most likely to go wrong** in builds A and B (briefs: [../backbone/requirements.md](../backbone/requirements.md), [../default-view/requirements.md](../default-view/requirements.md)).

## Write

- **`review.md` in this folder:** one screen of findings, ranked, each with file:line evidence and a one-line recommendation. Then the forks, each with your lean and why.
- Plain sentences, for a new coder.
- **Fences:** write only in this folder, no code edits, spawn no one. Commit by path. End your turn with a 5–10 line summary. Budget: about $20.
