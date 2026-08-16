# Selection: what is clickable, and what it shows

## What is selectable

`region()` (`layout.js`) marks a container so pointing inside it lights up a
target and clicking selects it. `pointed(root, el)` walks up from the actual
event target to the first element whose *parent* lays its children out — the
region itself, its direct items, and the items of any `flex`/`grid` nested
inside, never deeper. A `<p>` inside a card selects the card; a `<span>` inside
that paragraph is not a separate target, because the control vocabulary has
nothing to say about a span. Going deeper would put every word of a sentence
under the pointer.

## The sliders chip

Every bar ends with a fixed chip (the `tune` icon) that selects **the bar's own
target**, page or container alike. It closes the oldest gap in the module — a
region with no padding of its own was unclickable, since `pointed()` always lands
on a child — and it is the *only* way to select a page, which must not become a
clickable region itself (outlining every block on a docs page as the mouse moves
over it is not a docs page). One chip closes both holes with no new concept.

## Page words, not container words

`body.js`'s `container($el, redraw)` offers `flex`/`grid` plus their chips —
but a selected `.page.standard` **is** already a grid, so that section would offer
to flip a page's own breakout template to `flex` and break it. The panel asks one
question, `$el.hc("page")`, and swaps in `shape fill flow measure` (`layout.words`'
page vocabulary) instead. `fill` pairs its class with an inline
`overflow: auto`, because `.page.fill` alone carries `overflow: hidden`
(`Page.css`) and would otherwise clip everything below the fold — including the
toolbar that just wrote the class.

## Container, or item, or both

Both, when both are true: a nested box is an item of the row above it and a
container of the boxes below it. The container section always shows, because
any element can be given `flex`/`grid`; the item section (`basis`, `flex-1`,
`measure`) shows only when the element's *parent* already is one, since those
words do nothing anywhere else.

## Left alone on purpose

Flipping a load-bearing container's mode chip — a section band's own wrapper, say
— can break its bleed until reload. The panel is deliberately a playground rather
than a guarded one: any other chip (`--pad`, `v`) can break a layout just as
thoroughly, and letting a `layout.context()` registration *suppress* the container
section on the elements a consumer cares most about would be exactly the
black-magic-at-a-distance this module refuses elsewhere. A DOM-inspector shape —
show every computed property, edit any declaration — was considered and rejected:
this panel knows one vocabulary, the utility words `framework.css` defines and the
tokens they read, and its output is the literal call — `div.c("flex gap auto")` —
you paste into a page. Devtools can tell you `display: flex`; it cannot tell you
the word this site spells that with.
