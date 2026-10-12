# Next task: drill into a chat card: the sheet goes full screen, with routed paging inside it

Split off from [next-chat-hitl](../next-chat-hitl/), which built select, rename and the ✓/? marks in [`ext/Chat/ChatPanel`](/framework/ext/Chat/) and left this ask for its own task (budget).

## The owner's words, verbatim (2026-09-29, 19:35; full text in [../next-chat-hitl/owner-words.md](../next-chat-hitl/owner-words.md))

> "Yeah, and then, so one of the other things about these cards is that it might be nice to be able to click on one of them and kind of dig into it, in which case I might imagine that the uh, the the sheet could then go full screen and kind of become like, you know, a shell in and of itself with paging within it. And so then when you click on a specific card, You know, then you're, well, first it kind of selects that card, but also maybe expands it if there's things within it. I'm not sure exactly how that would work. Um, just some ideas."

And from 8:40 PM ([../owner-words.md](../owner-words.md), "Continued (about 8:40 PM)"):

> "Nestable content cards, like structured, hierarchical. Those need navigation to them. ... if anything that's clickable, like we probably need to, to route to that page so that then we can refresh without losing our, our spot ... these content cards should basically be pages of themselves ... Maybe a card is kind of a tiny page and doesn't need um, a directory of its own."

## What exists now

- A tap on a chat bubble SELECTS it (one at a time), and still opens the `from` pieces inside it. Select, rename and marks are all behind `marks: true` on ChatPanel. Read [`ext/Chat/readme.md`](/framework/ext/Chat/) and its `doc/decisions.md`.
- The ✦ sheet ([`ext/drawer/rail.js`](/framework/ext/drawer/)) drives ChatPanel through [`ext/Session`](/framework/ext/Session/).

## Asks

1. **Drill in:** a selected card that has contents gets an "open" action; opening it takes the ✦ sheet FULL SCREEN, as its own small shell: a header with back, and the card's contents as a page inside it. A card inside that page opens one level deeper (paging).
2. **Routed:** each level has its own URL (a hash or query on the current page is enough), so a reload or the back button lands in the same place, and "back out" returns to the normal sheet.
3. **A card is a tiny page without a directory:** address a card by its chat line's `at` (plus the session), not by a new folder. Say in one line in `doc/` how that maps to the page system, and what would make a card graduate to a real directory.
4. Desktop: the same open action works in the drawer's AI tab (full height of the drawer, or the page's main area; decide, and name the alternative).

Keep v1 reachable (the full-screen shell is an option). Pool worktree, smoke test, merge.mjs, one fresh reviewer, screenshots at 400 and 1920. **Budget: $10.**
