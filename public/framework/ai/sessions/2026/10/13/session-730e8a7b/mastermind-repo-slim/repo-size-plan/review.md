verdict: fix
1. [fix] The phase-3 `git filter-repo` regex in public/framework/ai/doc/repo-size.md:71 (`^public/framework/ai/(?!.*/doc/).*\.(png|jpe?g|webp)$`) would delete the images in `public/framework/ai/doc/` itself, because the lookahead needs a `/` before `doc/`. Tested with Python `re`: `public/framework/ai/doc/x.png` matches, so it would be removed. That contradicts the `.gitignore` exception, which keeps `doc/` images. Use `(?!(?:.*/)?doc/)` instead.
2. [note] .gitignore:170 ignores every png/jpg/webp under `public/framework/ai/`, including a picture a task report shows on its card (the finish-task skill asks for "a picture when there is one"). After this change those pictures exist only on the machine that made them. The doc says the AI log is dev-only, so this may be fine, but it should say plainly that report pictures are affected too, not only Playwright shots.
3. [note] Brief ask 2 wants a `decision` line for each category. task.jsonl has them for shots, usage, files, records and owner-prompts, but not for transcripts, notes or health logs. The doc's table covers those three as "already ignored", which is reasonable, but the decision lines are missing.
4. [note] The phase-3 commands in repo-size.md:66-77 only clone and push `michael/dev` and `main`. The doc's own "what breaks" list names 183 `salvage/` branches and 89 tags, but no command carries them over or archives them. The `--mirror` legacy clone keeps them, so nothing is lost. Add one line saying the slim repo drops them on purpose.
5. [note] Server/repo-size.mjs:41 cuts each object id to 40 characters, which assumes SHA-1. That is fine for this repo; a SHA-256 repo would break silently. The script is otherwise read-only, a class as the brief asked, and checks pack size against the summed blobs (474 + 134 ≈ 608 MB), as ask 1 requires.

## Requirements
- 1 "Measure, by script" — yes — Server/repo-size.mjs: (a) history by path via rev-list + cat-file, (b) working tree, (c) the 30 largest files with their type, (d) categories; the cross-check line is at :149
- 2 "Decide what should not be committed" — yes, partly — the commit-rule.md row is added; the .gitignore lines are for screenshots only, each with a reason; decision lines are missing for 3 categories (finding 3)
- 3 "The phased plan" — yes, with a fix — three phases with GB saved, risk and undo; the R2/E:/Pages trade-off table; the GitHub limits; the filter-repo regex is wrong (finding 1)
- 4 "Compaction" — yes — repo-size.md, a proposal section: when, what it keeps, what it loses, the one rule
- 5 "The framework's future shape" — yes — both options are under "Open", with what each needs and no decision
- 6 "Report on your card" — not checked (the card is outside the diff)
- Fence — yes — the diff touches only the fenced files; nothing is moved, deleted or rewritten
## Words
- content — yes — repo-size.md opens with a one-line headline and a table of numbers, with detail one section down; plain sentences
- links — yes — the readme links to the doc (readme.md:12); the doc links commit-rule.md, task.jsonl and the GitHub docs

No page changed, so there are no shots; only Requirements and Words are answered.
