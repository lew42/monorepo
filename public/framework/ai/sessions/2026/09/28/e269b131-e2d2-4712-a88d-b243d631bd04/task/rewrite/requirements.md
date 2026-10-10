# Step 6a: rewrite the paging docs, first pass (Sonnet)

Load the `minion` skill first, then `page`, `content`, `new-page` and `documentation`. The owner's words, verbatim: `../owner-words.md`, both sections. The structure you build is `../proposal.md`. Read it in full: it is the acceptance test, together with the owner's words. The evidence behind it: `../audit/3a.md`, `3b.md` and `3c.md` (read the parts your items cite).

## The owner's rules for every page you touch

- Write little. Let the headings do the work: H1, then H2, then H3 as small section headers.
- Use icon items as navigation to the topics readers use often (the structured-content vocabulary in `/framework/ux/Content/structure/`; don't invent a second one).
- Show the simplest example first: the code, then what it produces, live.
- Add cross-references wherever they make an idea tangible.
- Keep the existing navigation. Don't clobber it. When unsure, link to a new page.

## Deliverables: `proposal.md` rewrite order items 1, 2, 3 and 6, nothing else

1. **Readme "Use"** (`core/Page/readme.md`): list the four ways to make a page (page.js, page.jsonl, `route()`, folders) in that order, each with its smallest real example and a link. Group "Read next" into three. Link the page skill's structured content.
2. **Layout › Choosing a layout.** Add a new top tab, **Layout**, on core/Page. Its first page is *Choosing a layout*, a page made of links:
   - Standard, Split, Columns, Floating page and Top-down shape, each as an icon item with one line and a link to its real mechanism (see the proposal's table);
   - one callout on the word collision (the owner's wide and fill versus core's `width: "wide"` and `fill`).
   Floating page links to a stub that says it is coming (the AI 2 lead is building `floating()`).
3. **Make a page.** Add a new top tab: the four ways, each simplest first, with code and then result. Trim the `jsonl` demo to the two-line case, and move the full feature tour to a second example beside it. Add the **folders** overview card (the AI 2 index pattern, at demo scale; see 3b's "Simplest first" item 4).
6. **Tab order:**
   - Overview · Make a page · Layout · Generator · API · Docs · Files · Old.
   - The left nav must match this order. Check how it is generated.
   - Every existing URL keeps working, including `/framework/core/Page/jsonl/` and `/old/`.
   - Mark `doc/layout.md` as an open question at its top.

## Where

- Pool worktree `C:/Code/lew42/worktrees/qf-1`, with its server at `http://127.0.0.1:58131/`. Commit there only.
- Fence: `public/framework/core/Page/` only (page.js, readme.md, doc/, overview/, jsonl/, plus new dirs for the tabs).
- Don't touch `Page.class.js`: another agent is changing `child()` for `/fs`.

## Proof

- Screenshot each new or changed tab at 1920, reached by clicking from `/framework/core/Page/` (headless, following the `ui-test` skill). Also shoot Overview at 1280 and 3440.
- Save the shots to `public/framework/ai/2026-09-28/organization/rewrite/` in the MAIN tree, and look at each one.
- Run `node Server/smoke.mjs C:/Code/lew42/worktrees/qf-1` from the main repo. It must be clean.
- Log in `rewrite/task.jsonl`.

## Never

- Every process sets `windowsHide: true`.
- Don't restart servers, don't touch the owner's tabs, and don't merge.

Budget: about $3. Reply with one line: the commit, the shots, and the smoke result.
