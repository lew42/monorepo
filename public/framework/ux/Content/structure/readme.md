# Structure: words drawn as a picture

A [Content](/framework/ux/Content/) vocabulary: icon cards, groups, panels and outlines ([Structure.js](Structure.js)).

## Use
```js
import { iconCard, group, outline } from "/framework/ux/Content/structure/Structure.js";
group({ title: "Servex", bg: true, items: [{ name: "Agents", icon: "smart_toy", weight: 3, href: "agents/" }] });
outline([{ name: "Page", children: ["Sections", "Items"] }]);
```

## Watch out
- `bg: true` means a background, and so padding. Leave it off for a bare group: no padding at all.
- Items sort heaviest first (`weight` 1–3, default 2).

## More
- [Which piece when](doc/guide.md) · [Proposal: page weight](doc/weight.md)
