import { Page, div, p, h3, span, a, input, textarea, icon, md } from "/app.js";
import { Paging, press, STYLES, CONTENT, MECHANISMS } from "../paging.js";
import { parse, serialize } from "/framework/core/Page/generator/spec.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row (no page grid; `.page-column-prose`).
   2 SIZE       `large` — 28–64em. A row here is a title, three word chips and two
                icon buttons: it needs more than the 40em reading column and never
                more than 64em.
   3 OWN LAYOUT prose, then the list (a flex column of rows), then the form, then
                the text box. One rhythm per box.
   4 REGIONS    one — core's. The pages you make are real CHILDREN of this page and
                open as columns of the same row. `index: true`, because the list
                below already draws every one of them.
   5 PREVIEW    core's default card.

   ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────────
   Pages that do not exist on disk. Every row below is a REAL page — a real url,
   the real Router, core's own columns — built at runtime from one line of text,
   and stored in your browser rather than in a file.

   ── HOW IT WORKS, IN THREE SENTENCES ──────────────────────────────────────────
   1. The whole tree is ONE STRING. Each line is a page; indentation is nesting.
   2. `children:` already accepts real `Page` objects, and `Page.add()` gives each
      one a real url — so a virtual tree needs no new machinery at all. That is the
      page generator's own trick, and this page copies it rather than inventing a
      second one (/framework/core/Page/generator/).
   3. Every edit rewrites the STRING and regrows the tree from it. Nothing writes a
      class or a field onto a live page and hopes it survives — so the text box at
      the bottom and the chips in the list can never disagree.

   ⚠ The nesting parser and the writer are the generator's own (`spec.js`'s
     `parse()` and `serialize()`), imported, not copied. Only the LINE format is
     ours, because our words are not its words: it says `wall large cols=3`, we say
     `Title: card m launch`. `read()`/`write()` below are that one difference.     */

const BASELINE = [
	"Notes: card m launch",
	"  Today: plain s launch",
	"  Later: tint xs expand",
	"Ideas: tint l swap",
	"Archive: dark m takeover",
].join("\n");

const DEFAULTS = { style: "card", content: "m", mech: "launch" };

/* ONE LINE, TAKEN APART — `Title: <style> <content> <mechanism>`. A word that is not
   in the vocabulary is ignored rather than fatal, and a missing one takes its
   default, so a half-typed line still draws a page. */
export function read(line){
	const [head, ...rest] = line.split(":");
	const words = rest.join(":").trim().split(/\s+/).filter(Boolean);

	return {
		title: head.trim() || "Untitled",
		style: words.find(word => STYLES.includes(word)) ?? DEFAULTS.style,
		content: words.find(word => CONTENT.includes(word)) ?? DEFAULTS.content,
		mech: words.find(word => word in MECHANISMS) ?? DEFAULTS.mech,
	};
}

export const write = ({ title, style, content, mech }) => title + ": " + style + " " + content + " " + mech;

// A node named by its INDEX PATH — `[1, 0]` is the first child of the second page.
// Indices and not names, for the generator's own reason: renaming a page would
// break a name path the moment the rename landed.
const at_node = (roots, path) => path.reduce((node, i) => node?.kids[i], { kids: roots });

const edit_at = (text, path, change) => {
	const roots = parse(text);
	const node = at_node(roots, path);
	if (!node) return text;

	node.line = write({ ...read(node.line), ...change });
	return serialize(roots);
};

const remove_at = (text, path) => {
	const roots = parse(text);
	const parent = at_node(roots, path.slice(0, -1));
	if (!parent) return text;

	parent.kids.splice(path.at(-1), 1);
	return serialize(roots);
};

const add_under = (text, path, line) => {
	const roots = parse(text);

	if (!path.length) return (text.trim() ? text.trimEnd() + "\n" : "") + line;

	const node = at_node(roots, path);
	if (!node) return text;

	node.kids.push({ line, kids: [], depth: node.depth + 1 });
	return serialize(roots);
};

