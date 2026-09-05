# The builder — from "new page" to any page on this site, with controls

The owner, 2026-09-05:

> go through all the pages in this framework, and think, "how would i build this with a ui?"
> if we want to move pages to pure .json, how can the ui go from "new page" to any of the pages
> we have. top tabs? left sidebar tabs? column pages? header? footer? takeover? swap? color?
> etc… it needs to be better… simpler… more configurable.
> what's the ux for adding tabs to a page? what's the ux for configuring tabs?

This file is the answer in three parts: **the census** (every `page.js` on the site, sorted by
what a UI would have to offer to build it), **the builder** (which controls, in what order, and
what each one writes into the JSON), and **tabs** (adding one, configuring one).

The builder itself is a page you can open: **[/imagine/paging/build/](/imagine/paging/build/)**.
Where the pages go and why there is exactly one store is
[`persistence.md`](/imagine/paging/doc/persistence.md) beside this file — read that first if you
have not; this file assumes its "pages as pure JSON" table.

---

## 1 · The census

**Every `page.js` under `public/` was read and classified: 890 files found, 890 rows
classified.** The two numbers agree, and the sorter is
`ai/2026-09-05/page-builder-ux/census.mjs` — re-runnable, so the number is checkable rather
than remembered. Every row is in `census.tsv` beside it.

A row records: what navigation the page offers · its surface · its layout number (the
[`/imagine/layouts/`](/imagine/layouts/) numbering) · its content kind · and **the one thing
that forces it to be code**, if anything does.

### The headline

| tier | pages | what it means |
|---|---:|---|
| **configuration** | **197 (22%)** | a title, a description, some prose, children, maybe a card wall. **The builder can write this today** — there is no code in it at all. |
| **one word away** | **378 (42%)** | the page has to NAME something js supplies: a house factory, a page class, a stylesheet. That is exactly the `"kids": "tabs"` pattern — data chooses, js supplies. |
| **code** | **315 (35%)** | a live control, content computed from data, something fetched. **These should stay code**, and `page.js` is what they are for. |

### The three things that force code

Each page is charged to the FIRST reason that applies, in the order a builder would have to
solve them:

| what forces it | pages | can a UI ever fix this? |
|---|---:|---|
| **a live control** — a click handler, a chip, a form field | **137** | No. A page that answers a click has behaviour, and behaviour is code. |
| **content computed from data** — a loop over a manifest, a list built from a module | **94** | Partly: a `list` renderer pointed at a named source covers the common shape. The rest is code. |
| **async / fetch** — the page reads something before it can draw | **53** | Partly, and the same way. |
| its own state (`store()`) | 15 | No. |
| a class of its own | 16 | No. |

And the things that are *not* code — they only need a word in the JSON and a function
registered against it:

| what it needs named | pages |
|---|---:|
| a house factory the JSON has no word for (`demo()`, `section()`, `js()`, `transcript()`, …) | 268 |
| a page class (`Template`, `Shell`, `Post`, `Scene`, `Deck`, `Blog`, `AITask`, …) | 79 |
| its own stylesheet | 27 |
| fields computed by a helper (`new Page(numbered({…}))`) | 4 |

### The finding that decides the builder's shape

**There is no small set of house factories worth building renderers for.** The corpus uses
**817 distinct factory names**; 322 of them appear in the 268 pages that are otherwise one word
away. Taking them greedily — always the word that turns the most pages into pure configuration
— the best single word (`dashboard`) unlocks **16 pages**, and twelve words reach only **93 of
268**. It is a long tail with no head.

So the builder does **not** try to enumerate them. It ships four renderers and a **code
escape**: when the controls cannot say a thing, the builder prints the `page.js` a hand would
write for what you have built so far, with the line where your code goes already marked. That
is control 7 on the build page, and it is the honest end of a UI rather than a gap in one.

### What the site actually uses

**Navigation** — and this is the argument for making it one control:

