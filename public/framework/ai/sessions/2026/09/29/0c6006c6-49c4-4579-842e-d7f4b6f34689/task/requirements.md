# Layout decision system — the brief (as dispatched to minion-layout-system)

The owner's words: `../organization/owner-words.md`, "Continued (about 11:15 PM)".

1. **The decision process, as a short ordered list of questions,** each with its possible answers: how much space is there (sidebars known top-down; mobile always one column)? How much content is there, and is it outlined yet (outline BEFORE choosing a layout)? How do we fill the horizontal space? Which approved layout fits? Worded as judgement with examples, not do/don't rules. The system moves from uncertain to certain as the owner approves layouts.
2. **Demos of the column principles,** as live pages under /layouts/: three columns with roughly equal-height content; the same with one short column (the mismatch); the fix, the title column vertically centred; a small-content example (a preview card) against a lot of content (tabs or a left nav). Each demo leads with one sentence and one picture, at 1920 and 3440.
3. **Put the question list into the `layout` skill.** Replace nothing that works.
4. **Run the question list through `Server/ask-each.mjs`** once on a real page (/framework/servex/), one question at a time, and save the answers beside the demos as a worked example.

Built: `/layouts/decide/` (questions.js is the one copy; equal/, short/, centred/, amount/, servex/), one section added to `.claude/skills/layout/SKILL.md`, one link line + `decide` child on `/layouts/`.

