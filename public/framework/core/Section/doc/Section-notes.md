# Section — design notes

## What a Section is

A Section is a PAGE you put inside a page. It starts as a plain div two and a half lines tall with nothing in it at all, and it has exactly one idea of its own: it can be handed an APPROVED LAYOUT from `core/Layout`, and that layout's named boxes become the section's slots. Its children mount into those slots by name. That is the whole class.

It extends `Page`, so everything a page has arrives free and nothing here writes it: storage keyed on the section's own url (`store()`), children, `nearest()`, the six page words, previews, the whole naming machine. The owner asked for a sub page for exactly that reason.

Examples:
- `new Section({ url: "/…/band/" })` — a plain box, 2.5em tall
- `new Section({ …, editing: true })` — hover it: a hairline and one control
- `new Section({ …, layout: "main-aside", children: { Main: …, Aside: … } })` — two slots, filled by name

### Editing and persistence

EDITING IS OFF UNLESS CODE TURNS IT ON. A demo page or a doc page calls `section.edit()`; a visitor has no way to. There is no padding control and there never was one — the owner replaced that idea with approved layouts outright ("maybe having padding schemes isn't the way… yes, this is It").

DEMOS DO NOT PERSIST. Picking a layout writes nothing: the choice lives on the instance, and a reload is the page again. Storage is inherited and works — it is for an editor to call, and an editor has to make saving visible.

## Naming — EVERY VIEW PART IS `PageSection*`

`.page-section-*` is the namespace (styles/css-scopes.txt). `Section` itself is safe — `Page` is not a `View`, so `View.classify()` never sees this class and mints nothing from its name — but `.section` is a live rule elsewhere on the site and `/imagine/sections` dodged the word entirely for that reason. `core/Layout` made the same call one file over: inside core/Page's namespace on purpose, because `Section extends Page`.

## Class fields vs prototype defaults

A subclass's field initializers run AFTER `super()` has finished, so a field here would overwrite the config that was just assigned. The defaults sit on the prototype at the bottom of this file.

## What render() draws

`render()` is overridden WHOLE, and this is the one real difference between a Section and a Page: a page draws a title, a shell and the six words' frame; a band draws none of that. No `.page` class either, so the arrangement contract (which hides an unmarked `.page`) never has an opinion about a box a page built inline.

## Width rule and live redraw

THE BOX HAS NO SIZE YET when a page is built: a page is built detached, so every rect reads 0 and the first draw cannot know whether its layout fits. The observer answers the moment the box gets a size, and again every time that size changes — which is exactly when the question needs asking again. `core/Layout` learned the same thing one file over.

IT REDRAWS ONLY WHEN THE ANSWER CHANGED. A redraw is a DOM change and a DOM change fires the observer, so an unguarded one is an infinite loop.

## The empty() and view replacement pattern

`empty()`, never a new view: the box is already in the page, and replacing it strands whatever put it there. Same rule `Page.redraw()`-shaped code all over this site learned the hard way.

## Children mounting

Every child the layout did not claim, in declaration order. With no layout that is ALL of them, which is why a section with children and no layout is simply a stack — and why content is never silently dropped.

## Edit mode

Editing is turned on BY CODE: a demo page or a doc page calls this, a real page never does. `editing: true` in the config is the same switch, said once.

## The overlay — smallest thing that works

A hairline outline (Section.css) and ONE control in the corner. It is `position: absolute` and moves only `opacity`, so hovering a section shifts ZERO pixels — `ext/Playground` measured its way to that rule over a ten-point hover sweep and it is not worth re-learning.

The one sentence a stacked section owes its reader: WHICH layout it is holding, and why you are not looking at it. Never blocking, and inside the overlay — so it appears on hover and moves nothing.

## From a page.json

The third way a page arrives — data that describes one — and a Section reads the same file a Page does, plus two keys: `layout` and `editing`.

Example: `{ "title": "Team", "layout": "main-aside", "children": ["main", "aside"] }`

THERE IS NO `from()` HERE ANY MORE, and that is the point. `Page.from()` says `new this(…)` and `this.from(…)` since 2026-09-06, so a static inherited by this class builds THIS class — root and children alike. All a subclass owes is the extra keys, and `props()` is the one method that names them. Eighteen lines of copied reader deleted.

