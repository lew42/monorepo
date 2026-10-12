# Minion F — the review walkthrough, four clicks

Load the `minion` skill, then `page`. Parent: task-mastermind-review. Work in the MAIN tree (C:/Code/lew42/monorepo), only inside `public/framework/ai/2026-09-30/review/walkthrough/`. Commit only that folder, by exact path (`git add public/framework/ai/2026-09-30/review/walkthrough && git commit -m ... -- that path`). Don't touch other files.

Copy the shape of `public/framework/ext/drawer/walkthrough/page.js` exactly (ux/Wizard, one real screenshot per step, one sentence, an "open" link, the step in the `#hash`). Title: "The review, step by step". Pictures go in `walkthrough/pics/` (NOT a folder named `shots/`: that is gitignored). Copy them from the files below (use `cp`); crop nothing.

Steps:
1. "Every system asks its questions" — pic: `../shots-live/monorepo-localhost-framework-ai-review/1920.png`; open `/framework/ai/review/`; say: "The review questions for pages, navigation, layout, sizing, wrapping, spacing, colour, flow and words, on one page. Each comes from its skill's own questions.md, so a new rule brings its question with it."
2. "The same page on a phone" — pic: `../shots-live/monorepo-localhost-framework-ai-review/400.png`; open `/framework/ai/review/`; say: "At 400 the systems stack into one column."
3. "Screenshots belong to the task" — pic: `../proof/shots/monorepo-localhost-framework-ux-Rename/sheet.png`; open `/framework/ai/2026-09-30/review/proof/`; say: "Every review shoots the changed pages at 400, 1200, 1920 and 3440 into the task's own shots/ folder, with the measured numbers (tab rows, stacked padding, bands, wraps) beside them."
4. "One report answers every question" — pic: take ONE headless screenshot at 1280x900 of `http://monorepo.localhost/framework/ai/2026-09-30/review/proof/review/report.md` with `node -e` + `C:/Code/lew42/monorepo/Server/browser.mjs` (`import { browser } from ".../Server/browser.mjs"`), saved as `pics/report.png`; open that .md url; say: "A fresh reviewer loads the review skill and answers each question yes, no or n/a, with a shot or a number as proof. This proof run found 8 things on a task that had already landed."

Check it headless at 1920 (`node Server/layout-check.mjs http://monorepo.localhost/framework/ai/2026-09-30/review/walkthrough/ --widths 1920 --out <scratch>`): zero errors, the picture shows. Never use the owner's tabs (no mcp__site__pages/claim/eval). Reply with the url, stop. Budget $1.50.
