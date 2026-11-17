# Naming proposal: what real Figma kits do, applied to Lew42 v2 (2026-11-17)

Answers [naming-brief-2026-11-17.md](../naming-brief-2026-11-17.md), honouring all its Decided items (including item 8, `X · default`). Proposal only: nothing in Figma changed. **[V]** = read in the kit's own docs or source; **[R]** = reported second-hand. No Figma calls were needed; the library reads in [research/figma-kits.md](../research/figma-kits.md) cover the attached kits.

## What the kits do

- **Two kinds of frame, never mixed:** a *padded surface* that holds text (Card, Section band), and an *unpadded layout* that only arranges other things. Relume nests `section_name > padding-global > padding-section > container` [R]. Untitled UI puts a 1280 container inside a 1440 frame, with the padding on the container [R]. SDS's `Flex`, `Grid` and `Section` exist only in code; in Figma they are plain auto layout, and `Card` "should be defined by its parent. Use 'fill'" [V]. Figma's own tutorial builds `Text block`, `Quote block` and `Image block`, each holding a `Content` frame [V].
- **Names say shape, not number:** SDS `Panel Image Content Reverse`, `Card Grid Pricing` [V]. Relume's `Layout 11` and `Header 50` are opaque and need a thumbnail to make sense [V]. M3 splits a window into a fixed pane and a flexible pane [R].
- **Adding a section:** the page is a plain auto layout frame, not an instance. You paste or duplicate section instances into it (Relume, Untitled, shadcn) [R]. Inside a component you add more only through a slot (SDS `Card (Slot)`) [V], or by detaching it.

## Glossary (10 words)

| Word | What it is | Padding · fill · radius |
|---|---|---|
| **Page** | `1920 Desktop`. Tier names only on 400 Mobile, 1000 Default, 1920 Desktop and 3440 Mega; the interim pages are just `360`, `600`, `1600`, `2600` | n/a |
| **Root** | the page's one wrapper ([root-spec](../root-spec.md)) | as spec |
| **Folder** | a plain frame named `1`, `2`, `3` or `4` (the column count) | none |
| **Default** | `X · default`, one per size: the default background plus one `content · title` whose text is its own name. The start of everything | **pad `pad-x/-y`, fill Scheme `fill`, radius 0** |
| **Layout** | `X · N · shape`: N columns side by side, each one a default from a smaller size | **none, none, none**; gap 0 |
| **Column** | a position inside a layout, not a component. Its layer is named `Column 1`, `Column 2` | none (its default brings its own) |
| **Content** | `content · name`: text, list, stat. It has no size, so no size in its name | none |
| **Section** | a *look*, not a master: defaults touching each other (gap 0), wall to wall | from the default |
| **Card** | a *look*: a default with a gap around it and radius overridden to `radius` (rule 15) | radius by override |
| **Specimen** | the one review frame: light gray ground, white area, a label | n/a |

