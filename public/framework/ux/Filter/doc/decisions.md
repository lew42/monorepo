# Decisions — ux/Filter, 2026-08-21

Built against [`ux/doc/system.md`](/framework/ux/doc/system/) and the `Tree.selected_change(node)`
precedent. The question this task asked outright: does the one-wire seam hold when THREE
regions read it, not one?

## Verdict: yes, unchanged

`changed(predicate)` fires from exactly two places — `set()` and `query()` — and hands out a
plain function, never a DOM node, never a region name. The dashboard's `refresh(predicate)`
runs `MODULES.filter(predicate)` once and refills three independent `.empty()` boxes (stat
tiles, the card wall, the table). Adding a third consumer cost the page nothing extra in
`Filter.js` — the class does not know how many regions are listening, or that regions exist
at all. Typing "tr" narrows the stat count, the wall and the table to the same 3 rows in one
keystroke (`Tree.js`, `TreeKeys.js`, `tree.js` — the only three names that contain it),
proven headless: `shown` read `"3"` after the keystroke, `"6"` after clicking the `ux`
segment, `document.documentElement.scrollWidth` unchanged at every width.

## The one design line the brief asked to log

**Filter never reaches into foreign DOM.** It holds exactly two facts — `active`, `needle`
(see the `this.text` trap below) — and `predicate()` builds a fresh `row => boolean` from
them on every call. The caller's data array and its regions are the caller's: same split as
`Tree`, which remembers a selection and hands out a node rather than touching the preview
pane itself.

## The `this.text` trap — found by a headless run, not by reading

`Filter.query(text){ this.text = text; }` shipped first and threw silently: `View` already
has a `text(value)` **method** (getter/setter, `core/View/View.js`), so `this.text ??= ""`
in `render()` never wrote — a function is never nullish — and `this.needle.trim()` later
called `.trim` on a function reference. Nothing threw at write time; the first headless shot
of the exhibit stage printed `TypeError: this.text.trim is not a function` in the console
column. Renamed the state property to `this.needle` throughout `Filter.js`, `FilterChips.js`
and `page.js`. `Tree`'s readme already names `toggle()`/`show()`/`hide()` as View's; `text()`
belongs on that list too — filed as a `code`-skill improvement.

## The five layout questions

1. **Container:** `bleed` — the dashboard is the coordinated-regions demo itself, not a card;
   `demo.exhibit({ stage: steer => demo.stage(dashboard, steer).ac("bleed") })`, same shape
   `ux/Tree/page.js`'s explorer uses.
2. **Size:** 360 → one column throughout, bar wraps to two rows. 768 → wall and table already
   share a row (their `--column: 22em` floor times two just fits). 3440 → bar spans, a
   3-tile stat strip sits under it at full width, wall (3–4 cards wide) and table share the
   row below.
