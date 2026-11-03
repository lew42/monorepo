# How the plan was made

## The targets

A target is one job with one padding rule. The eight come from the site's own three spacing words — a page region takes `.pad`, a framed box takes `.card`, a control or a row keeps its own `em` — plus "none" for a box whose contents touch its edge.

| Target | Job | Why it is not another target |
|---|---|---|
| card | a framed box of content | — |
| frame | a framed box whose parts touch its edge | a card pads its whole inside; a picture or a head bar must not be padded |
| region | a band of the page | pads by the page, not by itself; its paint may bleed |
| preview | a picture of a child page | the thumbnail is the frame |
| pill | a label the size of its text | pads in its own em |
| row | one line in a list | no border, a ground only when hovered or selected |
| fold | a row that opens | a native `details`; its body keeps the row's inset |
| popover | a box floating over the page | anchored, holds controls |

Tables, trees, forms, the demo system and the Panel editor are widgets, not boxes: they keep their shape (`keep` in plan.json, with the reason).

## The counting

`count.mjs` reads every `.js` and `.css` file under `public/`, drops comment lines, and tests each merge's `grep` pattern. Task logs (`ai/<date>/`), the catalog and this plan are left out: they describe cards, they do not draw them. A file's page is the nearest folder above it that has a `page.js`. `within` and `without` narrow a merge to part of the tree, so the same pattern (`surface pad`) can be two merges: the ui/ templates first, everything else last.

The order sorts by risk (low, medium, high), then by pages, then by files.

## The two numbers

- **Kinds left** = the eight targets plus the kinds that keep their shape.
- **Padding rules left** = every distinct rule a remaining kind pads by, counted the catalog's way (`own rule` counts once, `unknown` is left out). Five are left: `--pad-card`, `--pad`, own em, none, and the demo stage's `1.5rem`, kept because every demo on the site is measured inside it.

## The pictures

"Before" runs the catalog's own render snippet. "After" runs the plan's `after` snippet with the same words, so only the box changes. Both are drawn in a box 30rem wide, because `--pad-card` is a percentage of the box it sits in, and the line under each says where its first word lands, measured live.
