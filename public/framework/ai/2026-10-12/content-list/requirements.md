# Page content is always a List (content.md step 1 only)

**The owner (2026-10-12):** content could always be a list, with its own render, instead of a function in one place and a List in another. The design is written: [core/Page/doc/content.md](/framework/core/Page/doc/content.md), "Design: `content` is always a List" (accessor on Page; a function becomes one `PageCode` item, an address a `PageAddress`, a string a `PageParagraph`; an object/array goes to `content.set()`; `render_content()` loses its type-switch). Do step 1 of its order only. The `children` migration (steps 2-3, 255 files) is not this task.

## Done when
- [ ] Built as designed, in `core/Page/` (now split: `Page.class.js`, `Jsonl.js`, `parts/`), the three item kinds each with a `View`, per the code skill. `page.content` is the same List for the page's life.
- [ ] Zero behaviour change for the 1,096 `content(){}` pages: reuse [page-split-3](../page-split-3/STATE.md)'s `baseline.mjs` on its 40 pages plus 10 that use a string/address content and the 5 with `{"content":...}` jsonl lines; 0 state diffs, 0 new console errors, screenshots match at 400/1200/1920/3440. Smoke clean. The page-tool stream proof (`stream-proof.mjs`) still passes.
- [ ] New ability proven: a page with `content(){}` plus a `{"content":...}` jsonl line shows both (today the line replaces the function).
- [ ] `content.md` step 1 ticked; `ai-api.md` updated if the tool docs mention content shapes.
- [ ] If any diff can't be fixed, don't merge; leave the branch and write why in `STATE.md`.

Sonnet 5.5, high. Worktree; hold live reloads during the merge batch. Land with `finish-task`.
