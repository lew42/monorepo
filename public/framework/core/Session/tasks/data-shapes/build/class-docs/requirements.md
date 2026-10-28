# Build C: class docs that show, not tell (plan step 6, first slice), in a worktree, NOT merged

**The owner's words** (asks 25, 43 and 44 in [../../requirements.md](../../requirements.md)):
- "Every time we create a view for something, it's just vomit."
- Doc pages become "a wall of useless or just not so useful text… I really just need to see things and then be able to click through."

The owner wants each class page to show:
- the live instance (the default view);
- its life cycle: who creates it, where, what changes it, over which channel;
- a dynamic route for method sub-pages.

## Start from

- **Build B's branch, `worktree/default-view`**, which has the one default view (`ux/Content/Object/DefaultView.js`) and the live demo at `core/Item/watch/`. Branch from its **second-last** commit. The last one, `f6d535acc`, only saved regenerated `files.jsonl` files: `git worktree add C:/Code/lew42/worktrees/class-docs -b worktree/class-docs f6d535acc~1`.
- **What exists for docs:** `ext/Doc/` (`Doc.js`, `ClassCard.js`, readme), `core/Page/` class pages, and the rules in `doc/rules.md` (readmes, docs, "show the class and its live instances").
- **Load the `page` skill** before drawing anything.

## Scope: one class page, done right, then a second to prove it repeats

1. **`Item`** (`core/Item/`). Its class page shows, at the top, before any text:
   - a short class line: what extends what, and what it holds;
   - the live default view of a real instance;
   - **the core test drawn on screen** (ask 44): the steps (create, set, add a child, save, replay), each with its one-line code and the object's view after the step. A build-A-style test can run the same steps headless.
   - **the life cycle in one picture:** who creates an Item (code, a UI click, a replay from JSONL), the delta's path to the file, and back to other tabs. Use seat (g)'s [delta-flow.md](../../seats/delta-flow/delta-flow.md) as the source of truth: show it, don't paste it.
2. **Method sub-pages from a dynamic route:**
   - `core/Item/methods/<name>/` is routed by `route(name)` on the class page, never one `page.js` per method;
   - each one shows the method's signature, a one-line job and a tiny live example;
   - notes, when a method has them, come from `core/Item/methods/<name>.md`. Write notes only for 2–3 methods that need them (`set`, `get`, `toJSON`), never empty files.
3. **Repeat for `List`** (`core/List/`), reusing the same page class. If the second page needs no new code, the pattern works.

**What good looks like:** the owner opens the Item page on a phone and, without reading a paragraph, can say what an Item is, what it holds, and how a change gets saved. Screenshots at 1920 and at phone width (headless only), judged against the page skill.

## Fences

- No changes to `core/Item/Item.js`, `Store.js` or `core/List/List.js` (build A owns them). If you need a hook, log the request.
- Don't merge. Don't restart Servex or the main dev server.
- **Your worktree's dev server:** start one with Servex's `start_server` (or `list_servers`) and log its url.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>` for a fresh review, answer every finding, and land with the branch, url, screenshots and review phrase.
- **Budget:** about $40. Spawn no one except the reviewer. **Finish by about 21:15;** the usage window resets at about 21:40.
