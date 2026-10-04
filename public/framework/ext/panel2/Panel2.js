import View, { div, span, button, icon, is } from "../../core/View/View.js";
import grip from "../grip/grip.js";

View.stylesheet(import.meta, "panel2.css");

/**
 * Panel2 — the owner's standard UI area: a header toolbar, a main content
 * region, and an optional footer — with an optional sidebar on either side of
 * main that becomes a sliding drawer on a narrow screen instead of squeezing
 * beside it. Two Panel2s can sit side by side (or stacked) with a resize grip
 * between them (`Panel2.split`), and several Panel2s can arrange themselves on
 * a dashboard with one grid class (`.panel2-grid`, panel2.css).
 *
 * A fresh, small module — nothing here is copied from the older `ext/Panel`
 * (that one is chrome for *wireframing* a page; this one is chrome you ship).
 * The only thing borrowed is the resize gesture, `ext/grip`.
 *
 *   import Panel2 from "/framework/ext/panel2/Panel2.js";
 *
 *   const p = new Panel2({ title: "Files" });
 *   p.header.append(button("Refresh"));   // the header IS a toolbar — mount straight into it
 *   p.main.append(...);                   // the content goes here
 *
 *   new Panel2({ title: "Inbox", start: true });             // a sidebar before main
 *   new Panel2({ title: "Inbox", end: { width: "20rem" } });  // …after main, its own width
 *   new Panel2({ title: "Log", footer: true });               // a footer strip too
 *
 *   Panel2.split(panelA, panelB);                // side by side, a grip between them
 *   Panel2.split(panelA, panelB, { axis: "y" });  // stacked, the grip drags the HEIGHT instead
 *
 * `start`/`end` take `true` (the 16rem default width) or `{ width: "20rem" }`.
 * Below 34em (the same floor `ext/grip` already uses for "a rail stops being a
 * rail") a side stops sitting beside main and slides over it instead — opened
 * by its own toggle button, which `Panel2` adds to the header for you.
 *
 * Two things this deliberately does NOT do yet — read the readme's "Open
 * questions" for why: a fixed-width/fluid-width switch, and more than one grip
 * (nest `Panel2.split()` calls for a third pane).
 */
export default class Panel2 extends View {

	render(){
		this.ac("surface");

		// Read these now: building the sides below OVERWRITES `this.start`/
		// `this.end`/`this.footer` with the real View once each exists, same as
		// `this.title` would be if a caller had passed a View instead of text.
		const start_opts = this.start, end_opts = this.end, want_footer = this.footer;

		this.header = new this.constructor.Header({ tag: "header", title: this.title });

		this.body = div.c("panel2-body", () => {
			if (start_opts)
				this.start = this.side("start", start_opts);

			this.main = new this.constructor.Main({ tag: "main" });

			if (end_opts)
				this.end = this.side("end", end_opts);
		});

		if (want_footer)
			this.footer = new this.constructor.Footer({ tag: "footer" });
	}

	// One side of main, plus the header button that reveals it once it becomes a
	// drawer (below 34em). `opts` is whatever the caller passed for this edge —
	// `true`, or `{ width }`.
	side(edge, opts){
		const $side = new this.constructor.Side(Object.assign({ tag: "aside", edge }, is.obj(opts) ? opts : {}));

		this.header.append(
			button.c("panel2-side-toggle")
				.attr("aria-label", "Open the " + edge + " panel")
				.attr("title", "Open the " + edge + " panel")
				.append(() => icon(edge === "start" ? "menu" : "menu_open"))
				.click(() => $side.toggle())
		);

		return $side;
	}
}

// The header — a slim toolbar: a title on the left, everything else lands in
// the controls row on the right. `panel.header.append(view)` mounts a real
// control there; it is a container, never a config array (the owner's own
// words, requirements.md step 3).
Panel2.Header = class Panel2Header extends View {
	render(){
		this.$title = span.c("panel2-title", this.title ?? "");
		this.controls = div.c("panel2-controls");
	}

	// ⚠ The very FIRST call reaches here before render() has run — View's own
	// initialize() is `this.append(this.render)`, and `this.controls` does not
	// exist yet at that point. The check below falls through to the real
	// append() for exactly that one call, then routes every later one.
	append(...args){
		if (this.controls){
			this.controls.append(...args);
			return this;
		}
		return super.append(...args);
	}

	// Change the title text after mount; the constructor's own `title` option
	// only sets it once.
	title_text(text){
		this.$title.text(text);
		return this;
	}
};

// The main content region. A plain container — nothing of its own yet.
Panel2.Main = class Panel2Main extends View {};

// The footer — a slim strip, same shape as the header, with no title and no
// controls row (append straight into it; it's a plain container).
Panel2.Footer = class Panel2Footer extends View {};

// One side of main: a sidebar on a wide screen, a drawer that slides over main
// on a narrow one. `edge` is "start" or "end"; `width` overrides the 16rem
// default (panel2.css's own `--panel2-side-w`).
Panel2.Side = class Panel2Side extends View {
	render(){
		this.ac(this.edge === "start" ? "panel2-side-start" : "panel2-side-end");
		if (this.width) this.style("--panel2-side-w", this.width);
	}

	open(on = true){ return this.tc("panel2-side-open", on); }
	close(){ return this.open(false); }
	toggle(){ return this.open(!this.hc("panel2-side-open")); }
};

// Two Panel2s, side by side (or stacked), with a grip between them that resizes
// the FIRST one — the second always takes whatever is left, same deal as a
// sidebar beside a page. `axis: "x"` (the default) drags a WIDTH; `axis: "y"`
// drags a HEIGHT instead (ext/grip's own word, unchanged). This is the simple
// two-way split requirements.md step 4 asks for — a THIRD pane is
// `Panel2.split(Panel2.split(a, b), c)`, not a feature of this one call.
Panel2.split = function split(a, b, { axis = "x" } = {}){
	const $wrap = div.c("panel2-split" + (axis === "y" ? " panel2-split-y" : ""));

	$wrap.append(a);

	// Mounted INSIDE `a`, same as every other ext/grip caller (Sidebar, drawer):
	// it reads `a`'s own box to know the pinned edge, and the width it writes
	// is `a`'s own width. `from: "start"` because `a` is the panel docked at
	// the split's start (or top, on the y axis) — the mirrored `.grip-start`
	// shape, same as Sidebar's left rail.
	a.append(grip({
		axis,
		from: "start",
		write: px => {
			const applied = Math.max(60, px);   // never collapse past a scrap
			a.style("--panel2-split-a", applied + "px");
			return applied;
		},
	}));

	$wrap.append(b);

	return $wrap;
};

export { Panel2 };
