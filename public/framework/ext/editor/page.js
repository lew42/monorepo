import { Doc, md, code, div, span, h4, input, icon, View } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import layout from "/framework/ext/layout/layout.js";
import { chips, btn } from "/framework/ext/layout/controls.js";
import { workspace, Panel } from "/framework/ext/Panel/workspace.js";
import History from "./History.js";
import { BLOCKS, Section, Text } from "./blocks.js";

/* css: .editor, .editor-region — plus `.panel-workspace`, whose `--panel-height` the
   frame below sets, and whose module is imported above. */
View.stylesheet(import.meta, "editor.css");

// ⚠ THE line that chooses where a document lives. Off localhost there is no dev socket,
// so FileSaver warns once and writes nothing (ruling 15) — the deployed editor gets
// localStorage instead and genuinely persists.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key });

// Two documents that never touch: what you are editing, and how you arranged the room.
const saver = store("/data/editor.json", "editor");
const panels = store("/data/editor-panels.json", "editor-panels");

const pane = (template, grow, mode) => new Panel({ data: { template, align: "tl", grow, mode } });
const split = (dir, grow, ...kids) => new Panel({ data: { dir, grow } }).add(...kids);

// The shell, once: palette | canvas | layers over properties, with the status strip
// under all three. Only ever runs for a workspace nobody has arranged yet.
const seed = root => root.set("dir", "col").add(
	split("row", 1,
		pane("palette", 1),
		pane("canvas", 4),
		split("col", 1.6, pane("layers", 1), pane("properties", 2))),
	pane("status", 1, "hug"));

/* One canvas node: a row you can grab, and — when it holds blocks — a box rows land
   in. `history` arrives by assign, which is all a dependency costs here. */
class Node extends Sortable {

	/* ⚠ Three halves. `Item.contains()` is strict, so `target !== this` is not
	   redundant; and `Draggable.registry` is one WeakMap for the whole document, so
	   without the root test a block drops into the panel tree it is being edited in. */
	drop_check(target){
		return target !== this && target.item?.root() === this.item.root() && !this.item.contains(target.item);
	}

	// Sortable commits inside release(), and act() snapshots BEFORE running — exactly
	// the shape a drag needs. A drop that lands nowhere pushes no snapshot. Re-select
	// afterwards: the move redraws the canvas, so my own node is a new element.
	release(e){
		if (!this.locate(e)) return super.release(e);
		this.history.act(() => super.release(e));
		this.select(this.item.id);
	}
}

/* ⚠ Adapted from the 2026-08-12 mock rather than imported (a log directory is not a
   module): a stage that steers a whole render treats every click inside as "select
   this region", and an editor with a selection of its own must not answer twice. */
const quiet = $el => $el.on("click", e => e.stopPropagation()).on("mouseover", e => e.stopPropagation());

/* One region's box, filling the panel body it was drawn into. ⚠ Quiet, because a click
   that reaches `.panel-body` is ext/layout's "select this region" and the drawer it
   opens pushes the whole app aside. Canvas nodes stop their own; this stops the rest. */
const region = (words, fn = () => {}) => quiet(div.c("editor-region " + words, fn))
	.style({ "--gap": "0.4em", "--pad": "0.5em" });

const depth = item => { let n = 0; for (let up = item.parent; up; up = up.parent) n++; return n; };
const label = item => String(item.get("text") || item.wire()).slice(0, 20) || "block";
const row = fn => div.c("flex wrap gap", fn).style("--gap", "0.3em");

// ⚠ `drag-items` is Sortable's mark, not the design's, and it is re-added on every
// render — persisting it would grow the class string by one word per reload.
const words_of = $body => [...$body.el.classList].filter(word => word !== "drag-items").join(" ");

