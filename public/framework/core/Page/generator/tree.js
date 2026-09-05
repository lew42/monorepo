import { Page, div, span, a, icon, code, md } from "/app.js";
import { WIDTHS, INPLACE } from "./gen.js";
import { parse, read, serialize } from "./spec.js";
import { kind, width, tune, shape } from "./controls.js";
import { fill, peek, title_for, empty } from "./fill.js";
import { module, content_line, width_line } from "./export.js";

/**
 * Spec text → **page configs**, the nested-POJO form `Page.declare()` already takes:
 *
 *     this.children = new Map();
 *     tree(spec, seed).forEach(config => this.add(config.name, config));
 *
 * That is the whole trick, and it is why this file is short. A `children:` array of
 * plain objects IS a virtual page tree — `add()` builds a real `Page` per entry and
 * recurses — so the generated tree gets real urls, the real Router, the real
 * `active-page` / `active-ancestor` contract, and core's columns. Nothing touches the
 * filesystem, and nothing here plays app the way `ext/demo`'s box does.
 *
 * Each config overrides three methods, which is all a generated page is:
 *   `column()`    — its picture, in the shape its block word names;
 *   `link()`      — the same url, carrying the seed;
 *   `container()` — WHERE its view mounts: a new column, or its parent's panel.
 *
 * A fourth is `route("code")` — the one UNDECLARED child every generated page answers
 * (`Page.child()`'s own contract: memory, then `route()`, then a filesystem probe). It
 * never appears in `children:` and is never part of the exported tree (`export.js`'s
 * `kids()` filters on `.at`, which this child does not have); it reuses `export.js`'s own
 * `content_line()` / `width_line()` / `module()` to show what a hand-written page.js for
 * THIS page would say, plus the calls the host's own controls logged against this page's
 * position (`page.js`'s `swap()` / `calls`).
 *
 * ⚠ Every generated url carries `#<seed>`. `Router.go()` pushes `pathname + search +
 *   hash`, so a plain href would DROP the seed the moment you navigated one level in —
 *   and the reload would rebuild a different tree under the same url.
 */

/* THE ONE QUESTION every placement asks: does this page show its children INSIDE itself?
   `tabs` and `vtabs` do; `wall`, `list` and `prose` open a column to the right. */
export const inplace = page => INPLACE.includes(page?.block);

/* `hash` is the generator's address — `#7` for a seed, `#s=<encoded>` for a typed spec.
   Every generated url carries it verbatim; this module never builds one itself.
   `host` is the generator page itself — threaded through only so a page's `route("code")`
   can read `host.calls`, the log every control click appends to (page.js). */
export function tree(text, hash, host){ return nodes(parse(text), hash, host); }

/* One config per line. The NAME is still the block word plus an ordinal, so a url reads
   `…/wall/list/prose/` and says what the tree is; the TITLE is a word drawn from the
   page's own key, so a nav of three children reads as three different pages. Both, because
   they answer different questions — the url is structure, the label is content. */
function nodes(list, hash, host, up, seed = 1, path = []){
	const seen = {}, taken = new Set();

	return list.map((node, at) => {
		const line = read(node.line);
		const block = line.block;
		const n = seen[block] = (seen[block] ?? 0) + 1;

		/* A width word is a track in the ROW, and an in-place child is in a panel — it has
		   no track to be wide in. `gen()` already refuses to draw one; this drops it from a
		   typed spec too, so the two agree about what the word can mean. */
		const inline = INPLACE.includes(up);
		const width = inline ? "" : (WIDTHS.includes(line.width) ? line.width : "");

		/* THE PAGE'S OWN SEED, from its PLACE in the spec — parent, position, arity. Content
		   is then a function of the spec text and nothing else, so a typed tree gets distinct
		   children with no seed at all, and the same spec twice is the same page twice down
		   to the last bar. fill.js draws everything from it.
		   ⚠ The BLOCK WORD is deliberately not in here (it was, until the switch controls
		     landed). A control that changed how a page presents its children also renamed it
		     and redrew every bar inside it — "Reports, vtabs" became "Bulletin, tabs" — which
		     is a silent reroll, and the one thing a control may not do. A page's content is a
		     function of WHERE it is, so switching its word leaves it the same page. */
		const key = (Math.imul(seed, 31) + at * 131 + node.kids.length) >>> 0;

		return {
			name: n > 1 ? `${block}-${n}` : block,
			title: title_for(key, taken),

			// `width` is core's own word — `column()` stamps `.page-column-<width>` and
			// Page.css turns that into a track. doc/columns.md.
			block, width, key, inline,

			/* MY PLACE IN THE SPEC, as indices — the address every control edits through
			   (`host.swap(this.at, …)`, spec.js). Indices and not the url, because a page is
			   named after its block word: switching `list` to `tabs` renames it, and a name
			   path would point at a page that stopped existing the moment the switch landed.
			   `opt` is the rest of the line — `flow` `cols` `gap`, read by `shape()`. */
			at: [...path, at],
			opt: line.opt,

			children: nodes(node.kids, hash, host, block, key, [...path, at]),

			// ⚠ The host's crumb strip draws `link()`. Without the seed a crumb click
			//   lands on a url that reloads into a DIFFERENT tree.
			link(text){ return a.c("page-link", text ?? this.title).href(this.url + hash); },

			column(host){ return column(this, host, hash); },
			container,

			// THE CODE TAB — an UNDECLARED child (Page.child()'s memory → route() →
			// filesystem order), so it exists only once something links to it (the
			// small `code` icon `column()` draws below) and is never part of
			// `children:` or the exported tree (`export.js`'s `kids()` filters on
			// `.at`, which this child does not have). `node` is THIS line's own raw
			// spec node (spec.js's `parse()`), closed over so the tab can show its
			// own fragment without re-parsing the whole spec.
			route(name){ return name === "code" ? code_child(node, hash, host) : null; },
		};
	});
}

