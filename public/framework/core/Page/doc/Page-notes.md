# Page.class.js — removed comments

## Top-level constants

The two page words that mean the same thing under an older name. `card` used to be `surface` (the theme's own tone list still says so, styles/sections/tone.js:11) and `tint` used to be `wash`. Read on the way in; never mentioned again.

A `.md` address is prose, anything else is the `page.json` at that address.

Page extends Item directly (no PageLog middle class).

## Extensions setup

Nobody calls it by default, so the loop below is empty for a page with no extensions.

core never statically imports ext, and the import is ASYNC: a late setup() catches up from `jsonl_lines`.

## PAGE.JSONL section

PAGE.JSONL — folded in from the deleted PageLog class.

A page's own preferences (today: `nav`). Never a plain object, so a repeat `settings` line merges.

A page is a BOUNDARY: its own events (and a content/pages List's, which bubble to the page first) never climb past it to a PARENT page. Each page's Store only ever hears changes inside its own subtree.

A page's id is its folder name, not a random one — `naming()` below sets `this.id ??= this.name` once the url (and so the name) is known. Nothing here can invent one before that.

`title`/`icon`/`description` live in `data`, read through Item's define_fields() accessors.

Item.apply() routing, plus: an array of lines, every line kept for late listeners, one `line` event each, lazy content.

## Content section

CONTENT — one PageContent List for the page's life; a function, string or address is one item in it.

A class-body `content(){}` would hide the accessor: move it into the list and put the accessor on the instance.

Anything to draw? An empty list with no parts draws nothing.

Hand the list away and start a new one (ext/catalog moves the old content into its intro).

The content list is a saved list only when it holds parts; code, addresses and text live in the page's code.

## Pages and children

My sub-pages, the real storage. `of: null` keeps a stub plain.

A Map-shaped view over `pages` for the ~215 `.children` callers. New code says `page.pages`.

A Map with entries (core/Page/page.js reorders its tabs this way) is copied back in, in its own order, after the clear.

## Words section

One redraw per burst of lines: a batch of lines read together (a replay, or a delta naming three words) lands as ONE rerender, on the next microtask.

THE SIX PAGE WORDS — resolved ONCE here; every default is undefined

Idempotent on purpose (naming() runs twice for an adopted page). There is no word for `type`: the key is `type_size`.

the lab's older key

The classes the words stamp on the page. `surface` is NOT here: it paints the Frame's box, not the page.

DID THE PAGE SAY ANY WORD AT ALL? This is what `render()` asks before it builds a `Frame`, rather than `word_classes().length` — `surface` writes no class up here and still needs the frame, because the frame draws the very box it paints.

## Declare section

My sub-pages, in declaration order: undefined = not mine, null = declared, Page = here.

`list` is the declaration; a second call ADDS; a function is a data source.

The eager form ran under whatever captor was current at declaration time.

## Adoption/moving

The one place `parent` is assigned. Adoption goes in through the CONSTRUCTOR: initialize() runs inside it, and a child added there needs my url already set.

The url is MINE plus the name — a page built standalone (its url derived from its own title) moves here, resolved children included.

Quietly: declaring a child is not a live edit (a stub holding the name is replaced in place).

Adoption hands a page a new address; the resolved subtree moves with it. Stubs (not yet loaded) have no `.move()` of their own and are skipped, same as the old `child?.move(...)` did when `child` was `null`.

[root … me]

## Child routing

Memory, then route(), then a filesystem probe. `levels` is how deep the child then loads.

A child the listing named as `kid/page.jsonl` is read from that file — no probe.

Every page has an `md/`: its markdown files, as pages. Before route(), so a page that routes every name still has one. Markdown.js.

Every page has an `fs/`: this directory's real files, full screen — the owner's "any path slash fs" route (2026-09-28). The same seam as `md` above, one door over in ext, so no page.js exists for it anywhere.

Every page has an `inbox/`: what agents left on it, unread first. A Doc page has it as a real tab (ext/Doc), which wins above.

A loaded page.jsonl listing says which file makes `name`, so the probe is skipped; a stale list never hides a page.

## Markdown/file loading

`name.md` beside me, as a page — the last probe, or the first when my list names it.

## Links/open

WHERE A CLICKED LINK OPENS — the page decides, the link carries no target. The Router hands every in-app click to the page that holds the link.

The real folder my own .md files live in. A card whose url is a view of a folder elsewhere overrides this.

The link's decision lives in Links.js; a page overrides these and the Router calls them.

## Static page lookup

Which page drew this element — the nearest one up. Filled by render().

## from() method

A page.json (an object, or a directory url) AS A REAL PAGE: parents first, children by directory name.

Not in child()'s probe chain. `new this` / `this.from`, never `new Page`. The keys are props().

`url &&` — an object handed in directly has no address for its children to hang off, so they are declared by name and left to resolve the ordinary way.

What a page.json becomes: the six words plus three labels. A subclass overrides props() alone.

## props() method

the disk key is older than the label

a url, or the page's own function

## slug() method

"Default Page Title" → "default-page-title"

## Container management

A region, an ancestor's $pages, or the app — most specific claim first.

The claim string names the parent that decided — the seam to log when debugging.

Router.activate() calls this root-to-leaf, so my ancestors — and their regions — already exist by the time I look for a container.

## in_doc() method

Is an ancestor drawn by ext/Doc? Then its Files tab already covers the Folder link (read off the DOM class).

`page.view` is a View: the class list is `page.view.el.classList`.

## render() method

`standard` is the default page shape; a declared `classes` replaces it whole.

No floating "Folder" link here: deleted on purpose (2026-09-28); read doc/decisions.md before re-adding one.

"$N.NN of AI work · M tasks": computed by Server/page-ai-cost.mjs, drawn at the END of the page.

"N open tasks touch this page", computed into ai/page-work.json; nothing drawn when there is none.

"Inbox · N": a link to inbox/, drawn only when this page has open notes.

once, here — the early return above skips a second draw

## Content rendering

What is in the box: the content list draws its items in order; the page does not know the kinds.

The row box for any List (the Now card's dashboard too): one row per item, redrawn from the list's events.

A page or file at an address, drawn in this page's box (`content: "/notes/x.md"`).

## drew_content() method

What came back, on screen — or the one sentence that says nothing did. A page read from an address is BUILT here, never the module page at that url, so nothing is shared with the real page and `render()`'s view cache is not stolen.

## crumbs() method

The trail to me, one link per page — DERIVED, so it cannot be wrong. `from` is where it starts (the site root by default); the marks are Router.mark_links()'s.

## RELATED section

RELATED — a pinned aside of links to other pages (Related.js; `related: "/a/ /b/"`, doc/property/related.md)

## COLUMNS section

COLUMNS — the Finder shape (Columns.js, doc/columns.md)

`this.columns({ even: true })`, never a declared `columns:` field: it would shadow this method.

`fit`: "floor" (default) never narrower than recommended; "round" fills tighter.

The narrowest a DRAG may leave a column. A field, so `new Page({ column_floor: 140 })` wins.

## nav_for() method

The child's own entry, at the url this list gives it. Weakest label last: the child's `label`, its title, then the segment — a declared child may still be null.

## PREVIEWS section

PREVIEWS — a card per child, a wall of rungs, one card (Previews.js, doc/previews.md)

Facades: a page overrides `preview(nav)` and calls `preview_card` (the hook below), so these stay Page methods.

The one card shape. A page that wants a live render overrides this method: `preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }`

## load_all_children() method

How deep my declared subtree is FETCHED (default 2; 1 = my children; 0 = none). A declared `depth:` wins.

My children fetched, and theirs, until the budget runs out.

## PREFERENCES section

PREFERENCES — the page's own url IS the id (localStorage)

Storage, not STATE: nothing here notifies.

## Class composition

ext/tabs patches `tabs()` onto this prototype and fills `regions`, which container() reads. Nothing here declares either.

Registered so define_fields() builds the title/icon/description accessors.

Opt-in instance tracking, installed once so every Page shares one list (core/track/track.js).
