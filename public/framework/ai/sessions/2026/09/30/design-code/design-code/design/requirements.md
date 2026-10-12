# Minion A — /framework/design/: requirements

Load the `minion` skill first, then `page`, `content`, `layout`, `new-page`. Parent task: `public/framework/ai/2026-09-30/design-code/` — read its `owner-words.md` and `requirements.md` (the owner's words are the acceptance test). The shape you build to is the top section, "The shape", of `/framework/ai/2026-09-30/servex-mastermind/ui-skills-proposal.md`, plus its thin-skill template and its "Where each existing skill goes" table. Read all three before you write.

**Work only in the worktree `C:\Code\lew42\worktrees\design-code`** (branch `worktree/design-code`, server http://localhost:52103/). Never write in the main tree `C:\Code\lew42\monorepo`.

## Deliverables

1. **`public/framework/design/`** — a Page (readme.md, page.js, doc/) titled "Design": everything that goes into making anything new. Children, each a page with its own readme.md + page.js (+ doc/ where detail lives): **layout, color, navigation, content, ui**. Level 1 of every page is visual and structured: concept tiles first (`ux/Content/Concepts`), then the one-line gist, then lists; detail one click down in `doc/*.md` (the Docs tab, like other modules). It LINKS to `/framework/styles/` and `/framework/ui/` and never repeats them. The design readme is the umbrella order of the job (today's page skill): kind of page → where it lives → how it's reached → layout → content → ui; the two tests for every element; the content-kinds table.
2. **Move every rule, nothing lost, each on exactly one page:**
   - `.claude/skills/page/SKILL.md` → design readme/doc; Cards + Structured content → content; navigation items → navigation. **Exception:** the "A page has an inbox" section is a Servex fact that already lives at `/framework/ai/inboxes/`: do NOT put it under design and do not copy it anywhere; the thin `page` skill drops it and points at `/framework/ai/inboxes/` in one line.
   - `.claude/skills/content/SKILL.md` → design/content.
   - `.claude/skills/layout/SKILL.md` + `caveats.md` → design/layout (doc/ pages for the long parts).
   - `.claude/skills/css/SKILL.md`: only its Colour and contrast knowledge → design/color; Icons' rules about pressable things → design/ui. (Everything else in css belongs to minion B's `/framework/code/css/`; do not touch it.)
   - ui page: the parked Controls questions (page/questions.md) + button/toolbar/dropdown/icon rules you find.
3. **Questions beside the pages.** Move `page/questions.md` → split into `design/questions.md` (Page structure) and `design/navigation/questions.md` (Navigation) + `design/ui/questions.md` (Controls); `layout/questions.md` → `design/layout/questions.md`, plus css's "Spacing and padding" section; css's "Colour and contrast" → `design/color/questions.md`; `content/questions.md` → `design/content/questions.md`. Keep the `## Heading` names and numbered-list format exactly (Server/review.mjs parses them). Leave the OLD questions.md files untouched — minion B makes review.mjs read the new ones and the parent retires the old.
4. **Thin skills** (per the template: description = awareness; body = "Read the readme chain at /framework/design/<x>/" + at most five overview lines; nothing else): rewrite `page` (becomes the design umbrella pointer — keep its name `page` for now), `content`, `layout`; create `color`, `navigation`, `ui`. Keep improvements.md files. **Do NOT commit anything under `.claude/skills/`** — leave those edits uncommitted; the parent sends the diff to the skills architect first.
5. **`coverage.md`** in `design-code/design/`: every line/rule of each old skill body → the page file it now lives on. A rule with no destination is a miss.
6. Add `design` to `public/framework/page.js` `children:` (after `styles` is fine — minion B adds `code` in the same line; the file is shared, edit only that string).

## Rules
- The page speaks to a person and an agent alike: no "you are an agent" voice.
- `create_page` / the `new-page` skill for the mechanics. New CSS classes: prefix `design-` (new-css-class skill). Prefer none.
- Check each page loads with zero console errors at http://localhost:52103/framework/design/… (headless, `mcp__site__shot` or Playwright; never the owner's tabs). Shots at 400 and 1920 of /framework/design/ into this folder.
- Commit in the worktree after each finished page (exact paths, never `.claude/skills/`). Every spawned process `windowsHide: true`.
- Budget: about $4. Log progress in your own task.jsonl. When done, end your turn with a 5-line report: pages made, coverage gaps, shots.

