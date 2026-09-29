# Alternatives to class-doc top tabs

The go-to is [`ext/Doc`](/framework/ext/Doc/)'s top-tab pattern (the main page, section 3). These
five are real, running alternatives — reach for one when its own shape fits the content better
than a flat rail of tabs.

| alternative | what it actually is | demo | pick it when | skip it when |
|---|---|---|---|---|
| **Miller columns** | Click a child, a new column opens to the right; every ancestor column stays visible. `this.columns()` on a `core/Page`. | [`core/Page/overview/columns/`](/framework/core/Page/overview/columns/) | the reader is drilling into a real tree (files, a nested catalog) and benefits from seeing every level's siblings at once | the tree is shallow (2 levels or less) — columns add width for no benefit |
| **Contextual swapping workspace** | A left rail whose CONTENTS change based on what's selected in the centre — "the right sidebar becomes the left, the picked one becomes the main view" (the owner, quoted in the explorer's own readme). | [`/layouts/explorer/`](/layouts/explorer/) | the categories genuinely depend on what's currently open, so one fixed rail would be wrong most of the time | the nav tree is the same no matter what page you're on — use the plain persistent Sidebar instead |
| **Full-screen switch** | The whole screen replaces itself; a thin label strip (not a rail) is what reads as "nothing jumped." Vocabulary: `full` replaces the screen, `fill` joins it and screens divide the row. | [`/layouts/labs/screens/`](/layouts/labs/screens/) | the content wants the entire viewport and switches are the exception, not the common case | switches happen constantly — a full replace every click is more motion than a fixed rail |
| **Persistent rail vs. full swap, head to head** | The exact same four slides, built both ways, so the cost of each is directly comparable. | [`/imagine/decks/persist/`](/imagine/decks/persist/) vs [`/imagine/decks/swap/`](/imagine/decks/swap/) | undecided between rail and swap for a specific case — read the finding first | you already know which one you want |
| **Contextual right rail (second surface)** | A right-side panel next to the main Sidebar, pushes the page rather than covering it, one per document, remembers its own width. | [`ext/drawer`](/framework/ext/drawer/) | the page needs a persistent SECOND surface (properties, AI chat, settings) alongside the main left nav, not instead of it | one nav surface is already enough — a second one is clutter |
| **The configurable prototype** | One page, six words in the url (navigation/content/room/arrangement/skin/stage) — rail vs tabs is one of the words. | [`/imagine/paging/`](/imagine/paging/) | trying combinations before committing to a shape | the shape is already decided — build the real page, don't keep it configurable |

## The finding from the head-to-head

`/imagine/decks/persist/` vs `/imagine/decks/swap/` (the same four slides, built both ways) did
not produce a single winner. The rail costs a fixed 16em (288px at 3440, 256px at 1920) on every
screen, always. The full swap costs nothing extra in width but needs its own "what am I even
looking at" signal — a thin strip of the same labels, redrawn identically on every slide, which
reads as persistent even though the whole region under it changed. Rule of thumb: **kinds that
scale want swap; kinds that cap (a fixed small set) want the rail.**

## A removed alternative, named so it isn't re-discovered as a live thing

The 2026-09-04 inventory this brief was built from lists `/imagine/paging/rightnav/` — a
persistent right tree with a swapping centre pane, in the same family as the contextual workspace
above. It was real and it worked (task log:
[`paging-rightnav`](/framework/ai/2026-09-04/paging-rightnav/)), but it was never wired into
`/imagine/paging/`'s own `children:`, and a later rewrite of the whole `/imagine/paging/` realm
("Paging v3") removed the directory before it ever became reachable. `git log --all` confirms it:
the directory exists in one historical commit and is gone by the next rewrite. This page does not
link to it and did not re-add it to any `children:` list — the inventory row describing it as
"live" was accurate when written, then went stale within the same day.
