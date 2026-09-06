# Graduating the paging vocabulary into core Page

**What this is.** `/imagine/paging/` is a lab where you build a page out of six words instead of
code — navigation, content, room, arrangement, colour, type. It works, it reached the owner's bar
(6/6 on the eighth audit, `../../2026-09-05/paging-audit-8/task.jsonl`), and it only works inside
the lab. This is the plan that makes those six words the way **any** page on this site is
configured, so the lab can delete its own renderer and its own vocabulary and import core's.

**The headline, before any detail.** Four of the six words are things core already does — it just
has no word for them. One of the six is already a core option and wins outright. One collides with
a method a core page really has and must be renamed on the way in. The renderer does not graduate
as a class: most of it is demo instrument, and the part that is real splits into one part class on
`Page` plus five CSS words. The change to `Page.class.js` is about **90 lines added and nothing
removed**; the change to `Page.css` is **one new block of about 40 rules**, none of which is
reachable until a page says a word it has never said before.

**The three slices.** 1 — core gains the words, nobody uses them, every screenshot on the site is
byte-identical. 2 — the lab imports them and deletes ~500 lines of its own copy. 3 —
`/imagine/sections/` and `/imagine/layouts/` become the two catalogues the *arrangement* word picks
from.

---

# 1 · The map

For each word: what core already has, what is missing, and — where the lab and core name the same
thing differently — which one wins and what happens to the loser.

## navigation — what a click on a child does, and how children are drawn

**The lab** has one control with seven answers (`imagine/paging/blocks.js:40`), each carrying two
flags: `stable` (does this move what I was already looking at?) and `swaps` (does clicking a child
change what is *inside* the box?). `PagingStage.frame()` (`imagine/paging/stage.js:234`) dispatches
on it.

**Core** already performs six of the seven — it just has no single word that picks between them, so
a page picks by calling a different method in `content()` or `initialize()`.

| the word | what core already does, today | where |
|---|---|---|
| `none` | nothing | — |
| `tabs` | `this.tabs()` — a bar of links over one panel region | `ext/tabs/tabs.js:17`, patched onto `Page.prototype`; `app.js:140` imports it for the whole site |
| `rail` / `rail-right` | a column of child links beside the content | closest today is `column()`'s own child rail, `core/Page/Page.class.js:334`; the box is the `.rail` layout word, `styles/doc/layout-system.md` §2 |
| `expand` | **missing** — `<details>` rows that open in place | `ui/accordion` is two CSS rules and no JS; the lab uses it at `stage.js:536` |
| `columns` | `this.columns()` — the whole subtree becomes a row of columns | `Page.class.js:275`, `Page.css:261–287` |
| `takeover` | `width: "full"` on the child — it takes the row and its ancestors collapse into the crumb strip | `Page.css:326`, `Page.css:388` |

**Two of the seven are core already, said out loud.** `columns` **is** `Page.columns()` and
`takeover` **is** `width: "full"` — the lab's own `words.js:1` says so in its header comment. What
the word buys is that both become sayable from a page's *declaration* instead of from a method
body.

**Missing in core:** the word itself; `expand`; and the height reservation that makes a swap not
resize the box (`imagine/paging/paging.css:769–771` — every panel drawn into one grid cell, the
ones you are not reading `visibility: hidden` so they are still *measured*). That last one is small
and it is the difference between "the box did not move" being true and being a claim.

**Who wins:** core's mechanisms win as the implementations, the lab's list wins as the names.
Nothing is renamed and nothing is reimplemented.

**The loser to alias:** `MECHANISMS` (`imagine/paging/words.js:15`) — the older four names for what
a click does. Nothing writes them any more; three pages in `/imagine/codrops/` import the object by
name. Leave the file exactly where it is and do not touch it in any slice.

## content — what is in the box

**Core wins outright, and it wins by already being right.** `content` is a core `Page` option
today: a function or a string, read by `render()` (`Page.class.js:245`) and by three of `declare()`'s
child forms (`Page.class.js:52–56`), with 19 declaration sites. On a real page, *what is in the box*
**is** `content()`.

**The lab's eight values** (`blocks.js:81`) are eight canned renderers in
`imagine/paging/content.js` — a fake article, a fake dashboard, a fake settings screen. They exist
because the lab has no real pages to show. **They must not graduate.** They stay in the lab as
demo fixtures.

