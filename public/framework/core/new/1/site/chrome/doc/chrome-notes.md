# chrome.js — design notes

## Highlight import and code factory

Importing highlight ENHANCES the shared `code` factory in place — code.js(), code.fn(), code.css(). This section's pages import `code` from here rather than from /app.js, so the enhancement and the thing it enhances arrive together instead of depending on who happened to import what first.

## show_source()

`String(fn)`, not `code.fn(fn)`: code.fn() runs util/source, which strips the wrapper — and for a function that IS the pattern, the signature is half of what a reader needs. Either way the text is the function that ran, so the page and the code cannot disagree.

## child_label() — the label rule

What a link to a child should SAY, before that child has been imported:

1. a label the parent declared    `labels: { dynamic: "route()" }`
2. the name, made readable        `"getting-started" -> "Getting started"`

Never the child's own `title`. A title exists only once that child has been imported, and WHICH children are imported depends on the url you arrived at — so a nav built from titles reads differently per entry point. That is the bug tabs() already refused, and a sidebar is on screen far longer than a bar.

`labels` is inert data on the parent: Page's constructor is assign-based, so this needs nothing from the framework. See agents/chrome/page.js for the one-method version that would let previews() agree with it.

## nav() — two levels, derived

Two levels, derived, and it imports nothing: the top level is root.children (names, in declaration order) and the second is the children of whichever of them is in `here`'s chain — a page you have necessarily walked through, so its own children Map already exists.

## crumbs()

chain() is [root … me] and every page in it is loaded by construction — the Router walked through them to get here. So crumbs are the one derived chrome with no lazy-title problem at all: real titles, always, for free.

The separator is CSS (.chrome-crumb + .chrome-crumb::before), not an element: a "›" between links is decoration, and as a DOM node it gets read aloud, selected, and copied along with the text.

## topbar()

The siblings of the current page — movement ACROSS the tree at the depth you are already at, which a vertical sidebar cannot express without expanding every level at once.

## prev_next() — ordering guarantee

The one pattern that spends the ordering guarantee: children is a Map built by declare() in declared order, and add() setting an existing key never moves it, so index order is AUTHORED order — permanently, whether a name has resolved yet or not. Nothing else in the tree needs that promise; this does.

At the ends, "up" instead of nothing: a dead end is where a reader most needs a way out, and the parent is always there.

## jump_list() — searchable tree

Every declared name reachable without an import: the root's children, plus the children of any page already loaded. Loaded pages contribute a real title; unloaded ones contribute their label, which is a name. Nothing here fetches, so nothing here can search what a name does not say.

## widths() — three viewports on one screen

A stage is a container, so the chrome inside it responds to the BOX. These buttons cap the box — max-width, never width, because a stage fixed at 1400px inside a 260px column pushes the whole page sideways.

Real chrome would say `@media`; a demo that queried the window would be lying about which width made it change.

## ChromeShell — miniature App + Router

A miniature App + Router, so a chrome pattern can be shown navigating without navigating the site. It exists to make one claim checkable: chrome() runs ONCE, in render(), and go() only ever touches $pages and the marking.

Usage:
```
new ChromeShell({
    root: sample(),
    chrome(shell){ … built once … },
    navigated(shell){ … derived chrome, rebuilt per navigation … },
});
```

`navigated` is deliberately the name this section is asking Router for: a crumb bar, a prev/next and a drawer that closes itself all need the same one line, and today the framework has nowhere to put it.

## ChromeShell.initialize() — preventDefault behavior

Any anchor inside a miniature is miniature navigation. preventDefault() here beats the Router to it — Router.link_clicked() bails on `e.defaultPrevented` — so a fictional url never reaches the real thing. One handler on the shell, not one per link.

## ChromeShell.go() — walk exactly as Router

The walk, exactly as Router does it. Nothing is fetched — a sample tree is built with add() — but the shape is the same, awaits and all.

## ChromeShell.show() — pages by name

$pages by name, never the ambient captor: go() is async, so by the time this runs the captor is long gone.

Every shell drills down as well as up, whatever chrome it is wearing.

## ChromeShell.mark() — miniature link marking

Router.mark_links() in miniature — with its two classes renamed.

It cannot use `.active` / `.in-path`: the real pass runs over every anchor in $app on every navigation and REMOVES those classes where they don't match, so a miniature that borrowed them would be silently wiped the next time you clicked anything. Same rule for any widget with link state.

## sample() — fictional sample tree

Not this site's: fictional urls, so nothing here can be confused with a route that exists, and a six-deep branch for the patterns that only break at depth. Built entirely with add(), so child() resolves from memory and no shell ever touches the network.

`labels` is the same inert data a real parent declares: "api" prettifies to "Api", which is the failure mode the declaration exists for.
