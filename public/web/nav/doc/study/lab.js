import { Page, View, div, p, span, a, button, icon } from "/app.js";

/* ── THE LAB — the same three-level tree three times, one rule different ──────
   All three rows are built from core's OWN column classes, so the cascade they get
   is the cascade a real columns page gets. What separates them is one class each:

     (none)             today — every column `flex: 1 1 0`, so they share the row
     `.dn-stable`       the proposal: a column keeps its own width (navigation.css)
     `.page-columns-even`  THE SHIPPED MODE — core's own class, and the arithmetic
                        below is core's own `Page.even_columns()`, not a copy of it

   ⚠ The numbers are measured against the LAB'S OWN BOX, never the viewport: a row
     that grows moves the page under it, and the browser's scroll anchoring can
     absorb part of that, so a viewport reading would depend on where you happen to
     be scrolled. An offset inside the box cannot.
   ⚠ The class name IS the CSS name — `classify()` turns `DnDemo` into `.dn-demo`,
     so the module's prefix has to be in the class name or the view wears an
     unprefixed class nobody reserved (new-css-class, step 3). */

/* Three levels of a small documentation browser. The first column is a rail
   (`small`); the other two are ordinary reading columns, which is where the defect
   lives — `small` is already `flex: 0 0`, which is why a rail never moved. */
const TREE = [
	{ key: "guides", title: "Guides", width: "small",
		items: ["Install", "Layout", "Routing", "Themes", "Deploy"] },
	/* ⚠ The prose is long on purpose, and the nav links sit UNDER it — that is the
	   shape the real defect has. A narrower column rewraps its paragraphs into more
	   lines, and every extra line pushes the links below them further down. Two short
	   sentences here and the drop measured 26px instead of the 170px the real site
	   produces; the demo would have understated its own subject. */
	{ key: "install", title: "Install", items: ["Windows", "macOS", "Linux", "Docker", "From source"],
		prose: ["Pick your machine. Every route below installs the same three files and ends on the same first page, so the only thing that really differs is how the files get onto the disk and what you have to have installed already.",
			"There is no build step to run afterwards and nothing is compiled. The files you download are the files the browser loads, which means you can open any one of them in an editor, change a line, and see the change by reloading the page.",
			"If you have done this before and just want the short version: download the zip, unpack it, and open the folder in a browser."] },
	{ key: "windows", title: "Windows",
		prose: ["Download the zip, unpack it anywhere, and open the folder. Nothing is written outside it."] },
];

const NAMES = {
	today:  { icon: "warning",      label: "Today" },
	stable: { icon: "check_circle", label: "The stable row" },
	even:   { icon: "view_column",  label: "Even columns" },
};

class DnDemo extends View {

	initialize(){
		this.mode ??= "today";  // "today" | "stable" | "even"
		this.opened ??= 2;      // how many columns are open
		this.change ??= null;   // the last press's two numbers
		this.even ??= null;     // { n, width, … } from core, for the `even` row only
		super.initialize();
	}

	render(){
		this.ac("dn-" + this.mode).ac(this.mode === "stable" && "dn-steady");

		div.c("dn-demo-name", () => {
			icon(NAMES[this.mode].icon);
			span(NAMES[this.mode].label);
		});

		/* ⚠ `default` is not decoration. `@layer util`'s arrangement contract hides
		   every `.page` that is not `.active-page`, `.active-ancestor` or `.default`
		   (Page.css, top of file) — without the third word this whole demo host was
		   `display: none`, its row measured 0x0, and the readouts dutifully reported
		   0px for both halves. `default` is the contract's own word for "shown
		   without being routed to", which is exactly what a demo is.
		   ⚠ `page-columns-even` is CORE's class, not one of ours: the third row is
		     the shipped mode, cascade and all, and the only thing this file adds to
		     it is the recommendation (navigation.css) — because a 66rem demo box
		     would otherwise fit exactly one 40em column and show nothing. */
		div.c("page columns default" + (this.mode === "even" ? " page-columns-even" : ""), () => {
			this.$bar = div.c("page-columns-bar", () => { this.crumbs(); });
			this.$row = div.c("page-columns-row", () => { this.cols(); });
		});

		this.$read = div.c("dn-read", () => { this.read(); });

		this.watch();
	}

	/* ⚠ A ResizeObserver, never a frame you count. This view is built DETACHED, so
	   `clientWidth` is 0 at render and at every rAF until it lands — the same trap
	   `reveal_column()` spells out in core. The observer fires the moment the row
	   gets a size, and again on every resize, which is exactly when N changes. */
	watch(){
		if (this.mode !== "even") return this;

		new ResizeObserver(() => {
			this.size();
			this.$read?.empty(() => { this.read(); });
		}).observe(this.$row.el);

		return this;
	}

