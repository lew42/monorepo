# core/Page: the class map

Budget: $4. Load the `minion` skill first.

**Deliverable:** ONE new file, `C:/Code/lew42/wt-page-owner-docs/public/framework/core/Page/doc/classes.md`, written in that worktree (branch `page-owner-docs`). Edit no other file there; the mastermind is editing `readme.md` and `doc/owner.md` in the same worktree. Log progress to this folder's `task.jsonl` through `node .claude/hooks/append.mjs` (run from `C:/Code/lew42/monorepo`). Do not commit or merge; the mastermind does.

**Why:** a fresh agent that owns `core/Page` cannot tell `Reader`, `Jsonl`, `Listing`, `Children`, `Frame`, `PageContent` and `PageInbox` apart without reading code. The readme names 3 of the 23 `.js` files.

**The files** (in `public/framework/core/Page/`): Children.js Columns.js Frame.js Jsonl.js Links.js Listing.js Log.js Markdown.js Page.class.js PageAddress.js PageCode.js PageContent.js PageContentItem.js PageInbox.js PageParagraph.js PageWeight.js Prefs.js Previews.js Reader.js Related.js object.js page.js words.js. Also look one level into `parts/` and `Template/` for their main class only.

**Method:** one file per step. Read its class declaration line, its exports, and who imports it (`rg -l "<File>.js" public/framework`, count only). Write one row, then the next file. Do not read whole bodies.

**Shape of `doc/classes.md`** (under ~60 lines; plain sentences; CLAUDE.md "Presentation"):

1. `# The core/Page classes`, then one sentence: `Page` is the class; the other files are its parts, attached as static members or used by it.
2. A structure block, as code, showing what extends what and what `Page` holds, e.g. `class Page extends Item` · `Page.Reader = PageLogReader extends Item.Store` — only what the code really says.
3. One table: `| file | class (extends) | its one job | used by (count, main caller) |`, ordered by importance (Page.class.js first, then the loading path: Jsonl, Reader, Listing, Children, then content, then the rest). A file that holds no class (a helper, a palette page) says so plainly; that is a finding (CLAUDE.md "Write classes, not function bags"), not a problem to fix.
4. `## Where a page comes from` — three lines linking `loading.md`, `jsonl.md`, `streaming.md` (relative links `loading.md`, they sit beside it).
5. Every file:line you cite must be one you opened.

Never kill or restart the dev server, never drive the owner's tabs, never stash (diff, don't stash).
