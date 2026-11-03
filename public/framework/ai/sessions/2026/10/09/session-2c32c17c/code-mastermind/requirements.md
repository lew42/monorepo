# Code mastermind: the code, design and content systems, one simple scheme

The owner, 2026-10-09 ~19:05 (VS Code tab 7efd07d5), condensed. Sonnet; frugal.

## The ask
- `/framework/code/` (patterns, dos-and-donts, css, objects, performance) is the home of how we write code; the `code` skill should be built around it (point to its readmes, never duplicate them). Upgrade it with the object-oriented system: class per file, manager class, composition (an instance holding instances), `architecture.md` per module.
- **A default object view.** Every class can render itself: a default `render_object`-style view that walks its properties, with the class choosing which properties matter and ordering by importance (the weights idea); internal timing state hidden. Find what exists first (`ux/Content/Object/DefaultView.js`, class cards in `ext/Doc`), name the one survivor, document it in `code/objects`.
- **CSS: reuse, don't add.** A limited set of tokens and layouts made to work well; custom CSS everywhere "has gotten way out of hand". Do's and don'ts split by JavaScript vs CSS.
- **Code, design, content are three sides of one thing**: code = syntax and patterns; design = contrast, layout, navigation, what goes where (`/framework/design/`); content = writing it down (readmes, markdown now, structured `page.jsonl` content via the page tool later). Propose how the three systems and their skills divide, with the fewest skills.
- `/framework/code/` page: links at the top and the same items written out below are redundant; keep the visual structure (the orange-underlined links work).

## Do
1. **Audit by script + skim**: the code readme chain, `code/*` pages, the `code`, `css`, `layout`, `content`, `documentation` skills. Haiku helpers (one per doc, each under 60k tokens, reading the code readme + its one file + related files it finds) only where reading is bulk; they report, you decide.
2. **Talk to `mastermind-system-architect`** (it owns the shared skills and is running an OOP census of loose-function files): agree who edits which skill; you edit `/framework/code/` and propose skill text to it.
3. A one-screen result page in this task dir: what changed, the three-systems proposal, the next tasks.

## Rules
Commit each step. Never destructive (archive with a note). Land with finish-task and a `Note:` card.