| navigation | pages |
|---|---:|
| none (a leaf) | 464 |
| **columns** — a child opens to the right, the url changes | **274** |
| top tabs | 63 |
| left rail | 27 |
| takeover (`width: "full"`) | 27 |
| right rail | 20 |
| footer | 11 |
| swap without a tab bar | 4 |

⚠ **`crumbs` is not on that list, because no page chooses it.** Core draws the trail on the
columns HOST after every activation (`Page.reveal_column`), so it is the host's, not the page's
— which is why the owner's *"will the breadcrumbs always be there?"* was answered in
[`/imagine/layouts/`](/imagine/layouts/) with a switch on the host and not a field on a page. A
page builder cannot offer a crumbs control today, and saying so is more useful than a control
that writes a field nothing reads.

**Surface**: 877 of 890 pages are `plain`. Seven are `card`, and two each are `tint`, `prim`
and `dark`. The five-surface vocabulary is real and almost entirely unused — which makes it a
cheap win for a builder, because a chip that costs one word can change a page's whole character.

**Layout number**: 661 pages are `1.measure` (one reading column), 144 are `4.wall` (a card
wall), 64 are `1.stack`, 18 are `1.sections`. Two are `4.quarters` and one is `3.thirds`.
**This site is a stack of reading columns and card walls.** Four arrangements cover it.

**Content kind**: prose 633 · demo 118 · wall 113 · form 24 · media 2.

### By realm

| realm | pages | configuration | one word away | code |
|---|---:|---:|---:|---:|
| `framework/core` | 342 | 88 | 106 | 148 |
| `framework/styles` | 58 | 21 | 19 | 18 |
| `framework/ai` | 51 | 7 | 34 | 10 |
| `imagine/paging` | 44 | 1 | 34 | 9 |
| `framework/ext` | 41 | 5 | 10 | 26 |
| `framework/ui` | 22 | 4 | 15 | 3 |
| `imagine/vary` | 21 | 9 | 9 | 3 |
| `imagine/platform` | 20 | 0 | 12 | 8 |
| `imagine/research` | 19 | 9 | 9 | 1 |
| `imagine/generated` | 16 | 15 | 1 | 0 |
| `imagine/design` | 15 | 1 | 1 | 13 |
| `edric/style` | 12 | 0 | 9 | 3 |
| the other 66 realms | 229 | 37 | 119 | 73 |

⚠ **342 of the 890 are `framework/core`, and 248 of those are one experiment** —
`core/new/1/site/`, a whole alternative site built to measure a routing question. It is real
`page.js` and it is counted, but it skews `framework/core` toward "code" more than the site
proper does. Excluding it, `/imagine/generated/` and the `ai/` task pages, the site proper is
**559 pages: 133 configuration · 253 one word away · 173 code** — the same three-way split
within a few points, which is why the headline is quoted from the whole corpus.

⚠ **The classifier reads text, not meaning.** It strips comments, then asks whether a
`content()` body contains anything but literal prose, a card wall and the realm's own lede. It
will call a page "code" for one `.map()` in a comment-free line that a human would call
configuration, and it guesses a page's layout number from what the file itself declares rather
than from a measurement. The tiers are a *shape of the problem*, accurate to a few per cent —
not a ledger. A dozen rows were sampled against their files and three read in full; that check
is what found the missing rule about page classes (`Template`, `Shell`, `Post`), which had been
scoring eleven template pages as pure configuration when each one needs its class.

---

## 2 · The builder — seven controls, in this order

Live: **[/imagine/paging/build/](/imagine/paging/build/)**. Left column the controls, middle
column the page assembling as you press them, right column the `page.json` that gets written.