**The one rule: anything that holds text pads itself; anything that holds only instances does not.** That is rule 2, and it is the kits' Card vs Container. So the parent never decides padding (Decided 8). (a), a padded band holding text columns, is a default whose content is swapped to `content · two columns`. (b), full-height columns that each pad themselves, is a layout. Joined vs separate is the layout's gap: 0 (the default, the owner's "full height, full width") or overridden to `gap`.

## Namespace

```
<size> · default                   one per size, directly in the Masters column
<size> · <N> · <shape>             in folder N; shape = equal | sidebar + main | main + aside | 1/3 + 2/3 | rails both sides
content · <name>                   size-less; on 1000 Default for now, Elements later
```

Each column holds the default of the tier nearest its drawn width (ties go up). For 1920: `2` → 1000, `3` → 600, `4` → 400. For 1000: `2` → 600, `3` → 360. Sizes always go down, so a master can never contain itself (Figma refuses that cycle).

**Browsing two ways without duplicates:** folders give you size, then count. Assets search gives you structure: `· 2 ·` finds every two-column layout and `sidebar` every sidebar [R: Assets search matches names]. No master is filed twice.

## Trees

```
1920 Desktop / Root
  Root Column - 1920 Desktop  > .1920 Desktop Preview
  Root Column - Masters
    1920 · default                    fill+pad, content · title "1920 · default"  (replaces Res.1920 Desktop Set)
    1   1920 · 1 · centred            Column 1 = 1600 · default, max 1600, centred (no padding)
        1920 · 1 · page               was 1920 Page 43:8103; its .Section remotes are swapped out
    2   1920 · 2 · equal              1000 · default ×2
        1920 · 2 · sidebar + main     400 · default + 1600 · default
    3   1920 · 3 · equal              600 · default ×3
        1920 · 3 · rails both sides   400 · default + 1000 · default + 400 · default
    4   1920 · 4 · equal              400 · default ×4
  Root Column - Specimens  > specimen ×N
  Notes · Archive (hidden: Res.1920 Desktop Set, Page 51:9277, image 1)

1000 Default / Root
  Root Column 1 - 1000 Default  > .1000 Default Preview, Swap demo
  Root Column 2 - Masters
    1000 · default                    (replaces Section 180:617, Section · Slot 242:12046, Containers/1 column, Res.1000 Default Set)
    1   1000 · 1 · text column        242:3970; the Actions wrapper is cut
    2   1000 · 2 · equal              was Containers/2 columns 180:560; 600 · default ×2
        1000 · 2 · nav + main         100:2164; 360 · default + 600 · default; the Region wrappers are cut
    3   1000 · 3 · equal              was 180:583; 360 · default ×3
    content   content · title (new), content · text, content · text + button, content · stat, content · list, content · two columns
  Root Column 3 - Demos
  Archive (hidden: Two cards, Three cards, Text column · old)
```

## Using it (the 4-step demo)

1. **Drag** `1920 · default` into your page frame. You get a 1920 band with its background and "1920 · default".
2. **Swap it** to `1920 · 2 · equal` (instance menu → `2`). Now you have two joined `1000 · default` columns.
3. **Swap one column:** Ctrl-click Column 2 and swap it to `1000 · 2 · equal`. The right half becomes two `600 · default`s.
4. **Swap again:** Ctrl-click Column 1's title and swap it to `content · text + button`. Want cards instead? Override the layout's gap to `gap` and the defaults' radius to `radius`.

The path you then see in the layers panel: `1920 · 2 · equal / Column 2 / 1000 · 2 · equal / Column 1 / content · title`.

**Adding a section or card:** your own page frame takes children, so Ctrl+D a section there. Inside an instance, **detach the layout**. A layout holds only instances and a gap, so detaching it loses nothing: its columns stay linked. Then Ctrl+D a column. Make it a new master only once you place it twice. **Reworking a layout:** swap it within its folder (`equal` → `sidebar + main`). Figma keeps a column's overrides when the layer names match, which is why the columns are named `Column N` [R]. Swapping to another size resets the Scale; that is accepted (Decided 2).

## Migration cost (from the [layer audit](../layer-audit-2026-11-17.md))

- **Build beside, then archive** (rule 14):
  - 8 `X · default` masters replace the 8 `Res.<size> Set`s;
  - 1 new `content · title`;
  - about 2 new `equal` layouts per page.
- **Cut** 34 pure wrappers (27 of them are `Region ·` frames).
- **Rename** about 20 masters, as in the audit's table, and rename the column layers to `Column N`.
- **Replace** about 20 hand-made card shells in the previews (`Stat card`, `Action card`…) with a default plus swapped content.
- **Archive** 7 masters: Two cards, Three cards, Text column · old, 2 Layout sets, Page, Section · Slot.
- **Effort:** roughly 4 `use_figma` calls and 2 shots per page, about 50 of the 200-a-day Figma budget, done over two days. Pilot on 1000 Default first.
- **Rules to edit:** rule 24 (a default and its size's layouts swap with each other; they share one kind) and rule 22 (gap, padding and radius overrides are allowed).

## Why this is the simplest

There are two kinds of master per size: the default, which pads, and layouts, which don't. Add one size-less content set, and that's all. No variants, properties or slots, and only one rule about padding. This is the split every kit settles on (padded surface vs plain layout), and Section and Card become looks, not more masters to keep in sync. Sizes only go down, so the whole space opens from one drag. And because layouts are so thin, detaching one to add a column costs nothing.

**The alternatives:**
- **The default holds a plain h1 text, not `content · title`:** one layer fewer, but you can't swap its content. It wins if content should always come from swapping the whole default.
- **Separate `X · card` masters:** clean instances (rule 22's alternative), but twice the masters at every size.
