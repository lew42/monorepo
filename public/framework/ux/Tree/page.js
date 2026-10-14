import { Doc, md, demo, div, span, pre, button, icon, ui } from "/app.js";
import Tree from "./Tree.js";

/* Patches demo.steps() on — a page-local side effect, the same way ext/demo's own
 * doors patch each other (layout.js imports exhibit.js). Not centrally imported
 * from app.js yet: that one line belongs to a task whose fence covers app.js. */
import "/framework/ext/demo/steps.js";

/* ── THE DEMO DATA: five levels, and a real wall at the bottom of them ─────────
 * 3 × 3 × 2 × 2 × 2 = 138 rows fully open. That number is the point of `adapt`:
 * open it all and count the rows, then press Adapt and count them again.
 * ⚠ `icon:` is a FUNCTION. A View built at the call site appends itself to whatever
 *   box is capturing at that moment; a function runs under the icon slot's own captor. */
const WORDS = [
	["Shop", "Guides", "Support"],
	["Men", "Women", "Kids"],
	["Shoes", "Jackets"],
	["Running", "Trail"],
	["Reviews", "Sizing"],
];

const grow = (level = 0) => WORDS[level].map(text => ({
	icon: () => icon(level < WORDS.length - 1 ? "folder" : "description"),
	text,
	children: level + 1 < WORDS.length ? grow(level + 1) : undefined,
}));

/* Built fresh per call: a Page caches its view, so a card's copy and the stage's copy
 * would otherwise fight over one set of DOM nodes (ext/demo/exhibit.js). One spine
 * starts open, so the tree arrives showing depth instead of three closed rows. */
const site = () => {
	const nodes = grow();
	nodes[0].open = nodes[0].children[0].open = true;
	return nodes;
};

const count_all = nodes => nodes.reduce((n, node) => n + 1 + (node.children ? count_all(node.children) : 0), 0);

/* The array holding `node` and its owning node (null at the root). Nodes carry no
 * parent pointer — the tree reports a move, the CONSUMER finds the slot and splices.
 * This is the four lines every consumer writes, shown rather than hidden. */
const locate = (nodes, node, parent = null) => {
	if (nodes.includes(node)) return { array: nodes, parent };

	for (const n of nodes){
		const found = n.children && locate(n.children, node, n);
		if (found) return found;
	}
	return null;
};


/* ── THE TREE, LIVE ────────────────────────────────────────────────────────────
 * One `Tree` with everything turned on — drag, the three row buttons, a readout of
 * every event it fires — and the `adapt` switch above it, because the owner's ask
 * ("getting this right takes a little practice") is a thing you have to try. */
