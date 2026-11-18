# Page structure v5: groups straight in Root (proposal, 2026-11-17 ~21:05, voice-app)

**Status: built on all 8 size pages (2026-11-17, mastermind-structure-v5); ids, sizes and the one deviation (Root takes the page tier mode, not Mega) are in [rollout.md, v5](./rollout.md#v5-2026-11-17-mastermind-structure-v5).** Source: [owner words, section "~21:00"](../owner-words-2026-11-17-naming.md).

## What exists today (1000 Default, read just now; the others match)

```
1000 Default
├─ 1000 · Preview                column: tint, section-pad, title
│  └─ .1000 Preview              the preview component (a second level, the one he asked about)
├─ 1000 · Masters                column: tint, section-pad, title
│  ├─ 1000 · Default             component: section-pad + fill → [Content]
│  ├─ 1000 · Content             white card (section-pad): placeholder, Text, Text + Media, Stat, with dividers
│  └─ 1000 · 2                   folder: · Equal, · Sidebar
└─ Archive                       hidden (his old Root Column 1 is in here now)
```

What's wrong with it:
- **The preview is wrapped twice** (a column, then the component).
- **`Masters` is a group he never asked for.** It puts Content, Default and the 2/3/4 folders one level down. Every group adds a step to the swap menu and the layers panel.
- **Default uses `section-pad`, not `pad`.** That leaves the two padding tokens doing the same job.

## Proposal

**Rule: Root's first level holds only the groups themselves, in order of use. No wrapper groups.**

```
1000 Default
├─ 1000 · Preview                the preview component itself (no wrapper; the Index uses it)
├─ 1000 · Default                component: pad + fill → [1000 · Content]
├─ 1000 · Content                one 1000-wide white card (pad); title "1000 · Content"; masters straight inside, dividers between
│  ├─ 1000 · Content             the placeholder: a kicker "1000 · Content", an h2, one paragraph
│  ├─ 1000 · Content · Text
│  ├─ 1000 · Content · Text + Media
│  ├─ 1000 · Content · Stat
│  ├─ 1000 · Content · List
│  └─ 1000 · Content · 2 · Equal
├─ 1000 · 2                      folder: tint + section-pad, title "1000 · 2"
│  ├─ 1000 · 2 · Equal           [400 · Default | 400 · Default]
│  └─ 1000 · 2 · Sidebar         [400 · Default | 600 · Default]
└─ Archive                       hidden, last

1920 Desktop                     (2600 and 3440 are the same, without a Build demo)
├─ 1920 · Preview
├─ 1920 · Default                → [1600 · Content]
├─ 1920 · 2                      · Equal [1000 | 1000]   · Sidebar [400 | 1600]
├─ 1920 · 3                      · Equal [600 ×3]
├─ 1920 · 4                      · Equal [400 ×4]
├─ 1920 · Build demo
└─ Archive
```

**The words, settled:**
- **Content:** no fill, no padding. Text and media. A component only so it's easy to find and swap to; often detached.
- **Default (owner ~21:35):** a white card with corners: `pad`, fill, radius and the card shadow, holding one Content. The starting point. A flush section is the same Default with radius 0 and no shadow (an override, rule 15). There is no separate Card master.
- **`X · N · Shape`:** bare columns, each holding a smaller Default.

**Padding tokens, one job each:**

| Token | Used on |
|---|---|
| `pad-x/-y` | everything that holds Content: Default, Card, the Content card |
| `section-pad-x/-y` | page-level groups: the 2/3/4 folders, the preview sheet, Root at Mega |
| button padding | buttons |

**How the groups look:**
- Components (Preview, Default) sit in Root bare, carrying their own fill.
- The Content group is a white card, so content shows the way it will sit inside a Default.
- The 2/3/4 folders get `tint` + `section-pad` + a title equal to their name.

**Root:** padding 0, gap `gap`, no fill, horizontal **with wrap**, and a fixed width chosen per page so the result reads 2:1 to square (for 1000, about 3500). Groups keep this order: Preview, Default, Content, 2, 3, 4, demo, Archive.

## Added (owner ~21:10): Content layouts get their own groups

Content can only be filed in one place, so the folders do the organising. Each column count gets its own first-level group; there are no sub-folders:

```
1000 · Content                   card (pad): single-column content
│  ├─ 1000 · Content             placeholder: kicker "1000 · Content", h2, paragraph
│  ├─ 1000 · Content · Text  ├─ · Text + Media  ├─ · Stat  └─ · List
1000 · Content · 2               card (pad): two-column content, layers Column 1 / Column 2
│  ├─ 1000 · Content · 2 · Equal
│  ├─ 1000 · Content · 2 · 1/3 + 2/3
│  └─ 1000 · Content · 2 · 2/3 + 1/3
1000 · Content · 3               card (pad)
   └─ 1000 · Content · 3 · Equal
```

Per size: 1600 gets Content, Content · 2 and Content · 3. 1000 gets the same. 600 gets Content and Content · 2 (Equal only). 400 gets Content only.

**First-level order:** Preview, Default, Content, Content · 2, Content · 3, then 2, 3, 4, the demo, and Archive.

**A truth worth writing down (owner):** for Content, the component system is mostly an **asset library**, not inheritance. You swap to a Content master or detach it and edit. Inheritance matters for the Defaults, the column layouts and the tokens. That's why the systems feel like they overlap.

## Cost

Moves and renames only; nothing is rebuilt and nothing is deleted. On each page:
1. Lift the preview component out of its column.
2. Dissolve `X · Masters` by lifting its children into Root, then archive the empty columns.
3. Restyle the 2/3/4 folders.
4. Change the Default and the Content card to `pad`.
5. Change the placeholder to kicker + h2 + paragraph.

About one or two `use_figma` calls per page, 8 pages, starting with 1000 Default.
