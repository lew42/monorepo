# Design — review questions

The design umbrella's rules (the order of the job, the two tests), worded as questions a reviewer answers yes, no or n/a from the screenshots, `layout.json` or the page's source; the `review` skill asks them. Moved from `.claude/skills/page/questions.md`.

## Page structure

1. Does the page's title or first line say, in one sentence, what the page is and who it is for? [page: step 1, what is it]
2. Is the first thing under the title the page's core concepts, as linked icon tiles or a short list of linked items? [page: step 5a, concepts first]
3. Does the content run in priority order, top to bottom: what it is, then its state, then what needs doing, then what was done, then detail? [page: step 5, content in priority order]
4. Does what is still open come before what is finished? [page: step 5, open before done]
5. Does the parent page's `children:` name this page, so it is reachable by clicking? [page: creating a new page, 1]
6. Does every view a click reaches (a tab, a selected item, an open panel) have its own URL, so a reload or the back button lands in the same place? [page: creating a new page, 2; CLAUDE.md: route everything]
7. Does the page use a layout word or an approved type, rather than page-specific CSS for its shape? [page: which kind of page is this?]
8. Is every item, label and button self-evident: would the owner know what it is and does without reading more? [page: two tests, self-evident]
9. Does every element earn its space: nothing repeats what a neighbour already shows, and no small control sits alone on a wide empty row? [page: two tests, necessary]
10. Is each piece in its best form: a number or grid rather than a sentence, one filtered list rather than two lists, a structure shown rather than described? [page: step 6, best form]
11. Does every section have a title that makes the whole section clear? [page: step 6; CLAUDE.md: clarity is familiar structure]
12. Where a working version was restructured, is the old version still reachable to compare against? [page: never destroy a viable version]
