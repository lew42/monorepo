# Layout vocabulary v6: a frame holding sections (proposal, 2026-11-18)

**Status: a proposal, ready to test with templates. Nothing in Figma was renamed or changed** (rule 31). It is built on the owner's words, in [owner-words-2026-11-17-naming.md](../owner-words-2026-11-17-naming.md): ~23:55 ("I just want to finalize the system"), ~00:05 (the rename tax), ~00:20 (Page per size, columns on the section, radius needs room) and ~00:35 (named sections, defaults not definitions, test it). Once approved, it replaces the "four words" line in [glossary.md](../glossary.md).

## The model in five lines

1. **Every container is a frame holding a stack of sections.** A Page is a frame; so is a Card. The sections are full width with zero gap.
2. **The frame carries the treatment:** background, radius, shadow, width. Square and full bleed makes a **Page**. Rounded with a shadow makes a **Card**. That is the whole difference, so a Page can become a Card and back by changing the frame ("a page could actually become a card almost").
3. **Sections carry the padding, and are named by their role:** Header, Body, Footer, Hero, Media. A section can hold columns directly.
4. **Inside a section, text and media go in a Content:** a bare stack with no padding, no fill and `text-gap`.
5. **Radius needs room.** Anything rounded sits inside padding or a gap, never against an edge. Full bleed means radius 0.

```
Page or Card (the frame: background, radius, shadow, width)
└─ Header / Body / Footer …   (sections: full width, zero gap, they carry the padding)
   └─ Content                  (bare text and media, text-gap)  or  columns of Cards / Content
```

## The words: five, plus role names

| Word | What it is | Defaults (drag it out and this is what you get) | Holds |
|---|---|---|---|
| **Page** | the square, full-bleed frame: one screen at one size | page background, radius 0, no shadow, padding 0, gap 0, Fill width, Hug height (pages have any height). The design's Scale mode is set on the placed Page | sections |
| **Card** | the rounded frame | Scheme fill (White), `radius` + the card shadow, clip on, padding 0, gap 0, Fill width, Hug height | sections (usually one Body) |
| **Section** | one full-width band of a frame, named by its role | no radius, padding `section-pad` in a Page and `pad` in a Card, transparent unless it sets its own Scheme (a dark Header), Hug height. Vertical, or horizontal + wrap when it holds columns | Content, Cards, columns, a Container |
| **Content** | bare text and media | no fill, padding 0, gap `text-gap`, vertical, Fill width, text max `measure` | text, images, buttons, icon items, rows, a Card as a callout |
| **Container** | the centred 1600 cap inside a wide section | no fill, padding 0, Fill, max width `max-width` (1600, Constants), centred | what the section would hold |

