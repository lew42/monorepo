The whole arrangement tier, as a stylesheet reading two classes the Router writes.
There is no layout class hierarchy to learn — `.page:not(.active-page,
.active-ancestor:has(.page.active-page), .default) { display: none }` in
`@layer util` **is** the arrangement contract, and every layout on the site is a
page opting into a shape rather than a component switching one on.

## Four shapes, one selector each

`standard` (the default: a 52em measure plus `.wide`/`.bleed` breakout tracks),
`pad`, `full`, `fill` — declared as classes on `.page`, and combinable
(`classes: "full fill"`). The long reasoning for each — why `util`, why `standard`
became the default, why the breakout scales and the measure never does — lives in
`../css.md`, cited rather than repeated here.

## The cards

`.page-preview` / `.page-preview-thumb` / `.page-preview-link` are one card shape
shared by every wall, rail and ladder on the site. The thumb is `pointer-events:
none` and the label carries the real `<a>`, because a live render inside an anchor
would nest two anchors and the browser silently un-nests them.

## Improvements

1. **No `doc/file/Page.css.md` existed before this pass**, despite `../css.md`
   already carrying the full design record. *(simple, important — done.)*
2. **The file mixes two concerns that could split**: the arrangement contract
   (visibility + shapes) and the preview-card component. They are read together
   today because both are small; worth revisiting only if either grows.
   *(medium, speculative.)*
