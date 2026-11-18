# Layout vocabulary v6: Page, Section, Card, Content, and the radius rule (proposal, 2026-11-18)

**Status: a proposal. Nothing in Figma was renamed or changed** (rule 31). It is built on the owner's words: "I just want to finalize the system" (~23:55), the rename-tax worry (~00:05), and the calls he made at ~00:20, all in [owner-words-2026-11-17-naming.md](../owner-words-2026-11-17-naming.md) (last three sections); also [sizes ~23:40](../owner-words-2026-11-17-sizes.md#voice-2340-2026-11-17-sections-padding-max-width-1920-content-from-1600). Once approved, it replaces the "four words" line in [glossary.md](../glossary.md).

**Settled by the owner (~00:20):**
- **Page** is a word, one per size (`500 · Page`, `1000 · Page`, `1920 · Page`). It is the full container for a stack of sections.
- **Sections are naturally full width.** A Page has no padding, so its Sections run edge to edge (full bleed).
- **A Section can hold columns directly**, with the layout on the Section itself. An extra wrapper is allowed only as a drag-and-drop target.
- **Presets matter:** start from a correctly configured Section, so drag and drop just works.
- **A padded Section may hold Content or Cards directly; a flush Section should not.**
- **Radius needs room; full bleed means zero radius.**

## The one rule: radius needs room

**Anything with a corner radius sits inside padding or gap. It never touches a visible edge: its parent's painted edge, or another border.** Full bleed means radius 0. Remove a Card's radius and shadow, and it can become a full-bleed Section; give a Section a radius, and it needs room around it, so it becomes a Card.

This is why the two words differ: **a Card has a radius, so it needs room. A Section has none, so it may touch the edges.** Lint can check it: walk up from a rounded node to the nearest ancestor with a fill, and warn if no padding or gap separates them.

## (a) The words: seven

| Word | What it is | Sits in | Holds | Defaults (change freely) |
|---|---|---|---|---|
| **Page** | one screen at one size | the top of a design | Sections | page background, padding 0, gap 0, vertical, Fill. The design's Scale mode is set on the placed instance. |
| **Section** | a full-bleed band, radius 0 | a Page, or a column of a flush Section | Content, Cards, a Container; its own columns | a background (a Scheme mode), `section-pad-x/-y` (the Flush preset has 0), gap `gap`, no radius, no shadow, Fill width, Hug height. Vertical, or horizontal + wrap when it holds columns |
| **Container** | the centred 1600 cap | only a Section wider than its content (1920) | the Section's content, or its columns | no background, padding 0, gap `gap`, Fill, max width `max-width` (1600, Constants), centred |
| **Card** | a rounded, padded surface | somewhere with room: a padded Section, a Container, a Column, Columns, Content | Content (usually one), its own columns | a Scheme fill that differs from its parent, `pad-x/-y`, `radius` + the card shadow, Fill width, Hug height |
| **Content** | the text area: no box | a padded surface: a padded Section or a Card | text, images, buttons, icon items, rows, a Card as a callout | no background, padding 0, gap `text-gap`, vertical, Fill width, text max `measure` |
| **Columns** | a bare row of columns, used only when the columns can't be the parent's own layout | beside a title in a Section; in place of a Card (the swap demo) | Cards (or columns of Content) | no background, padding 0, gap `gap` (0 = joined), horizontal + wrap |
| **Column** | the name of one child of a columns layout (`Column 1`, `Column 2`) | a Section, Container, Card or Columns laid out as columns | one Card, Content, or a pile of Cards | Fill (its share), vertical, gap `gap` |

**When is a Columns wrapper needed?** Only in two cases. One is a title above the columns, because a frame can't be vertical (title over) and horizontal (columns) at once. The other is a drag-and-drop target, such as the bare `Columns · 2 · Equal` you swap a Card for. Otherwise the Section, Container or Card carries the columns layout itself.

**Section padding by default: padded.** The `Section` preset has `section-pad`, and the separate preset `Section · Flush` has none. Why: most sections hold text (his words: "a lot of them should have padding, especially if there's text"), and a padded Section accepts a dropped Card or Content at once without breaking the radius rule. Flush is the exception (photos, split bands), so it gets its own preset rather than being the default. Alternative: flush by default, with padding added each time. It would match "full bleed" literally, but every text section would need a manual step, and every dropped Card would touch the edges until someone fixed it.

**Scaffolding words stay as they are:** Root, Root column, Specimen and Stage, Preview, Masonry, and the group titles. They organize the canvas; they are not part of a design.

## The words line up with the site's CSS

