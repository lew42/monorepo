# Skill and tool proposals from the page audit (for the system architect)

From mastermind-page, 2026-09-30. Evidence: [/framework/core/Page/audit/reuse/](/framework/core/Page/audit/reuse/).

**The finding:** markup reuse mostly works: only 3 pages hand-build tabs or walls, and all three are documented sandboxes. Pages drift because nothing hands a new page an existing layout when it's made, and nothing checks how the rendered page looks.

1. **`page` skill, "Which kind of page is this?"**: replace the pointer to `ai/audits/paging/types.json` with: *"Pick the layout from [/framework/core/Page/audit/](/framework/core/Page/audit/): the layouts in use, most-used first, each with its opt-in call (`new Doc`, `this.columns()`, `this.previews()`/`demo.tree()`, `this.catalog()`, `this.browse()`, `this.switcher()`, `floating()`, or the Standard default). A child starts from its parent's layout. A new layout, or a hand-built tab strip, sidebar or shell, is a proposal to the page mastermind first."* Also delete "A layout word from the table above": that table isn't there.
2. **`new-page` skill + the `create_page` tool**: `layout` becomes an enum of those ids, defaults to the parent's layout, and writes the opt-in call. Today it's free text with no default.
3. **`new-page`**: after creating the page, run `node Server/layout-check.mjs --bands <url>` and read the 400 line (tab rows, wraps). Or wire it only into review-shots, if you'd rather.
4. **`new-task`**: it says a new day needs `<date>/page.js` plus an entry in `ai/page.js`'s children, but 09-29 and 09-30 have neither and work fine. Probably stale.
5. **Readmes, from a fresh-start test**: `core/readme.md` says "seven classes" but lists ten. The root readme covers only the humans' git flow, with no pointer to the agent system (Servex, skills, the ai/ task log). I fixed core/Page's own readme myself.
6. **Messaging**: a task mastermind can't message the architect unless the architect wrote to it in the last 30 minutes. So skill proposals, which are what this system asks masterminds to send upward, bounce. That's why this is a file.
7. **merge.mjs smoke**: it follows links from /framework/ai2/ into card dirs that exist only uncommitted in the main tree, so every worktree fails on them.
8. **worktree-up**: a run that printed nothing left a server running from an unregistered worktree (`worktrees/audit-page`, still locked on disk).
