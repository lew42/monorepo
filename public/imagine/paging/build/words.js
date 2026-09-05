/* ── THE BUILDER'S VOCABULARY ──────────────────────────────────────────────────

   Everything the builder can SAY about a page, in one file that imports nothing —
   the same shape `../words.js` uses for the realm, so the controls, the stage, the
   JSON box and the doc all read one list and cannot disagree.

   THE ONE RULE: every word here is written into the SAME `page.json` Make already
   writes (`../make/made.js` is the only store, `../doc/persistence.md` is the
   contract). This file adds words to that node; it never adds a second file, a
   second directory or a second store.

   A NODE, in full:

       { "name": "notes",                    the directory, and the last bit of the url
         "title": "Notes",                   the head, the crumb, the card, the tab
         "icon": "description",              the material icon, everywhere it appears
         "description": "…",                 the card's second line
         "mode": {
           "style": "card",                  SURFACE   — one of five
           "content": "m",                   Make's own content rung, left alone
           "mech":  "launch",                what a click on a CHILD does
           "kids":  "tabs",                  how the children are DRAWN
           "layout": "wide",                 the column width word
           "arrange": "1.stack",             how the BLOCKS are laid out
           "blocks": [ … ]                   the content, as data
         },
         "children": [ … more nodes … ] }

   ⚠ WHY `blocks` AND `arrange` LIVE INSIDE `mode`. `FileStore.file()` writes exactly
     five keys — title, icon, description, `mode`, children — and drops anything else
     at the top level, so a top-level `blocks` would be lost the moment it was saved.
     `mode` is passed through whole, so everything the builder invents rides safely
     inside it and Make needs no change at all. The honest home for `blocks` is the
     top level, and that is a ONE-LINE diff to `made.js` — written out in
     `../doc/builder.md`, not applied here: `make/` is another task's file.          */

/* ── 1 · NAVIGATION — one control, six answers ────────────────────────────────

   The owner asked whether top tabs, left tabs and column pages should be one
   control. They should: all three are answers to ONE question — *how do the pages
   under this one appear?* — and each is a pair of words that already exist in the
   realm. `kids` is how the children are DRAWN; `mech` is what a click on one DOES.
   The builder shows one row of pictures and writes both.                          */
export const NAVS = [
	{
		id: "none", title: "None", icon: "remove",
		kids: "none", mech: "launch",
		means: "This page has no pages under it. Nothing is drawn.",
	},
	{
		id: "columns", title: "Columns", icon: "view_column",
		kids: "columns", mech: "launch",
		means: "Each child is a row you click, and it opens as a COLUMN to the right. The url changes, so a child can be linked to and the Back button works. This is the site's default and 274 of its pages use it.",
	},
	{
		id: "tabs", title: "Top tabs", icon: "tab",
		kids: "tabs", mech: "swap",
		means: "The children become a strip of tabs over one bounded panel. Clicking a tab swaps the panel and does NOT change the url — so a tab cannot be linked to. Each panel carries a link to the same child as a column, which can.",
	},
	{
		id: "rail", title: "Left rail", icon: "view_sidebar",
		kids: "rail", mech: "swap",
		means: "The same tabs, stacked down the left instead of across the top. Same swap, same panel, same no-url — a long list of children reads better vertically.",
	},
	{
		id: "rail-right", title: "Right rail", icon: "view_sidebar",
		kids: "rail-right", mech: "swap",
		means: "The rail on the other side, for a contents list or a properties panel: the eye keeps its home edge on the left and the list stays out of the reading line.",
	},
	{
		id: "takeover", title: "Takeover", icon: "open_in_full",
		kids: "columns", mech: "takeover",
		means: "A click fills the screen with the child and collapses everything behind it into the crumb strip. `width: \"full\"` is core's own word for it.",
	},
];

export const nav_of = node => {
	const mode = node?.mode ?? {};
	return NAVS.find(nav => nav.kids === (mode.kids ?? "none") && nav.mech === (mode.mech ?? "launch"))
		?? NAVS.find(nav => nav.kids === (mode.kids ?? "none"))
		?? NAVS[0];
};

/* ── 2 · SURFACE — five, and they are the realm's own five ────────────────────
   Restated here rather than imported so this file keeps its "imports nothing"
   promise; `../words.js` `STYLES` is the same list and `../../layouts/system.js`
   `SURFACES` is the same list again. If they ever disagree, that is the bug.      */