**What does graduate is the ninth answer: a url.** `blocks.js:267` `is_url()` is the whole test —
a value starting with `/`. `stage.js:400` reads a `.md` address as prose; `stage.js:482` reads a
page address as its `page.json` and runs it. Core already has both halves of that:
`Page.file()` (`Page.class.js:140`) makes a sibling `.md` a page, and `md.file()` renders one.

So core gains one rule: **a `content` string that starts with `/` is an address to render, not text
to print.** Verified safe — there is no `content: "/…"` anywhere in the repo today, so no existing
page changes.

**Missing in core:** nothing else. The lab's loop fuse (`stage.js:457`, two levels of nesting then a
link) graduates with the url rule, because a page whose `content` is its own address would otherwise
read itself for ever with nothing thrown.

## room — how much of the screen the box gets

**Core's key wins, by 194 to 2.** `width:` is declared 194 times across the repo
(`large` 80, `small` 60, `full` 51, `fill` 51, `hug` 5); `room:` twice, both in the lab. `width` is
stamped by `column()` at `Page.class.js:359` and the five column words are `Page.css:322–326`.

**The two vocabularies are not rivals — they are two halves of one axis, and each half belongs to a
different host.**

- In a **columns row**: `small hug large fill full` (already core; `core/Page/doc/columns.md` has
  the table).
- In the **page grid**: the lab's four — and core answers three of them already.
  `Page.css:131–152` gives every page three tracks (`main` capped at `--measure`, `wide` = all the
  leftover, `bleed` = edge to edge, `Page.css:154–156`), and `.page.solo` (`Page.css:167`) is a page
  that takes the whole region.

| lab word | core, after | new CSS |
|---|---|---|
| `narrow` | the page itself stops at the measure plus its gutters | one rule, `.page-w-narrow` |
| `reading` | the default — writes nothing at all | none |
| `wide` | the page's own frame claims the `wide` track; **prose keeps its measure** | one rule, `.page-w-wide` |
| `full` | `.page.solo`, which core already has | none — `full` maps to the class that exists |

`full` therefore means the same thing in both halves ("one page at a time, the ancestors collapse"),
which is why it is the one word that is allowed to be in both lists.

**The loser to alias:** `room:`. Read it on the way in and never mention it again —
`this.width ??= this.room` — so every `page.json` the lab has already written keeps working for
ever.

⚠ **Do not add `narrow reading wide` to the column half.** `column()` stamps
`page-column-<width>` for *any* value, so `width: "wide"` inside a columns row would stamp a class
that does not exist and silently fall back to the default column. That is acceptable (a no-op, not a
break) but it must be written down, and slice 1 must not invent `.page-column-wide` to "fix" it.

## arrangement — where the page's other parts sit around the box

**The lab** has seven shapes (`blocks.js:141`), each naming the numbered layout it compiles to
(`blocks.js:129` `layout_of()`), and it is careful about one distinction core does not have a word
for at all: **a navigation rail lists this page's children; an arrangement panel is anything else**
— a filter, a contents list, the properties of what you are reading (`blocks.js:135` says so; the
renderer at `stage.js:673` draws it).

**Core** has the mechanism and no word: `regions`, a `Map` from a child's name to the view it mounts
in, read by `container()` (`Page.class.js:187`) and filled today only by `ext/tabs`
(`ext/tabs/tabs.js:30`). Beyond core there are two whole realms that are already this word's
catalogue: `/imagine/sections/` (bands stacked down a page — head, side, main, aside, notes, foot)
and `/imagine/layouts/` (18 numbered layouts, each one CSS declarations as data,
`imagine/layouts/system.js`).

**Who wins:** the lab's seven names win — they are the reader's words and they already point at the
numbered layouts. Core supplies the **boxes**: an arrangement word creates a region and registers it
in `this.regions` under a fixed name, and a declared child of that name mounts in it, exactly the
way an `ext/tabs` child does today.

| word | region it opens | numbered layout (`blocks.js:141`) |
|---|---|---|
| `plain` | none | 1.stack |
| `bar-top` | `bar`, before the content | 1.stack |
| `bar-bottom` | `bar`, after the content | 1.stack |
| `rail-left` | `panel`, before the content | 2.main-aside |
| `rail-right` | `panel`, after the content | 2.main-aside |
| `main-aside` | `aside`, after the content | 2.main-aside |
| `wall` | none — the content spreads into as many tracks as fit | 4.wall |

⚠ **`bar`, `panel`, `aside` and `rail` are region names — Map keys — and they must never become
fields or methods on `Page`.** All four are already page words somewhere: `imagine/blogx/Blog.js:262`
declares `rail()` and `aside()` as page methods, `framework/ui/page.js:39` declares `bar()`,
`core/Page/overview/docs/page.js:56` declares `rail: true`. `core/Page/doc/columns.md` already
recorded this trap when `index:` was named. A Map key shadows nothing.