| Figma | Web (framework.css, core/Page) |
|---|---|
| Page | a `Page` ([core/Page](/framework/core/Page/readme.md)): its `background` word is the Page fill |
| Section (padded) | a band with a ground class and `.pad` |
| a Section, Container or Card holding columns | `.flex.auto.gap`: wrapping columns, each child's basis `--column` (Figma: horizontal + wrap, children Fill with a min width) |
| `· 2 · Equal` / `· 2 · Sidebar` | `.cols.half` / `.cols.main-aside` (a ratio that stacks below a floor) |
| Column | a child of `.flex.auto` or `.cols` |
| Card | `.card`: surface fill, `--radius`, `--pad-card`, shadow |
| Content | plain flow, or `.flex.v` with the text gap |
| Container | the Page's `width: "wide"` word (`.page-w-wide`) |

Two small mismatches (notes, not changes):
- The web's `.card` adds a border (`--line`), which the Figma Card doesn't have.
- The web has no "Section" class. A section there is just a band in the page.

## Presets per size: the minimal set

**Names follow rule 30 (`<Group>/<size> · <Name>`). ✅ = exists today; ➕ = new.**

| Preset | What it is | 500 | 1000 | 1920 |
|---|---|---|---|---|
| `Pages/X · Page` | a gap-0 stack holding a Section and a `Section · Flush` | ➕ | ➕ | ➕ |
| `Sections/X · Section` | padded, holds the size's Content | ✅ | ✅ | ✅ (a Container inside) |
| `Sections/X · Section · Flush` | padding 0, gap 0, horizontal: an Image beside a dark Section | ➕ | ➕ | ➕ |
| `Sections/X · Section · 2` | padded, its own 2-column layout, a Card in each column | – (500 stacks) | ➕ | ➕ (in the Container) |
| `Cards/X · Card` | the rounded card, holds one Content | ✅ 360, 400, 500 | ✅ | ✅ 1920 and the 1600 Card |
| `Columns/X · N · Shape` | bare columns of Cards, swaps with a Card | ✅ 2 · Equal | ✅ 2 · Equal, 2 · Sidebar | ✅ 2 · Equal, 2 · Sidebar, 3, 4 |
| `Content/X · Content · …` | text blocks | ✅ | ✅ | (uses 1600 Content) |

**That makes 8 new masters:** 3 Pages, 3 Flush Sections, and 2 `Section · 2`. A `Section · 3` is left out: put `Columns/1920 · 3 · Equal` into a Section's Container instead. Everything else exists and is only renamed.

## How strict?

