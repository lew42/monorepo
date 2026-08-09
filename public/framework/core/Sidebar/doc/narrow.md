# Below 52em — a top bar and a hamburger

Stacked, the panel sits above the content, so its full height is a wall you scroll
past to reach the page. At 7 entries that was fine; at 30 it measured **700px of nav
before the first heading** at 390px wide.

## Take one — show only the group you are in (superseded)

| option | why not |
|---|---|
| a hamburger drawer | needs JS, or a checkbox hack, or `<details>` restructuring — and a whole open/closed state to get right |
| a horizontal scroll strip | 30 items in a one-line scroller, group titles inline, is a worse index than none |
| **show the group you are in** | ✓ (at the time) |

`display: contents` on the group, hide the group title, and
`:not(:has(.sidebar-link:is(.active, .in-path)))` on the rest. ~200px, no JS, no
state. `display: contents` rather than making the group a flex item, because as an
item it stayed a *column* and the flat entries after it wrapped up beside it — "Dev
server" sat next to "Page", reading like a second column that wasn't one.

**It worked "sorta", and the costs were the product:** one wrap row of the current
group is an index with no route to the *other* groups, `display: contents` breaks the
a11y tree in some browsers when it lands on interactive ancestors, and the row never
looked designed.

## Take two — the panel becomes the bar

| | |
|---|---|
| keep take one, restyle the row | the structural problems (no other groups, `contents`) survive any restyle |
| off-canvas drawer | a second layout (slide, overlay, backdrop) and the most JS of the three |
| **top bar + slide-down menu** | ✓ — the bar is the header the panel already had; the menu is the panel it already was |

**Verdict: the panel becomes a sticky top bar; the burger drops the whole menu below
it.** The pieces were already there — `bar()` (header + toggle) and `menu()` (nav +
footer) exist at every width, and the media query only changes which of them is a
strip and which is hidden. Open state is one class (`.open`) and one attribute
(`aria-expanded`); the menu is `position: absolute; top: 100%` against the sticky bar,
so opening it moves nothing else, and the footer rides along — the mode toggle stays
reachable on a phone.

Decisions worth a line each:

- **A real `<button>`**, not a clickable div or a checkbox hack — focus, Enter/Space
  and `aria-expanded` come free. The bars are three spans painted `currentColor`, so
  there is no icon-font dependency (the chevron's rule, applied again).
- **CSS decides "narrow"** — the button is always in the DOM, shown by the media
  query. No resize listener, and no state to reconcile with one.
- **Escape closes and refocuses the toggle; a link click closes.** Navigation
  happened; the menu's job is done. Both are two lines, and both are harmless on a
  wide screen where `.open` does nothing.
- **Breakpoint 52em**, matching the topic stacking in `/styles.css`. A container query
  would let a demo box simulate it, but the bar and border changes are on `.sidebar`
  *itself*, which a container query cannot style.

**What made take one honest was its escape route, and it still applies:** the brand
links to the section index, which lists every section as a card. So a phone gets
*"where am I"* from the panel and *"somewhere else"* from the index — the same split a
drawer would provide, without the drawer.