function editor(root){
	let doc = root, sel, saved, $canvas, $layers, $props, $status, $undo, $redo;
	const nodes = new Map();   // id → { item, $node, $body }, rebuilt by every draw()

	// Everything that happens to the document lands here: write it, and repaint the two
	// bits of chrome that report on it. ⚠ A save resolving `false` wrote NOTHING, and
	// that return value is the only honest source for the badge — ruling 15.
	const changed = () => {
		marks();
		return doc.save().then(ok => { saved = ok; badge(); });
	};

	// Autosave is one listener at the root: Item events bubble, so an edit anywhere
	// lands here. ⚠ Only STRUCTURE redraws — a "change" must not, or a chip click
	// would replace the very element the properties region is holding.
	const listen = () => {
		["change", "add", "remove"].forEach(event => doc.on(event, changed));
		["add", "remove"].forEach(event => doc.on(event, draw));
	};

	const history = new History({
		read: () => JSON.stringify(doc),
		restore: snapshot => swap(JSON.parse(snapshot)),
	});

	// ⚠ ONE function, because hydrate returns a NEW tree: the saver, the autosave
	// listener, the canvas and the selection move onto it together or not at all.
	const swap = json => { doc = Item.hydrate(json).assign({ saver }); listen(); draw(); changed(); };

	/* Five painters, one per region. ⚠ Every one is guarded: a region the workspace is
	   not showing has no body, and closing one must not take the editor with it. */
	const marks = () => {
		if ($undo) $undo.el.disabled = !history.can_undo();
		if ($redo) $redo.el.disabled = !history.can_redo();
	};

	const badge = () => $status?.empty(() => {
		span.c("editor-status", saved === undefined ? "…" : saved ? "saved" : "read only")
			.ac(saved === false && "editor-warn");
	});

	// Parent-first, the order a tree is read in — `walk()` already visits that way.
	const layers = () => $layers?.empty(() => {
		doc.walk(item => btn(() => { icon(item.leaf?.() ? "notes" : "folder"); span(label(item)); }, () => select(item.id))
			.ac("editor-layer").ac(item.id === sel && "on")
			.style("padding-inline-start", 0.3 + depth(item) * 0.8 + "em"));
	});

	const properties = () => $props?.empty(() => { fields(nodes.get(sel)); });

	const draw = () => {
		nodes.clear();
		$canvas?.empty(() => { node(doc); });
		select(sel);
	};

	// ⚠ Selection is an id, never a node — undo replaces every object in the tree, so
	// a remembered reference is a detached element holding a dead Item.
	const select = id => {
		sel = nodes.has(id) ? id : doc.id;
		nodes.forEach((node, key) => node.$node[key === sel ? "ac" : "rc"]("on"));
		layers();
		properties();
	};

	function node(item){
		let $bar, $body;
		const grip = !!item.parent;   // ⚠ a boolean: `handle: undefined` falls back to the whole node

		const $node = div.c("editor-node", () => {
			if (grip) $bar = div.c("editor-bar", () => { icon("drag_indicator"); span(label(item)); });

			$body = div.c(item.get("words")).attr("style", item.get("css") ?? "");
			if (item.leaf?.()) $body.append(item.get("text"));
			else $body.append(() => { item.items.each(kid => node(kid)); });
		}).click(function(e){ e.stopPropagation(); select(item.id); });

		new Node({ view: $node, handle: grip && $bar, $items: item.leaf?.() ? undefined : $body, item, history, select });
		nodes.set(item.id, { item, $node, $body });
		return $node;
	}

	/* The region is ext/layout's own — the same word registry (`layout.words`), the same
	   chips. A parallel vocabulary here would be a second answer to "what is this box",
	   and the line at the top is what you would paste into a page. */
	function fields(picked){
		if (!picked) return span.c("muted", "Nothing selected.");

		const { item, $body } = picked;
		const leaf = !!item.leaf?.();

		h4(`${item.wire()} — ${leaf ? "text" : "container"}`);
		code(`div.c("${words_of($body)}")`);

		if (leaf)
			input.c("editor-text").attr("value", item.get("text") ?? "")
				.on("change", function(){ history.act(() => item.set("text", this.el.value)); draw(); });
		else {
			row(() => layout.words.mode($body));
			row(() => chips($body, "v wrap auto gap"));
			row(() => { layout.words.gap($body); layout.words.column($body); });
		}

		row(() => chips($body, "pad surface wash flex-1 basis"));
		row(() => layout.words.pad($body));
	}

	/* ⚠ ext/layout's controls write to the ELEMENT — that is their whole contract. So
	   once one has run the element is the truth, and this copies it back onto the Item,
	   which is what serializes. Bubble phase, so it lands after the control's handler. */
	const sync = () => {
		const picked = nodes.get(sel);
		if (!picked) return;
		picked.item.set("words", words_of(picked.$body));
		picked.item.set("css", picked.$body.el.getAttribute("style") ?? "");
	};

	// Into the selection when it holds blocks, else beside it. The document is the
	// floor, so the palette always lands somewhere.
	const insert = Class => {
		const picked = nodes.get(sel)?.item ?? doc;
		const into = picked.leaf?.() ? picked.parent ?? doc : picked;
		const made = new Class();
		history.act(() => into.add(made));
		select(made.id);
	};

	const cut = () => {
		const item = nodes.get(sel)?.item;
		const up = item?.parent;
		if (!up) return;   // the document itself is not a block
		history.act(() => item.remove());
		select(up.id);
	};

	/* This workspace's T vocabulary: five regions and an empty one, each closing over
	   the editor above. Nothing about editor state reaches ext/Panel's global templates,
	   and a region the arrangement drops simply stops being painted. ⚠ `panel-controls`
	   is a payload's claim that its top edge holds controls, which `panel.css` answers by
	   reserving the hover bar's height — the canvas abstains because it is the document,
	   and the status strip because a badge is read while the pointer is somewhere else. */
	const REGIONS = {
		blank: { draw(){ region("pad", () => { span.c("muted", "Empty — pick a region from T."); }); } },

		palette: { draw(){
			region("panel-controls flex v gap pad", () => {
				Object.keys(BLOCKS).forEach(name => btn(name, () => insert(BLOCKS[name])));
				row(() => {
					$undo = btn(() => icon("undo"), () => history.undo()).attr("title", "Ctrl+Z");
					$redo = btn(() => icon("redo"), () => history.redo()).attr("title", "Ctrl+Shift+Z");
					btn(() => icon("delete"), cut).attr("title", "Delete the selected block");
				});
			});
			marks();
		} },

		canvas: { draw(){ $canvas = region("pad"); draw(); } },
		layers: { draw(){ $layers = region("panel-controls flex v pad"); layers(); } },
		properties: { draw(){ $props = region("panel-controls flex v gap pad").on("click", sync).on("input", sync); properties(); } },
		status: { draw(){ $status = region("flex v-center gap pad"); badge(); } },
	};

	// ⚠ Every ext/Panel authoring tool off: none of the five regions are template content
	// a visitor picks and arranges — they're fixed editor chrome, and canvas besides is a
	// document, not a panel to align, zoom, edge-split or type straight into.
	const $workspace = workspace({
		saver: panels, templates: REGIONS, seed,
		tools: { align: false, zoom: false, inspect: false, edges: false, insert: false, text: false, display: false },
	}).ac("editor");

	// ⚠ One window listener for the life of the document — a Page caches its view, so
	// content() runs once. The connected check keeps a routed-away editor from eating
	// the shortcut of whatever is on screen now.
	window.addEventListener("keydown", e => {
		if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z" || !$workspace.el.isConnected) return;
		e.preventDefault();
		e.shiftKey ? history.redo() : history.undo();
	});

	// ⚠ No changed() here — that would save on every visit, edited or not. badge()
	// already ran (via the status region's draw) showing "…"; only a real edit saves.
	listen();
	return $workspace;
}