| # | control | what it is | what it writes |
|---|---|---|---|
| 1 | **Name** | a title, a description, and an icon you click to cycle | `"title"`, `"description"`, `"icon"` |
| 2 | **Navigation** | six pictures: none · columns · top tabs · left rail · right rail · takeover | `"mode": { "navigation": … }` |
| 3 | **Surface** | five chips: plain · card · tint · prim · dark | `"mode": { "surface": … }` |
| 4 | **Arrangement** | seven chips: plain · toolbar top · footer · panel left · panel right · main + aside · wall | `"mode": { "arrangement": … }` |
| 5 | **Blocks** | add a block: prose · card wall · template | `"mode": { "blocks": [ … ] }` |
| 6 | **Pages** | add a child; each row is its icon, name, order and default | `"children": [ … ]` |
| 7 | **Code** | the `page.js` a hand would write for what you have built | nothing — it is the way out |

The order is not arbitrary: **1–4 are decisions about the whole page and 5–6 are its
contents.** You cannot sensibly add a block before you know whether the page is one column or a
wall, and the navigation control changes what "add a page" even means — which is why it comes
second, right after the page has a name.

### The ruling: navigation is ONE control

> **Top tabs, left tabs and column pages are one question asked once — *how do the pages under
> this one appear?* — so they are one control with six pictures, not three settings.**

Each option writes ONE word — `navigation`, the realm's own (`blocks.js`). It used to write a
pair of keys of the builder's own (`kids` and `mech`); that was a second vocabulary in the same
file, and it is gone (2026-09-05).

| the picture you pick | `navigation` | what you get |
|---|---|---|
| **None** | `none` | a leaf. 464 of the site's pages. |
| **Columns** | `columns` | rows you click; each opens as a column to the right and the url changes. |
| **Top tabs** | `tabs` | a strip over one bounded panel. No url. |
| **Left rail** | `rail` | the same strip, down the left. |
| **Right rail** | `rail-right` | the same again, on the other side. |
| **Takeover** | `takeover` | a click fills the screen; everything behind collapses to the crumb strip. |

And the thing the owner suspected is true and is now said out loud in the UI: **"swap" is not
offered as a navigation at all, because a swap with a bar on it is a tab strip and a swap
without one is a mystery.** The builder calls it tabs. `swap` survives as the *mechanism* word
underneath, where it belongs — four pages on the whole site use it bare, and every one of them
is a demo OF the mechanism.

Each option draws its own shape rather than naming it. A word cannot tell you what `swap` does
to a page; a thumbnail with the bar in the right place can.

### Surface and layout are chips, and the layout chips are the layout numbers

Five surfaces, four arrangements, all one word each. The arrangements are the
[`/imagine/layouts/`](/imagine/layouts/) numbers, so the builder and the layout system say the
same words: `1.stack`, `2.main-aside`, `3.thirds`, `4.wall`. The census says that is enough:
**743 of the site's 890 pages are one column and 144 are a card wall** — three pages in total
use anything else.

### Blocks are "add a block", and every block is a renderer that exists

Three today, and each one is drawn by something already written:

- **prose** → `md()`. The text is a textarea in the controls.
- **card wall** → the page's own children as cards (core's `previews()` shape), or **the
  eleven [template families](/imagine/paging/templates/)**, read from the templates realm's own
  list.
- **template** → one family, drawn by the family's OWN module — `mag.column()`, `Post.hero()`,
  a real `Shell`. Nothing is copied.

⚠ **The families are imported lazily.** `templates/families.js` pulls the magazine, the blog's
manifest, the shells and two `ux` modules down with it; a builder that never adds a template
block should never pay for them. The import fires on first use and the box is filled in a
callback — nothing may build DOM after an `await`.

### The code escape is control 7, and it is the census's conclusion

A third of the site needs a `content()` that computes something. So the last control prints the
real `page.js` for the node you have built — imports, fields, the block calls, and a marked
line where your code goes. Copy it into a directory and the builder has handed the page over to
you. **A builder that pretends it can build everything is worse than one that says where it
stops.**

---

## 3 · Tabs — adding one, configuring one

> **A tab is a child page.** There is no separate tab object to create, name or delete. You add
> a page under this one, and the *Navigation* control decides whether the pages under it are
> drawn as **tabs** (a strip over one panel) or as **columns** (rows that open to the right).
>
> **Configuring a tab is the four things every child page already has** — its **name**, its
> **order** among its siblings, whether it is the **default** (the one showing when you
> arrive), and its **icon**. There is no fifth thing.

