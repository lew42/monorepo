# Layout vocabulary v6: name a layer by where it sits (proposal, 2026-11-17/18)

**Status: a proposal. Nothing in Figma was renamed or changed** (rule 31). It answers the owner's asks: "I don't actually mind what the words are called. I just want to finalize the system" (~23:55), and the worry about a rename tax at ~00:05 ([naming words](../owner-words-2026-11-17-naming.md), last two sections; also [sizes ~23:40](../owner-words-2026-11-17-sizes.md#voice-2340-2026-11-17-sections-padding-max-width-1920-content-from-1600)). Once approved, it replaces the "four words" line in [glossary.md](../glossary.md).

**The idea in one line:** a layer's name says *where it sits* (its level), not what it looks like. Its properties are only defaults you may change freely. A layer is renamed only when it moves to another level.

```
Page → Section → (Container) → (Columns → Column) → Card → Content
```

## (a) The recommended words: seven

| Word | Where it sits (the rule) | What it holds | Defaults (change freely) |
|---|---|---|---|
| **Page** | the top of a design; one per screen at one size | Sections | the page background (`tint` or a Scheme mode), padding 0, gap 0, vertical, Fill. **This is where the design's Scale mode is set.** |
| **Section** | a direct child of a Page | Container, Columns, Cards, Content | optional background, `section-pad-x/-y`, gap `gap`, no radius, no shadow, Fill width, Hug height |
| **Container** | the only child of a Section that is wider than its content (1920) | Columns, Cards, Content | no background, padding 0, gap `gap`, Fill, max width `max-width` (1600, Constants), centred |
| **Columns** | in a Section, Container or Card; it is only the direct wrapper around columns | 2 or more Column, nothing else | no background, padding 0, gap `gap` (0 = joined), horizontal, Fill, Hug |
| **Column** | only inside Columns | Cards, Content, or another Columns | no background, padding 0, gap `gap`, vertical, Fill (its share) |
| **Card** | in a Section, Container, Column, or Content (as a callout) | Content (usually one), Columns | a Scheme fill that differs from its parent, `pad-x/-y`, `radius` + the card shadow, Fill width, Hug height |
| **Content** | inside a Card or a Section, never straight in a Page | text, images, buttons, icon items, rows, a Card as a callout | no background, padding 0, gap `text-gap`, vertical, Fill width, text max `measure` |

**Three rules stay strict, because they catch real visual bugs.** Lint can check all three.
1. The name follows the position. A Section's parent is a Page; a Card is never a Page's child; Content is never a Page's child; Columns holds only Columns' columns.
2. Padding comes only with a background (rule 2).
3. Text sits in exactly one padded surface (rule 3).

Everything else is a default.

**Scaffolding words stay as they are:** Root, Root column, Specimen and Stage, Preview, Masonry, and the group titles. They organize the canvas; they are not part of a design.

## Does "name by where it sits" hold? Yes, with three amendments

Tested against each of the owner's examples:

