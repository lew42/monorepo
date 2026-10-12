# Merge 7: retire ai2.css into the blocks that own each rule

Load the `minion` skill first, then the `css` skill. Your parent is task-mastermind-inbox-ext; message it the commit id when done.

**The owner's words** ([../owner-words.md](../owner-words.md)): the inbox CSS moves out of ai2.css into ux blocks; "we probably shouldn't even have an ai2.css… maybe we need it for specific overrides, but kept really minimal". AI 2 must not regress (law: never destroy a viable version).

**Where you work:** worktree `C:/Code/lew42/worktrees/inbox-ext` (branch worktree/inbox-ext), with its server at http://127.0.0.1:51490. Don't stop that server. If it's down, reboot it hidden, the way worktree-up.mjs does. Commit after each step. Never use git stash, and never edit these files in the main tree.

**The plan is already written:** [../card-body/ai2-css-census.md](../card-body/ai2-css-census.md), section by section with line ranges. Follow it:
1. Create a new block, `ux/Card/`, shaped like `ux/Inbox/`: `Card.css`, `readme.md`, `page.js` demo, `files.jsonl`, plus a line in `ux/page.js` children and the `ux/readme.md` index. Move every "Generic" range into `Card.css` **verbatim**: cut and paste, with the comments, and never rewrite a rule. Keep each rule inside its `@layer`.
2. The Processes section (about lines 1805–1993) moves verbatim to `ai2/processes.css`, loaded by `ai2/processes.js` with `View.stylesheet(import.meta, "processes.css")`.
3. What stays in `ai2.css` is only the AI 2 v1 screens (the old Log rows, Overview, the old Needs-you screen, the old Log screen): about 450 lines.
4. `card.js` and `page.js` load `/framework/ux/Card/Card.css` (keep `ai2.css` loaded only where its v1 screens are drawn).

**Proof (this is the job):**
- BEFORE any edit, shoot /framework/ai/, /framework/ai2/, a card (/framework/ai/2026/09/19/a-153628/), /framework/ai2/live/, /framework/ai2/needs/ and /framework/ai2/log/ with `node Server/layout-check.mjs <urls> --widths 400,1200,1920,3440`. Also record a computed-style fingerprint of the moved rules' elements.
- AFTER, the same shots and fingerprint. They must match, except for differences you name and explain.
- A grep shows every class you moved is still defined exactly once.

Done means: committed, before/after shots in this folder, and one `{"log":…}` line per decision in your task.jsonl.