**Role names for sections** (the layer name; a section's kind is its role):
- **Header**, **Body** (the padded middle, the default), **Footer**: in Cards and Pages.
- **Hero** and **Media** (flush: padding 0, holds a full-bleed image): mostly in Pages.
- Rename a Body to what it holds (`Features`, `Pricing`) when that helps; it is still a section.

**Column** stays as the name of a child in a columns layout (`Column 1`, `Column 2`), as today. A separate **Columns** frame appears only when a title sits above the columns (a frame can't be vertical and horizontal at once), or as a bare swap target.

## Content or Body: Body is the padded section, Content stays the bare stack

**Recommendation:** the padded middle section is **Body**, and **Content** keeps its current meaning, the bare text stack.
- **No word gets two meanings,** and the 29 existing `Content/…` masters keep their names (9 on 500 SM, 10 on 1000, 10 on 1600).
- **Header / Body / Footer is the standard card anatomy:** Bootstrap's `.card-header`, `.card-body` and `.card-footer`, HTML's `header` and `footer`. Your ~00:35 words allow it: "a card with a header, footer, and a body ... makes sense as well".
- **The flip** (Content = the padded area, the bare stack renamed Stack) reads well too ("content to me sounds like a section that has padding"). But it renames 29 masters and every `Content` layer, and "Stack" means a stack *with* a gap in most other systems.

## Nesting pictures

```
1920 · Page                          square, page background, gap 0; Scale mode 1920 Desktop on the instance
├─ Header                            section-pad, White
│  └─ Container (1600) → Content     logo, nav, Button
├─ Hero                              section-pad, Dark
│  └─ Container → Content            h1, line, Button
├─ Body · 3 (Features)               section-pad, Light gray
│  └─ Container                      vertical
│     ├─ Content                     the title above the columns
│     └─ Columns · 3 · Equal         needed: the title sits above
│        ├─ Card → Body → Content
│        ├─ Card → Body → Content
│        └─ Card → Body → Content
├─ Media                             flush: padding 0, a full-bleed image, radius 0
└─ Footer                            section-pad, Dark
   └─ Container → Content

500 · Page                           gap 0; Scale mode 500 SM
├─ Header → Content
├─ Body                              Light gray: Cards straight in, the section's gap spaces them
│  ├─ Card → Body → Content
│  └─ Card → Body → Content · Stat
└─ Footer → Content

1000 · Card                          rounded, shadow, White, clip on
├─ Header                            pad; may set its own Scheme (a gray strip); square corners, clipped by the Card
│  └─ Content                        icon item + title
├─ Body                              pad
│  └─ Content                        paragraph, list, a Card as a callout (inside the padding)
└─ Footer                            pad
   └─ Content                        Buttons
```

## Does FRAME + SECTIONS hold? Yes, with four caveats

| Test (his words) | Result |
|---|---|
| "a card itself could have full width sections with zero gap" | ✅ the same stack of sections in both frames |
| "a page could actually become a card almost" | ✅ change the frame's radius, shadow and width; the sections stay |
| "cards and the sections ... can kind of be interchangeable ... the treatment ... what kind of frame it has" | ✅ the treatment lives on the frame only |
| named sections: header, content/body, footer | ✅ role names on sections |
| pages and page sections have variable height | ✅ everything Hugs its height |
| moving, adding or removing cards and columns | ✅ nothing is renamed |
| defaults, not definitions: "you already have a kind of understanding of what it does and how it's supposed to nest" | ✅ every word is a preset with its nesting shown above |

The caveats:
1. **The padding token depends on the frame.** A Page's sections use `section-pad`; a Card's use `pad`. So there are two small preset families: page sections (`Sections/…`) and the sections built into each Card master. When you hand-convert a Card into a Page, rebind its sections' padding, or keep `pad` for a tighter page.
2. **The simplest card is one layer deeper:** `Card → Body → Content`, where today's Default is `Card → Content`. That layer is what makes a Header or Footer a plain drop-in, and it keeps the names right after a detach. The alternative, a padded Card frame with no sections, gives two kinds of Card, which is worse.
3. **Rule 2 needs a new wording.** Today it says padding comes with its own background. Here a Body is padded but transparent: it shows its frame's fill. Proposed: "the frame carries the background, sections carry the padding, and a section sets its own fill only when it should look different". Rule 3 (text in exactly one padded surface) stands: text sits in exactly one padded section. Lint's same-on-same and padding checks would follow.
4. **A wide section needs a Container** for the 1600 cap (1920 only). At 500 and 1000 it is left out.

## How strict?

**Defaults plus nesting.** A word is its preset. Change padding, gap, background, shadow or height freely, and nothing is renamed. Converting a Card into a section or a Page is done by hand, by changing the frame (as you said, the simplest way). Only two rules stay firm, because they catch visible bugs:
- **Radius needs room.** Nothing rounded touches an edge.
- **Text sits in exactly one padded section.**

Lint warns about these two and never fails a name.

## Presets per size (for the template test)

**Names follow rule 30 (`<Group>/<size> · <Name>`). ✅ = exists today (renamed); ➕ = new.**

| Preset | 500 | 1000 | 1920 |
|---|---|---|---|
| `Pages/X · Page`: Header, Body, Footer | ➕ | ➕ | ➕ |
| `Sections/X · Header`, `· Body`, `· Footer` (section-pad) | Body ✅ (was `Section`), Header and Footer ➕ | same | same, each with a Container |
| `Sections/X · Body · 2` (its own 2 columns of Cards) | – (500 stacks) | ➕ | ➕ |
| `Sections/X · Media` (flush, full-bleed image) | ➕ | ➕ | ➕ |
| `Cards/X · Card`: Body → Content (pad) | ✅ rebuilt from the 360, 400 and 500 Defaults | ✅ rebuilt | ✅ rebuilt (and 1600) |
| `Cards/X · Card · Header + Footer` | – | ➕ | – |
| `Columns/X · N · Shape` (bare, the swap demo) | ✅ was `Wrappers/` | ✅ | ✅ |
| `Content/X · Content · …` | ✅ unchanged | ✅ | (1920 uses the 1600 Content) |

The template test should show, per size, one Page made only from these presets, one Card with Header and Footer, and the hand conversion of a Card into a Page band (radius 0, no shadow, padding token rebound).

## The words line up with the site's CSS

| Figma | Web |
|---|---|
| Page | a `Page` ([core/Page](/framework/core/Page/readme.md)); its `background` word is the frame's fill |
| Card | `.card`: surface, `--radius`, shadow. The web `.card` pads itself and has a border, so the web's card is the Card plus its Body in one element |
| a section with columns | `.flex.auto.gap`; `2 · Equal` / `2 · Sidebar` = `.cols.half` / `.cols.main-aside` |
| Container | the Page's `width: "wide"` (`.page-w-wide`) |
| Content | plain flow, or `.flex.v` with the text gap |

## Alternatives (the earlier drafts of this doc)

- **Seven words, named by position** (Page › Section › Container › Columns › Card › Content, with a flush card keeping the name Card). Superseded: a Card and a Page were different words for the same shape, which you saw at ~00:35.
- **Card vs Section split by radius only** (a Card is rounded and needs room; a Section is square and touches the edges). Kept as the radius rule, but sections now live *inside* frames, so a Card can have them too.
- **Section › Row › Column** (Divi). Not chosen: "rows within sections" confused you.
- **Today's words** (Section, Wrapper, Default, Content). Not chosen: Wrapper does three jobs, and Default names the starting point, not the thing.

## Where "Wrapper" came from

**You said it first. We made it a folder name.** You wrote this at ~22:10 ([sizes, "Text ~22:10"](../owner-words-2026-11-17-sizes.md#text-2210-work-in-mastermind-mode-wrapper-not-card-the-system-picture-page-by-page-page-names--scale-modes)):

> "a wrapper to me just means like a basically zero padding, right? Like, so I think the wrapper around a grid of cards that does have gap but does not have padding, you know, you can then use that in a padded card"

Eleven minutes later (22:21, commit `56a0d05cfb`), the size-system agent made it the master group `Wrappers/` on every size page. At ~23:40 it was written into the glossary. Before that it was only a loose word in our docs, and you had also used it for a padded thing ("wrappers around 1920 layouts that have their own padding", [root](../owner-words-2026-11-17-root.md)). That double meaning is why it reads as vague.

## Migration (counts from three read-only reads, 2026-11-17)

These counts come from read-only reads of 500 SM `345:2`, 1000 Default `358:2` and 1920 Desktop `367:10325`. The 1600 LG figures are taken from [size-system-proposal.md](../size-system-proposal.md).

| Current | New | 500 SM | 1000 | 1920 | 1600 |
|---|---|---|---|---|---|
| `Defaults/X · Default` (Card → Content) | `Cards/X · Card` (Card → Body → Content): a rebuild | 3 | 1 | 1 | 1 |
| `Wrappers/X · N · Shape` | `Columns/X · N · Shape` | 1 | 2 | 4 | 0 |
| `Wrappers/400 · Stack` | archive it: a Body spaces its Cards itself | 1 | – | – | – |
| `Sections/X · Section` | `Sections/X · Body` | 1 | 1 | 1 | – |
| `Wrapper · max 1600` (layer) | `Container` | – | – | 1 | – |
| `Content/…`, `App/…`, `.X Preview`, `Column 1–4` | unchanged | | | | |

**Docs** to update in the same task as the rollout: readme rules 2 (the new wording, caveat 3), 15, 24 and 30, [glossary.md](../glossary.md), [start-here.md](../start-here.md), [index.md](../index.md), and the AI page's Glossary block `322:70`.

## Open questions (at most three)

1. **Body for the padded section, Content kept for the bare stack** (recommended), or flip them?
2. **Rule 2's new wording:** the frame carries the background and sections carry the padding. OK?
3. **The one-layer-deeper card** (`Card → Body → Content`): fine, or keep a padded one-layer card for the simplest case?

## Sources

- Bootstrap: [Cards](https://getbootstrap.com/docs/5.3/components/card/) (`.card-header`, `.card-body`, `.card-footer`), [Grid](https://getbootstrap.com/docs/5.3/layout/grid/) (container › row › col).
- Webflow: [Section vs Container vs Div Block](https://university.webflow.com/videos/section-container-div): Section is full width, Container is the centred max width.
- Elementor: [flexbox Containers](https://elementor.com/blog/introducing-flexbox-containers/): one nestable container that carries its own layout, which replaced Section › Column.
- Divi: [Sections, rows and modules](https://dividuck.com/understanding-sections-rows-and-modules-in-the-divi-theme/).
- Framer: [Stacks](https://www.framer.com/academy/lessons/framer-fundamentals-stacks-and-relative-positioning), [default gap 10](https://www.framer.community/c/support/set-default-gap-for-stacks-and-grids). Every Layout: [The Stack](https://every-layout.dev/layouts/stack/). Braid: [Stack](https://seek-oss.github.io/braid-design-system/components/Stack/). Chakra: [Stack](https://www.chakra-ui.com/docs/components/stack) (8 px default). In all four, a Stack has a gap.
- Material 3: [Cards](https://m3.material.io/components/cards/specs) (elevated, filled, outlined: the card is the frame's treatment).
- Untitled UI: [Section headers](https://www.untitledui.com/components/section-headers).
- Our CSS: `public/framework/framework.css` (`.card` at line 492, `.flex.auto` at 951, `.cols` at 981).