- **Strict: where a word sits, and the radius rule.** A Section sits in a Page (or a flush Section's column). A Card always has room around it. Content always sits in a padded surface. Text sits in exactly one padded surface (rule 3), and padding comes with a background (rule 2).
- **Defaults: everything else.** Padding, gap, background, shadow and hug/fill can all change without a rename.
- **The only rename is the radius flip.** Card → radius 0 and no shadow, at full bleed, becomes a Section (rule 15, unchanged). A Section that gets a radius becomes a Card and needs room. Moving, adding or removing cards and columns (what you do most) renames nothing.
- **The presets are the definitions.** "What is a Card?" is answered by `Cards/1000 · Card`'s starting properties, as you suggested: "the strict definition is more of like the starting point".
- **Lint warns; it never blocks on a name.** It warns on a radius with no room, a Section that isn't a Page's child, and Content straight in a Page.

## (b) Alternatives

- **Name by position only** (the previous draft of this doc: a flush card keeps the name Card). Not chosen now: it hides the radius difference you want documented, and lets a rounded card sit against an edge without a warning.
- **Always wrap columns in a Columns frame.** Not chosen: you ruled it out at ~00:20 ("We wouldn't need an extra wrapper just for columns").
- **Section › Row › Column › Module** (Divi). Not chosen: "rows within sections" confused you, and "row" means three things.
- **Today's words: Section, Wrapper, Default, Content.** Not chosen: "Wrapper" does three jobs today (the columns wrapper, the 1600 cap, a vertical pile), and "Default" names the starting point, not the thing.
- **Stack and List** as layer names (Stack = gap 0, List = gap, as you first suggested). Not needed: each word decides its own gap. Outside systems also mean the opposite (their Stack has a gap: Every Layout, Braid, Chakra 8 px, Framer 10). `Content · List` stays as a master name for rows with dividers.

## (c) Nesting pictures

```
1920 · Page                          padding 0, gap 0; Scale mode 1920 Desktop on the instance
├─ Section · 2 (padded)              Light gray, section-pad
│  └─ Container                      max-width 1600, centred, vertical
│     ├─ Content                     kicker, h2, one line  ← the title above the columns
│     └─ Columns · 3 · Equal         the one wrapper: needed because the title sits above
│        ├─ Card → Content
│        ├─ Card → Content
│        └─ Card → Content
├─ Section · Flush                   padding 0, gap 0, horizontal: full bleed
│  ├─ Image                          Fill both ways, radius 0
│  └─ Section                        Dark, section-pad, radius 0  ← a flush Section's column
│     └─ Content
└─ Section · 2 (padded)              White
   └─ Container                      its own layout is 2 · Sidebar: no extra wrapper
      ├─ Column 1                    Scale mode 500 SM (the sidebar)
      │  ├─ Card → Content · Stat
      │  └─ Card → Content · Stat
      └─ Column 2 → Card → Content · Text + Media

500 · Page                           padding 0, gap 0; Scale mode 500 SM
├─ Section (padded)                  White
│  └─ Content                        kicker, h1, line, Button
├─ Section (padded)                  White
│  └─ Content                        h2, paragraph, Card (a callout, inside the padding) → Content, paragraph
├─ Section (padded)                  Light gray, gap: Cards straight in, no wrapper
│  ├─ Card → Content
│  └─ Card → Content · Stat
└─ Section · Flush                   full bleed
   └─ Image                          radius 0
```

## Your questions (~23:55), answered

1. **Section, Row or Columns?** A Section holds its columns directly. A Columns frame appears only when a title sits above the columns, or as a swap and drag target. There is no Row. Columns sit inside the Section's padding. For full bleed, use `Section · Flush`, which holds only radius-0 things.
2. **What makes a card?** Its radius (with the shadow and `pad`). Because of the radius it needs room. Without a radius, at full bleed, it is a Section. A transparent, unpadded block that holds text is Content.
3. **Zero padding and zero background: is that Content?** Yes. It is a vertical stack with `text-gap`, it may hold a Card as a callout, and it always sits in a padded surface. Every size page keeps its `Content` group; 1920 uses the 1600 Content.
4. **Stack or List?** Neither is needed as a layer name (see Alternatives).
5. **A property changes and the layer no longer fits its word?** Only the radius flip renames (Card ↔ Section). Everything else is a default. No slots, no variants.
6. **Strict or defaults?** Placement and the radius rule are strict; properties are defaults.
7. **The Scale mode.** No master sets a mode (rule 32). The mode goes on the placed Page, and when a part differs, on a Section, Container or Column, never on a Card or Content. When a layer's mode differs from its parent's, everything inside it takes the new padding, gap and radius, but its own width does not change: the parent still decides that (Fill). For example, the sidebar Column above is 500 SM inside a 1920 Page, so its cards get small padding.

## (d) Where "Wrapper" came from

**You said it first. We made it a folder name.** You wrote this at ~22:10 ([sizes, "Text ~22:10"](../owner-words-2026-11-17-sizes.md#text-2210-work-in-mastermind-mode-wrapper-not-card-the-system-picture-page-by-page-page-names--scale-modes)):

> "a wrapper to me just means like a basically zero padding, right? Like, so I think the wrapper around a grid of cards that does have gap but does not have padding, you know, you can then use that in a padded card"

Eleven minutes later (22:21, commit `56a0d05cfb`), the size-system agent made it the master group `Wrappers/` on every size page. At ~23:40 it was written into the glossary's "four words". Before that, "wrapper" was only a loose word in our docs (2026-10-13: "layout wrappers are transparent"; rule 7: "no wrapper groups"). And you had also used it for a *padded* thing: "on the 1920 pages, then we're going to want wrappers around 1920 layouts that have their own padding" ([root](../owner-words-2026-11-17-root.md)). That double meaning is why it reads as vague now.

## (e) Migration: current name → new name

These counts come from three read-only `use_figma` reads (2026-11-17), one each of 500 SM `345:2`, 1000 Default `358:2` and 1920 Desktop `367:10325`. The 1600 LG figures are taken from [size-system-proposal.md](../size-system-proposal.md).

**Masters**

| Current | New | 500 SM | 1000 Default | 1920 Desktop | 1600 LG |
|---|---|---|---|---|---|
| `Defaults/X · Default` | `Cards/X · Card` | 3 (360, 400, 500) | 1 | 1 | 1 |
| `Wrappers/X · N · Shape` | `Columns/X · N · Shape` | 1 (2 · Equal) | 2 (2 · Equal, 2 · Sidebar) | 4 (2 · Equal, 2 · Sidebar, 3 · Equal, 4 · Equal) | 0 |
| `Wrappers/400 · Stack` (a vertical pile of cards) | archive it: a padded Section spaces its Cards itself (or `Columns/400 · 1`, if it is in use) | 1 | – | – | – |
| `Sections/…`, `Content/…`, `App/…`, `.X Preview` | unchanged | 1 + 9 + 3 + 1 | 1 + 10 + 1 | 1 | 10 Content |
| **Renamed** | | **5** | **3** | **5** | **1** |
| **New** (Pages, `Section · Flush`, `Section · 2`) | | 2 | 3 | 3 | – |

That makes 14 renames and 8 new masters. Instances stay linked through a rename. The Index holds only instances. Its swap-demo note names `Defaults/500 · Default` and `Wrappers/500 · 2 · Equal`, so that text needs updating too.

**Layers and groups**

| Current | New | 500 SM | 1000 | 1920 |
|---|---|---|---|---|
| `Wrapper · max 1600` (inside `Sections/1920 · Section`) | `Container` | – | – | 1 |
| group frames `Defaults`, `Wrappers` (`Wrappers · 500`) | `Cards`, `Columns` | 3 | 2 | 2 |
| `Specimen · Defaults/…`, `Specimen · Wrappers/…` | follow the master's new name | 5 | 3 | 5 |
| `Stage · X (a Default around the Content)` | `Stage · X (a Card around the Content)` | 9 | 10 | – |
| `Default · Hero`, `Default · two Content columns`, `Default · Text + Media`, `Item · … Default …` | `Card · …` | 2 | 3 | – |
| `Column 1`–`Column 4`, `Content` | unchanged | 15 + 14 | 25 + 14 | 13 + 13 |

**Docs** to update in the same task: readme rules 2 and 15 (add "radius needs room"), 24 and 30 (they say Default and Wrappers), [glossary.md](../glossary.md), [start-here.md](../start-here.md), [index.md](../index.md), and the AI page's Glossary block `322:70`.

## (f) Open questions (at most three)

1. **Is a Section padded by default,** with `Section · Flush` as the exception (recommended), or flush by default?
2. **Card or Default?** The proposal retires "Default" for `Cards/1000 · Card`. The alternative keeps your word inside the new group: `Cards/1000 · Default`.
3. **May a Section sit inside a flush Section** (as the dark text half of a split band), or should that half have its own name?

## Sources

- Divi: [Sections, rows and modules](https://dividuck.com/understanding-sections-rows-and-modules-in-the-divi-theme/), [Rows in Divi 5](https://www.elegantthemes.com/documentation/divi/rows/): Section › Row › Column › Module; a Row defines the columns.
- Elementor: [Introducing flexbox Containers](https://elementor.com/blog/introducing-flexbox-containers/), [Container vs Section](https://happyaddons.com/elementor-container-vs-section/): Section › Column › Widget was replaced by one nestable Container that carries its own layout, the same move as "a Section holds its columns directly".
- Webflow: [Section vs Container vs Div Block](https://university.webflow.com/videos/section-container-div), [Client-First core structure](https://finsweet.com/client-first/docs/core-structure-strategy): Section is full width, Container is the centred max width, Div is anything.
- Framer: [Frames and Stacks](https://www.framer.com/academy/lessons/framer-fundamentals-stacks-and-relative-positioning), [default gap 10](https://www.framer.community/c/support/set-default-gap-for-stacks-and-grids).
- Bootstrap: [Grid](https://getbootstrap.com/docs/5.3/layout/grid/) (container › row › col; "rows are wrappers for columns"), [Gutters](https://getbootstrap.com/docs/5.2/layout/gutters/) (`g-0` removes the gap). Tailwind has no layout words, only `container` (a max width) and `gap-*`/`space-y-*` utilities.
- Every Layout: [Layouts](https://every-layout.dev/layouts/), [The Stack](https://every-layout.dev/layouts/stack/): its Stack puts space between children.
- Braid (SEEK): [Layout foundation](https://seek-oss.github.io/braid-design-system/foundations/layout/), [Stack](https://seek-oss.github.io/braid-design-system/components/Stack/), [Columns](https://seek-oss.github.io/braid-design-system/components/Columns/): Stack, Columns and Inline each take a `space`, and Box is the low-level box.
- Chakra: [Stack](https://www.chakra-ui.com/docs/components/stack): the default gap is 8 px.
- Material 3: [Cards](https://m3.material.io/components/cards/specs): elevated, filled, outlined; a card is a surface, with or without a shadow.
- Untitled UI: [Section headers](https://www.untitledui.com/components/section-headers): the header is its own block above the content, as the title is above the columns here.
- Our CSS: `public/framework/framework.css` (`.flex.auto` at line 951, `.cols` at 981, `.card` at 492 and 525).
