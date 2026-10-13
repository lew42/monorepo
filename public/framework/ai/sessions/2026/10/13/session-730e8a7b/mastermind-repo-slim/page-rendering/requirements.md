# How a page renders: the answer, in the inbox and in one doc

Budget: $8. Load the `sub-mastermind`, `page` and `documentation` skills first. The owner's raw words: `../requirements-4.md`, ask 2 and 3 ("I'm still not sure how we're rendering dynamic pages with JavaScript. Are we still using the little helper functions? Are we just writing JSON data for all the views and instantiating views from JSONL data? … look into that and document it better… when I ask these questions, answer my question in the inbox so I'm gonna see it later"). Your log is this dir's `task.jsonl`. CLAUDE.md law 2: clear beats brief, explain it like I'm five, start with the basics in full plain sentences; show, don't tell.

## What exists

- `public/framework/core/Page/readme.md` and `doc/` (`architecture.md`, `composition.md`, `content.md`, `jsonl.md`, `declaring.md`, `loading.md`, `ai-api.md`, `data.md`, `data-children.md`, `markdown.md`, `binding.md`, `page-js-notes.md`): the answer is spread across these. `core/` (the `p()`/`h1()` helpers, `View`, `App`), `ext/JSONL`, the page tools (`page_set`, `page_add`). `public/framework/ai/doc/classes.md` for the class rules.

## Deliverable

1. **One doc, `core/Page/doc/how-a-page-renders.md`** (one screen first, then detail): the plain answer, in order: (a) a page is a class instance (`class X extends Page`) made by a tiny `page.js`; (b) the helper functions (`p()`, `h1()`, `css()`, …) are still how a view writes DOM, and what they are; (c) `page.jsonl` is a log of deltas that the page replays into content blocks (which kinds: text, part-link, columns, …), written by agents through the page tools; (d) which pages are code, which are JSONL, which are both, with one live example of each linked; (e) the markdown path (`.md` files as pages); (f) how live updates arrive (`live()` tail, no polling). Each claim links the file that does it. A small diagram as a code block (the flow from `page.js` → `Page` → blocks → DOM, and `page.jsonl` → replay → blocks). Link it from `core/Page/readme.md` at the top ("How a page renders") and from `public/framework/readme.md`'s Page line.
2. **The inbox answer**: one `owner_note` (kind `decision`, title "How pages render today: classes + helpers, with page.jsonl deltas on top"), three plain sentences and the link. This is the deliverable the owner reads.
3. **Sanity check the readme chain** on the way (CLAUDE.md "documentation sanity check"): any Page doc that contradicts what the code does today gets a one-line fix or a line in your log.
4. Report on your card: the three-sentence answer and the link.

Fence: `core/Page/doc/how-a-page-renders.md`, one link line in `core/Page/readme.md` and `public/framework/readme.md`, one-line fixes in `core/Page/doc/*.md`, this task dir. Worktree, `merge.mjs`. No code changes. Sonnet.
