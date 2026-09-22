/* The study behind `/framework/styles/system/studies/spacing/nesting/` - the owner's words: "once you put
 * something in a card it has to be double padded to have a background color different
 * from the card color: padding on the outer container, padding on the card, and an inner
 * card is three levels of padding from the edge of the viewport."
 *
 * ONE dataset, real text lifted from `/framework/ux/Tree/page.js` (its own module blurb,
 * and the first sentence of its "compare"/"keys"/"words" demo notes) - a topic, its three
 * items, and each item's one-line detail - drawn four ways: cards in cards in cards, two
 * levels (one shared box), a flat list (hairlines and indent, no boxes), and `ux/Tree` on
 * the same nodes. Using the site's own module as the content means the comparison is about
 * the PADDING, never about invented copy.
 *
 * ⚠ A page is built DETACHED, so `getBoundingClientRect` has nothing to answer with until
 *   the boxes are in the document - `watch()` hangs a `ResizeObserver` on the wall, the
 *   same shape `type/anchors/anchors.js` uses, and for the same reason.
 */

import { View, div, p, h3 } from "/app.js";
import Tree from "/framework/ux/Tree/Tree.js";

View.stylesheet(import.meta, "nesting.css");

const live = (el, fn) => new ResizeObserver(fn).observe(el);

/** The one dataset every variant draws, three levels deep. */
export const TOPIC = {
	text: "ux/Tree",
	blurb: "Rows from a plain array, or straight from a Page's children. The keyboard is always on.",
};

export const ITEMS = [
	{ text: "Compare", detail: "Three trees existed on this site and only one was reusable." },
	{ text: "Keys", detail: "Tab reaches the tree once and the arrows do the rest, never thirty tab stops." },
	{ text: "Words", detail: "A ux never ships a compact mode, both tiers read the same framework tokens." },
];

export class NestingStudy {
	constructor(...args){ this.assign(...args); }
	assign(...args){
		Object.assign(this, ...args);
		this.variants = {};
		return this;
	}

	/* ---- the shell every variant sits in: a name, a one-line note, the demo, a readout */
	shell(key, name, note, build){
		this.variants[key] = { name };
		return div.c("nesting-variant", () => {
			h3.c("nesting-name", name);
			p.c("nesting-note muted", note);
			this.variants[key].$demo = div.c("nesting-demo", () => { this.variants[key].$deepest = build.call(this); });
			this.variants[key].$readout = div.c("nesting-readout", "Measuring…");
		});
	}

	/* (a) CARDS IN CARDS IN CARDS - three boxes, each `.surface.pad` (its own ground, its
	 * own `--pad`): the topic, then an item, then that item's detail. All three items get
	 * the full three-deep nest - `item[0]`'s detail box is the one measured. */
	cards(){
		let $deepest;
		div.c("nesting-box surface pad", () => {
			div.c("h4 nesting-label", TOPIC.text);
			p.c("nesting-blurb", TOPIC.blurb);
			div.c("nesting-stack", () => {
				ITEMS.forEach((item, i) => {
					div.c("nesting-box surface pad", () => {
						div.c("h4 nesting-label", item.text);
						div.c("nesting-box surface pad", () => {
							const $p = p(item.detail);
							if (i === 0) $deepest = $p.el;
						});
					});
				});
			});
		});
		return $deepest;
	}

	/* (b) TWO LEVELS - the page's own gutter, plus ONE box. The topic is a heading, not a
	 * box; that one box holds every item as a row, and an item's detail is a plain second
	 * line in the same row - never a third ground. */
	two_levels(){
		let $deepest;
		div.c("nesting-topic-head", TOPIC.text);
		div.c("nesting-box surface pad", () => {
			ITEMS.forEach((item, i) => {
				div.c("nesting-row", () => {
					div.c("nesting-row-label", item.text);
					const $p = p.c("nesting-row-detail muted", item.detail);
					if (i === 0) $deepest = $p.el;
				});
			});
		});
		return $deepest;
	}

	/* (c) FLAT LIST - no ground anywhere, not even one. Hairlines separate the items;
	 * indent (a real `padding-inline-start`, not a margin) is the only thing that says
	 * "this line belongs under that one." */
	flat_list(){
		let $deepest;
		div.c("nesting-topic-head", TOPIC.text);
		div.c("nesting-flat", () => {
			ITEMS.forEach((item, i) => {
				div.c("nesting-flat-item", () => {
					div.c("nesting-flat-label", item.text);
					div.c("nesting-flat-detail", () => {
						const $p = p(item.detail);
						if (i === 0) $deepest = $p.el;
					});
				});
			});
		});
		return $deepest;
	}

	/* (d) ux/Tree, ON THE SAME NODES - one `.surface.pad` box holding the widget, `adapt:
	 * true`, and one `select()` right after building it: everything but the chain down to
	 * `item[0]` folds shut, so the reader sees depth without three grounds stacked.
	 * `.ui-tree-text` shrink-wraps to its own content (`white-space: nowrap`), so it is not
	 * the number to read for "room left" - the row it sits in is, out to the row's own
	 * padded edge; `tree_width()` below measures that instead. */
	tree_variant(){
		const detail_nodes = ITEMS.map(item => ({ text: item.detail }));
		const item_nodes = ITEMS.map((item, i) => ({ text: item.text, children: [detail_nodes[i]] }));
		const topic_node = { text: TOPIC.text, children: item_nodes, open: true };

		let $deepest;
		div.c("nesting-box surface pad", () => {
			const tree = new Tree({ nodes: [topic_node], adapt: true });
			tree.select(item_nodes[0]);
			const $row = tree.rows.get(detail_nodes[0]);
			this.variants.d.$row = $row?.el;
			$deepest = $row?.el.querySelector(".ui-tree-text");
		});
		return $deepest;
	}