/**
 * WHERE A VIEW MOUNTS — shared by every generated page AND its `code` child, because both
 * answer the same question: does MY PARENT show its children inside itself?
 *
 * Core hands a child to the nearest ancestor's `$pages`, which is a SIBLING of that
 * ancestor's column body, so `display: contents` floats it out as the next column in the
 * row. Two lines change that:
 *
 *   1. an in-place parent hands me its `$panel` instead — inside its body, so the row
 *      never grows and picking a tab (or opening its code) swaps content where it stands;
 *   2. my own children then skip PAST me to the nearest ancestor that still owns a slot in
 *      the row, or a grandchild would open inside the panel too.
 *
 * This is `ext/tabs`' `regions` contract by hand: same seam, same guarantee that an
 * ancestor has rendered before I look (Router.activate runs root-to-leaf).
 * ⚠ A plain function, not an arrow: `this` is whichever Page it is attached to.
 */
function container(){
	if (inplace(this.parent) && this.parent.$panel) return this.parent.$panel;

	for (let page = this.parent; page; page = page.parent)
		if (page.$pages && !inplace(page.parent)) return page.$pages;

	return Page.prototype.container.call(this);
}

/**
 * THE CODE TAB'S OWN CONFIG — `route("code")`'s answer. `this` at render time is the LIVE
 * code page `add()` just built, and `this.parent` is the generated page it hangs off
 * (adoption sets that the moment `child()` adopts what `route()` returned) — so every read
 * below is the CURRENT state of that page, not a snapshot from when the tree grew.
 *
 * Three things, and `export.js` writes two of them already — read there first:
 *   `serialize([node])`  — this page's own spec line (and any nested lines), spec.js's;
 *   `module(page)`       — the whole page.js `export.js` would write for it;
 *   `host.calls`         — one line per control click, logged by `page.js`'s `swap()`,
 *                          keyed by `page.at` so it survives the regrow every click causes.
 */
function code_child(node, hash, host){
	return {
		title: "Code",
		label: "Code",
		icon: "code",
		width: "large",

		link(text){ return a.c("page-link", text ?? this.title).href(this.url + hash); },
		container,

		column(){
			const page = this.parent;
			const calls = host.calls.get(JSON.stringify(page.at)) ?? [];

			return div.c("page-gen page-gen-code page-column-body page-column-large", () => {
				div.c("page-column-head", () => {
					span.c("page-column-title", "Code");
					a.c("page-column-close", () => icon("close")).href(page.url + hash);
				});

				div.c("page-column-prose flow", () => {
					md("**The spec** — this page's own line in the tree:");
					code(serialize([node]));

					md("**The `page.js` `export.js` would write** for it, right now:");
					code.js(module(page));

					md(calls.length
						? "**As its controls are clicked**, the matching line is appended here:"
						: "Switch this page's kind, width, or (on a wall/list) its arrangement, then reopen this tab — each click appends the line it corresponds to.");
					if (calls.length) code.js(calls.join("\n"));
				});
			});
		},
	};
}