export const SURFACES = [
	{ id: "plain", means: "no frame at all — the page sits on whatever is under it" },
	{ id: "card", means: "a white card with a hairline and a shadow: the surface that says “this is one thing”" },
	{ id: "tint", means: "one subtle step off the parent, for a panel that is part of the page" },
	{ id: "prim", means: "10% of the accent mixed in — an island you are meant to notice" },
	{ id: "dark", means: "an always-dark island; every token inside it flips" },
];

/* ── 3 · LAYOUT — the /imagine/layouts/ numbers, and what they do to the blocks ──
   The SAME names the layout system uses, and each `means` links to the full-screen
   version of that arrangement, so the builder and the catalogue cannot drift into two
   vocabularies. Four is enough: the census found 743 of the site's 890 pages are one
   column and 144 are a card wall (`../doc/builder.md`). */
export const ARRANGES = [
	{ id: "1.stack", title: "1.stack", means: "One column. Every block under the last, at the reading measure. [See 1.stack full size](/imagine/layouts/1/stack/)." },
	{ id: "2.main-aside", title: "2.main-aside", means: "The first block is the main track; every other block stacks in an aside beside it. [See 2.main-aside full size](/imagine/layouts/2/main-aside/)." },
	{ id: "3.thirds", title: "3.thirds", means: "Three equal tracks, blocks dealt across them. [See 3.thirds full size](/imagine/layouts/3/thirds/)." },
	{ id: "4.wall", title: "4.wall", means: "A wall: as many tracks as fit, each block a tile. [See 4.wall full size](/imagine/layouts/4/wall/)." },
];

/* ── 4 · BLOCKS — the content, as data ────────────────────────────────────────
   Three types, and every one is a RENDERER that already exists: `md()` for prose,
   core's own `previews()` for a card wall, and the templates realm's own module for
   a family. `../doc/persistence.md` calls this "data chooses, js supplies" and it is
   the same pattern `"kids": "tabs"` used.                                          */
export const BLOCKS = [
	{ id: "prose", title: "Prose", icon: "notes", means: "a paragraph of markdown. Drawn by `md()`." },
	{ id: "cards", title: "Card wall", icon: "grid_view", means: "the children of this page, as cards. Drawn by core's own `previews()`." },
	{ id: "template", title: "Template", icon: "dashboard", means: "one of the eleven template families, drawn by the family's own module." },
];

export const new_block = type => type === "prose"
	? { type: "prose", text: "A new paragraph. Click it in the controls to change these words." }
	: type === "cards" ? { type: "cards" } : { type: "template", family: "magazine" };

// ── 5 · ICONS a child can wear. A click cycles; a list beats a picker at this size.
export const ICONS = ["description", "article", "tab", "folder", "star", "bolt", "science", "palette", "map", "code"];

export const next_in = (list, value) => list[(list.indexOf(value) + 1) % list.length];

/* ── THE NODE ─────────────────────────────────────────────────────────────────
   Every edit below returns a NEW node. Nothing is patched in place, for the reason
   `make/page.js` gives: the store works out which files to write by comparing the
   tree it is given with the tree it had, and a mutated old tree makes every
   comparison say “nothing changed”. */

export const clone = value => JSON.parse(JSON.stringify(value));

export const DEFAULT_MODE = { style: "card", content: "m", mech: "launch", kids: "none", layout: "wide", arrange: "1.stack", blocks: [] };

export const NEW_PAGE = () => ({
	name: "", title: "New page", icon: "description",
	description: "A page you built with the builder.",
	mode: { ...DEFAULT_MODE },
	children: [],
});

export const mode_of = node => ({ ...DEFAULT_MODE, ...node?.mode });

export const blocks_of = node => mode_of(node).blocks ?? [];

// A directory name no sibling already has. `slug` is core's `Page.slug`, handed in
// so this file still imports nothing.
export function name_for(title, siblings, slug){
	const base = slug(title) || "page";
	let name = base, n = 2;
	while (siblings.some(kid => kid.name === name)) name = base + "-" + n++;
	return name;
}

export const edit = (node, change) => ({ ...clone(node), ...change });

export const set_mode = (node, change) => edit(node, { mode: { ...mode_of(node), ...change } });

export const set_blocks = (node, blocks) => set_mode(node, { blocks });

export function add_block(node, type){
	return set_blocks(node, [...blocks_of(node), new_block(type)]);
}

export function edit_block(node, i, change){
	return set_blocks(node, blocks_of(node).map((block, n) => n === i ? { ...block, ...change } : block));
}

