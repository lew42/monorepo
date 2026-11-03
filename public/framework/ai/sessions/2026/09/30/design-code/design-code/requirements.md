# /framework/design/ and /framework/code/: knowledge systems you can browse: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

## The idea
Skills hide knowledge in `.claude/skills/`. The owner wants that knowledge **browsable as pages**: one tree of readmes and sub-systems that an agent or a person reads the same way. The skill stays, but thin:
- its description gives agents awareness that it exists;
- its body says "read the readme chain at /framework/design/… (a quick overview follows)".

The knowledge itself moves into the pages.

## Asks
1. **`/framework/design/`: the design system.** Everything that contributes to design when you create anything new:
   - **layout**;
   - **color**;
   - **navigation**: the path, how links look, persistent or switching, transitions;
   - **content**: the iceberg, level of detail, what is foundational, importance and prioritization;
   - **UI**: buttons, toolbars, dropdowns, icons.

   Each is a child page with a readme. It **links** to `/framework/styles/` (the CSS style guide) and `/framework/ui/`, and doesn't duplicate them.
2. **`/framework/code/`: the coding system,** for code in this framework (HTML, CSS, JS):
   - patterns;
   - do's and don'ts;
   - formatting;
   - opinions;
   - the traps that never throw.

   Also an **object-oriented design** page: every class ships a view of its state.
3. **Move the knowledge out of the skills.** Candidates:
   - `content`, `layout`, `page`, `css` and `naming` → design;
   - `code` and `new-css-class` → code.

   Each skill shrinks to a pointer plus a short overview. Don't lose a single rule in the move: check line by line.
4. **Level 1 of each page is visual and structured,** in the familiar-structure style of CLAUDE.md: concept tiles, then the gist, then lists. Use the same docs top-tabs as the other modules.
5. Add both to `/framework/`'s `children:` so they can be found.

## Coordination (important)
- **mastermind-servex-9** is the skills architect. It is writing the proposal for the content/layout/UI/navigation skill structure. Read its card first, and build to it. Skill edits go through it: send it the diff, and it approves.
- **task-mastermind-ai-page** documents the AI system at /framework/ai/, and links here for design and code rather than repeating them.
- **task-mastermind-review**'s review questions per system should live on these pages.

## Rules
- Pool worktree, then `merge.mjs` (smoke test), then the review skill. Screenshots at 400 and 1920.
- Budget: $12, hard. At most 2 Sonnet minions.
- Post a short outline on the card before building.