**What does not graduate:** the lab's panel *contents*. `stage.js:673` draws four canned filter rows
and four canned property rows. Core ships boxes, never furniture.

## colour — two independent controls, five words each

**The lab** has five surface words (`blocks.js:164`) and uses them twice, on purpose: the content's
own fill and the page behind it, because the owner asked for exactly that. The classes are
`imagine/paging/paging.css:704–722`.

**Core** has every one of the five as a token or a class already:

| word | what it is in core today |
|---|---|
| `plain` | no fill — nothing to declare |
| `card` | `.surface` — `framework.css:336`: `--surface`, a hairline, a radius. The lab adds a soft shadow. |
| `tint` | `.tint` — `framework.css:346`, the token `--tint` at `framework.css:82` |
| `prim` | `--prim` mixed into the surface. `framework.css:527` has `button.prim`; there is **no panel class** |
| `dark` | `styles/sections/tone.js:22` `band("dark")` — `--bg` plus `color-scheme: dark`, which is the one line that flips every token inside the island |

**The vocabularies disagree, and it is worth naming exactly how.** The theme's four tones are
`surface wash prim dark` (`styles/sections/tone.js:11`); the lab's five are
`plain card tint prim dark`. Two mismatches:

- `card` ↔ `surface` are the same thing under two names.
- `wash` has no lab word — and the lab's `paging-bg-plain` **is** `var(--wash)`
  (`paging.css:718`). So the two vocabularies already met and nobody noticed.

**Who wins: the lab's five.** They are already the cross-realm names —
`imagine/sections/sections.js:2` imports `SURFACES` straight out of `paging/blocks.js`, and
`imagine/layouts/system.js:38` re-lists the identical five. Two other realms have already voted.
Every one of the five is *defined as* an existing theme token, so nothing new is invented.

**Losers to alias:** `surface` → `card`, `wash` → `tint`, on the way in. `tone.js`'s own
`TONES` array is untouched (it is a band's vocabulary, not a page's) and slice 3 is where the two
get pointed at one list.

⚠ **One real inconsistency to fix while moving.** `plain` means *transparent* on the box
(`paging.css:704`) and *`var(--wash)`* on the frame (`paging.css:718`). In core, `plain` must mean
one thing: **no fill of its own**. The grey a lab frame shows is the region's grey, not the word's.

## type — the type size

**The lab** has three (`blocks.js:172`): `compact` 0.9×, `regular` 1×, `display` 1.15× with a
steeper heading ramp (`paging.css:835–839`).

**Core** has one scale and no word: the body clamp at `framework.css:278` and the heading ramp at
`framework.css:317–321`.

⚠ **`type` is taken on a core `Page`, and this is the one hard collision in the whole plan.**
`core/Page/generator/page.js:261` declares `type(text){ … }` as a page **method** and calls it three
times (`:146`, `:272`, `:286`). A `Page` field named `type` would read that function back and stamp
a CSS class made out of a function body — the exact shadowing trap the `code` skill records for
`opens`, `chips` and `naming`.

**The key is `type_size:`** — which is already the reader-facing label: `blocks.js:242` says
`label: "type size"`, and the url key has said `type-size` since 2026-09-05. Inside a `mode` object
the key stays `type` (there it is data in an object, not a field on a page, so it shadows nothing)
and `Page.from()` translates it.

**Who wins:** the lab's three values, on core's key.

## What core is missing outright — the whole list

