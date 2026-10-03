# Preview levels — the three sizes any class view comes in

A house rule, not a component: nothing in `Panel2.js` enforces this today, and nothing has to —
it is the three answers worth knowing before you draw a list, a card wall, or a detail page for
any kind of thing (a session, a task, a file, an agent). Added 2026-10-02, the owner's own words
([`requirements.md`](/framework/ai/2026-10-02/sessions-grid-v2/)):

> Three preview levels for any class view:
> - inline: an icon and the name;
> - card: the icon, the title, a ⋯ menu of quick actions, and most of the card is a link, with a
>   corner arrow on touch screens (no hover there);
> - detail: the full page.

## The three levels

| level | shows | used for |
|---|---|---|
| **inline** | an icon and the name, nothing else | a mention (`#Page`, `@agent`), a breadcrumb, a tag inside a sentence — any spot where the THING is a reference, not the subject |
| **card** | the icon, the title, a **⋯** menu of quick actions, and the card itself is a link (most of its surface) | a wall of previews, a grid, a rail — anywhere several things are browsed at once |
| **detail** | the full page | the one thing you opened, at `/its/own/url/` |

**Why exactly three, and not more.** Every size in between is one of these with something hidden
or something added back — a dense row IS an inline plus a few more facts in a line; a hero block
IS a card at a bigger size. Naming three keeps "how much do I show here" a three-way choice
instead of a new decision every time.

## Card's own two watch-outs

- **Most of the card is a link; the ⋯ menu is the one part that is not.** A click anywhere else
  on the card opens the thing; the menu is its own small hit target so "open" stays the easy,
  big-target gesture and "do something to it without opening it" stays possible without a context
  menu's full right-click ritual. [`ui`](/framework/ui/) has the dropdown this menu is built from.
- **The corner arrow is a TOUCH affordance, not a decoration.** A mouse has hover to say "this is
  clickable" before the click; a touch screen has no hover, so a card that is a whole-surface link
  needs the arrow to say so up front — `(pointer: coarse)` or `(hover: none)`, the same media
  query `ext/grip`'s own touch rule already keys on (`grip.css`).

## Where this is used today

[`/framework/ai/sessions/`](/framework/ai/sessions/) is a **data grid**, not a card wall — a row
IS the inline level (an icon/tag and the name, read left to right instead of stacked), and its own
url is the detail level, opened as a side peek via `core/Page`'s [`columns()`](/framework/core/Page/doc/columns/).
Nothing on the live site is a card-wall exemplar of this rule yet; the next class view built on
Panel2 that previews several things at once is the one to hold to the card shape above.

## What this is not

Not a new CSS class, not a new JS part. A page that already shows an inline reference, a card wall,
or its own detail route is already following this rule — naming the three levels is so the next
page's author asks "which of the three is this" instead of inventing a fourth.
