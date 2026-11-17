# Naming proposal: the web's words (2026-11-17, revised at 18:00 for `X · default`)

Angle: Lew42 v2 has to become HTML and CSS, so this proposal uses the web's vocabulary. It answers [naming-brief-2026-11-17.md](../naming-brief-2026-11-17.md) and follows the owner's words in [owner-words-2026-11-17-naming.md](../owner-words-2026-11-17-naming.md), including the 18:00 section. It is a proposal only; nothing in Figma was changed.

## What the web says

On the web, **the thing being laid out brings its own padding, and a layout only adds gaps.** This is the same as decided item 8 ("a Card brings its own padding; the parent doesn't decide").

- In [Every Layout](https://every-layout.dev/layouts/), only the Box (and Cover) set padding. Stack, Switcher, Sidebar, Cluster, Grid and Reel set `gap` and nothing else [V].
- Bootstrap's `.container` is a max width plus side padding, and its columns use gutters [V]. Tailwind's `container` is only a max width [K].

So there are three kinds of frame, and every frame is exactly one of them:

- **defaults and cards** pad,
- **layouts** arrange,
- **content** fills.

Three more findings shaped the words:

- **"Block" tells nothing apart.** In CSS, `display: block` only means "fills its width and starts a new line" ([MDN](https://developer.mozilla.org/en-US/docs/Glossary/Block-level_content)). Everything here fills its width. `default` says the role instead, so it's the better word.
- **Section and Card are looks, not separate masters.** HTML elements describe meaning, not appearance: `<section>` is a themed group, `<article>` a self-contained item (a card), `<aside>` sits beside the main content ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section)). Rounded or wall to wall is up to the CSS. So whether a default looks like a section or a card is the user's call (item 8, rule 15).
- **The web already names our layouts.** Every Layout's **Switcher** is a row of equal items that stacks below a threshold, gap only [V]. That is our `equal` (rule 8: wrap, Fill, min width). Its **Sidebar** is one fixed side plus one part that fills [V], our `sidebar + main`. Its **Center** (a max width) is our text column at the 720 measure.

## Glossary (for the AI page)

| Word | What it is | Padding / fill / radius |
|---|---|---|
| **Tier** | A width with a Scale mode. The named ones: 400 Mobile, 1000 Default, 1920 Desktop, 3440 Mega. The in-between ones (360, 600, 1600, 2600) go by number only, because they are the widths a column holds. | none |
| **Default** | `X · default`: one per tier, the starting point and swap placeholder. It has the default background and an h1 whose text is its own name, and nothing else. It fills its width. | Tier `pad` (it has its own background, rule 2). Radius 0. |
| **Card** | `card` (16:364): what you swap a default to when it should look like a card. One master, because cards don't scale (see [research/modes.md](../research/modes.md)). HTML `<article>`. | Its own pad, white, with a radius |
| **Section** | Not a master. It's a default used full width and wall to wall. HTML `<section>`. | the default's |
| **Layout** | Any `X · N · shape` master. It arranges its children and never pads. Each child is the default of the tier nearest to that column's width. | None. Gap only. |
| **Equal** | `X · N · equal`: N equal children that Fill, wrap and have a min width (the Switcher). | gap only |
| **Sidebar + main** | `X · 2 · sidebar + main`: a token-width side plus one part that Fills (the Sidebar). The only uneven split built ahead of time. | gap only |
| **Content** | `content · <what>`: what goes inside a card (text, stat, list). | None, and no width |
| **Page** | `X · 1 · page`: a stack of defaults with gap 0, the one thing you detach. | none |
| **Folder** | A plain frame named `1` to `4` in Root's Masters column. It only orders the canvas. | none |

**The one nesting rule: a padded thing never sits directly inside a padded thing of the same fill.** A layout always comes between them, so nothing is padded twice (rule 3).

**Gap depends on the tier:**

- At 1920 and wider, `equal` has gap 0, so the children read as full-height sections.
- At 1600 and narrower, it has the `gap` token, so the children read as separate cards.

Joined cards at the small tiers are a one-off gap override. They are not built ahead of time.

The specimen (item 7) is the default placed on a light ground.

## Formula

```
X · default                 one per tier, at the top of Root's Masters column
X · N · <shape>             in folder N   (shape: equal, sidebar + main, centred, text column, page, app bar …)
content · <what>            no width
card                        no tier
```

- X is the drawn width, as a number only.
- N is the number of children side by side, the same as its folder.

**The names do the sorting.** [kit-structure.md](../kit-structure.md) found the swap menu groups masters by page and top-level frame only. The folders inside Root probably won't show in it, so the shared prefix keeps the list in order: `1920 · 1 ·` comes before `1920 · 2 ·`. This needs one check in the Figma UI.

**The second way to browse is the swap search box.** Typing "sidebar" lists the sidebar at every tier, so no master needs to be duplicated. The swap menu also opens on the current master's page, so you swap within a tier, which replaces rule 24's folder-per-kind.

## Usage demo: four swaps

```
1. Drag 1920 · default                     → [1920 · default]            "1920 · default", full width, light
2. Swap it to 1920 · 2 · equal              → [1920 · 2 · equal]
                                                [1000 · default] [1000 · default]      two 960 halves, gap 0
3. Swap the right half to 1000 · 2 · equal  → [1000 · default] [1000 · 2 · equal]
                                                                  [600 · default] [600 · default]   gap token
4. Swap one 600 · default to card,           → … [card > content · stat] [600 · default]
   then its content to content · stat         (or the left half to 1000 · 1 · text column)
```

Every layer reads as its own master name, so the layers panel shows the design's structure (item 2). Overrides carry across a swap when the child layer names match. That means `equal` ↔ `sidebar + main` keeps most of what was inside; this needs testing once.

## Trees

```
1920 Desktop / Root
  Root Column - 1920 Desktop                 title, 1920 mode › .1920 Desktop Preview
  Root Column - Masters
    1920 · default                          NEW, replaces Res.1920 Desktop Set (100:9888)
    1
      1920 · 1 · centred                    NEW: 1920 · default overridden to section-pad, holding one 1600 · default (item 4's nesting)
      1920 · 1 · page                       was 1920 Page (43:8103): stack, gap 0, 3 × 1920 · default
    2
      1920 · 2 · equal                      NEW: gap 0, 2 × 1000 · default
      1920 · 2 · sidebar + main             NEW, static: 400 · default + 1600 · default (Layout.Sidebar Set stays on Elements for prototypes)
    3
      1920 · 3 · equal                      NEW: gap 0, 3 × 600 · default
  Root Column - Specimens
  Archive (hidden)                          + Res.1920 Desktop Set, Page (51:9277), image 1 (228:7335)

1000 Default / Root
  Root Column - 1000 Default                 title, 1000 mode › .1000 Default Preview
  Root Column - Masters
    1000 · default                          NEW: folds Section 180:617, Section · Slot 242:12046, Res.1000 Default Set 100:9677
    1
      1000 · 1 · text column                was Text column (242:3970); the Actions wrapper is cut and the Button sits directly inside
    2
      1000 · 2 · equal                      was Containers/2 columns (180:560): gap token, Cards → 2 × 600 · default
      1000 · 2 · sidebar + main             was Nav + main (100:2164): Region wrappers cut, 360 · default + 600 · default
    3
      1000 · 3 · equal                      was Containers/3 columns (180:583): 3 × 360 · default
  Root Column - Content                     content · text, text + button, stat, list, two columns (180:516–541)
  Root Column - Specimens
  Archive (hidden)                          + Two cards, Three cards, Text column · old, Containers/1 column (180:548)
```

## What each column holds

A column holds the default of the tier whose measured range contains its width. The ranges come from the [readme](../../readme.md): 600 holds about 480–800, 400 about 340–560 and 360 about 320–400.

| Column | Holds |
|---|---|
| 1920 / 2 = 960 | 1000 · default |
| 1920 / 3 = 640 | 600 · default |
| 1600 / 2 ≈ 790 | 600 · default |
| 1600 / 3 ≈ 520 | 600 · default |
| 1600 / 4 ≈ 385 | 400 · default |
| 1000 / 2 ≈ 490 | 600 · default |
| 1000 / 3 ≈ 320 | 360 · default |

How the brief's two column layouts (question 3) come out:

- **(a) A padded section holding content columns** is `1920 · 1 · centred`, with its 1600 default swapped to `1600 · 2 · equal`.
- **(b) Full-height, full-width columns** is `1920 · 2 · equal`.

Built for each tier: `default`, `2 · equal`, `2 · sidebar + main`, `3 · equal`, plus `4 · equal` at 1600 and wider.

## Adding a section, and morphing a layout

**Adding a section.** A page on the web is a stack of `<section>`s, and each page is a one-off. So: place `1920 · 1 · page`, **detach it once**, then Ctrl+D a default to add a section and swap it. The children stay instances. Detach the page, never its parts. The alternative was a slot on the page; it was rejected because item 5 says no slots.

**Morphing.** Swap at the level that should change: a section, one column, or a card's content. If you're changing structure rather than content (rule 22), detach that one instance and save it as a new master, `X · N · <new shape>`.

## Migration cost

The counts come from the [layer audit](../layer-audit-2026-11-17.md):

- **Defaults:** build 8 `X · default` masters next to the 8 `Res.<size> Set`s, swap the Sets' instances over, then archive the Sets.
- **Wrappers:** cut 34 (27 `Region ·`, 1 `Actions`, 3 `Grid · Screens`, 3 `Row · 2`).
- **Renames:** about 28. `columns`, `two/three cards` and `stat tiles` become `equal`, and `nav + main` and `rail + main` become `sidebar + main`.
- **Children:** swap about 16 Card children in layouts to defaults.
- **Preview shells:** turn about 20 hand-made shells in the previews into `card` + content.
- **New masters:** add about 10.
- **Archive:** 10 duplicates.

That is about 3 `use_figma` calls per page, roughly 24 in all, or about an eighth of the 200-a-day budget. Pilot on 1000 Default first, one page at a time (rule 14). Modes stay under rule 19 until the card-token split in [research/modes.md](../research/modes.md) lands; after it, a default or card looks the same wherever it is placed.

## Why this is the simplest

There are three kinds of frame, and the name says which one you're holding:

- a default or a card brings its own padding,
- a layout only arranges,
- content fills.

So nobody has to ask "does the parent pad?", and we need no padded or unpadded versions, no variants and no property. This is how HTML and CSS already work, so the Figma tree is the code tree: `section.default > div.equal > article.card > content`. Your View classes can reuse the same words. One formula names everything and sorts the swap menu without extra folders. One default per tier reaches the whole layout space by swapping down a tier at a time, and the in-between tiers earn their place as column widths.

Sources: [Every Layout Switcher](https://every-layout.dev/layouts/switcher/), [Sidebar](https://every-layout.dev/layouts/sidebar/) [V]. Box and Center are behind a paywall, so I read them through the [Tailwind Every Layout plugin](https://tailwind-every-layout-plugin.netlify.app/layouts/) ("the box is a simple container with a padding"; Center sets a max width, with padding only through optional gutters) [V]. [Bootstrap containers](https://getbootstrap.com/docs/5.3/layout/containers/) [V]. MDN [block-level](https://developer.mozilla.org/en-US/docs/Glossary/Block-level_content), [`<section>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section), [`<article>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article) [K]. [V] = read in the source today; [K] = known, not re-fetched.
