# Coverage — every rule moved, and where it landed

Checked line by line against `.claude/skills/code/SKILL.md`, `.claude/skills/css/SKILL.md` +
`caveats.md` + `strategy.md`, and `.claude/skills/new-css-class/SKILL.md`, as they stood before
this task.

## `code` skill → `/framework/code/`

| Old section | New home |
|---|---|
| §1 Capturing is synchronous | `code/patterns/` (page.js + doc/patterns.md) |
| §2 A module is a class; every method is a seam | `code/patterns/` |
| §3 Parts are classes — hang them on the constructor | `code/patterns/` |
| §4 Names | `code/patterns/` |
| §5 Page — the blessed shape | `code/patterns/` |
| §6 CSS — invoke `css` | `code/patterns/` (now links to `code/css/`) |
| §7 Failures that never throw (all six sub-lists) | `code/dos-and-donts/doc/traps.md`, gisted on `code/dos-and-donts/page.js` |
| §8 Before you add anything | `code/dos-and-donts/doc/opinions.md` |
| §9 OOP: a default view for any instance | `code/objects/doc/views.md`, gisted on `code/objects/page.js` |
| "Every process you start is hidden" | `code/dos-and-donts/readme.md` (kept as a top watch-out; it's also still true site-wide) |
| Skill header ("no bundler…", three laws) | `code/patterns/page.js` intro; the three laws stay in `CLAUDE.md` (not duplicated) |

## `css` skill + `caveats.md` + `strategy.md` → `/framework/code/css/`, except colour and icon-buttons

| Old section | New home |
|---|---|
| "Never destroy a viable version" | `code/css/doc/rules.md` |
| "Start from this: write as little new CSS" | `code/css/doc/rules.md` |
| 1. Read the CSS that will actually cascade | `code/css/doc/rules.md` §1 |
| 2. Climb the ladder | `code/css/doc/rules.md` §2, gisted on `code/css/page.js` |
| 3. Layers | `code/css/doc/rules.md` §3, gisted on `code/css/page.js` |
| 4. Constrain the container | `code/css/doc/rules.md` §4 |
| 5. A new class name → run `new-css-class` | `code/css/doc/rules.md` §5 (now the full six steps, folded in — see next table) |
| 6. Smoke-test, then refine | `code/css/doc/rules.md` §6 |
| 7. Count before you add | `code/css/doc/rules.md` §7 |
| Icons section — glyph, inline, frame, buttons, em-scaling | `code/css/doc/rules.md` "Icons", **except** the pressable-button bullet (`.ui-icon-btn`, `aria-pressed`, `.ui-icon-rail`) which is minion A's, on `/framework/design/ui/` |
| Ownership | `code/css/doc/rules.md` "Ownership" |
| Two one-liners (padding floors, blocks that can't break) | `code/css/doc/rules.md` "Two one-liners" |
| `caveats.md` — every line except `--wash`, `--muted`, `light-dark()` | `code/css/doc/caveats.md` (those three are colour and moved to minion A's `/framework/design/color/`) |
| `strategy.md` — questions 1–5 | folded into `code/css/doc/rules.md` (the ladder, container/item, token/declaration, layer, census), except "Light and dark are modes of one theme" under Ownership, which is colour and is minion A's |
| `strategy.md` — Two one-liners | `code/css/doc/rules.md` |
| `css/questions.md` — "Spacing and padding" (10 questions) | minion A's, `/framework/design/layout/questions.md` |
| `css/questions.md` — "Colour and contrast" (8 questions) | minion A's, `/framework/design/color/questions.md` |

Nothing else was in `css/questions.md`, so `code/css/questions.md` is a placeholder noting that
(see the file itself) — there is currently no CSS-code review question that isn't spacing or
colour.

## `new-css-class` skill → `/framework/code/css/`

| Old step | New home |
|---|---|
| 1–6 (scopes file, census, view classes, prefixing, opening a namespace, `page--` stamps) | `code/css/doc/rules.md` §5, as the six numbered steps, unchanged in substance |

## What did NOT move (companions, unchanged)

- `naming` — stays a skill, thirty-second procedure, not knowledge.
- `review`, `clarity`, `ui-test` — unchanged; `review`'s `SKILL.md` links were updated to point at
  the new `design/` and `code/` question pages (edit left **uncommitted**, per the brief — the
  skills architect approves it).

## Server/review.mjs — the review seam

`questionsCmd` now also walks `public/framework/design/` and `public/framework/code/` recursively
for `questions.md` files, recording `skill` as the page's own path (e.g. `design/layout`,
`code/css`). When the same `## Heading` exists both in an old skill dir and under design/ or
code/, the page's copy wins, so no question is ever listed twice and the old skill files keep
working until they're retired. Tested: `node Server/review.mjs --questions` →
`public/framework/ai/review/questions.json` lists each of the 10 systems exactly once (checked
2026-09-30 in this worktree).