Those four are the four controls on each row under *Pages* in the builder, and each writes one
field of that child in the JSON:

| you want to | you do | it writes |
|---|---|---|
| make a page use tabs | pick **Top tabs** in Navigation | `"mode": { "kids": "tabs", "mech": "swap" }` on the PARENT |
| add a tab | **+ Add a tab** — the same button says **+ Add a page** when the navigation is columns | a new node in `"children"` |
| rename a tab | type in its row | that child's `"title"` |
| reorder the tabs | the ↑ ↓ arrows; tabs appear in the order the parent lists its children | the order of `"children"` |
| make one the default | the ★ on its row; exactly one, so setting it clears the others | that child's `"mode": { "default": true }` |
| change its icon | click the icon on its row to cycle | that child's `"icon"` |
| remove a tab | ✕ — a tab is a page, so this deletes the page | the node leaves `"children"` |

⚠ **The default flag lives in the child's `mode`, not beside its title.**
`FileStore.file()` writes exactly five keys and drops everything else at the top level, so a
top-level `"default": true` was written into memory, drawn on screen, and **silently lost on
save** — the tab came back un-defaulted after a reload with nothing said. Measured 2026-09-05.
`mode` is the one object that rides through whole.

⚠ **Tabs do not change the url.** A tab strip is `swap`: the panel changes and the address bar
does not, so a tab cannot be linked to or reached with the Back button. The panel says so
itself, with the link that opens the same child as a column — which does. If a child deserves an
address, leave the navigation on **columns**
([the four mechanisms](/imagine/paging/mechanisms/)).

⚠ **A rename changes the title, never the directory.** `made/notes/page.json` stays where it is
whatever the page is called, so a url somebody saved keeps working. The trade is that a page
titled *Overview* can live in a directory called `new-tab`; the file is the page and the url is
its address, and moving files under a reader is the worse of the two. The same trade
[Make](/imagine/paging/make/) already made.

**The stage is a drawn rectangle on purpose.** The owner: *"make sure the stage they're
swapping on is visually evident… it could be a white card, and a new white card comes in."* So
the tab strip's selected tab joins the panel below it — no bottom edge, the same background —
and the whole screen has an edge, a radius and a shadow. Measured at 3440: the stage rect was
`[488, 89, 2398]` before a swap and `[488, 89, 2398]` after two of them. **Nothing moves but the
panel**, which is the entire argument for the mechanism.

---

## 4 · Where it saves, and the one store

The builder writes through **`make/made.js`** — the same store [Make](/imagine/paging/make/)
uses, `ext/Saver`'s `FileSaver` over the dev socket in dev and `localStorage` on a static host.
There is no second store and there will not be one; the rule is
[`persistence.md`](/imagine/paging/doc/persistence.md).

A page you build is therefore a real page at a real url — `/imagine/paging/make/<name>/` — and
a real directory, `public/imagine/paging/made/<name>/page.json`. Proved 2026-09-05: built with
tabs at 1280, saved, reloaded, still there; opened cold at its own url and the Router walked
five columns to it.

The builder's own draft is kept under this realm's one key,
`lew42:paging:/imagine/paging/build/`, and the page carries the
[mark](/imagine/paging/doc/persistence.md): amber while the draft is only in your browser, green
once it is a file, with the way back to an empty page either way.

### ⚠ Why `blocks` lives inside `mode`

`FileStore.file()` writes exactly five keys — `title`, `icon`, `description`, `mode`,
`children` — and drops anything else at the top level. So a top-level `"blocks"` would be lost
the moment it was saved. `mode` is passed through whole, so everything the builder invents rides
safely inside it and **Make needed no change at all**. (`arrange` used to ride there too; it is
gone — the numbered layout is derived from the arrangement word, not stored.)

