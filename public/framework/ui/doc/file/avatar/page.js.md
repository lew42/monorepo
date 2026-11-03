The avatar exhibit (a three-circle stack) plus two variants: `sizes` (one
token, three renders) and `photos` (an `<img>` instead of initials — the
class already handles both since `overflow: hidden` + `object-fit: cover` are
on `.ui-avatar` itself).

## Real callers

Unlike most of this directory, `avatar()` has cross-module callers:
`styles/sections/team.js` and `styles/sections/testimonials.js` both import
it directly — the first cross-import between the two galleries, noted as
deliberate in `doc/record.md` §9.

## Improvements

Nothing ranked: the page correctly states there is no `ui.avatars()` plural
export even though the CSS supports a stack, since the stack is composed from
repeated `.ui-avatar` calls rather than a second function.