const tree = () => {
	const nodes = site();
	const total = count_all(nodes);
	let $tree, $adapt, $count, $path, $event;

	const say = text => $event.text(text);

	const tally = () => $count.text(`${$tree.moves().length} of ${total} rows visible`);

	// ⚠ `draw()` rebuilds from the DATA, so what is open has to BE in the data before
	// the rebuild — the caller owns the data, and this is what that costs: one line.
	const redraw = () => {
		$tree.rows.forEach(($row, node) => node.open = $row.item.opened());
		$tree.draw(nodes);
		tally();
	};

	// THE ONE DRAG EVENT. The tree never touched `nodes`; this does, and `index` is
	// already counted without the dragged node in it, so the splice needs no fixing up.
	const move = ({ node, into, index }) => {
		const { array } = locate(nodes, node);

		array.splice(array.indexOf(node), 1);
		(into ? (into.children ??= []) : nodes).splice(index, 0, node);

		say(`move({ node: "${node.text}", into: ${into ? `"${into.text}"` : "null"}, index: ${index} })`);
		$tree.el.dispatchEvent(new CustomEvent("move", { bubbles: true }));   // demo.steps()'s "drag" step
		redraw();
	};

	// THE ONE BUTTON EVENT. Three buttons, one seam — the tree draws them and reports
	// the press; what a star or a × MEANS is decided right here, by the consumer.
	const act = (name, node) => {
		const { array } = locate(nodes, node);

		if (name === "default") array.forEach(n => n.default = n === node && !node.default);
		if (name === "add") (node.children ??= []).push({ icon: () => icon("description"), text: "New page" });
		if (name === "remove") array.splice(array.indexOf(node), 1);

		say(`act("${name}", "${node.text}")`);
		redraw();
	};

	const show = node => {
		const chain = [];
		for (let item = $tree.rows.get(node)?.item; item; item = item.up) chain.unshift(item.node.text);

		$path.text(chain.join("  /  "));
		tally();
	};

	const every = open => { $tree.rows.forEach($row => $row.item[open ? "open" : "close"]()); tally(); };

	const adapt = () => {
		$tree.adapt = !$tree.adapt;
		$adapt.text(`Adapt: ${$tree.adapt ? "on" : "off"}`).tc("prim", $tree.adapt);
		$tree.adapt_to($tree.selected);
		if ($tree.adapt) $tree.el.dispatchEvent(new CustomEvent("adapt", { bubbles: true }));   // demo.steps()'s "adapt" step — only firing it ON, since that's the step
		tally();
	};

	return div.c("flex v gap", () => {
		div.c("flex v-center wrap gap-35", () => {
			$adapt = button.c("btn", "Adapt: off").click(adapt);
			button.c("btn", "Open every branch").click(() => every(true));
			button.c("btn", "Close them all").click(() => every(false));
			$count = span.c("muted");
		});

		/* ⚠ THE TREE TAKES THE WHOLE WIDTH, and the readouts go UNDER it. It was a 14em
		 * `.rail` beside a pane first, and at this stage's real width (600px inside a
		 * Doc's detail column) the rail measured 168px — a row that carries a grip, a
		 * caret, an icon, a star, a + and a × had about 30px left for its label, so
		 * every row read "S…". Six controls on a line need the room they need.
		 * ⚠ And it scrolls, on purpose: "Open every branch" is 138 rows, which is the
		 *   wall `adapt` answers — but an unbounded one would be 3,700px of stage. */
		div.c("surface pad", () => {
			$tree = new Tree({ nodes, drag: true, acts: true, selected_change: show, onMove: move, onAct: act });

			// demo.steps()'s "expand a branch" step has no callback to hook: Tree's own
			// caret click calls `stopPropagation()` before an ancestor listener ever
			// sees it (Tree.js §caret — out of this task's fence), and the → key opens
			// one too. A class watch is the one signal available from the outside,
			// however the branch opened.
			new MutationObserver(muts => {
				if (muts.some(m => m.target.classList.contains("ui-tree-open")))
					$tree.el.dispatchEvent(new CustomEvent("expand", { bubbles: true }));
			}).observe($tree.el, { attributes: true, attributeFilter: ["class"], subtree: true });
		}).style({ "max-height": "24em", "overflow": "auto" });

		/* ⚠ A `min-width` floor, or they never wrap: `.flex-1` is `flex: 1 1 0` with no
		 * basis, so two of them split a 280px phone stage into two 130px columns and the
		 * readout reads one word per line. The floor is what makes them stack. */
		div.c("flex wrap gap", () => {
			div.c("flex-1 surface pad flex v gap-50", () => {
				span.c("h4 muted", "selected");
				$path = span("(click a row, or Tab in and use the arrows)");
			}).style("min-width", "15em");

			div.c("flex-1 surface pad flex v gap-50", () => {
				span.c("h4 muted", "last event");
				$event = pre.c("ux-tree-log", "(drag a row by its grip, or press a row button)");
			}).style("min-width", "15em");
		});
	// ⚠ Braces and a semicolon: a captured callback's RETURN VALUE is appended too, and
	// `tally()` answers with `$count` — which would MOVE the readout to the end.
	}).append(() => { tally(); });
};


/* ── THE SAME CLASS, POINTED AT A PAGE ─────────────────────────────────────────
 * `Tree.from(page)` reads `page.children` — the Map core already keeps — and every
 * row is an `<a href>` to that child's url. Deeper levels load when you open them.
 * The two numbers under it have to agree, which is the whole test. */
const from_page = page => {
	let $tree, $count;

	const pages_in = p => [...p.children.values()].reduce((n, child) => n + 1 + (child?.children ? pages_in(child) : 0), 0);

	// Open every branch, waiting for each lazily-loaded level, until no new row arrives.
	const open_all = async () => {
		for (let pass = 0; pass < 9; pass++){
			const before = $tree.rows.size;
			$tree.rows.forEach($row => $row.item.open());
			await Promise.all([...$tree.rows.values()].map($row => $row.item.growing));
			if ($tree.rows.size === before) break;
		}

		await page.load_all_children(9).loading;
		$count.text(`${$tree.rows.size} rows rendered · ${pages_in(page)} pages under ${page.url}`);
	};

	return div.c("flex wrap gap", () => {
		div.c("flex-1 surface pad", () => { $tree = Tree.from(page, { adapt: true }); }).style("min-width", "16em");

		div.c("flex-1 surface pad flex v gap-50", () => {
			span.c("h4 muted", "Tree.from(page)");
			span("Every row is a link to a real url. A branch fetches its own children the first time you open it, so a fifty-module subtree costs one level on arrival.");
			button.c("btn", "Open every branch, then count").click(open_all);
			$count = span.c("muted", "(nothing counted yet)");
		});
	});
};


