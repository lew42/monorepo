/* The repeated anchor — the study behind `/framework/styles/system/studies/type/anchors/`.
 *
 * Three copies of one post, word for word identical, differing only in how the little
 * mark after each h2 is treated. That is the whole experiment: if the posts differ in
 * anything else, the comparison is worth nothing.
 *
 * Every size on this page is one of the site's six type levels and nothing else — no
 * `font-size` is declared anywhere in `anchors.css`. The anchor and the eyebrow are the
 * **h4 level**, which is this site's small-label level: bold, uppercase, letter-spaced,
 * 0.875em, borrowed onto a `<span>` and a `<p>` with the framework's own "wear the level,
 * keep the tag" class form.
 *
 * ⚠ A page is built DETACHED on this site, so `getComputedStyle` has nothing to answer
 *   with until the boxes are in the document. `watch()` hangs a `ResizeObserver` on the
 *   wall, which fires on first layout and again on every resize.
 */

import { div, figure, figcaption, h1, h2, p, span } from "/app.js";
import { parse, ratio, floorOf, hex } from "/framework/styles/stacks/stacks.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);

/** The three treatments. `key` is also the modifier class the stylesheet keys on. */
export const VARIANTS = [
	{ key: "accent", label: "A — the mark in the accent" },
	{ key: "muted", label: "B — the mark in a muted ink" },
	{ key: "rule", label: "C — the mark underlined in the accent" },
];

/** One post, said once. Every variant renders these exact words. */
export const POST = {
	eyebrow: "Field notes",
	title: "Repetition",
	standfirst: "A page is a stack of grounds and a stack of text. Where either repeats, the reader stops "
		+ "reading and starts recognising — which is faster, and is most of what a layout is for.",
	sections: [
		["What repeats", "17 Sep 2026",
			"The eye finds a repeated mark before it reads a word. Three marks at the same size, weight and "
			+ "colour are a set; three different marks are three interruptions."],
		["What it says", "12 notes",
			"A date, a count, a tag — the words carry almost nothing here. Swap them and the post still reads "
			+ "the same way, because the mark's job is where it sits and what colour it is."],
		["Where it sits", "Design",
			"Always after the heading, never before it, and never on a paragraph. A mark that moves is not an "
			+ "anchor; it is one more thing to look at."],
	],
};

export class AnchorStudy {
	constructor(...args){ this.assign(...args); }
	assign(...args){
		Object.assign(this, ...args);
		this.posts ??= [];
		return this;
	}

	/* ---- building ---------------------------------------------------------- */

	/** The heading and its mark on one baseline. The mark is a SIBLING of the h2, not a
	 *  child of it: `em` is the element's own font size, so a 0.875em span inside a
	 *  2.25em heading would be 1.97em of body text — a size the site does not have. As
	 *  a sibling in a row at body size, `.h4` is exactly the h4 level. */
	head(text, mark, post){
		div.c("type-anchors-head", () => {
			h2(text);
			post.marks.push(span.c("h4 type-anchor", mark));
		});
	}

	/** One post. `.flow` owns the rhythm between its blocks; `.surface` gives it a card,
	 *  because the three posts are alternatives the reader is choosing between and a set
	 *  of choices reads as a set when each one has a ground. */
	post(variant){
		const post = { ...variant, marks: [] };
		this.posts.push(post);
		figure.c("type-anchors-cell", () => {
			// ⚠ The modifier carries the module's prefix, and that is not tidiness: with a
			//   bare `muted` the framework's own `.muted` utility faded the ENTIRE post —
			//   heading, body and all — and the variant looked like a deliberate design.
			post.$box = div.c("surface pad flow type-anchors-post type-anchors-" + variant.key, () => {
				p.c("h4 type-anchors-eyebrow", POST.eyebrow);
				h1(POST.title);
				p(POST.standfirst);
				POST.sections.forEach(([text, mark, body]) => {
					this.head(text, mark, post);
					p(body);
				});
			});
			figcaption.c("type-anchors-cap", () => {
				span.c("type-anchors-label", variant.label);
				post.$num = span.c("type-anchors-num", "");
			});
		});
	}

	/** Three posts side by side. NOT `.grid.auto`: that utility's track max is `1fr`, it
	 *  lives in `@layer util`, and a component rule can never override a utility here —
	 *  so the ceiling a post needs (it holds a reading measure and centres, it does not
	 *  stretch to 1,100px at 3440) is written as this page's own grid instead. */
	wall(){
		return div.c("type-anchors-wall", () => { VARIANTS.forEach(v => this.post(v)); });
	}

	takeaway_box(){
		this.$takeaway = div.c("type-anchors-takeaway", "Reading the colours…");
		return this.$takeaway;
	}

	/* ---- reading it back ---------------------------------------------------- */

	measure(){
		this.posts.forEach(post => {
			const $m = post.marks[0];
			if (!$m) return;
			const style = getComputedStyle($m.el);
			const ink = parse(style.color);
			if (!ink[3]) return;
			const floor = floorOf($m.el);
			post.ratio = ratio(ink, floor);
			post.ink = ink;
			post.chromatic = Math.max(ink[0], ink[1], ink[2]) - Math.min(ink[0], ink[1], ink[2]) > 12;

			// The underlined variant's colour is in the RULE, not in the text, so reporting
			// the text's 10.5:1 there would be answering a question nobody asked.
			post.ruled = style.textDecorationLine.includes("underline");
			post.rule_rgb = post.ruled ? parse(style.textDecorationColor) : null;
			post.rule_ratio = post.rule_rgb ? ratio(post.rule_rgb, floor) : 0;

			// ⚠ One line, in all three. When this said ", the same grey family as the ink
			//   beside it" the caption wrapped under B and C but not A, and since the cells
			//   are one grid row the two posts above the longer captions came out 50px
			//   SHORTER than the third — an A/B/C comparison where the boxes do not match.
			post.$num.text(post.ruled
				? hex(ink) + " text, " + hex(post.rule_rgb) + " rule — " + post.rule_ratio.toFixed(1) + ":1 · a colour"
				: hex(ink) + " on " + hex(floor) + " — " + post.ratio.toFixed(1) + ":1 · "
					+ (post.chromatic ? "a colour" : "a grey"));
		});
		this.$takeaway?.text(this.takeaway());
	}

	/** The page's one conclusion. The two ratios in it are read off the rendered marks;
	 *  which one reads as anchored is a judgement, and the sentence says why. */
	takeaway(){
		const find = k => this.posts.find(x => x.key === k);
		const A = find("accent"), B = find("muted");
		if (!A?.ratio || !B?.ratio) return "Reading the colours…";
		const pair = B.ratio.toFixed(1) + ":1 against " + A.ratio.toFixed(1) + ":1";
		return `A is the one that reads as anchored: its three marks are the only colour on the post, so the eye `
			+ `finds all three of them before it reads a word. B's grey mark `
			+ (B.ratio > A.ratio ? `has the HIGHER contrast of the two — ${pair} — and still vanishes`
				: `measures ${pair} and still vanishes`)
			+ `, because it is the same grey family as the ink beside it: contrast is not what anchors a page, `
			+ `difference is. C anchors more quietly — the underline marks the heading instead of putting a second `
			+ `object next to it — and pays for it by borrowing the mark this site already uses for a link.`;
	}

	watch($root){
		live($root.el, () => this.measure());
		requestAnimationFrame(() => this.measure());
	}
}