	/** The wall: all four, side by side at 1280, stacked at 400 - `nesting.css` does the
	 * responsive part, not a media query written twice. */
	wall(){
		return div.c("nesting-wall", () => {
			this.shell("a", "(a) Cards in cards in cards", "Three boxes: the topic, an item, its detail - each with its own ground and its own padding.", this.cards);
			this.shell("b", "(b) Two levels", "The page's gutter, plus one box. An item's detail is a second line in the same row, not a third ground.", this.two_levels);
			this.shell("c", "(c) Flat list", "No boxes at all. A hairline and an indent carry the hierarchy a background used to.", this.flat_list);
			this.shell("d", "(d) ux/Tree, folded", "Same three levels, adapt: true. Selecting item[0] shuts its siblings and opens only the chain down to it.", this.tree_variant);
		});
	}

	takeaway_box(){
		this.$takeaway = div.c("nesting-takeaway", "Reading the boxes…");
		return this.$takeaway;
	}

	guidance_box(){
		this.$guidance = p.c("nesting-guidance", "Reading the boxes…");
		return this.$guidance;
	}

	/* ---- reading it back --------------------------------------------------------------
	 * ONE geometric method for every variant: walk from the deepest content element up to
	 * the variant's own `.nesting-demo` root, and read every ancestor's OWN computed
	 * `padding-left` in real px - `.surface.pad`'s padding, `.ui-tree-children`'s indent
	 * (`padding-inline-start`), `.nesting-flat-item`/`-detail`'s indent - whatever the
	 * mechanism actually is, this reads what the browser rendered rather than summing CSS
	 * by hand. The page's own gutter is read off `$takeaway`, which always sits in the
	 * page's plain single-column track, at any width. */
	measure(){
		if (!this.$takeaway) return;
		const gutter = this.$takeaway.el.getBoundingClientRect().left;
		const vw = window.innerWidth;

		Object.values(this.variants).forEach(v => {
			if (!v.$deepest) return;

			const width = v === this.variants.d ? this.tree_width(v) : v.$deepest.getBoundingClientRect().width;

			const levels = [];
			for (let node = v.$deepest.parentElement; node && (node === v.$demo.el || v.$demo.el.contains(node)); node = node.parentElement){
				const pl = parseFloat(getComputedStyle(node).paddingLeft) || 0;
				if (pl > 0.5) levels.unshift(Math.round(pl));
			}

			const total = Math.round(gutter) + levels.reduce((a, b) => a + b, 0);
			v.width = width; v.pct = width / vw * 100; v.levels = levels; v.total = total;

			v.$readout.text(`${Math.round(width)}px left for text (${v.pct.toFixed(0)}% of the viewport) · `
				+ `${Math.round(gutter)} + ${levels.join(" + ")} = ${total}px in from the edge`);
		});

		this.$takeaway?.text(this.takeaway());
		this.$guidance?.text(this.guidance());
	}

	/** `.ui-tree-text` shrink-wraps (`white-space: nowrap`), so its own rendered width is
	 * "how wide the words are", not "how much room there was" - the row it sits in fills
	 * its container, so the room is the row's own right inner edge minus where the text
	 * starts. */
	tree_width(v){
		if (!v.$row) return 0;
		const row = v.$row.getBoundingClientRect();
		const pad_right = parseFloat(getComputedStyle(v.$row).paddingRight) || 0;
		const text = v.$deepest.getBoundingClientRect();
		return (row.right - pad_right) - text.left;
	}

	/** Deliverable 1: the computed sentence at the top - the most-nested variant against
	 * the least-nested one, in real numbers off the render, at whatever width the reader
	 * is looking at right now. */
	takeaway(){
		const a = this.variants.a, c = this.variants.c;
		if (!a?.width || !c?.width) return "Reading the boxes…";
		return `At this width, three nested cards (a) leave ${Math.round(a.width)}px for the actual words - the flat list (c) leaves ${Math.round(c.width)}px, ${(c.width / a.width).toFixed(1)}× more, from the same three levels of content.`;
	}

	/** Deliverable 2 - corrected 2026-09-18: not a rule ("two levels is the limit"), a
	 * sentence about what the numbers show and when each shape earns its keep. */
	guidance(){
		const a = this.variants.a;
		if (!a?.width) return "Reading the boxes…";
		return `The numbers below are a rough order, not a rule: a flat list with indent alone (c) is often the cleanest choice for a simple set of rows; a box wants its own padding once it takes its own background, or the text rides the seam; how close or spaced the rows sit is itself what tells a reader whether two things are closely related or merely near each other; and three nested grounds here (a) leave about ${Math.round(a.width)}px for the words, which is the number worth remembering more than any rule.`;
	}

	watch($wall){
		live($wall.el, () => this.measure());
		requestAnimationFrame(() => this.measure());
	}
}
