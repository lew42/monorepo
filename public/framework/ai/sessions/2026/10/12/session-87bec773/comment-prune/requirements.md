# Comment prune: the eight worst files (brief)

**Owner (2026-10-12):** "We definitely have too many comments… paragraphs of comments… the code speaks for itself." Comment only what is unintuitive, ideally a one-line pointer to a doc. Rule: the `code` skill, "Comments: a pointer, not an essay".

**Census** (`node public/framework/code/patterns/comment-census.mjs`, 2026-10-12): 167,455 lines, 34,787 comment lines (21%), 2,976 blocks of 4+ lines. Worst:
`ai/v/3/page.js` (1,132, 49%), `ext/drawer/rail.js` (579), `ux/Dictate/Dictate.js` (512), `ux/Dictate/Widget.js` (421), `ext/Chat/Mic.js` (380), `ai/cards/card.js` (373), `ai/rail/inbox.js` (346), `ext/Chat/Chat.js` (300).

## Done when
- [ ] For each file: keep one-line comments that flag a trap or a non-obvious why; move history, lessons and design reasons to the module's `doc/*.md` (create `doc/notes.md` if none, linked from the readme) and leave a one-line pointer. Nothing is lost: it moves.
- [ ] **Code unchanged:** the diff touches comments only (check with a script that strips comments from before and after and compares). Beware `**/` inside block comments and backticks (CLAUDE.md traps).
- [ ] Each file's page still loads (smoke clean); `hold.mjs` around the batch; one commit per file.
- [ ] Census before → after in `STATE.md`; merge; land.

Sonnet 5.5; Haiku minions are fine for single files under 60k. Worktree; one-sentence replies; land with `finish-task`.