/* ── THE COMPARISON, one click down ────────────────────────────────────────── */
const compare = () => div.c("flex v gap", () => {
	// ⚠ Its own scroller. Seven columns in a Doc's ~640px detail column is a wrapping
	// table already; at 400 it has to be able to slide rather than squeeze to nothing.
	div.c("ux-tree-scroll", () => ui.table(
		["", "rows from", "expand / collapse", "keyboard", "drag", "selection", "marks + acts"],
		[
			["ux/Tree, before", "a nodes array", "chevron", "only in TreeKeys", "only in TreeDrag, 2 targets", "on the tree", "none"],
			["ui/tree", "hand-written markup", "baked into the data", "none", "none", "baked into the data", "none"],
			["make/tree.js", "a page tree", "none — always open", "none", "grip, 3 targets (edges)", "a picked path", "star, +, ×"],
			["ux/Tree, merged", "a nodes array, or a Page", "chevron + arrows", "always on", "grip, 3 targets (edges)", "on the tree", "star, +, ×"],
		]));

	md("**None of the four draws connector lines** — no `├─`, no guide rails. Depth is real nesting and one indent per level, in all of them, so there was nothing to merge there and nothing was added.");

	md("**The defect the merge fixes.** `TreeKeys` and `TreeDrag` were *siblings* — both `extends Tree` — so no tree could have the arrows **and** the drag. The page CMS needed both and wrote its own tree instead, which is why there were three. Now there is one class, and the keyboard, the drag, the drill-down and the row buttons are things you turn on.");

	md("**Make's tree is the better drag and the worse tree**, which is why the merge went this way round: its three-target edge model is lifted here whole, and the rest of it — a row that carries a path into `made.js`, a drop that commits through `page.move_to()`, no folding at all — is welded to the page CMS. It becomes a consumer of this class in a later task.");
});


/* The keyboard, which is no longer a subclass — the same tree, driven by hand. */
const keyboard = () => {
	const gesture = (name, said) => div.c("flex v-center gap-35", () => { ui.keys(name); span.c("muted", said); });

	return div.c("flex wrap gap", () => {
		div.c("flex-1 surface pad", () => new Tree({ nodes: site() })).style("min-width", "16em");

		div.c("flex-1 surface pad flex v gap-50", () => {
			span.c("h3", "Tab in, then drive");
			gesture("↑ ↓", "move one visible row");
			gesture("→", "open a branch, then step into it");
			gesture("←", "shut it, then step out to the parent");
			gesture("Enter", "select the focused row");
			gesture("Home / End", "first / last visible row");
		});
	});
};

/* The words proof: both tiers read the same tokens, so ONE class on the section
 * re-skins the ui/ template and the ux/ class in one pass. */
const words = () => {
	const explorer = () => div.c("surface pad", () => new Tree({ nodes: site(), acts: "default" }));

	return div.c("flex v gap-2em", () => {
		div.c("flex v gap-50", () => { div.c("h4 muted", "default"); explorer(); });
		div.c("flex v gap-50", () => { div.c("h4 muted", "ui-contrast ui-compact"); explorer().ac("ui-contrast ui-compact"); });
	});
};


export default new Doc({
	meta: import.meta,
	title: "Tree",
	description: "One tree — expandable, draggable, and it folds itself around what you select.",
	icon: "account_tree",
	related: "/framework/ui/tree/ /layouts/shell/ /imagine/gallery/lists/",

	files: "Tree.js TreeKeys.js TreeDrag.js Tree.css page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("compare", compare, {
			note: "Three trees existed on this site and only one was reusable. The row that matters is the last one: everything the other two could do, in one class you turn on." }),

		demo.page("keys", keyboard, {
			note: "No subclass — this is `new Tree({ nodes })`. One row carries `tabindex=\"0\"` and every other `-1`, so Tab reaches the tree once and the arrows do the rest, never thirty tab stops." }),

		demo.page("words", words, {
			note: "The same tree twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins the class and the template it composed in one pass." }),

		"drag",
	],

	content(){

		demo.steps({
			steps: [
				{ say: "Expand a branch", when: "expand" },
				{ say: "Drag a row above another", when: "move" },
				{ say: "Turn on Adapt", when: "adapt" },
			],
			stage: () => demo.stage(tree),
		});

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(tree, steer).ac("bleed"),
			def: tree,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Five levels, 138 rows.** Press **Adapt** and click down the tree: selecting a row shuts everything and re-opens just the chain you are on, so you see your ancestors, your siblings at every level, and your own children — twelve rows at depth four instead of 138. Drag a row by its **⠿** grip: its top edge puts you above, its middle puts you inside, its bottom edge puts you below. Every gesture prints the one event it fires, on the right.",
		});

		md("## One class, and you turn things on");

		md("A tree used to be three files you had to choose between: `Tree` for rows, `TreeKeys` for the arrow keys, `TreeDrag` for dragging — and the last two were *siblings*, so no tree could have both. It is one class now. The keyboard is always there; `drag: true`, `adapt: true` and `acts: \"default add remove\"` are the switches. [The comparison](/framework/ux/Tree/compare/) has what each of the three used to do.");

		md("**The tree never writes.** A drop reports `move({ node, into, index })` and a row button reports `act(name, node)` — one event each — and the consumer decides what that means: the page CMS moves a page on disk, a nav rail re-orders links, this demo splices an array. `index` is already counted without the dragged node in it, so nobody has to correct for their own shift.");

		md("## A page's children, as a tree of links");

		from_page(this);

		md("`Tree.from(page)` builds its rows from `page.children`, the Map core already keeps, and gives every row the child's real url. A branch's own children are a **function**, so they are fetched the first time you open that branch — the same shape core took for [data-backed children](/framework/core/Page/doc/data-children/), which is what lets a page whose children live in a database be a tree here too.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Tree({ nodes: site() }))); },
});