// The next word in a list, wrapping — what a click on a word chip does.
const next = (list, word) => list[(list.indexOf(word) + 1) % list.length];

/* SPEC → REAL PAGES. Each node becomes a `Paging` with the words on its line as its
   opening mode, and its own children built the same way. `Page.add()` (called by
   `regrow()` below) hands each one a real url derived from this page's, and
   `move()` carries it down the whole subtree. */
function grow(nodes){
	return nodes.map(node => {
		const { title, style, content, mech } = read(node.line);

		return new Paging({
			name: Page.slug(title),
			title,
			icon: "description",
			description: "A page you made, wearing " + style + " · " + content + " · " + mech + ".",
			takeaway: "**You made this page — it has a real url, and it does not exist on disk.** Everything about it comes from one line of text stored in your browser: `" + write({ title, style, content, mech }) + "`. Its chips work exactly like every other page's here, and Reset on the [hub](/imagine/paging/) forgets it.",
			axes: "style content mech",
			mode: { style, content, mech },
			children: grow(node.kids),
			content(){ this.lede(); this.paging(); },
		});
	});
}

export default new Paging({
	meta: import.meta,
	title: "Make",
	description: "Make real pages at runtime — no files, stored in your browser.",
	icon: "add_circle_outline",
	width: "large",
	index: true,
	axes: "",

	takeaway: "**Make pages here and they are real pages: a real url, the real router, real columns — with no file on disk.** The whole tree is one string of text; every page below is one line of it. Nothing leaves your browser, and [Reset](/imagine/paging/) puts the list back to the five it shipped with.",

	// The tree exists before the first paint, so a cold arrival at a made page's own
	// url finds it. `initialize()` runs inside the constructor, after `naming()` has
	// given this page its url — which `add()` needs to address the children.
	initialize(){ this.regrow(); },

	// ── the string, and the tree it grows ─────────────────────────────────────
	// ⚠ `patch`, not `set`: this page's own mode record lives under the same key
	//   (one key per page is the realm's one rule — words.js), so a `set` would wipe
	//   it. The two fields have never collided and this is why.
	spec(){ return this.store().get({ spec: BASELINE }).spec; },

	save(text){
		this.store().patch({ spec: text });
		this.regrow();
		this.redraw();
		return this;
	},

	regrow(){
		this.children = new Map();
		grow(parse(this.spec())).forEach(page => this.add(page.name, page));
		return this;
	},

	// One seam every write goes through, so the list, the text box and the tree can
	// never show three different answers.
	redraw(){
		this.$list?.empty(() => { this.rows(); });
		if (this.$text) this.$text.el.value = this.spec();
		this.app?.router?.mark_links();
		return this;
	},

	content(){
		this.lede();

		h3("The pages you have made");

		md("Each row is a real page. **Click its title** to open it as a column. **Click one of its three words** to change it — the word cycles through the vocabulary and the page is rebuilt immediately. **`+`** adds a child under it; **`×`** deletes it.");

		this.$list = div.c("paging-make-list", () => { this.rows(); });

		h3("Add a page");

		this.form();

		h3("Or edit the whole tree as text");

		md("This is the same tree, as the string it actually is. One line per page, `Title: style content mechanism`, and **indentation is nesting** — two spaces per level. Change it and press Save; a word the vocabulary does not know is ignored rather than fatal, and a missing word takes its default (`" + write({ title: "Title", ...DEFAULTS }) + "`).");

		this.editor();

		h3("Where this is kept");

		md("In `localStorage`, under this page's own address inside the realm's one namespace — `lew42:paging:/imagine/paging/make/`. Nothing is sent anywhere and no file is written. [Reset](/imagine/paging/) on the hub clears every `lew42:paging:` key at once, which puts this list back to its five baseline pages and every other demo back to how it shipped. The contract in full: [doc/persistence.md](/imagine/paging/doc/persistence.md).");

		md("**What this cannot do yet, and why.** A page you delete while its column is open stays on screen until you navigate — the row is gone from the tree, but core does not unmount a column it is not asked to. Nothing here writes to disk either; exporting a made tree to real `page.js` files is the page generator's Export button, which is dev-server only ([generator](/framework/core/Page/generator/)).");
	},

	// ── the list: one row per made page, at any depth ─────────────────────────
	rows(path = [], nodes = parse(this.spec())){
		if (!nodes.length && !path.length)
			return p.c("muted", "No pages. Add one below, or press Save on the text box to bring the baseline five back.");

		nodes.forEach((node, i) => {
			const here = [...path, i];
			this.row(node, here);
			if (node.kids.length) div.c("paging-make-kids", () => { this.rows(here, node.kids); });
		});
	},

	row(node, path){
		const line = read(node.line);
		const page = this.at_path(path);

		return div.c("paging-make-row", () => {
			icon("description");

			a.c("paging-make-title", line.title).href(page?.url ?? this.url);

			this.word(path, "style", line.style, STYLES);
			this.word(path, "content", line.content, CONTENT);
			this.word(path, "mech", line.mech, Object.keys(MECHANISMS));

			press(span.c("paging-make-act").attr("title", "add a child page under " + line.title).append(() => icon("add")),
				() => this.save(add_under(this.spec(), path, write({ ...DEFAULTS, title: "New page" }))));

			press(span.c("paging-make-act paging-make-del").attr("title", "delete " + line.title).append(() => icon("close")),
				() => this.save(remove_at(this.spec(), path)));
		});
	},

	// The live page a row stands for, so the title can link to its real url.
	at_path(path){
		let page = this;
		for (const i of path) page = [...(page?.children.values() ?? [])][i];
		return page;
	},

	/* A WORD YOU CAN CLICK. One chip per axis, and a click advances it to the next
	   word in that axis — three chips instead of fourteen, and the cycling is what
	   teaches the vocabulary: press `style` five times and you have seen all five
	   surfaces without reading a list of them. */
	word(path, axis, value, list){
		return press(span.c("paging-chip paging-make-word").attr("title", axis + " — click for the next one").append(() => {
			if (axis === "mech") icon(MECHANISMS[value].icon);
			span(value);
		}), () => this.save(edit_at(this.spec(), path, { [axis]: next(list, value) })));
	},

	// ── create ───────────────────────────────────────────────────────────────
	form(){
		return div.c("paging-make-form", () => {
			const $name = input().attr("type", "text").attr("placeholder", "A name — “Reading list”").ac("paging-make-name");

			const add = () => {
				const title = ($name.el.value || "").trim();
				if (!title) return $name.el.focus();

				$name.el.value = "";
				this.save(add_under(this.spec(), [], write({ ...DEFAULTS, title })));
			};

			$name.on("keydown", event => { if (event.key === "Enter"){ event.preventDefault(); add(); } });

			press(span.c("paging-chip on").append(() => { icon("add"); span("Add the page"); }), add);

			p.c("muted", "It arrives wearing " + write({ ...DEFAULTS, title: "…" }).replace("…: ", "") + ". Click its words in the list to change them.");
		});
	},

	// ── update, the whole tree at once ────────────────────────────────────────
	editor(){
		return div.c("paging-make-editor", () => {
			this.$text = textarea.c("paging-make-text").attr("rows", "8").attr("spellcheck", "false");
			this.$text.el.value = this.spec();

			div.c("paging-make-form", () => {
				press(span.c("paging-chip on").append(() => { icon("save"); span("Save"); }),
					() => this.save(this.$text.el.value));

				press(span.c("paging-chip").append(() => { icon("refresh"); span("Back to the baseline five"); }),
					() => this.save(BASELINE));
			});
		});
	},
});