	/* THE REAL MODE. `Page.even_columns()` is core's own static — the same function a
	   real host calls on its own ResizeObserver — so this row's N and a live page's N
	   are one piece of arithmetic, not two that have to be kept in step. It returns
	   null under 32em of row, where core pages one column at a time. */
	size(){
		this.even = this.mode === "even" ? Page.even_columns(this.$row?.el) : null;
		return this;
	}

	// ── the row, built the way core builds one (Page.class.js `column()`) ────
	cols(){
		TREE.slice(0, this.opened).forEach(col => {
			div.c("page-column-body").ac(col.width && "page-column-" + col.width)
				.attr("data-dn", col.key)
				.append(() => {
					div.c("page-column-head", () => { span.c("page-column-title", col.title); });
					if (col.prose) div.c("page-column-prose flow", () => { col.prose.forEach(line => p(line)); });
					(col.items ?? []).forEach(label => { this.item(label); });
				});
		});
	}

	/* A demo link goes nowhere: the row is driven by the button, not by the router.
	   ⚠ No `href` at all, not `href="#"` — the router marks every link whose url is
	     on the path, and `#` resolves to the page's own url, so all five would have
	     lit up as the open one. */
	item(label){
		return a.c("page-column-item")
			.append(() => {
				span.c("page-column-label", label);
				icon("chevron_right");
			});
	}

	crumbs(){
		div.c("page-crumbs", () => TREE.slice(0, this.opened).forEach((col, i) => {
			if (i) span.c("muted", " / ");
			span(col.title);
		}));
	}

	// ── the measurement ──────────────────────────────────────────────────────
	/* `getBoundingClientRect()` flushes layout synchronously, so reading straight
	   after the rebuild gives the real numbers rather than an estimate. */
	spot(){
		const mine = this.el.getBoundingClientRect();
		const seen = {};
		this.el.querySelectorAll(".page-column-body").forEach(el => {
			const box = el.getBoundingClientRect();
			seen[el.dataset.dn] = {
				w: Math.round(box.width),
				links: [...el.querySelectorAll(".page-column-item")].slice(0, 5)
					.map(link => Math.round(link.getBoundingClientRect().top - mine.top)),
			};
		});
		return seen;
	}

	/* The two numbers, over every column that was open BEFORE and is still open
	   after — a column that just arrived has nothing to have moved from. */
	swap(){
		const before = this.spot();
		this.opened = this.opened === 3 ? 2 : 3;
		this.$row.empty(() => { this.cols(); });
		this.$bar.empty(() => { this.crumbs(); });
		// The room did not change, so N does not either — but the row was rebuilt, so
		// it is re-stamped here rather than waiting for a resize that will never come.
		this.size();
		const after = this.spot();

		let moved = 0, sized = 0;
		for (const key in before){
			if (!after[key]) continue;
			sized = Math.max(sized, Math.abs(after[key].w - before[key].w));
			before[key].links.forEach((y, i) => {
				if (after[key].links[i] != null) moved = Math.max(moved, Math.abs(after[key].links[i] - y));
			});
		}

		// `paged` is read BEFORE the readout is written: the sentence says what actually
		// happened in this row, and what happens depends on which regime the row is in.
		this.change = { moved, sized, paged: this.paged() };
		this.$read.empty(() => { this.read(); });
		this.reveal();
		return this;
	}

	/* Is this row narrow enough that the site pages it one column at a time? Core's own
	   threshold, said in core's own unit: `@container page-columns (width < 32em)` in
	   Page.css, where the container IS this row. The demo pins itself to 1rem, so the
	   two can never drift apart. */
	paged(){
		const row = this.$row.el;
		return row.clientWidth < 32 * parseFloat(getComputedStyle(row).fontSize);
	}

	/* ⚠ DO NOT SCROLL TO THE END. The row already holds the rail, the column that was
	   open and a peek of the new one, and that picture IS the proof: what was open did
	   not move, and something new has arrived at the right-hand edge. Scrolling to the
	   end instead drove 450px of the open column's 640 under the pinned rail at 1280 —
	   539 of 640 at 1000 — so its head went blank and its words were cut mid-letter, and
	   the row that exists to prove nothing moved looked like the broken one of the two
	   (measured 2026-09-17). The reader can still scroll across; the rail's shadow says
	   the column continues under it.
	   ⚠ The phone regime is the exception, and it has to be: under 32em core pages one
	     column at a time and every column is the whole row, so the end is the only place
	     the new column can be seen. There is no pinned rail down there either — the same
	     container query gates both — so nothing can be hidden behind one.
	   ⚠ The `even` row never scrolls on this press and must not be made to: its third
	     column lands in a slot that was already on screen. That IS the demonstration. */
	reveal(){
		const row = this.$row.el;
		row.scrollTo({ left: this.opened === 3 && this.paged() ? row.scrollWidth : 0, behavior: "smooth" });
		return this;
	}