3. **Own layout:** the bar is `flex wrap gap v-center` (unchanged from `ui/toolbar`'s
   `filter()`); stat tiles are `grid gap auto` at `--column: 9em` (`ui/stats`'s own number);
   the wall is `grid gap auto` at `--column: 14em`; the wall+table split is `flex auto wrap
   gap` at `--column: 22em` — **not** `.rail`. `.rail` is a side-NAV-beside-main-content
   relationship (`Tree`'s explorer: a rail of nodes beside the one preview pane); wall and
   table here are two PEER views of the same filtered result, so an even 2-up split that
   wraps under its own `--column` fits the actual relationship, and measured equal
   (1035.5px each of a 2089px region at 3440, headless).
4. **Containers on the page:** three — the exhibit (the dashboard itself), the words band
   (bar + stat strip only, twice — Tree's "small duplicated section" precedent, not the
   whole three-region dashboard), and the `chips` child page (the bar alone, no wired
   regions — a class demo, not a second dashboard).
5. **Preview:** a static `Filter` bar at `zoom-50 pad`, unfiltered — a picture, not the live
   dashboard, same call `ux/Auth`'s preview makes for its login card.

## What 3440 needed that 1280 didn't

Nothing new in markup or CSS — the same three region functions, the same `flex auto` split.
1280 already fits wall+table side by side (the `--column: 22em` floor × 2 = 44em ≈ 704px,
comfortably inside a 1280 stage). What changes is purely how much surplus space `flex-grow:
1` on each side distributes: at 1280 the wall shows 2 card columns, at 3440 it shows 3–4 and
the table's `.ui-table { width: 100% }` stretches to fill its half rather than leaving the
table cramped. No breakpoint was written for either width — the token did the work.

## CSS: zero new rules, zero minted classes

`Filter.js` and `FilterChips.js` ship no stylesheet. `.filter` / `.filter-chips` arrive free
from `classify()` (`core/View/View.js`) off the constructor name — the same fact `Wizard`'s
own comment names for `.wizard` — and neither is targeted by a rule, so nothing needed
registering in `css-scopes.txt`. Every visual fact is an existing utility or an existing
component class: `surface pad flex wrap gap v-center` (the bar, `ui/toolbar`'s `filter()`
verbatim), `.prim` (segment selection, same precedent), `grid gap auto` + `--column` (tiles,
wall — `ui/stats`'s own template), `flex auto` + `--column` (the wall/table split),
`ui-badge ui-pill h4` (`FilterChips`'s chips, `ui/badge`/`ui/tags`'s markup with a real
listener instead of `ui/tags`'s inert one). The one inline style outside a token override —
`overflowX: "auto"` on the table's wrapper — matches the landed precedent in
`ui/toolbar/page.js`'s `scrolling()` demo, not a new pattern.

## FilterChips — built, not parked

Time allowed it: `class FilterChips extends Filter` is 47 lines, one new piece
(`chip_list()`), and `set()`/`query()`/`predicate()` travel down untouched — the same claim
`ux/Auth/doc/decisions.md` made for `MagicAuth`, now proven for a second `ux/` class. Its one
override of `changed()` calls `super.changed()` first, so the predicate it hands the caller
is never different from the base class's. Verified headless: select `ux`, type "tr" → two
chips (`ux ×`, `"tr" ×`); dismiss the query chip → one chip left, and the search box's value
cleared to `""` (via `this.$field.el.value = ""`, why `Filter.field()` keeps that reference).

## Cut

Nothing from the "never cut" list. The one trim: the words band duplicates the bar + stat
strip only, not the full three-region dashboard — `ux/Tree/page.js`'s words child is a
smaller reuse for the same reason (proving the config-word contract needs one region, not
three, and a lighter page loads faster for every reader after this one).

## 2026-09-18 — the first real consumer, `segments: []`, and Escape

`core/Sidebar` (`ai/2026-09-18/sidebar-filter/`) is this class's first production caller —
151 lines and zero callers before today, exactly the flag the overlap study named it as
(`ai/2026-09-18/overlap-study/overlap.md`, `overlap-filter-into-sidebar`). Composed, not
rewritten, per that task's brief: `segments: []` with the default `all`/`active` left alone
is enough to make it search-only (`active === all` never stops being true when nothing ever
calls `set()`), so no change was needed here to support a caller with one fact instead of
two. `search_field: "text"` is the only per-caller wiring — it reads whatever field the
caller's own rows carry, and `ux/Tree`'s node shape happens to use `text`.

**The one seam actually added: Escape clears the query.** `core/Sidebar`'s brief asked for
it by name ("Escape clears") and `Filter` had no such behaviour — `field()`'s `input`
listener only ever answered a real keystroke, never a key that clears the box without
typing anything into it. `FilterChips` already had the two lines this needs, under
`clear_query()`, for its own chip's ×; that method moved UP from `FilterChips` to `Filter`
(a subclass method promoted to its base, not a new one invented) and `field()` gained one
`keydown` listener that calls it on `Escape`. Both existing `FilterChips` call sites
(`ux/Filter/page.js`'s `chips` demo) keep working with no code change — the inherited method
resolves the same way it did when it was defined locally. Every `Filter`/`FilterChips`
instance on the site gained Escape-to-clear the moment this shipped, with no opt-in and no
caller edited.

**No toggle added.** `core/Sidebar`'s brief allowed one "if `ux/Filter` already offers one" —
segment buttons ARE that toggle mechanism, but this caller has no second, real category to
put in them (a page's title is the only fact worth narrowing a nav tree by), so nothing was
added on either side.
