# title-wrap — a page title must never break a word in half at 400 (Sonnet, group `websites`)

Three laws: less is more (ASAP); clear beats brief; prioritize. Length budget: one CSS rule, two pictures, five report lines.

⚠ **NO INTERNET.** Everything is on disk; the only server is `http://localhost:8123`.

Read first: `../mastermind-playwright/minion-rules.md`. Skills: `new-task` (this dir, group `websites`), `code`, `css` (read `framework.css` and the layer rule before you write), `documentation`, `finish-task`.

## The bug

At 400 px wide, a page whose title is one long word breaks it mid-word: `/websites/tag/documentation/` renders `Documentatio` / `n` (found by the `critic-websites` Opus; `core/Page` was outside its fence). The h1 is sized by a clamp in `public/framework/core/Page/Page.css` (around lines 120–140); the word is wider than the 400 column at that size.

## Do

1. Reproduce: headless at 400×844, `http://localhost:8123/websites/tag/documentation/` → `before.jpg` in this dir; Read it.
2. Fix the cause once, in `Page.css`, inside its layer: the smallest rule that keeps a long single word whole — `overflow-wrap: anywhere` breaks it too; prefer letting the title shrink (`font-size` clamp with a smaller floor at narrow widths) or `hyphens: auto` with `lang` set (check `<html lang>` exists), and say in the comment why you chose it. The rule must not change any title at 1280 or wider.
3. Prove: `after.jpg` at 400 (the word whole), and `/framework/` at 1920 before and after your edit (pixel-identical h1 — compare the two shots' h1 rects via `getBoundingClientRect`, print both).
4. One line in `core/Page/readme.md` Watch out, or its doc, if the module documents its title sizing — make the doc true, nothing more.

## Fences and budget

Write ONLY `public/framework/core/Page/Page.css`, one line in `public/framework/core/Page/readme.md` or `doc/`, this dir, scratch named `title-wrap-*`. Budget ~60k tokens. Report in ≤ 5 plain lines: the rule, the two pictures, the 1920 rects before and after.