	/* ── the readout ──────────────────────────────────────────────────────────
	   ⚠ Before the first press there are no numbers, so there are NO number boxes: the
	     row used to read "-- nav moved -- widths changed", and a pair of bare double
	     dashes is not a placeholder a newcomer can read (2026-09-17). The sentence
	     beside them already says a press is what fills them in. */
	read(){
		if (this.change){
			this.num(this.change.moved, "nav moved");
			this.num(this.change.sized, "widths changed");
		}
		// The third readout, and it is the mode's whole claim: how many columns the
		// room fits, and how wide each one therefore is. It is there before the first
		// press, because it is true before the first press.
		if (this.even) this.count(this.even.n, Math.round(this.even.width) + "px each");
		p.c("dn-say", this.says());
	}

	num(px, what){
		return div.c("dn-num").ac(px === 0 ? "dn-zero" : "dn-moved").append(() => {
			span.c("dn-px", px + "px");
			span.c("dn-what", what);
		});
	}

	// Neither good nor bad, so neither green nor amber: N is a fact about the room.
	count(n, what){
		return div.c("dn-num dn-count").append(() => {
			span.c("dn-px", "N = " + n);
			span.c("dn-what", what);
		});
	}

	/* ⚠ EVERY branch is derived from the numbers that were just measured, never from
	   which row this is. The old version said "Both open columns paid for the new one,
	   they got narrower" whenever this was the `today` row — and at 400 that sentence
	   sat directly beside its own measured 0px and 0px, because under 32em of row core
	   already pages one column at a time (measured 2026-09-17). A demo whose prose can
	   contradict its own readout is not a demo. */
	says(){
		if (!this.change) return this.even
			? `This row fits ${this.even.n} columns of ${Math.round(this.even.width)}px, so there is an empty slot waiting. Press the button and watch it get filled.`
			: "Press the button and the two numbers fill in.";

		const { moved, sized, paged } = this.change;
		if (!moved && !sized) return this.mode === "even"
			? (this.opened !== 3
				? "Closing it is just as quiet: the two columns that stay are the width they always were, and the slot goes back to being empty."
				: this.even
					? `Nothing resized, nothing rewrapped, and nothing scrolled. The room fits ${this.even.n} columns of ${Math.round(this.even.width)}px whatever is open in it, so the new column had a slot of its own waiting.`
					: "Nothing moved: this row is narrow enough that the site pages it one column at a time, and the even mode stands aside for that.")
			: this.mode === "stable"
			? (this.opened !== 3
				? "Closing it is just as quiet: the columns that stay keep the width they had."
				: paged
					? "Nothing resized and nothing rewrapped. This row is narrow enough that the site pages it one column at a time, so the new column simply takes the screen."
					: "Nothing resized and nothing rewrapped. The new column arrived in the space that was already there, and the rail and the column beside it did not move a pixel.")
			: "Nothing moved in this row either — it is narrow enough that the site already pages it one column at a time, the way a phone does. The defect needs two columns side by side before it can appear.";

		return this.opened === 3
			? `Both open columns paid for the new one: ${sized}px came off a column's width, its text rewrapped, and a nav link inside it dropped ${moved}px down the page.`
			: `The same jump in reverse when the column closes: ${sized}px back onto the width, and the link ${moved}px up again.`;
	}
}

/* The three, and the one button that presses all of them.
   ⚠ `DnStudy`, not `DnLab`: `classify()` would give the view `.dn-lab`, the class the
     inner GRID wears, and the page would have two nested grids. */
export class DnStudy extends View {

	render(){
		div.c("dn-bar", () => {
			this.$btn = button("Open a third column").on("click", () => { this.press(); });
			p.c("dn-hint", "The same click, in all three rows. Watch the middle column.");
		});

		div.c("dn-lab", () => {
			this.rows = ["today", "stable", "even"].map(mode => new DnDemo({ mode }));
		});
	}

	press(){
		this.rows.forEach(row => row.swap());
		this.$btn.text(this.rows[0].opened === 3 ? "Close the third column" : "Open a third column");
		return this;
	}
}

export default DnStudy;
