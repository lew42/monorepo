# Lew42 v2 Index as a preview system (2026-11-16, think-index, read-only proposal)

Goal: open Index and think "this looks good, and it is simple". Each preview is the best 10% of one page, and clicking it takes you to that page.

## How Big Sloppy's Index works (read from file `hbolzQ3Xnc78rhxAPj8xK2`, node 208:40423)

- **Every page owns one component, `<Page> Preview`**, at that page's 0,0, before the page itself. Index holds **instances** of those components, not copies (24 of them), so editing a page's preview updates Index.
- **Each preview is the same shell:** one `Page Set / Size=1920` instance with a Header (the page name, one line) and a Content slot holding one Section with the page's best 3 items, using real component instances. Every preview is therefore 1920 wide on light gray (245), with white cards, black text, one orange accent and often one dark card. The same width and ground are why 24 previews read as one calm grid.
- **Index layout:** a vertical Root holds a Top row (a title pill, then a "How this file works" card with 5 numbered steps) and then a Columns row with 5 vertical columns (Foundations, Components, Patterns, Layouts & pages, Examples). Each column is a big header plus one line, then its previews stacked.
- **The link is the instance itself.** There are no hyperlinks on the previews: you select one and use the main component link in the right panel to jump to its page. Text hyperlinks only appear inside the docs ("See it live: Colors").
- **Its own rules, written on Index:** show only the best pieces; if a preview grows long, the page has too much, so merge or delete. Previews clutter Assets and Swap, and that cost was accepted. A `.` prefix hides some previews from publishing.

## The minimal v2 Index: 3 columns, 7 previews (built from the target pages in [consolidation-plan.md](./consolidation-plan.md))

| Foundations | Components | Layouts |
|---|---|---|
| **Tokens** (Scale page, later Tokens): the same Card at Mobile and Default | **Card**: 3 white Cards on light gray | **Page + Section**: one 1920 page, one Section |
| **Text** (Text page): the type styles in one card | **Elements**: Button default and accent, Icon.Item, Image | **Sizes** (later): one Card, 360 to 3440 |
| **Icons** (Icons page): its `Icons Preview` already exists | | |

- A fourth column, **Examples** (Showcase, Click through), comes later. Explore, Templates, Squeeze, Columns and Card vs Section get no preview: they are on their way to Archive.
- **Name and home:** `.<Page> Preview` is the first child of that page's Root. The dot keeps it out of the published library. **Link two ways:** the main component link (free), plus a NODE hyperlink on the master's Title pointing at its page id (`setRangeHyperlink`, which works on master text per the readme), so a single click on Index's title jumps there. Check that instances inherit it on the first preview.

## First 3 to build, in order (each approved before the next, per [approval-strategy.md](./approval-strategy.md))

0. **Before that, the shell:** a local `Page` master (Header plus Content slot, 1920, `pad-x` margins). Today v2's Index uses Big Sloppy's remote `Page Set`. This is the Approve page's item 5.
1. **Card Preview.** Smallest version: on a light gray Page, a row of 3 Card instances: kicker, title and body; kicker, title and an accent Button; and one Dark-scheme card. That gives one orange and one dark element. It needs the card-white fix first, because Card binds Scheme `fill` today.
2. **Text Preview.** One white card holding h1, h3, body and label, each shown once with its style name. Nothing else.
3. **Tokens Preview.** Two Regions side by side, Mobile (400) and Default (1000), each holding the same Card instance, so the eye sees pad and gap change. No numbers typed in. Index v0 is these 3 instances in their columns plus the 3-step "How this file works" card. It grows by one preview per approved page.

## What to avoid (each one happened in v2 today)

- **Sprawl:** 27 pages, with masters on 15 of them. One preview per kept page, never one per frame or per experiment. A preview taller than about 1200 means its page needs cutting.
- **White on white:** Card's fill follows the ground's Scheme. The preview ground is a direct Colors `light` fill with no Scheme mode. Every card must come out White, and lint's same-on-same count must be 0.
- **Nesting:** Big Sloppy went Preview > Page > Section > Content > item. In v2, drop the Section: Preview > Page > Content slot > items, 3 levels before a Card (the owner's specimen complaint).
- **Floating frames and connectors:** a preview sits inside its page's Root, and Index is a single Root. Nothing loose at the top level (v2 Index today has a loose 3424 px image next to its Root).
- **Unapproved content:** a preview holds only approved masters. A Draft master on Index looks like canon.
- **Zoomed-out review:** judge each preview from a 1:1 crop at 1920. Use the Index shot only for rhythm.
- **AI page contradiction:** its Pages list says "Index: one instance of every master, and nothing else". Once this proposal is approved, change it to "one Preview per page".