/* One child, one link — the ONE place a generated url is written, so the generator's own
   column and every column it grows carry the seed the same way.
   ⚠ A page's view is built when it ACTIVATES, so a generated child is invisible until
     something links to it. The generator's own column draws this list too; without it
     the tree exists in memory and nothing on screen can reach it (2026-08-26). */
export function items(page, hash){
	return page.children.forEach((child, name) => {
		const nav = page.nav_for(name);

		a.c("page-gen-item").href(nav.url + hash).append(() => {
			span.c("page-gen-label", nav.label);

			// An inbox row and a wall card are PREVIEWS, not links: a line or two of the
			// page behind them, which is the whole reason those columns cost their width.
			// A tab or a side tab is a label and nothing else — a strip has no room.
			if (page.block === "list" || page.block === "wall") peek(child?.key ?? 1);
			else if (child?.children.size) icon("chevron_right");
		});
	});
}

/**
 * ONE COLUMN, for all five words — `Page.column()`'s shape, with the child list drawn as
 * whatever the word names. The word is a CLASS and `generator.css` is what makes a `wall`
 * look like a wall, so a sixth word is one entry in `gen.js` and one rule there.
 */
export function column(page, host, hash){
	const inline = page.inline;

	// The two words whose children are a WALL OF LINKS, and the only two with an
	// arrangement to control. A strip of tabs is one line and has none.
	const wall = page.block === "wall" || page.block === "list";

	return div.c("page-gen page-gen-" + page.block, () => {

		div.c("page-column-head", () => {
			span.c("page-column-title", page.title);

			/* THE SWITCH — this page's word, and its track, on its own head. The word
			   chip that used to sit here was a READOUT of exactly these two, so nothing
			   was added to the head: the readout became the control. */
			div.c("page-gen-picks", () => {
				kind(page, host);
				if (!inline) width(page, host);
			});

			// THE CODE TAB — a real link (`route("code")` above), so a reload or a
			// middle-click lands on it too. `.attr("title", …)` because the icon
			// alone says nothing to a reader who has not met this feature before.
			a.c("page-gen-code-link").href(page.url + "code/" + hash).attr("title", "code for this page")
				.append(() => icon("code"));

			// ⚠ Not on an in-place child: it has no column of its own to close, and the
			//   `×` would close the tab set it is inside.
			if (page !== host && !inline) a.c("page-column-close", () => icon("close")).href(page.parent.url + hash);
		});

		if (wall) tune(page, host);

		if (inplace(page)) panel(page, hash);
		else {
			if (page.children.size || page.block !== "prose") nav(page, hash, wall);

			// ⚠ An inbox draws NO content of its own: its rows already are the page, and a
			//   run of grey bars under the last message read as a broken column.
			if (page.block !== "list" || !page.children.size) fill(page.key, page.block === "prose");
		}
	})
		/* ⚠ `page-column-body` is what core SIZES — a 40em cap, its own scrollbar, a rule
		     down its right edge, a snap point in the row. An in-place child is none of
		     those: it is content inside somebody else's column, so it wears its own class
		     and takes the panel's width. Its width word was dropped upstream for the same
		     reason, so nothing here can contradict it. */
		.ac(inline ? "page-gen-inline" : "page-column-body")
		.ac(!inline && page.width && "page-column-" + page.width);
}

/* The child list — and the ONE place `shape()` is applied. A wall and an inbox are the
   same box in framework words: `.grid.auto` (or `.flex.auto`) reading `--column`, and
   `.gap` reading `--gap`. The `tune` chips above write those two tokens and nothing
   else, which is why swapping grid for flex needs no rule of our own. */
function nav(page, hash, wall){
	const $nav = div.c("page-gen-nav", () => page.children.size ? items(page, hash) : empty(page.block));

	return wall ? shape($nav, page.opt) : $nav;
}

/* THE IN-PLACE SHAPE — a strip of tabs (or a side rail) and the box its children land in.
   `container()` above sends every child into `$panel`, and the page's own content sits in
   there too and steps aside when a child arrives — a `@layer util` rule in generator.css,
   the same one `ext/tabs` uses on `.tab-panel`. So a tab set with nothing selected shows
   its own page rather than a blank box, and a childless one shows why it is empty. */
function panel(page, hash){
	div.c("page-gen-nav", () => page.children.size ? items(page, hash) : empty(page.block));

	page.$panel = div.c("page-gen-panel", () => fill(page.key, false));
}

export default tree;