The honest home for `blocks` is the top level. That is a one-line diff to `make/made.js`, and
it is written out below rather than applied: `make/` is another task's file.

---

## Proposals — the diffs this task did not apply

1. **`build` in the paging hub's `children:`.** The page exists (core probes the filesystem for
   an undeclared name, so its url works), but nothing links to it, and on this site a page
   nobody links to does not exist. One word:

   ```diff
   - children: "examples mechanisms styles sizes make templates center transitions toolbars rightnav explorer inventory critique",
   + children: "examples mechanisms styles sizes make build templates center transitions toolbars rightnav explorer inventory critique",
   ```

2. **This file in the realm's Docs wall.** `/imagine/paging/doc/page.js` landed the same
   night with a `RECORDS` map of the four docs it knows about; nothing crawls, so this one is
   invisible there until it is named. Every link to it in the builder uses the raw
   `…/doc/builder.md` form, which works either way — but the wall is where a reader looks:

   ```diff
     templates: ["Templates", "Which template family's machinery is imported from where, …"],
   + builder: ["The builder", "Every page.js on the site, sorted by what a UI would have to offer to build it - then the smallest builder that does it, and what adding a tab means."],
   ```

3. **`blocks` at the top level of a node.** Two lines in `make/made.js`, and the builder's JSON
   stops hiding content inside `mode`:

   ```diff
   - file(node){
   -     return { title: node.title, icon: …, description: …, mode: { …DEFAULTS, …node.mode },
   -              children: (node.children ?? []).map(kid => kid.name) };
   - }
   + file(node){
   +     const { name, children, ...rest } = node;
   +     return { ...rest, icon: node.icon ?? "description", description: node.description ?? "A page you made.",
   +              mode: { ...DEFAULTS, ...node.mode }, children: (children ?? []).map(kid => kid.name) };
   + }
   ```

4. ~~**Make should draw a node's blocks.**~~ **DONE, 2026-09-05 — and the decision is below.**

5. **`build-` in `framework/styles/css-scopes.txt`.** The prefix is registered by the
   `new-css-class` skill and this task's fence is `build/` only:

   ```diff
   + build-       /imagine/paging/build (the three-column builder card, its stage and its file pane)
   ```

## Decided: the blocks reach the page, through the stage's `draw` seam (2026-09-05)

**The problem.** Build's fifth control collected prose, card walls and template families; they
were saved to disk inside `mode.blocks`; and outside `build/` **nothing in the realm read them**.
So a paragraph you typed survived the save and appeared on no page. It is the same defect the
previous pass fixed for the seven words — a control writing a key nothing reads — one level
down (`paging-audit-4b`, break 2).

**The two answers, and why this one.** Either a made page draws the blocks, or `PIECES` and
Build's step 5 come out. Taking them out would delete the only content a built page can have
that is not one of the eight canned samples, and the census above is the argument for keeping
them: "data chooses, js supplies". So the blocks are drawn.

**How.** One renderer, `build/draw.js`, with two callers:

```js
// build/stage.js — the middle column of the builder
draw_blocks(this.node, this.page);

// make/page.js — the page that was saved, through the stage's own seam
this.stage(config, { pages: …, draw: () => draw_blocks(node, this) });
```

`draw` is the seam `stage.js` already had for "put my own thing in the box" — the templates realm
hands a family's real machinery over the same way. **What you see while building is what the saved
page shows**, because it is the same function.

**The rule this sets, in one line:** *a page draws its blocks if it has any, and the `content`
word's sample if it has none.* Nothing else changed about `content`.

**What it costs.** `make/page.js` imports `build/draw.js`, which loads `build.css` — the sheet
that owns `.build-block*`. A made page needs those rules and never loads `build/page.js`, so the
module that draws the classes is the module that asks for the sheet. `View.stylesheet()` is keyed
by href, so the builder loading it twice costs nothing.

**And it decides the merge's shape.** `BuildStage` → `PagingStage` needs a `draw` seam and a
`draw_child` seam; `draw` is now proven on a real page, and the renderer it calls no longer lives
inside the class being deleted.

