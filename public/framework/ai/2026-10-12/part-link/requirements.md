# A content item that points at a child page, and the promote script

**From** [core/Page/doc/content.md](/framework/core/Page/doc/content.md), "A block that needs a url" (not built): a `part-link` kind that holds a child page's path and draws as a card with the child's title and summary; a promote script that moves a block's line into a new child folder and leaves a `part-link` behind; scrolling to a block by `#id`. This completes the owner's subpage CRUD ask with the content list that just landed ([content-list](../content-list/STATE.md)).

## Done when
- [ ] `part-link` kind (an Item with its View, per the code skill), usable through the page tools as a plain delta; documented in `core/Page/doc/ai-api.md`'s table.
- [ ] `promote` as a node script (dry run default, manifest, reversible, `git mv`-style, never destructive) and as a page-tool call if it fits the existing tools without a new one.
- [ ] `#id` on a block scrolls to it, routed.
- [ ] Proof: a scratch page built through the page tools gets three cards, one is promoted; the parent shows the link card, the child has its own url and the original content; headless at 400/1200/1920/3440. The content-list A/B on its 56 pages still shows 0 diffs.

Sonnet 5.5, medium. Worktree; commit each step; merge. Land with `finish-task`.