export const remove_block = (node, i) => set_blocks(node, blocks_of(node).filter((_, n) => n !== i));

export function move_block(node, i, delta){
	const blocks = [...blocks_of(node)], j = i + delta;
	if (j < 0 || j >= blocks.length) return node;
	blocks.splice(j, 0, ...blocks.splice(i, 1));
	return set_blocks(node, blocks);
}

/* ── CHILDREN — which is to say TABS ──────────────────────────────────────────
   A tab is a child page. So there is no `add_tab()` here and there never will be:
   `add_child()` is the whole of it, and the parent's `kids` word decides whether
   what you just made is drawn as a tab or as a column.                            */
export function add_child(node, title, slug){
	const kids = node.children ?? [];

	return edit(node, {
		children: [...kids, {
			name: name_for(title, kids, slug),
			title,
			icon: ICONS[kids.length % ICONS.length],
			description: "",
			mode: { ...DEFAULT_MODE, kids: "none" },
			children: [],
		}],
	});
}

export const edit_child = (node, i, change) =>
	edit(node, { children: (node.children ?? []).map((kid, n) => n === i ? { ...kid, ...change } : kid) });

export const remove_child = (node, i) =>
	edit(node, { children: (node.children ?? []).filter((_, n) => n !== i) });

export function move_child(node, i, delta){
	const kids = [...(node.children ?? [])], j = i + delta;
	if (j < 0 || j >= kids.length) return node;
	kids.splice(j, 0, ...kids.splice(i, 1));
	return edit(node, { children: kids });
}

/* THE DEFAULT CHILD — the tab that is open when you arrive. Exactly one, so setting
   it clears the others: two defaults is a state the renderer would have to break a
   tie in, and a tie broken silently is the bug that state produces. */
/* ⚠ THE FLAG LIVES IN THE CHILD'S `mode`, not beside its title. `FileStore.file()`
     writes exactly five keys and drops everything else at the top level, so a
     top-level `default: true` was written into memory, drawn on screen, and SILENTLY
     LOST on save - the tab came back un-defaulted after a reload with nothing said.
     Measured 2026-09-05; `mode` is the one object that rides through whole. */
export const set_default = (node, i) =>
	edit(node, { children: (node.children ?? []).map((kid, n) => ({ ...kid, mode: { ...mode_of(kid), default: n === i } })) });

export const is_default = kid => mode_of(kid).default === true;

export const default_index = node => Math.max(0, (node.children ?? []).findIndex(is_default));

/* ── THE CODE ESCAPE ──────────────────────────────────────────────────────────
   A third of this site's pages need a `content()` that computes something, and no
   amount of JSON will ever supply one (`../doc/builder.md` has the census). So the
   builder's last control prints the `page.js` a hand would write for the node you
   have built — the real file, ready to paste into a directory, with the block calls
   already in it and a marked line where the code goes.                            */
export function code_for(node){
	const mode = mode_of(node);
	const kids = node.children ?? [];
	const blocks = blocks_of(node);

	const factories = ["Page", ...(blocks.some(b => b.type === "prose") ? ["md"] : [])].join(", ");

	const lines = [
		`import { ${factories} } from "/app.js";`,
		``,
		`export default new Page({`,
		`\tmeta: import.meta,`,
		`\ttitle: ${JSON.stringify(node.title)},`,
		node.icon ? `\ticon: ${JSON.stringify(node.icon)},` : null,
		node.description ? `\tdescription: ${JSON.stringify(node.description)},` : null,
		mode.mech === "takeover" ? `\twidth: "full",   // takeover — core's own word` : `\twidth: "large",`,
		kids.length ? `\tchildren: ${JSON.stringify(kids.map(kid => kid.name).join(" "))},` : null,
		blocks.some(b => b.type === "cards") ? `\tindex: true,     // my content already shows my children` : null,
		``,
		`\tcontent(){`,
		...blocks.map(block => "\t\t" + call_for(block)),
		blocks.length ? `` : `\t\t// nothing here yet — add a block in the builder`,
		`\t\t// ↓ anything the builder cannot say goes here, and this is why page.js exists`,
		`\t},`,
		kids.some(is_default) ? `\n\t// the tab that opens first` : null,
		`});`,
	];

	return lines.filter(line => line !== null).join("\n");
}

const call_for = block => block.type === "prose" ? `md(${JSON.stringify(block.text ?? "")});`
	: block.type === "cards" ? `this.previews();`
	: `family(${JSON.stringify(block.family ?? "magazine")}).example(this);`;
