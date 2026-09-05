import { NAVIGATION, SURFACES, LAYOUTS } from "../blocks.js";

/* ── THE BUILDER'S VOCABULARY ──────────────────────────────────────────────────

   Everything the builder can SAY about a page. It used to import nothing and write
   the realm's words out again — three of the five duplicate vocabularies the
   2026-09-05 audit found were in this file. It now imports the three lists from
   `../blocks.js` (which itself imports nothing) and adds only the KEYS a `page.json`
   stores, which is a translation, not a second vocabulary.

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

/* ── 1 · NAVIGATION — one control, six answers, ONE LIST ──────────────────────

   The owner asked whether top tabs, left tabs and column pages should be one
   control. They should: all three are answers to ONE question — *how do the pages
   under this one appear?*

   ⚠ THE WORDS COME FROM `../blocks.js`. This file used to write the six out again,
     with its own titles and its own sentences — one of FIVE live definitions of
     `navigation` in the realm (paging-audit-2b, Q1). The ids, titles, icons and
     sentences now have exactly one home, and all this file adds is the pair of keys
     a `page.json` stores: `kids` is how the children are DRAWN, `mech` is what a
     click on one DOES. A translation table is not a second vocabulary. */
const STORED = {
	"none":       { kids: "none",       mech: "launch" },
	"columns":    { kids: "columns",    mech: "launch" },
	"tabs":       { kids: "tabs",       mech: "swap" },
	"rail":       { kids: "rail",       mech: "swap" },
	"rail-right": { kids: "rail-right", mech: "swap" },
	"takeover":   { kids: "columns",    mech: "takeover" },
};

export const NAVS = NAVIGATION.map(nav => ({ ...nav, ...STORED[nav.id] }));

export const nav_of = node => {
	const mode = node?.mode ?? {};
	return NAVS.find(nav => nav.kids === (mode.kids ?? "none") && nav.mech === (mode.mech ?? "launch"))
		?? NAVS.find(nav => nav.kids === (mode.kids ?? "none"))
		?? NAVS[0];
};

/* ── 2 · SURFACE — the realm's own five, imported, not restated ───────────────
   This list was written out here a second time with its own sentences, and its own
   comment admitted the copy. It is `../blocks.js`'s list now. (One more copy still
   exists, in `/imagine/layouts/system.js` — a sibling realm, and not this task's
   file to change; it is the remaining place the two can disagree.) */
export { SURFACES };

/* ── 3 · LAYOUT — the /imagine/layouts/ numbers ───────────────────────────────
   Also one list, in `../blocks.js`, where the ARRANGEMENT words already named these
   numbers. All this adds is the "see it full size" link the builder's control shows.
   Four is enough: the census found 743 of the site's 890 pages are one column and
   144 are a card wall (`../doc/builder.md`). */
export const ARRANGES = LAYOUTS.map(layout => ({
	...layout,
	means: layout.means + " [See " + layout.title + " full size](" + layout.url + ").",
}));

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
