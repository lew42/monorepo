# Minion brief: the core/Page readme, the Layout hub, and a readme-as-page example

Load the `minion` skill first, then the `page`, `documentation` and `content` skills. Task dir (read `owner-words.md` in full, especially "Continued (about 3:45 PM)"): `public/framework/ai/2026-09-29/module-experts/`. Log in its `task.jsonl`.

**Work ONLY in the worktree `C:\Code\lew42\worktrees\module-experts`** (its site: http://localhost:62087/). Commit there by exact path and don't merge. Another minion (`minion-experts-build`) works in the same worktree on `Servex/`, `core/Page/expert.json` and `core/Page/doc/readme-log.jsonl`. Don't touch those files.

## Why this matters
The Page expert (an agent that reads core/Page once and answers questions about pages) is only as good as what it reads first, which is `core/Page/readme.md`. The owner: "The summaries should be just extremely clear and simple… certain things are self-evident, they don't need an explanation."

## Your fence
`public/framework/core/Page/readme.md`, `public/framework/core/Page/layout/**`, `public/framework/core/Page/make/**`, `public/framework/core/Page/old/**` (only to add v1 copies), and new files under `public/framework/core/Page/doc/` that you create yourself. Nothing else.

## Deliverables
1. **Curate `core/Page/readme.md`.** Keep v1 reachable first: copy it verbatim to `core/Page/old/readme-v1.md`, then add a one-line link to it from `old/`'s readme or page (not from the new readme).
   - The top of the file is a short, very clear index of its sub-pages and sub-files, one line each, saying what goes where.
   - Self-evident things get no explanation. "Layout" needs no summary of what layout means, just a link and what is there.
   - Detail moves into its own file in `doc/` (or stays in the doc that already covers it), and the readme links it.
   - Keep the four ways to make a page, but as a compact list with a link each. Code blocks may stay only if they are the shortest way to show it.
   - No dated decision history, no reversals, no "the owner said on…".
   - Add one line: "This module has an expert: ask it with `ask_expert core/Page …` (Servex)."
   - Every link must still resolve (check with `node public/framework/core/Page/tools/links.mjs` if it applies, or load the pages).
2. **Make the Layout page (`core/Page/layout/`) the hub for all the layout work.** Keep v1 reachable: move the current `layout/page.js` content to `layout/v1/page.js` (a child page, declared in `children:`), and the new hub links to it. The hub is skill-like: what goes where, an index of the layout types, the decision process, and the research worth keeping. It references (at minimum) these, finding each one's real url first:
   - `/layouts/`: the encyclopedia, plus `browse`, `decide` (the five questions and the column demos), `practice`, `labs` and `shell`;
   - the sidebar variants (grep for them);
   - the floating page (`layout/floating`);
   - `core/Layout` (the catalogue of arrangements);
   - the layout explorer, which is being built now: `public/framework/ai/2026-09-29/layout-explorer/` (find its target url in its requirements.md; link it, labelled "being built" if it doesn't exist yet);
   - the `layout` skill's core questions, as a pointer.
   Use icon-item sections (`ux/Content/structure/Structure.js` `section`), with the most important on top. Give it its own `readme.md` (the index) and make the page render that readme where it can (see 3).
3. **README as page content: one example.** Add a fifth way to `make/` ("a readme as the page"): a small example page whose content is its own `readme.md`, rendered with `md.file(import.meta, "readme.md")`, followed by one JS-built block (for example an icon section) to show the mix. Show the readme source and the rendered page side by side (`demo()` or two columns), so what the AI reads is what the owner sees. Under it, write in 3 short lines where markdown falls short (custom modules, classes on a span, live widgets), and so when to write the page in JS instead. Link it from `make/` and from the readme's index.
4. **Proof.** Screenshots at 1920 of `/framework/core/Page/`, `/framework/core/Page/layout/` and the new make example (`mcp__site__shot` or Playwright headless, never the owner's tabs), taken from the worktree's server at http://localhost:62087. Save them in the task dir as `shot-page.png`, `shot-layout.png` and `shot-readme-page.png`, and look at each one. Zero console errors on those three pages.

## Budget and finish
Sonnet, about $3. Finish with a message that lists what changed, the readme's line count before and after, and the three shots. Start it with `BLOCKED` if you're stuck.
