# Minion B — /framework/code/: requirements

Load the `minion` skill first, then `page`, `code`, `new-page`. Parent task: `public/framework/ai/sessions/2026/09/30/design-code/design-code/` — read its `owner-words.md` and `requirements.md` (the owner's words are the acceptance test). The shape you build to is the top section, "The shape", of `/framework/ai/sessions/2026/09/30/servex-mastermind/ui-skills-proposal.md`, plus its thin-skill template and its "Where each existing skill goes" table. Read all three before you write.

**Work only in the worktree `C:\Code\lew42\worktrees\design-code`** (branch `worktree/design-code`, server http://localhost:52103/). Never write in the main tree `C:\Code\lew42\monorepo`. Minion A builds `/framework/design/` in the same worktree at the same time: never touch `public/framework/design/`.

## Deliverables

1. **`public/framework/code/`** — a Page (readme.md, page.js, doc/) titled "Code": the code in this framework, HTML CSS JS. Children, each a page with its own readme.md + page.js (+ doc/): **patterns, dos-and-donts, css, objects**. dos-and-donts holds the traps that never throw, formatting and opinions. objects is object-oriented design: every class ships a view of its state (chip / row / panel). Level 1 of every page is visual and structured: concept tiles first (`ux/Content/Concepts`), the one-line gist, then lists; detail one click down in `doc/*.md` (the Docs tab, like other modules). code/css LINKS to `/framework/styles/` (the vocabulary) and never repeats it.
2. **Move every rule, nothing lost, each on exactly one page:**
   - `.claude/skills/code/SKILL.md` → code/ (patterns, dos-and-donts, objects).
   - `.claude/skills/css/SKILL.md` + `caveats.md` + `strategy.md`: layers, where a declaration belongs, everything EXCEPT Colour and contrast and Icons' pressable-things rules (those are minion A's) → code/css.
   - `.claude/skills/new-css-class/SKILL.md` → code/css (a class name is a step of writing CSS).
3. **Questions beside the pages:** css/questions.md's sections other than "Spacing and padding" and "Colour and contrast" (A takes those) → `code/css/questions.md`. Same `## Heading` + numbered-list format.
4. **The review seam — `Server/review.mjs` `questionsCmd`:** make it also read every `questions.md` under `public/framework/design/` and `public/framework/code/` (recursively), recording `skill` as the page path (e.g. `design/layout`). When the same `## Heading` appears both in a skill dir and under design/ or code/, the page's copy wins (so the old skill files keep working until they are retired, and no question is listed twice). Update the comment. Also update `.claude/skills/review/SKILL.md`'s links to the new question paths — but see rule on skills below. Test: `node Server/review.mjs --questions` in the worktree, then check `public/framework/ai/review/questions.json` lists each system once.
5. **Thin skills** (description = awareness; body = "Read the readme chain at /framework/code/<x>/" + at most five overview lines): rewrite `code`, `css`, `new-css-class` (new-css-class keeps its thirty-second procedure steps if they are a procedure, not knowledge — say which you chose). **Do NOT commit anything under `.claude/skills/`** — leave those edits uncommitted; the parent sends the diff to the skills architect first.
6. **`coverage.md`** in `design-code/code/`: every line/rule of each old skill body → the page file it now lives on.
7. Add `code` to `public/framework/page.js` `children:` next to `design` (minion A adds `design`; edit only that string; if A has not added it yet, add both).

## Rules
- The page speaks to a person and an agent alike: no "you are an agent" voice.
- `create_page` / `new-page` skill for mechanics. New CSS classes: prefix `code-`. Prefer none.
- Check each page loads with zero console errors at http://localhost:52103/framework/code/… (headless; never the owner's tabs). Shots at 400 and 1920 of /framework/code/ into this folder.
- Commit in the worktree after each finished piece (exact paths, never `.claude/skills/`). Every spawned process `windowsHide: true`.
- Budget: about $4. Log progress in your own task.jsonl. When done, end your turn with a 5-line report.

