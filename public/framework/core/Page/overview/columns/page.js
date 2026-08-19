import { Page, View, demo, md, div, a, span, icon } from "/app.js";

View.stylesheet(import.meta, "columns.css");

const finder = () => {
	const site = new Page({
		title: "Finder",
		content(){ md("Every page in this tree draws itself as one **column**."); },

		children: {
			Docs: {
				icon: "description",
				content(){ md("Its children are the rows; the open one is lit."); },
				children: {
					Intro(){ md("A page with no children is just its prose — the row stops here."); },
					Guide: {
						content(){ md("Click a row and the next column opens to its right."); },
						children: {
							Setup(){ md("Nothing in the tree knows about columns — one walk patches every page."); },
							Usage(){ md("Click a row in a column further left and everything right of it closes."); },
							Deep: { children: { Deeper: { children: {
								Deepest(){ md("Six columns. The row scrolls sideways when it runs out of room, and the newest one scrolls itself into view."); },
							} } } },
						},
					},
					API(){ md("Ordinary pages, ordinary `children:` — the arrangement is CSS."); },
				},
			},
			Blog: {
				icon: "rss_feed",
				children: {
					Latest(){ md("Coming back up a branch closed the columns that were open to the right."); },
					Archive(){ md("Drag the stage narrow: under two columns' width the row pages one at a time."); },
				},
			},
			About(){ md("The DOM is a tree; `display: contents` makes the layout a row."); },
		},
	});

	// The deepest column on screen, brought into view by the smallest move — so the
	// columns to its left stay exactly where they are.
	// ⚠ `scrollBy` on the row, never `scrollIntoView`: that walks up and scrolls the
	// page around the demo box too.
	const reveal = row => {
		const body = [...row.querySelectorAll(".page-column-body")].filter(el => el.offsetWidth).at(-1);
		if (!body) return;

		const to = body.getBoundingClientRect(), from = row.getBoundingClientRect();
		const dx = to.right > from.right ? to.right - from.right
			: to.left < from.left ? to.left - from.left : 0;

		if (dx) row.scrollBy({ left: dx });
	};

	// Every page draws its own column — heading, prose, children as rows — and puts the
	// region its children mount in INSIDE that column, so the DOM stays a tree and the
	// visibility contract holds. columns.css flattens only the LAYOUT (`display: contents`),
	// which leaves every column body a peer in one flex row.
	const column = page => {
		const prose = page.content;

		page.assign({
			classes: page.parent ? "column" : "columns",         // the root IS the row

			content(){
				div.c("page-column-body", () => {
					div.c("page-column-head", () => {
						span.c("page-column-title", this.title);
						if (this.parent) a.c("page-column-close", () => icon("close")).href(this.parent.url);
					});

					if (prose) div.c("page-column-prose", () => prose.call(this));

					this.children.forEach((child, name) => {
						const nav = this.nav_for(name);

						a.c("page-column-item").href(nav.url).append(() => {
							if (nav.icon) icon(nav.icon);
							span.c("page-column-label", nav.label);
							if (child?.children.size) icon("chevron_right");
						});
					});
				});

				this.$pages = div.c("page-column-pages");
			},

			activated(){
				const root = this.chain()[0], row = root.view.el;

				// ⚠ The row has no box yet, and no frame you can count will give it one: a
				// page is BUILT detached and lands in the document later. The observer
				// fires the moment it gets a size — and again whenever the stage is
				// dragged, which is exactly when the deepest column needs revealing again.
				if (!root.watching) (root.watching = new ResizeObserver(() => reveal(row))).observe(row);

				// ⚠ One frame, for every navigation after that: the box marks what it
				// shows AFTER activate(), so right now this column is still `display: none`.
				requestAnimationFrame(() => reveal(row));
			},
		});

		page.children.forEach(column);
	};

	column(site);

	return site.children.get("docs").children.get("guide");   // arrive three columns in
};

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	tree: finder,
	height: "22em",
	note: "Miller columns — the Finder arrangement. Nested pages laying out as peers: the tree is real, `display: contents` is what flattens it.",
}));
