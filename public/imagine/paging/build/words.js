import { NAVIGATION, SURFACES, ARRANGEMENT, DEFAULT, config_of, mode_for, layout_of } from "../blocks.js";

/* ── THE BUILDER'S VOCABULARY ─────────────────────────────────────────

   THE BUILDER HAS NO VOCABULARY OF ITS OWN. Everything it can say about a page is
   the realm's seven words (`../blocks.js`), and this file adds exactly two things
   on top of them: the CONTENT PIECES a built page is made of, and the plain-object
   algebra every control edits a node with.

   It used to add a third: its own list of navigation words, stored under its own
   keys (`kids`, `mech`, `style`, `layout`, `arrange`). That is how the realm ended
   up with TWO editors writing TWO schemas into ONE file — and because Make reads the
   seven, Build's Navigation, Surface and Layout controls changed nothing at all on
   any page Make had made (measured 2026-09-05, paging-audit-3b). One vocabulary.

   A NODE, in full:

       { "name": "notes",                    the directory, and the last bit of the url
         "title": "Notes",                   the head, the crumb, the card, the tab
         "icon": "description",              the material icon, everywhere it appears
         "description": "…",                 the card's second line
         "mode": {
           "navigation": "tabs",             what a click on a child does, and how
                                             the children are drawn — one of six
           "content": "article",             what is in the box — one of eight
           "room": "reading",                how much of the screen the box gets
           "arrangement": "plain",           where the page's other parts sit
           "surface": "card",                the CONTENT's own fill
           "background": "plain",            the PAGE behind it
           "type": "regular",                the type scale
           "blocks": [ … ]                   the content, as data — the builder's
         },
         "children": [ … more nodes … ] }

   ⚠ WHY `blocks` LIVES INSIDE `mode`. `FileStore.file()` writes exactly five keys —
     title, icon, description, `mode`, children — and drops anything else at the top
     level, so a top-level `blocks` would be lost the moment it was saved. `mode` is
     passed through whole (`mode_for()` in `../blocks.js` is what keeps it there).   */

/* ── THE THREE CONTROLS THAT WERE THE BUILDER'S OWN ─────────────────────────

   Navigation, Surface and Arrangement are `NAVIGATION`, `SURFACES` and `ARRANGEMENT`
   from `../blocks.js`, unchanged and un-copied — re-exported here only so the builder
   imports its words from one place. `config_of(node)` reads them back off a node.

   ⚠ STEP 4 IS `arrangement`, NOT `arrange`. The control was labelled "Layout" and
     wrote a key called `arrange`, while the key actually named `layout` in the JSON
     beside it was the width word and had no control at all — one word, two meanings,
     on one screen (paging-audit-3, item 2). There is now ONE arrangement word, it is
     the realm's, and the numbered layout the blocks use is DERIVED from it by
     `layout_of()` rather than stored a second time.                                */
export { NAVIGATION, SURFACES, ARRANGEMENT, config_of, layout_of };

/* ── PIECES — the content of a built page, as data ────────────────────────────
   Three kinds, and every one is a RENDERER that already exists: `md()` for prose,
   core's own `previews()` for a card wall, and the templates realm's own module for
   a family. `../doc/persistence.md` calls this "data chooses, js supplies".

   ⚠ CALLED `PIECES`, NOT `BLOCKS`. `BLOCKS` is the realm's headline word and it is
     taken: `../blocks.js` `BLOCKS` is the SIX BUILDING BLOCKS the whole realm is
     organized around. Two lists of that name, one of them three items long, on the
     realm whose front page is called "the six blocks" (paging-audit-3b, fix 7).   */