## The layout

`layout` is one word: the `name` of an entry in `core/Layout`'s catalogue. The catalogue is plain data with no imports, so reading it here costs a page nothing and cannot disagree with the layout pages themselves.

## The entry actually drawn — stacking

BELOW ITS FLOOR A LAYOUT STACKS (the owner, addendum: "below its floor a layout stacks to a named fallback… and the fallback is the thing being judged there"). A two-column grid in a 276px box is not a two-column layout with a problem; it is 4,433px of column, measured, before this method existed.

Stacking here means DRAWING NO LAYOUT, and that is a decision worth reading: a section's stack is its own children in declaration order, which is exactly what `stack` — the fallback of every multi-column layout in the catalogue but one — describes. Taking the fallback's own BOXES instead would hand the content a set of slot names it was never written for (`First`, `Second`, `Third`), and content in a slot it does not belong to is worse than content in a stack. See doc/slots.md.

## Pick a layout

Pick one, by name. `""` puts the plain box back. Nothing is written to storage — see the note at the top of this file.

## The arrangement applied

The entry's `decl` IS the layout — the same declarations the layout page prints and the fixtures pour into — and one slot is drawn per box. Every slot is a REGION under the box's name, which is the Map `Page.container()` already reads, so a child mounts here with no new rule to write. It is what `Page.Frame` does for a bar, a rail or an aside.

## One box to one slot

One box → one slot. `Main` is the slot `main`, so a child called `main` lands in it: the layout says the shape and the page says the names, once each.

## Mount pattern

The child's view is APPENDED, never built inside the captor. A page MEMOIZES its view, so on the second draw `child.render()` builds nothing at all and a captured call would append nothing — the slot would silently come up empty after one pick. Passing the View to `append()` moves it either way.

`default`, because nothing ROUTES to a slot: without the mark the arrangement contract hides the child (Page.css). Same line as `Frame.region()`.

## Which layouts fit

The width is read LIVE off the rendered section, so a box that was resized offers a different list; the picker asks again every time it opens.

Every approved layout, with the rule already asked, fitting ones first. `note` is a plain sentence either way — a greyed row that does not say why it is greyed teaches nothing.

## GLYPH

A picture for the shape, not for the name: how many columns it divides into.

## The one control — Picker and Dropdown

`ext/Dropdown` — imported, never copied. It brings the top layer with it, which is the whole reason: an open list is promoted out of every `overflow: hidden` ancestor, and a section lives inside plenty of them. Outside-click, Escape and the arrow keys are its own too.

`Dropdown` is a plain class, not a `View`, so `classify()` mints no CSS class from `PageSectionPicker` — the name is still `PageSection*` because the next part someone adds here may well be a View, and one naming rule is cheaper than two.

## Picker.chosen()

The trigger reads the SECTION, so it can never disagree with what is on screen: the layout's name, or the word "layout" when there is none.

## Picker.open()

Rebuilt on every open: the section's width decides which layouts fit and the section can be resized between two opens — drag a demo's handle and watch the list change.

`fits && value` — every layout is in `options` whether it fits or not, so asking only for a value found thirty of them and the empty state never drew (measured at a 400 viewport, where nothing fits).

## Picker.pick()

`pick` is the hook `Dropdown.option()` calls (`this.pick?.(o.value)`) — an OPTIONAL one, so a picker without it swallows every click and nothing throws: the list closed, the trigger went back to saying "layout", and the section never changed. Measured before this method existed.

## Picker.option()

A layout that does not fit is NOT an option — it is a row saying why, so it cannot be clicked, cannot be focused, and cannot be reached with the arrow keys (which walk `.dropdown-option`). A fitting one is the dropdown's own option with its range added.

## Picker.nothing()

A list with nothing in it says so, and says the one useful thing: what the narrowest layout on the site needs.

## Prototype defaults

The defaults, on the PROTOTYPE — a declared value shadows one with no code, and a class field here would land after `assign()` and wipe the config instead.

`leaf: true`: a section presents ITSELF, not its children — they are its slots, not pages a reader browses to — so it spends none of its parent's load budget and never appears on someone else's wall of cards.
