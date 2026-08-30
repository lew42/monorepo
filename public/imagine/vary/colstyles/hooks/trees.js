import { Page, p, div, span } from "/app.js";

// Seven small trees, one per control point — each built fresh so the demo
// box on the hooks page owns its own state. None imports another; the only
// thing shared is the shape (`initialize(){ this.columns(); }`).

// 1 — width: words. One rail, six children, one word each — click through
// and watch the pane resize; nothing else on the page changes.
export function widths(){
	const words = { Small: "small", Hug: "hug", Default: undefined, Large: "large", Fill: "fill", Full: "full" };

	return new Page({
		title: "Row", width: "small",
		initialize(){ this.columns(); },
		content(){ p("Click a word."); },
		children: Object.fromEntries(Object.entries(words).map(([title, width]) => [title, {
			width,
			content(){ p(width ? `width: "${width}"` : "width: (none) — the default"); },
		}])),
	});
}

// 2 — the tokens. Two leaf hosts, same word, one retuned: `--page-column-max`
// wider and `--page-column-pad-x/y` fatter, both plain numbers on the same
// tokens the width words already set (colstyles.css).
export function tokens_plain(){
	return new Page({
		title: "Plain",
		initialize(){ this.columns(); },
		content(){ p("The 40em default ceiling, 0.9em / 0.7em inset."); },
	});
}
export function tokens_retuned(){
	return new Page({
		title: "Retuned", classes: "vary-colstyles-retuned",
		initialize(){ this.columns(); },
		content(){ p("--page-column-max: 22em; pad-x: 2em; pad-y: 1.4em — a class, no new word."); },
	});
}

// 3 — column() overridden outright: no head, no rows, a chip wall instead.
export function custom_column(){
	return new Page({
		title: "Tags", width: "small",
		initialize(){ this.columns(); },
		column(){
			return div.c("page-column-body page-column-small vary-colstyles-chips", () => {
				["css", "layout", "columns", "tokens", "bleed"].forEach(tag => span.c("vary-colstyles-chip", tag));
			});
		},
	});
}

// 4 — index: true. content() already drew the children as cards, so core
// leaves the rail of rows out.
export function index_true(){
	return new Page({
		title: "Shelf", width: "small", index: true,
		initialize(){ this.columns(); },
		content(){ this.previews(); },
		children: {
			A: { description: "First.", content(){ p("A."); } },
			B: { description: "Second.", content(){ p("B."); } },
			C: { description: "Third.", content(){ p("C."); } },
		},
	});
}

// 5 — bleed. A block escapes the column's own inset, mid-flow, so the
// inset it escapes is the thing right above and below it.
export function bleed(){
	return new Page({
		title: "Note",
		initialize(){ this.columns(); },
		content(){
			p("Inset text — 0.9em / 0.7em by default.");
			div.c("bleed vary-colstyles-figure", "edge to edge — .bleed spends the column's own pad tokens back");
			p("Back on the inset to close.");
		},
	});
}

// 6 — default_column. Never routed anywhere; the host builds its own
// `default` child and shows it beside itself.
export function default_column(){
	const root = new Page({
		title: "Panel", width: "small",
		initialize(){ this.columns(); },
		content(){ p("Arrived cold — nothing was routed."); },
		children: {
			Overview: { classes: "default", content(){ p("The `default` child. Open on arrival, stood down the moment a real one routes beside it."); } },
			Metrics: { content(){ p("Metrics."); } },
		},
	});
	return root;
}

// 7 — the drag seam. Two columns is enough; the hairline between them is
// the whole demo.
export function seam(){
	const root = new Page({
		title: "A", width: "small",
		initialize(){ this.columns(); },
		content(){ p("Drag the hairline to the right of this column."); },
		children: { B: { content(){ p("Double-click the seam to put it back."); } } },
	});
	return root.children.get("b");
}