## What it still cannot do

- **No delete, and no "open an existing page to edit it".** The builder starts from *new page*
  every time; [Make](/imagine/paging/make/) is where a page you already made is renamed,
  reordered and deleted. Loading a made page back INTO the builder is the obvious next control
  and it is one `made.load()` plus a picker — left out because the brief's flow is "new page to
  a finished page", and a half-built loader would have shipped without the reload proof.
- **A block cannot be edited in the stage, only in the controls.** Clicking the prose in the
  middle column does nothing; you type in the left one. Editing in place is a bigger idea
  (`ext/editor` already has it) and mixing the two would make the stage stop being a picture of
  the file.
- **The layout number is the arrangement of the BLOCKS, not of the page in its row.** A page's
  width word (`large`, `fill`, `full`) is still only reachable through the Navigation control's
  takeover option. Splitting them would be a fifth control for a word 27 pages use.

## Done: `BuildStage` renders a `PagingStage` (2026-09-05, after the fourth audit)

**The realm has one renderer for a configured page, and it is now true of the builder too.**
`build/stage.js` used to draw a page by hand — crumbs, tabs, a rail, a toolbar, side panels,
five surface classes — beside `stage.js` doing the same job for everything else. The two copies
had already started to disagree (four properties rows here against three there). The builder's
middle column is a `PagingStage`:

```js
this.$stage = new PagingStage({
	config: config_of(node),                     // the seven words — blocks.js reads them
	pages: kids.map(kid => ({ title: kid.title, icon: kid.icon, text: kid.description })),
	open: this.page.tab ?? default_index(node),  // Build rebuilds this view on every press
	inner: true,                                 // a picture: no caption, no url, no nest
	draw: () => this.blocks(),                   // the blocks, in this page's arrangement
	draw_child: (child, i) => this.panel(child), // a child's panel — the seam that was missing
	picked: i => { this.page.tab = i; },         // which tab you were on, kept
});
```

**What it cost, in lines.** `build/stage.js` went from 260 to 98; `build/build.css` lost 91
lines — the tab strip, the rail, the sheet, the row list and the five `build-screen-*`
surfaces are `paging.css`'s now, drawn once. `stage.js` grew two hooks, seven lines together.

**The three things a builder has that a page does not**, and they are all that is left in
`build/stage.js`: the crumb strip (core draws it on a real page's columns host), the node's
title above the box, and the child panel's one sentence — *the url did not change* — which
only a page that does not exist yet needs to say.

**Two seams, and why they had to be seams rather than options.** `draw` puts the caller's own
thing IN the box; `draw_child` puts it in a CHILD's panel. A configuration has no way to name
either, because neither is a word — they are code the caller supplies, which is exactly what
the census above says a third of this site needs. `picked` is the third and smallest: it hands
back which child is open, because a caller that rebuilds the stage on every keystroke cannot
keep that inside it.

**Proven.** Two tabs added in the builder draw as the realm's own tab strip; clicking the second
selects it and shows its panel; pressing a control afterwards leaves you on the tab you were on;
Surface → Dark paints `paging-surface-dark` on the box; Navigation → Left rail draws a
`paging-rail`; Arrangement → Wall lays the blocks out as `build-arrange-4-wall` inside
`paging-arr-wall`. 1280 / 3440 / 400, zero console errors.

**What it opens.** The builder's middle can now wear the realm's own bar with one line
(`stage.changed = (axis, value) => this.set_words({ [axis]: value })`), which would give Build
the four words it has no control for — room, page colour, type size and content. That is the
next thing here, and it is small.

## Dropped from the plan: `compare/` (2026-09-05)

A two-stage side-by-side page was proposed and is not being built.
[`cross/`](/imagine/paging/cross/) shipped and is the better version of the same ask: **nine**
live pages at once, navigation across and arrangement down, and every cell is a link to that
page full size. A compare page would have needed a shared toolbar and a second set of state to
show one fewer comparison.
