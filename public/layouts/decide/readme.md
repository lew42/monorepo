# Choosing a layout — [/layouts/decide/](/layouts/decide/)

Five questions, asked in order, that pick a page's layout: how much room, how much content, is it outlined, how to fill the width, which approved layout. Each is a judgement with its usual answers, never a rule (the owner, 2026-09-28: rules get followed too literally).

## Use
- The questions live in `questions.js`. The page draws them; `node gen-questions.mjs` writes `questions.md` from it (one per line, for `node Server/ask-each.mjs`); the `layout` skill has them in prose, so change that by hand.
- Four demos of the fourth question: `equal/`, `short/`, `centred/` (the fix: `flex v h-center` on the title's box), `amount/`.
- `servex/` is the five questions asked of /framework/servex/ one at a time: `context.md` in, `answers.md` out.

## Watch out
- Each demo's two pictures are shot from its own live box: `node public/layouts/decide/shoot.mjs <base url>` after any change.
- A little content keeps a ceiling: `.std-decide-previews` (decide.css) caps preview cards at 20rem, because `grid auto` stretched them to 1000px at 3440.

## More
The task: [ai/2026-09-28/layout-system](/framework/ai/2026-09-28/layout-system/). The owner's words: `ai/2026-09-28/organization/owner-words.md`, "Continued (about 11:15 PM)".