1. The **word→class stamp** (six classes on the page's own view).
2. **`expand`** navigation — `<details>` rows.
3. The **height reservation** that makes a swap not resize the box.
4. **`content` as a url**, and the loop fuse that makes it safe.
5. **`Page.from(json)`** — a `page.json` as a real page.

Everything else on this page already exists in core under another name.

---

# 2 · The seam

## What a page says

```js
import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Notes",

	navigation: "rail",        // how my children are drawn, and what a click does
	width: "wide",             // how much of the region I take   (`room:` still read)
	arrangement: "rail-right", // what chrome sits around me, and where
	surface: "card",           // my content's own fill
	background: "plain",       // the page behind it
	type_size: "regular",      // the type scale

	children: "today later properties",
	content(){ p("What is in the box."); },
});
```

Six words, all optional, every default writing nothing. A page that says none of them renders today's
markup byte for byte.

## What lands in `core/Page/Page.class.js` — about 90 lines, all additive

**A. `words()` — the one reader, so nothing can disagree about what a page said.** Add beside
`naming()` (which is `Page.class.js:26`), and call it from `naming()`'s last line so it runs inside
the constructor before `declare()`:

```js
// The two words that mean the same thing under an older name. `card` used to be
// `surface` (the theme's own tone list still says so, styles/sections/tone.js:11)
// and `tint` used to be `wash`.
const ALIAS = { surface: "card", wash: "tint" };

	// The six page words, resolved once. Every default is undefined — a word nobody
	// says writes no class at all.
	// ⚠ IDEMPOTENT ON PURPOSE. `naming()` runs twice for an adopted page — once in
	//   the constructor (Page.class.js:17) and again from add() (:82) — so every line
	//   here must survive being run on its own output. `??=` does; a straight
	//   reassignment through ALIAS does too, because ALIAS has no entry for its own
	//   answers. There is NO line for `type` — see the risks.
	words(){
		this.width      ??= this.room;                                  // the lab's older key
		this.surface     = ALIAS[this.surface]    ?? this.surface;
		this.background  = ALIAS[this.background] ?? this.background;
		return this;
	}

	// The classes the six words stamp. One method, so `render()` and `render_column()`
	// cannot drift.
	word_classes(){
		return [
			this.navigation  && "page-nav-" + this.navigation,
			this.arrangement && "page-arr-" + this.arrangement,
			this.surface     && "page-surface-" + this.surface,
			this.background  && "page-bg-" + this.background,
			this.type_size   && "page-type-" + this.type_size,
		].filter(Boolean);
	}
```

**B. `render()` stamps them.** `Page.class.js:241–256`, two changed lines:

```js
		this.view = div.c("page flow", () => { … })
			.ac(this.name && "page--" + this.name)
			.ac(this.width && !this.column_host() && "page-w-" + this.width)   // NEW
			.ac(...this.word_classes())                                        // NEW
			.ac(this.classes ?? "standard");
```

⚠ `render_column()` (`Page.class.js:298`) gets `.ac(...this.word_classes())` too, but **not** the
`page-w-` line — a column's width is already stamped by `column()` at `Page.class.js:359`.

**C. The frame — one part class, hung on the constructor.** This is what `PagingStage` becomes, and
the `code` skill's §3 is why it is a static: `extends` copies the static side, so a subclass gets the
whole machine with nothing to wire, and a method inside reaches it as `this.constructor.Frame`.

```js
// core/Page/Page.class.js, at the bottom beside Page.Store
Page.Frame = class PageFrame extends View {

	// The page's shape: chrome where the arrangement word puts it, the children drawn
	// the way the navigation word says, the content in the middle.
	render(){ … }

	// one method per piece, so a subclass replaces ONE of them:
	bar(where){ … }      panel(side){ … }     aside(){ … }
	rail(side){ … }      tabs(){ … }          rows(){ … }     expander(){ … }
	box(){ … }           reserve(){ … }
};
```

`render()` builds one only when the page said a word that needs a box — otherwise it does not exist
and nothing changes:

```js
		const frame = this.word_classes().length && new this.constructor.Frame({ page: this });
```

⚠ **`PageFrame`, never `Frame` or `Stage`.** `View.classify()` (`core/View/View.js:44`) mints a CSS
class from every constructor name in the chain, so a class called `Stage` wears the framework's own
`.stage` — `container-type: inline-size; overflow: hidden` — and shrink-wraps itself. That happened
for real on 2026-09-05 (307px inside a 1546px frame, nothing thrown), which is why the lab's class is
called `PagingStage`. `.page-frame` is census-clean.

⚠ **Never pass a `name` to it.** `classify()` ends with `if (this.name) this.ac(this.name)`, so a
`name` field becomes a bare unprefixed CSS class.

**D. Regions.** `Page.Frame.render()` fills `page.regions` (the `Map` `container()` already reads at
`Page.class.js:187`) with `bar`, `panel` or `aside` per the arrangement table above, and with the
navigation panel for `tabs`/`rail`/`rail-right`. `ext/tabs` fills the same Map today; there is no new
mounting rule to write.

**E. `navigation: "tabs"` calls `ext/tabs`, it does not reimplement it.**

```js
	tabs(){
		if (is.fn(this.page.tabs)) return this.page.tabs();
		return p.c("muted", 'navigation: "tabs" needs `import "/framework/ext/tabs/tabs.js"`.');
	}
```

Core still imports no `ext` (the rule `Page.file()` keeps at `Page.class.js:140`), and the site has
exactly one tab implementation — `app.js:140` imports `ext/tabs` for every page here, so the
fallback line is a dev message, not a normal path.

**F. `Page.from(source)` — a `page.json` is a page.** A new static, beside `Page.file()`
(`Page.class.js:140`) and `Page.load()` (`Page.class.js:163`):

```js
	/** A page.json — an object, or the url of a directory holding one — as a real Page.
	 *  Parents first, children by DIRECTORY NAME, exactly the shape make/made.js writes. */
	static async from(source, adopt){
		const url  = is.str(source) ? source.replace(/\/?$/, "/") : null;
		const data = url ? await Page.read_json(url + "page.json") : source;
		if (!data) return null;

		const mode = data.mode ?? {};
		const page = new Page({
			title: data.title, icon: data.icon, description: data.description,
			navigation: mode.navigation, arrangement: mode.arrangement,
			surface: mode.surface, background: mode.background,
			type_size: mode.type,                       // the disk key is older than the label
			width: mode.room ?? mode.width,
			content: mode.content,                      // a url, or the page's own function
		}, adopt);

		for (const name of data.children ?? [])
			page.add(name, await Page.from(url + name + "/") ?? { title: name });

		return page;
	}
```

**Why `from` and why a name at all.** `Page.load()` is "the page.js at this url" and `Page.file()` is
"the .md beside me". `Page.from()` is the third: "the data that describes a page". `from` reads the
way `Array.from` does, and no `Page.from` exists today.

⚠ **Do NOT wire `Page.from()` into `child()`'s probe chain** (`Page.class.js:121–138`). A third
fetch on every would-be-404 child would be paid by every `.md` child on the site. A page that owns a
JSON subtree calls `Page.from()` itself — the pattern `cms/json/page.js` already documents, and the
one `imagine/paging/make/page.js` already uses (`grow()`, `make/page.js:70`). If that override is
written, **carry core's own guard across** — `if (levels <= this.loaded) return this;` — or a second
call reads back the promise being assigned and throws "Chaining cycle detected for promise" with no
file, no line and no stack (four of them on one page load, 2026-09-05).

`Page.read_json()` is four lines and must carry the SPA-fallback guard: **`res.ok` is not "the file
is there" — the content-type is the 404.** The identical guard is at `Page.class.js:142`,
`imagine/paging/stage.js:36` and `imagine/paging/make/made.js:178`.

## What lands in `core/Page/Page.css` — one new block, about 40 rules

All of it inside `@layer theme` (the file's second layer opens at `Page.css:52`), appended as one
new section after the columns block. Lifted, not re-derived, from
`imagine/paging/paging.css:704–722` (surfaces), `:769–771` (the reservation), `:798–801` (room) and
`:835–839` (type).

```css
	/* the five surface words, twice — the content's fill and the page behind it */
	.page-surface-plain { background: transparent; }
	.page-surface-tint  { background: var(--tint); }
	.page-surface-prim  { background: color-mix(in srgb, var(--prim) 10%, var(--surface)); }
	.page-surface-card  { background: var(--surface); border: 1px solid var(--line);
	                      border-radius: var(--radius); box-shadow: 0 1px 3px var(--shade-a08, rgba(0,0,0,0.08)); }
	.page-surface-dark  { color-scheme: dark; background: #17161a; color: #e8e8ea;
	                      border-radius: var(--radius); }
	/* .page-bg-* — the same five, on the page rather than on its content box */

	/* the three type steps */
	.page-type-compact { font-size: 0.9em; line-height: 1.4; }
	.page-type-regular { font-size: 1em; }
	.page-type-display { font-size: 1.15em; }

	/* room, in the page grid. `reading` writes nothing; `full` is `.solo`, which exists. */
	.page-w-narrow { max-width: calc(var(--measure) + var(--gutter-x) * 2); }
	.page-w-wide > .page-frame { grid-column: wide; }

	/* a swap may not resize the box: every panel drawn, in one cell, the unread ones
	   hidden but still MEASURED. `visibility`, never `display: none`. */
	.page-nav-reserve { display: grid; }
	.page-nav-reserve > * { grid-area: 1 / 1; }
	.page-nav-hidden { visibility: hidden; }
```

Names checked against `framework/styles/css-scopes.txt` (`page-` is core/Page's own reserved
namespace, line 62) and censused live: `.page-nav-*`, `.page-arr-*`, `.page-surface-*`, `.page-bg-*`,
`.page-type-*`, `.page-w-*` and `.page-frame` have **zero** hits anywhere in `public/`.

## What `PagingStage` becomes — and what dies

`PagingStage` is 856 lines and it does seven jobs. **It does not graduate as a class; it splits.**

| what it does | where it goes |
|---|---|
| paints six classes on itself (`stage.js:219`) | `Page.render()`'s `.ac(...word_classes())` — no class needed |
| the frame: bar, rail, box, pane, aside, takeover (`stage.js:234–700`) | **`Page.Frame`** — core |
| the four child drawings: tabs, rail rows, expand, columns (`stage.js:536–618`) | **`Page.Frame`** — core |
| the height reservation (`stage.js:292–317`) | **`Page.css`** — core |
| eight canned samples (`stage.js:372` → `content.js`) | **stays in the lab** — demo fixtures |
| the caption that measures the box before/after every click (`stage.js:719–857`) | **stays in the lab** — it is a measuring instrument, not a page feature |
| reading and writing `?navigation=…` (`stage.js:745`, `url.js`) | **stays in the lab** — the mastermind ruled the url overlay is an editor feature |

After slice 2, `imagine/paging/stage.js` is `class PagingStage extends Page.Frame` plus the caption,
the samples and the url — roughly 350 lines instead of 856, and `classify()` gives it
`.paging-stage.page-frame`, so it wears core's frame CSS for free.

---

# 3 · Three slices

Each one leaves the site green. Each is written so a cold Sonnet can execute it from this text
alone.

## The proof, identical for all three

Run it **before** the slice as well as after, and diff the two — a finding that was already there is
not yours.

1. Start a private server from the repo root: `PORT=8095 node server.js`. **Never port 80**, and kill
   the pid you started, by pid, when you land. (`netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"`
   lists what is taken.)
2. Headless Playwright — never the owner's tabs. Walk the paging realm from
   `http://localhost:8095/imagine/paging/`, following every in-realm link: **108 pages**, at
   **400 / 1280 / 1920 / 3440**. Collect every console message.
3. **Zero console errors, with one known exception**: the declared-child probe 404 on
   `imagine/paging/readme/page.js`. It is present today, at both widths
   (`../../2026-09-05/paging-audit-8/task.jsonl`). Any second error is a regression.
4. Screenshot four control surfaces at 1280 and 3440 and compare against the pre-slice run —
   `/framework/ext/Doc/` (any Doc page), `/imagine/research/`, `/blog/`, `/imagine/` — plus
   `/framework/` and `/`. **Slice 1 must produce identical images.**
5. Three layout invariants at each width: no text or framed box at `x: 0`; no prose past
   `--measure`; every `overflow: auto|scroll` box named and wanted.

Scratch scripts go in the session scratchpad, named after the slice
(`slice-1-crawl.mjs`), never in the repo — a sibling minion will overwrite a `probe.mjs`.

## Slice 1 — core gains the words; nobody uses them

**Files: `core/Page/Page.class.js` and `core/Page/Page.css` only.** Nothing else in `public/` is
touched.

1. `Page.class.js:26` `naming()` — append `return this.words();`, and add `words()` under it
   (section 2A).
2. `Page.class.js` — add `word_classes()` beside `nav()` (`:444`).
3. `Page.class.js:241–256` `render()` — add the two `.ac()` lines (section 2B), **above** the
   existing `.ac(this.classes ?? "standard")` at `:253`.
4. `Page.class.js:298–318` `render_column()` — add `.ac(...this.word_classes())` on the return line
   at `:317`. **Do not touch `:359`**, which already stamps the column width.
5. `Page.class.js:245` `render()` — the content branch becomes: a `content` string starting with `/`
   renders the page or file at that address; anything else behaves exactly as today.
6. `Page.class.js` — add `static async read_json(url)` and `static async from(source, adopt)`
   (section 2F) after `static async load()` at `:174`.
7. `Page.class.js` bottom, after `Page.Store` (`:565`) — add `Page.Frame`, with the nine methods in
   section 2C. Port each one from `imagine/paging/stage.js` at the line given in the split table,
   changing only `this.config.<word>` → `this.page.<word>` and `paging-` → `page-` on every class
   name.
8. `Page.css` — append the new block inside `@layer theme` (section 2's CSS), after the columns
   section ends at `:554`.

**Extra proof for this slice:** every screenshot in step 4 is *identical*, and a grep proves it —
`grep -rn "navigation:\|arrangement:\|surface:\|background:\|type_size:\|room:" --include=page.js public/`
returns nothing outside `/imagine/paging/`. The words exist and no page says one.

**Verify the frame is real before moving on** by adding one throwaway page under
`core/Page/overview/` that says all six words, shooting it at four widths, and **deleting it again**.
Do not ship it in this slice.

## Slice 2 — the lab imports core's words and deletes its own copy

**Files: `imagine/paging/*` only.**

1. `blocks.js` — delete `NAVIGATION` (`:40`), `ROOM` (`:95`), `ARRANGEMENT` (`:141`), `SURFACES`
   (`:164`) and `TYPE` (`:172`); re-export core's from `/app.js` under the same names so
   `imagine/sections/sections.js:2` and every in-realm importer keep working unchanged. `CONTENT`
   (`:81`), `BLOCKS` (`:186`), `CONTROLS` (`:235`), `DEFAULT` (`:208`) and `config_of`/`mode_for`
   (`:313`) **stay** — they are the lab's own control surface.
2. `stage.js` — `class PagingStage extends Page.Frame`. Delete `paint()` (`:219`), `frame()`
   (`:234`), `box()` (`:266`), `held()` (`:292`), `swaps()` (`:309`), `slot()` (`:312`), `tabs()`
   (`:575`), `rail()` (`:586`), `rows()` (`:596`), `row()` (`:606`), `pane()` (`:618`), `taken()`
   (`:635`), `bar()` (`:658`), `panel()` (`:673`), `aside()` (`:683`), `expander()` (`:536`). Keep
   `initialize()`, `sample()`, `nest_box()`, `inside()`, `page_at()`, `prose_at()`, `pick()`,
   `set()`, `reopen()`, `rect()`, `caption()`, `moved()` and `stage_props()`.
3. `paging.css` — delete `:704–722` (surfaces), `:769–771` (reservation), `:798–801` (room),
   `:835–839` (type). Keep everything else; the realm's own chrome is not core's.
4. `make/page.js:70` `grow()` — replace the hand-rolled node→`Paging` walk with `Page.from()`.
   `make/made.js` is untouched: the fs writer stays in `ext/Saver` and `FileStore` still writes the
   same five keys.
5. `build/stage.js` — `BuildStage` already wraps `PagingStage` for three things (crumbs, the title,
   the child panel). It keeps those three and inherits the rest.

**Extra proof:** the nine-step use test from `../../2026-09-05/paging-audit-8/requirements.md` — pick,
send, open cold, save, nest, content you wrote, edit from the page's own bar, save a nest, delete the
page you made. All nine still pass, and **delete the page you made** at the end so no scratch page is
committed.

## Slice 3 — sections and layouts under *arrangement*

**Files: `imagine/sections/*`, `imagine/layouts/*`, and the doc pages that name them.**

1. `imagine/sections/sections.js:2` — import `SURFACES` from `/app.js` instead of
   `../paging/blocks.js`. One line; slice 2's re-export means it already works either way, so this is
   tidying, not a break.
2. `imagine/layouts/system.js:38–53` — delete the re-listed `SURFACES` / `SURFACE_MEANS` and import
   core's. Keep `SURFACE_CLASS` (its own realm's paint) until `.page-surface-*` is proven at four
   widths on a layout card, then delete that too.
3. `styles/sections/tone.js:11` — `TONES` stays four words (a *band* is not a page) but gains a
   comment pointing at core's five and the two aliases, so the next reader is not the third person to
   discover they are the same list.
4. `arrangement`'s seven values gain a link each to the numbered layout they compile to — the data is
   already there (`blocks.js:107` `LAYOUTS`, `blocks.js:129` `layout_of()`); it moves to core with the
   word.
5. `core/Page/doc/` gains one page — the six words, the table of what each one maps to, and the
   before/after of one page file. `core/Page/readme.md` gains one line pointing at it.

**Extra proof:** `/imagine/sections/`, `/imagine/layouts/` and all 18 numbered full-screen layouts at
four widths, plus the same four control surfaces.

---

# 4 · Risks, named — and what each slice must not touch

**The one that will bite first.** `type` is a page method in `core/Page/generator/page.js:261`. If
any slice writes `this.type` on a `Page`, the generator page reads a function back, stamps a class
made of a function body, and — because `classify()`-adjacent code splits on whitespace — probably
throws three frames away on somebody else's page. **The key is `type_size` everywhere except inside
a `mode` object.**

**`Page.css` is layered and large** (835 lines, `@layer util` at `:25`, `@layer theme` at `:52`).
`@layer util` beats `@layer theme` at *any* specificity, so nothing in the new block can override
`Page.css:39` (the columns visibility rule) or `Page.css:48–49` (the bleed payback). Put every new
rule in `@layer theme` and never reach for `!important`. **No slice may touch `@layer util`.**

**A class name is minted from every constructor in the chain.** `View.classify()`
(`core/View/View.js:44`) walks the chain and adds each name lowercased, so `Stage`, `Rail`, `Wall`,
`Solo`, `Card`, `Grid`, `Flex` and `Page` are all names a View may not have. `PageFrame` is the
name; check any second class against the census before writing it.

**`fill` yields to an open child** — `Page.css:341–343`, a 2026-09-05 decision in core. The new
`page-w-*` rules are in the page grid and must not go near it. **No slice may edit `Page.css:280–390`.**

**The columns host has no page grid.** Under a columns host, content sits in `.page-column-prose`
and `grid-column` is meaningless, so `page-w-wide` does nothing there — which is why `render()`
stamps `page-w-*` only when `column_host()` is undefined. The other five words are plain classes and
work in both hosts.

**Hidden tabs do not lay out.** Every one-shot measurement in the lab (`rect()`, `stage.js:813`) runs
while the panel may be hidden. The reservation rule is `visibility: hidden`, never `display: none` —
a display-hidden panel is not measured, which is the entire thing being bought. Copy the rule
verbatim; do not "simplify" it.

**One backtick inside `` css(`…`) `` kills every page**, and only `p()`/`h1`–`h6` read backticks.
Nothing in this plan writes a `css()` template — if a slice reaches for one, it has gone off-plan.

**`--measure: none` is forbidden.** `styles/doc/layout-system.md` records three shells that measured
104, 105 and 250 characters a line. `page-w-wide` moves the *frame* to the wide track and leaves
prose on its measure; it must never remove the cap.

**A bash heredoc eats one backslash layer.** Build any edit script, JSONL line or test plan with the
Write tool, not an inline heredoc — five tasks lost a retry each to this on 2026-09-04/05.

**Never `git stash`, `git checkout --`, `git reset`, commit or push** — the tree is shared with other
agents in flight. Diff, don't stash.

**What no slice may touch, as one list:** `imagine/paging/words.js` (three `/imagine/codrops/` pages
import `MECHANISMS` by name), `imagine/paging/baseline.js` (five other realms import `baseline`),
`ext/Saver/FileSaver.js`, `Page.css` `@layer util`, `Page.css:280–390`, `Page.class.js:121–138`
(`child()`'s probe chain), and `CLAUDE.md`.

---

# 5 · What I would delete

Deleting beats adding. Everything here goes in slice 2 or 3, after the thing that replaces it is
proven at four widths.

| what | lines | why it becomes redundant |
|---|---|---|
| `stage.js` `paint()` `frame()` `box()` `held()` `swaps()` `slot()` `tabs()` `rail()` `rows()` `row()` `pane()` `taken()` `bar()` `panel()` `aside()` `expander()` | ~370 | `Page.Frame` is the same code, one level up, where every page can reach it |
| `paging.css:704–722`, `:769–771`, `:798–801`, `:835–839` | ~40 | the same declarations, in `Page.css`, under the `page-` prefix |
| `blocks.js` `NAVIGATION` `ROOM` `ARRANGEMENT` `SURFACES` `TYPE` | ~60 | re-exported from core; the lists themselves move, so there is one copy on the site |
| `imagine/layouts/system.js:38–53` `SURFACES` / `SURFACE_MEANS` | ~20 | a third copy of the five surface words, written out by hand in a second realm |
| `make/page.js` `grow()` (`:70`) | ~30 | `Page.from()` is the same walk, and it is the seam a nested page needs anyway |
| `build/stage.js` — everything except crumbs, title, `draw_child` | ~60 | already noted as redundant in `imagine/paging/doc/builder.md`; the builder's stage becomes a `Page.Frame` like every other |

**About 580 lines deleted against about 130 added** — and the count understates it, because five of
the six deletions are *second copies of a list*, which is the defect this realm has re-found in eight
audits running.

**What I would deliberately NOT delete.** `imagine/paging/content.js` (the eight canned samples are
what makes the lab a lab), `presets.js` (twelve sets of words that earned a url), `url.js` and
`toolbar.js` (the editor overlay the mastermind ruled stays in the lab), `words.js` (another realm
imports it), and `make/made.js` (the fs writer, which belongs to `ext/Saver` and not to core).