| His example | What happens under this proposal | Holds? |
|---|---|---|
| "what if you do want gap between your sections?" | It's a gap on the Page. The Sections are still the Page's children, so nothing is renamed. | ✅ |
| "quickly add padding to the parent" | It's padding on the Page (it has a background, so rule 2 is fine). Still Sections. | ✅ |
| a full-width card loses its radius and shadow and starts to look like a section | It keeps the name Card, because it still sits where a Card sits. His ~00:05 words: a card "presumably has padding and a background color, even though it might not anymore" | ✅ (this replaces rule 15's "rename it Section") |
| "you would unlikely put a section inside of a card ... they're called content" | A Section can only be a Page child, so a padded block inside a Card is Content | ✅ |
| moving, adding or removing cards and columns (what he does most) | They stay at the same level, so nothing is renamed | ✅ |
| detaching a pre-built block keeps its layer names | The names describe the level, which a detach doesn't change | ✅ |
| a card dragged up to be a Page child | It becomes a Section: rename it, or swap it to the Section preset | rename, but only on a move between levels |
| "is every layer that gets padding called Card?" | No. A padded Section, a padded Page and a Content with padding added are all fine | ✅ |

The three amendments to the candidate ladder:
1. **A Card may also sit in Content** (his "a stack of text could have a card ... dropped into it") and in a Column. So the ladder is a default order, not a straight line.
2. **Container** sits between a Section and its children, but only where the Section is wider than the content (1920 holding 1600). At 500 and 1000 it is left out.
3. **Stack and List are not layer names.** Under this proposal each level already decides its own gap. A Page is the zero-gap stack of Sections, a Section or a Column is the spaced pile of Cards, and Content is the text stack. A list of rows with dividers is Content with gap 0 (the `Content · List` master stays). This also avoids the clash with outside systems, where a "Stack" has a gap (Every Layout, Braid, Chakra 8 px, Framer 10), the opposite of the owner's suggested default.

**Card and Section are the same kind of thing, treated differently** (his ~00:05). Both are a padded block with a background and one Content inside. Their presets differ only in defaults: `section-pad`, no radius and no shadow for a Section; `pad`, radius and shadow for a Card. Both keep a child named `Content`, so swapping one preset for the other keeps the overrides. There are two presets, not one master with a toggle: no variants, no slots.

## How strict?

- **Names are strict about position and loose about properties.** Change radius, shadow, padding, gap or background as much as you like: no rename. Rename only when the layer moves to another level.
- **Lint checks positions, never properties.** It flags a Card that is a Page's child, Content straight in a Page, or a Columns holding something other than columns. Plus rules 2 and 3. A name never fails lint because of a tweak.
- **The presets are the definitions.** "What is a Card?" is answered by `Cards/1000 · Card`'s starting properties, as the owner suggested: "the strict definition is more of like the starting point".
- **The rename tax is close to zero.** A rename happens only on a move between levels, which he says is rare.

## Page: harmonized with the code's Page class

In code, a `Page` ([core/Page](/framework/core/Page/readme.md)) is one url's screen: its content plus "the six page words" ([doc/words.md](/framework/core/Page/doc/words.md)). Three of those words map straight onto Figma:
- the code's `background` is the Page's fill;
- `surface: "card"` is a Card's fill;
- `width: "reading" | "wide" | "full"` does the Container's job (how much of the screen the content takes).

So a Figma **Page** is what a code Page renders at one width: a stack of Sections. It is the one frame where a design sets its Scale mode.

**Should there be Page masters per size? Yes, three, but they are a low priority.** `Pages/500 · Page`, `Pages/1000 · Page` and `Pages/1920 · Page` would each be a gap-0 stack holding two Section presets. They give every design the same top frame and name, and the obvious place to set the mode. Rule 32 still applies: the master sets no mode, and you set it on the instance you place (one click). Don't build Page templates per layout: compose those from Sections.

## How few words?

- **Seven** covers everything: Page, Section, Container, Columns, Column, Card, Content.
- **Six** is possible by dropping Container: let the 1920 Section's own padding do the job (160 a side). The owner rejected that at ~23:40 ("you either need ... 160 pixels of padding or you need a max width"), so Container stays.
- **Column** is already in use: every Columns master has layers `Column 1`…`Column 4`. It costs nothing to keep.
- Words that aren't needed: Wrapper, Row, Stack and List (as layer names), and Default (see the open question below).

## (b) Alternatives

- **Name by properties** (the first draft of this doc: a Card has a fill, pad and radius; a flush one is renamed Section; Stack = gap 0, List = gap). Not chosen: every tweak becomes a rename, which is exactly the tax he worried about at ~00:05.
- **Section › Row › Column › Module** (Divi; Elementor before 2022). Not chosen: he found "rows within sections" confusing, and "row" means three things (a wrapper of columns, a flex direction, a table line).
- **Keep today's words: Section, Wrapper, Default, Content.** Not chosen: "Wrapper" does three jobs today, the columns wrapper (`Wrappers/1000 · 2 · Equal`), the 1600 cap (`Wrapper · max 1600`) and a vertical pile (`Wrappers/400 · Stack`); and "Default" names the starting point, not the thing.

## (c) Nesting pictures

```
Page · 1920                          gap 0, Scale mode 1920 Desktop (set on the instance)
├─ Section · Intro                   Light gray, section-pad
│  └─ Container                      max-width 1600, centred
│     ├─ Content                     kicker, h2, one line  ← the title above the columns
│     └─ Columns · 3 · Equal         gap
│        ├─ Column 1 → Card → Content
│        ├─ Column 2 → Card → Content
│        └─ Column 3 → Card → Content
├─ Section · Split                   padding 0 by override; still a Section
│  └─ Columns · 2 · Equal            gap 0
│     ├─ Column 1 → Image            Fill both ways
│     └─ Column 2 → Card             Dark, radius 0, no shadow; still a Card
│                    └─ Content
└─ Section · Dashboard               White, section-pad
   └─ Container
      └─ Columns · 2 · Sidebar
         ├─ Column 1                 Scale mode 500 SM (the sidebar)
         │  ├─ Card → Content · Stat
         │  └─ Card → Content · Stat
         └─ Column 2 → Card → Content · Text + Media

Page · 500                           gap 0, Scale mode 500 SM
├─ Section · Header                  White, section-pad; no Container (500 is narrower than the cap)
│  └─ Content                        kicker, h1, line, Button
├─ Section · Article                 White, section-pad
│  └─ Content                        h2, paragraph, Card (a callout) → Content, paragraph
├─ Section · Cards                   Light gray, section-pad, gap: the Section itself spaces them
│  ├─ Card → Content
│  └─ Card → Content · Stat
└─ Section · Settings                White, section-pad
   └─ Content · List                 gap 0, dividers, Icon.Item rows
```

## Your seven questions (~23:55), answered

1. **Section, Row or Columns?** Columns is the direct wrapper around columns, as you leaned. There is no Row. The title above three columns sits in the Section (or its Container), above the Columns. Columns sit inside the Section's padding. For full width, zero the Section's padding: it is still a Section, because it is still a Page child.
2. **What makes a card?** Where it sits: inside a Section, Container, Column or Content. Its preset has a fill, `pad`, radius and shadow, and it may lose any of them and keep the name. A transparent, unpadded block that holds text is Content.
3. **Zero padding and zero background: is that Content?** Yes. It is a vertical stack with `text-gap`, and it may hold a Card. Every size page keeps its `Content` group: one block at the size, content inside at standard padding. 1920 uses the 1600 Content; there is no 1920 Content.
4. **Stack or List?** Neither is needed as a layer name: each level decides its own gap (above).
5. **One property changes and the layer no longer fits its word.** Under this proposal it still fits: the word is about position, so nothing is renamed. Only a move to another level renames it (or swaps it to that level's preset). No slots.
6. **Strict rules or defaults?** Position is strict; properties are defaults (see "How strict?").
7. **The Scale mode.** No master sets a mode (rule 32). The mode goes on a frame that decides the width: the Page, and when a part differs, a Section, a Container, a Columns or a Column. It never goes on a Card or on Content. When a layer's mode differs from its parent's, everything inside it takes the new padding, gap and radius, but its own width does not change, because the parent still decides that (Fill). For example, the sidebar Column above is 500 SM inside a 1920 Page, so its cards get small padding.

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
| `Wrappers/400 · Stack` (a vertical pile of cards) | `Columns/400 · 1` (the one-column case); or archive it and let the Section space the cards | 1 | – | – | – |
| `Sections/…`, `Content/…`, `App/…`, `.X Preview` | unchanged | 1 + 9 + 3 + 1 | 1 + 10 + 1 | 1 | 10 Content |
| new: `Pages/X · Page` (optional, low priority) | – | +1 | +1 | +1 | – |
| **Masters renamed** | | **5** | **3** | **5** | **1** |

That makes 14 renames in total. Instances stay linked through a rename. The Index holds only instances. Its swap-demo note names `Defaults/500 · Default` and `Wrappers/500 · 2 · Equal`, so that text needs updating too.

**Layers and groups**

| Current | New | 500 SM | 1000 | 1920 |
|---|---|---|---|---|
| `Wrapper · max 1600` (inside `Sections/1920 · Section`) | `Container` | – | – | 1 |
| group frames `Defaults`, `Wrappers` (`Wrappers · 500`) | `Cards`, `Columns` | 3 | 2 | 2 |
| `Specimen · Defaults/…`, `Specimen · Wrappers/…` | follow the master's new name | 5 | 3 | 5 |
| `Stage · X (a Default around the Content)` | `Stage · X (a Card around the Content)` | 9 | 10 | – |
| `Default · Hero`, `Default · two Content columns`, `Default · Text + Media`, `Item · … Default …` | `Card · …` | 2 | 3 | – |
| `Column 1`–`Column 4`, `Content` | unchanged | 15 + 14 | 25 + 14 | 13 + 13 |

**Docs** to update in the same task: readme rules 15 (a flush card keeps the name Card), 24 and 30 (they say Default and Wrappers), [glossary.md](../glossary.md), [start-here.md](../start-here.md), [index.md](../index.md), and the AI page's Glossary block `322:70`.

## (f) Open questions (at most three)

1. **Name by where it sits** (this proposal) rather than by properties. OK? It means a flush, shadowless card keeps the name Card, which reverses rule 15's "rename it Section".
2. **Card or Default?** The proposal retires "Default" for `Cards/1000 · Card`. The alternative keeps your word inside the new group: `Cards/1000 · Default`.
3. **Build the three Page masters** (500, 1000, 1920), or just name each design's top frame `Page · <size>` by hand?

## Sources

- Divi: [Sections, rows and modules](https://dividuck.com/understanding-sections-rows-and-modules-in-the-divi-theme/), [Rows in Divi 5](https://www.elegantthemes.com/documentation/divi/rows/): Section › Row › Column › Module; a Row defines the columns.
- Elementor: [Introducing flexbox Containers](https://elementor.com/blog/introducing-flexbox-containers/), [Container vs Section](https://happyaddons.com/elementor-container-vs-section/): Section › Column › Widget was replaced by one nestable Container.
- Webflow: [Section vs Container vs Div Block](https://university.webflow.com/videos/section-container-div), [Client-First core structure](https://finsweet.com/client-first/docs/core-structure-strategy): Section is full width, Container is the centred max width, Div is anything.
- Framer: [Frames and Stacks](https://www.framer.com/academy/lessons/framer-fundamentals-stacks-and-relative-positioning), [default gap 10](https://www.framer.community/c/support/set-default-gap-for-stacks-and-grids).
- Bootstrap: [Grid](https://getbootstrap.com/docs/5.3/layout/grid/) (container › row › col; "rows are wrappers for columns"), [Gutters](https://getbootstrap.com/docs/5.2/layout/gutters/) (`g-0` removes the gap). Tailwind has no layout words, only `container` (a max width) and `gap-*`/`space-y-*` utilities.
- Every Layout: [Layouts](https://every-layout.dev/layouts/), [The Stack](https://every-layout.dev/layouts/stack/): its Stack puts space between children.
- Braid (SEEK): [Layout foundation](https://seek-oss.github.io/braid-design-system/foundations/layout/), [Stack](https://seek-oss.github.io/braid-design-system/components/Stack/), [Columns](https://seek-oss.github.io/braid-design-system/components/Columns/): Stack, Columns and Inline each take a `space`, and Box is the low-level box.
- Chakra: [Stack](https://www.chakra-ui.com/docs/components/stack): the default gap is 8 px.
- Material 3: [Cards](https://m3.material.io/components/cards/specs) (elevated, filled, outlined: a card is a surface, with or without a shadow). M3 Lists are rows with dividers and no gap.
- Untitled UI: [Section headers](https://www.untitledui.com/components/section-headers): the header is its own block above the content, as the title is above Columns here.
