# Page.class.js — design notes

## Pages without filesystem overview
A node: a url, some content, and children declared EITHER way — eager (imported with me) or lazy (imported when walked to). Both tiers compose at any depth. The eager tier is new/0's; the lazy tier is what new/0 could not have, because its recursive adopt() assumed the whole tree was already in memory.

## Class field declarations
Every property the class assigns after construction is declared at the top. No initialisers and no behaviour change — the point is `alias()`, which refuses to shadow existing property with `if (!(key in this))`. That guard was complete for the prototype and blind to these seven class fields, so a child named `view` or `$pages` overwrote real state and blanked the page **on a cold load only** — it worked on a click because the property hadn't been written yet. Declaring them makes the guard true.

The side benefit: a reader now learns this class's whole mutable surface from the top of the file.

## add() adoption
Adoption goes in through the CONSTRUCTOR, not after it. `initialize()` runs at the end of constructor, so an inline page used to reach it with no parent and therefore no url — any child it added computed `undefinedkid/`, silently. Every route()-built page is in exactly that position. Passing `adopt` as second argument works because constructor is `assign(...args)` and later args win, same shape as `new Router(this.router, { app: this })`.

`new Page({…})` built by hand and passed in stays un-adopted until this line (should: you constructed it before adoption, so no url for it). Found by the url seat.

## reserved names for children
A Set to protect against children shadowing class state. A child named `content` makes a page render THE CHILD as its own content, silently. A child named `classes` throws "arg.split is not a function". `content` is an ordinary section name.

A Set not three more class fields — an instance field shadows a prototype method, so `content;` would break every `class X extends Page { content(){ … } }`. The seven class fields above are safe only because none is ever a method.

## load(url) error handling
A module that throws is NOT a module that isn't there (this is the one place the distinction gets lost). Swallowing both (missing + error) turns a syntax error in a page just written into a silent 404.

## child routing order
I may still claim a name never declared — route() is how a page owns urls it couldn't list in advance (`/items/42/`). It runs after the DECLARATION, not after filesystem, which is the ordering starter got stuck on: only declared names ever hit network, so a dynamic name costs no doomed 404, and route() structurally cannot shadow a page.js — a file you want is a file you declared.

`is.fn` not `?.` — alias() writes child onto `this` by name, so a child called "route" makes `this.route` a Page, and `this.route?.(name)` throws TypeError where it should 404'd.

## container() mounting hierarchy
Where I mount, in order of how specific the claim is:
1. my parent put ME somewhere (`regions`) — one named child (a tab)
2. an ancestor claimed the subtree (`$pages`) — everything below it
3. the app — the default, flat

A page claims a subtree by assigning `this.$pages`; tabs() claims single children, which is why two tab sets on one page can't share a `$pages` and needed their own level.

## container() observability
container() is the one step a reader cannot see — a parent it never mentions decides where it lands. Kept (it makes tabs, columns and nested arrangements expressible), so the answer is to make the choice observable rather than declarative. Eric's request, after ten recipes.

## tabs() default tab ownership
The first tab's link is THIS page's url, not the child's, so `/tabs/` is the default tab rather than a second url showing the same thing. Only the FIRST set can do that — my url means one thing — so a second tabs() on the same page is ordinary: every tab links to its own url and nothing is default.

Which children are tabs is decided HERE, at placement — not marked on the child. So a page can have several sets, and a child in none of them is an ordinary child that renders wherever it would have anyway.

ONE tab is imported: the first (must render to show on this page's url). The rest are labelled by their declared NAME, which is deterministic — a title would depend on which url you arrived on, which is exactly the bar-reads-differently bug. load_all_children() in initialize() opts into real titles for all.

## render() one-shot
Built once, never rebuilt. It's what makes tabs, columns and nested arrangements expressible at all. Captured synchronously (no DOM after await — async child() would import every declared child on cold load, measured once on cold load of "/").

## previews() unresolved children
A POJO is never stored, adopted, or given identity — it's a string and a url on the way to an `<a>`. Not the rejected stub. An unresolved child is drawn from what a name tells: segment and url it must have. Card says "columns" until you visit and says "Columns".
