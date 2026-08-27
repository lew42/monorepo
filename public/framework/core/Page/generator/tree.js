import { div, span, a, icon } from "/app.js";
import { BLOCKS, WIDTHS } from "./gen.js";

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
 * Each config overrides two methods, which is all a generated page is:
 *   `column()` — its picture, in the shape its block word names;
 *   `link()`   — the same url, carrying the seed.
 *
 * ⚠ Every generated url carries `#<seed>`. `Router.go()` pushes `pathname + search +
 *   hash`, so a plain href would DROP the seed the moment you navigated one level in —
 *   and the reload would rebuild a different tree under the same url.
 */

/* Indentation is nesting. The same eight lines as space's `spec.js` — copied rather
   than imported, because that module reaches for space's own `site` parts. */
export function parse(text){
	const top = { kids: [], depth: -1 };
	const stack = [top];

	for (const raw of text.split("\n")){
		if (!raw.trim() || raw.trimStart().startsWith("#")) continue;

		const node = { line: raw.trim(), kids: [], depth: raw.search(/\S/) };

		while (stack.at(-1).depth >= node.depth) stack.pop();
		stack.at(-1).kids.push(node);
		stack.push(node);
	}

	return top.kids;
}

/* `hash` is the generator's address — `#7` for a seed, `#s=<encoded>` for a typed spec.
   Every generated url carries it verbatim; this module never builds one itself. */
export function tree(text, hash){ return nodes(parse(text), hash); }

/* One config per line. The name is the block word, plus an ordinal when a parent drew
   the same word twice — so a url reads `…/wall/list/prose/` and says what it is. */
function nodes(list, hash){
	const seen = {};

	return list.map(node => {
		const [word, given] = node.line.split(/\s+/);
		const block = BLOCKS.includes(word) ? word : "prose";
		const width = WIDTHS.includes(given) ? given : "";
		const n = seen[block] = (seen[block] ?? 0) + 1;

		return {
			name: n > 1 ? `${block}-${n}` : block,
			title: width ? `${block} ${width}` : block,

			// `width` is core's own word — `column()` stamps `.page-column-<width>` and
			// Page.css turns that into a track. design.md §2.
			block, width,

			children: nodes(node.kids, hash),

			// ⚠ The host's crumb strip draws `link()`. Without the seed a crumb click
			//   lands on a url that reloads into a DIFFERENT tree.
			link(text){ return a.c("page-link", text ?? this.title).href(this.url + hash); },

			column(host){ return column(this, host, hash); },
		};
	});
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
			if (child?.children.size) icon("chevron_right");
		});
	});
}

/**
 * ONE COLUMN, for all nine words — `Page.column()`'s shape, with the child list drawn
 * as whatever the word names and a few filler bars for content. The word is a CLASS and
 * `generator.css` is what makes a `wall` look like a wall, so a tenth word is one entry
 * in `gen.js` and one rule there.
 *
 * Placeholder content on purpose: this page is about the SHAPE of a tree, and real
 * prose would only be noise — the same reason space's parts are grey boxes.
 */
export function column(page, host, hash){
	return div.c("page-gen page-column-body page-gen-" + page.block, () => {

		div.c("page-column-head", () => {
			span.c("page-column-title", page.title);
			if (page !== host) a.c("page-column-close", () => icon("close")).href(page.parent.url + hash);
		});

		// The one word that draws its ANCESTORS. `chain()` is [root … me], so filtering
		// to the pages that carry a block word leaves exactly the generated branch.
		if (page.block === "crumbs")
			div.c("page-gen-trail", () => page.chain().filter(p => p.block).forEach(p =>
				a.c("page-gen-crumb", p.title).href(p.url + hash)));

		if (page.children.size) div.c("page-gen-nav", () => items(page, hash));

		div.c("page-gen-fill", () => {
			for (let i = 0, n = page.block === "prose" ? 5 : 3; i < n; i++) div.c("page-gen-bar");
		});
	}).ac(page.width && "page-column-" + page.width);
}

export default tree;