export const PIECES = [
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

/* WHAT A NEW PAGE ARRIVES WEARING: the realm's seven words, and no blocks yet. It
   used to be `{ style, content: "m", mech, kids, layout, arrange }` — six keys, of
   which `content: "m"` named a rung of an axis DELETED on 2026-09-05, and none of
   which any other control in the realm could read. */
export const DEFAULT_MODE = { ...DEFAULT, blocks: [] };

export const NEW_PAGE = () => ({
	name: "", title: "New page", icon: "description",
	description: "A page you built with the builder.",
	mode: { ...DEFAULT_MODE },
	children: [],
});

/* A NODE'S WHOLE `mode`: the seven words, plus the blocks and the default-tab flag
   that ride inside it. `mode_for()` (`../blocks.js`) is the one reader; this only
   guarantees `blocks` is an array so nothing below has to check. */
export const mode_of = node => {
	const mode = mode_for(node);
	return { ...mode, blocks: mode.blocks ?? [] };
};

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
			mode: { ...DEFAULT_MODE, navigation: "none" },
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
   already in it and a marked line where the code goes.

   ⚠ `code_for_node`, and `../config.js` has `code_for_config`. Both print a
     `page.js`; they are given different things, and both were called `code_for`
     (paging-audit-3b, fix 7). A node has blocks and children, so its file is a
     `Page` with a `content()`; a configuration is seven words, so its file is one
     `this.stage({…})` call. The name now says which you are looking at.

   ⚠ IT PRINTS THE SEVEN WORDS. It used to print `title`, `icon`, `description`,
     `children` and `width: "large"` — five of the seven words missing, and the one
     word it did print was core's `width`, which this realm calls ROOM and which no
     control on the page writes (paging-audit-4). So the printed file is a `Paging`
     page with one `this.stage({…})` call in it, exactly like the drawer's
     `code_for_config` — and exactly like the file `make/page.js` actually runs.   */
export function code_for_node(node){
	const mode = mode_of(node);
	const kids = node.children ?? [];
	const blocks = blocks_of(node);

	// The two things the stage needs beyond the words: whose children to draw, and
	// what to put in the box. Both are omitted when the page has neither.
	const extras = [
		kids.length ? `\t\t\tpages: [\n` + kids.map(kid =>
			`\t\t\t\t{ title: ${JSON.stringify(kid.title)}, icon: ${JSON.stringify(kid.icon ?? "description")}, text: ${JSON.stringify(kid.description || "")} },`).join("\n") + `\n\t\t\t],` : null,
		blocks.length ? `\t\t\tdraw: () => {\n` + blocks.map(block => `\t\t\t\t${call_for(block)}`).join("\n") + `\n\t\t\t},` : null,
	].filter(Boolean);

	const lines = [
		`import { Paging } from "/imagine/paging/paging.js";`,
		blocks.some(block => block.type === "prose") ? `import { md } from "/app.js";` : null,
		``,
		`export default new Paging({`,
		`\tmeta: import.meta,`,
		`\ttitle: ${JSON.stringify(node.title)},`,
		node.icon ? `\ticon: ${JSON.stringify(node.icon)},` : null,
		node.description ? `\tdescription: ${JSON.stringify(node.description)},` : null,
		kids.length ? `\tchildren: ${JSON.stringify(kids.map(kid => kid.name).join(" "))},` : null,
		blocks.some(block => block.type === "cards") ? `\tindex: true,     // my content already shows my children` : null,
		``,
		`\tcontent(){`,
		`\t\t// the seven words this page is made of`,
		`\t\tthis.stage({`,
		...Object.keys(DEFAULT).map(key => `\t\t\t${key}: ${JSON.stringify(mode[key])},`),
		extras.length ? `\t\t}, {` : `\t\t});`,
		...extras,
		extras.length ? `\t\t});` : null,
		``,
		`\t\t// ↓ anything the builder cannot say goes here, and this is why page.js exists`,
		`\t},`,
		kids.some(is_default) ? `\n\t// the tab that opens first` : null,
		`});`,
	];

	return lines.filter(line => line !== null).join("\n");
}

/* ⚠ ARROWS, NOT METHODS. `draw` is called by the stage, so `this` inside a method
     would be the STAGE — an arrow keeps the page's own `this`, which is what
     `previews()` and a family's `example()` both need. */
const call_for = block => block.type === "prose" ? `md(${JSON.stringify(block.text ?? "")});`
	: block.type === "cards" ? `this.previews();`
	: `family(${JSON.stringify(block.family ?? "magazine")}).example(this);`;