export default new Doc({
	meta: import.meta,
	title: "Editor",
	description: "A drag-and-drop builder on this stack and nothing else — the prototype the whole thing points at.",
	icon: "design_services",

	// The only real class in the module — History.js. blocks.js's five Block
	// subclasses are documented via doc/file/blocks.js.md instead: Doc takes one
	// subject, and this is the one with behavior worth an API tab.
	subject: History,
	properties: "past future",
	methods:    "act undo redo step can_undo can_redo read restore",
	notes:      "shell decisions",
	files:      "blocks.js History.js editor.css page.js",

	content(){

		// ⚠ Placed NOW and filled in a callback below: the document arrives async, and
		// a factory call after an `await` appends wherever the captor has since drifted.
		const $shell = div.c("editor-shell bleed");

		md("**Drag a block into a nested container and reload the page — it is still there.** **Ctrl+Z** undoes the drag; **Ctrl+Shift+Z** redoes it.");

		md("**The shell is a [panel workspace](/framework/ext/Panel/).** Point at a region and its bar fades in over the top of it — split it with the two icons, drag one beside another by its grip, drag a divider, close one and put it back from `T`. That arrangement reloads too, out of a second file nothing about the document knows.");

		code.js(`const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key });

const saver  = store("/data/editor.json", "editor");                 // what you are editing
const panels = store("/data/editor-panels.json", "editor-panels");   // how you arranged the room

const doc = await Item.open(saver);   // load -> hydrate -> attach: the one async entry

["change", "add", "remove"].forEach(event => doc.on(event, () => doc.save()));`);

		md("That is the persistence layer, entire — and it is the *same* layer twice. `Item` events **bubble**, so one listener at the root catches an edit anywhere in the tree, and the saver's queue collapses fifty of them into two writes.");

		md("**A region is a template.** `workspace()` takes the vocabulary its `T` menus offer, so this one lists the editor's five regions instead of the site's section bands — and each one is a closure over the editor above, which is why no editor state reaches `ext/Panel`.");

		code.js(`const REGIONS = {
    canvas: { draw(){ $canvas = region("pad"); draw(); } },
    layers: { draw(){ $layers = region("flex v"); layers(); } },
    // …palette, properties, status
};

workspace({ saver: panels, templates: REGIONS, seed });`);

		md("Every box above is a real [`Item`](/framework/core/Item/), every row is a [`Sortable`](/framework/ext/Draggable/), the properties region is [`ext/layout`](/framework/ext/layout/)'s own vocabulary, and every edit writes the whole document through a [`Saver`](/framework/ext/Saver/). There is no fifth mechanism.");

		md("**Undo restores a snapshot through `Item.hydrate`**, which returns a *new tree* — so every Ctrl+Z is a live test of the round trip a reload takes, and the selection has to be an **id**: afterwards every object in the document is a different object.");

		md("**A drag is one `item.move(parent, before)`.** Reorder, reparent and nest are not three features; the drop site under the cursor decides which one it was. Two drag systems share the page — panels move by their grip, blocks by their bar — and each rejects a drop whose `item.root()` is not its own document.");

		md("Next: [Item](/framework/core/Item/) — the tree this page is editing.");

		md("Where this module stands — and the ruling on the capital E: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/).");

		md.details(import.meta, "readme.md", "Readme");

		return Item.open(saver).then(doc => {
			if (!doc.get("words")) doc.set("words", "flex v gap pad");
			if (!doc.items.length) doc.add(new Section().add(new Text()));
			$shell.empty(() => { editor(doc); });
		});
	},

	// No preview() override: a live thumb here broke (Traps below). The wall gets
	// the plain default card — icon, title, description.
});
