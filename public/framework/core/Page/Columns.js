import { div, span, a, icon, is } from "../View/View.js";

// The Finder shape: how a page draws itself as a column, and how its host row sizes, scrolls and resizes them. (doc/columns.md)
// `page.columns()`, `column(host)`, `render_column(host)` and the rest are facades on Page: a page overrides `column(host)`,
// so every call back into the page goes through `this.page.*` and the override still wins.
export default class PageColumns {

	page = null;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// The page as a column, then the region its children mount in. ⚠ No `page-title` or `flow` here; `classes` is additive. (doc/watch-out.md)
	render(host){
		const page = this.page;

		const stack = () => {
			page.column_grab(page.column(host));
			// ⚠ The host builds a `default` child (nothing routes to it) and hands down `app`. (doc/decisions.md)
			page.$pages = div.c("page-column-pages", () => page.default_column()?.assign({ app: page.app }).render());
		};

		// The mode is the HOST's, so the class is the host's too: Page.css reads `.page.columns.page-columns-even`.
		page.view = div.c("page")
			.ac(page === host ? "columns" : "column")
			.ac(page === host && page.column_even && "page-columns-even");

		page.view.append(page === host ? () => {
			page.$crumbs = div.c("page-columns-bar");
			page.$row = div.c("page-columns-row", stack);
		} : stack);

		// ⚠ No `page-w-*` here: `column()` stamps the width, and a columns host has no page grid. (doc/watch-out.md)
		page.constructor.views.set(page.view.el, page);
		return page.view.ac(page.name && "page--" + page.name).ac(...page.word_classes()).ac(page.classes);
	}

	// The child that opens when nothing deeper is routed (the `default` word). ⚠ Not `opens()`. (doc/decisions.md)
	default(){ return [...this.page.children.values()].find(child => child?.classes?.split(/\s+/).includes("default")); }

	// ONE COLUMN: a sticky head, my own content, my children as rows. `width` is the page's own word.
	body(host){
		const page = this.page;

		return div.c("page-column-body", () => {
			div.c("page-column-head", () => {
				span.c("page-column-title", page.title);
				// A page may put its own controls at the right end of its name line (a session's menu button: core/Session/SessionMenu.js).
				if (is.fn(page.head_tools)) span.c("page-column-tools", () => page.head_tools());
				if (page !== host) a.c("page-column-close", () => icon("close")).href(page.parent.url);
			});

			// ⚠ `render_content()`, not a hand-written two-branch copy: one reader decides what is in the box. (doc/decisions.md)
			const tabbed = page.navigation === "tabs" && is.fn(page.tabs);
			if (tabbed) page.tabs(undefined, { home: () => div.c("page-column-prose flow", () => page.render_content()) });
			else if (page.has_content?.())
				div.c("page-column-prose flow", () => page.render_content());

			// ⚠ `index: true` — my content already shows my children, so no rail. A field, not a method. (doc/watch-out.md)
			if (!page.index && !tabbed) page.children.forEach((child, name) => {
				const nav = page.nav_for(name);

				a.c("page-column-item").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-column-label", nav.label);
					if (child?.children.size) icon("chevron_right");
				});
			});

			// A column is already a rail, so `related:` is a short list at its end. (doc/columns.md)
			if (page.related) div.c("page-column-prose", () => page.related_aside());
		}).ac(page.width && "page-column-" + page.width);
	}

	// The seam: drag it and this column keeps the width you left it at. ⚠ `lostpointercapture` ends the drag; `preventDefault` on the DOWN. (doc/watch-out.md)
	grab($body){
		const $grab = div.c("page-column-grab");
		let from, width;

		$grab.on("pointerdown", e => {
			from = e.clientX;
			width = $body.el.getBoundingClientRect().width;
			$grab.el.setPointerCapture(e.pointerId);
			$grab.ac("page-column-grabbing");
			e.preventDefault();
		});

		$grab.on("pointermove", e => is.num(from) && this.resize($body, width + e.clientX - from));
		$grab.on("lostpointercapture", () => { from = undefined; $grab.rc("page-column-grabbing"); });
		$grab.on("dblclick", () => this.resize($body));

		return $grab;
	}

	// The width a drag leaves behind, as the same three tokens the width words set. ⚠ No `px` = back to the page's word. (doc/watch-out.md)
	resize($body, px){
		const row = this.page.column_host()?.$row?.el;
		const width = px && Math.round(Math.max(this.page.column_floor, Math.min(px, row?.clientWidth ?? px)));

		return $body.style({
			"--page-column-flex": width ? `0 0 ${width}px` : "",
			"--page-column-min":  width ? "0" : "",
			"--page-column-max":  width ? "none" : "",
		});
	}

	// `even`: N columns of equal width, N computed from the ROW's room.
	// ⚠ STATIC, so the lab sizes with the host's own arithmetic. The stamp comes off BEFORE the read. `max-width: none` = the phone regime. (doc/watch-out.md)
	static even(row, fit = "floor"){
		if (!row) return null;

		row.style.removeProperty("--page-column-even-w");

		const body = row.querySelector(".page-column-body");
		const recommended = parseFloat(body && getComputedStyle(body).maxWidth);
		const available = row.clientWidth;
		if (!(recommended > 0) || !available) return null;

		// `floor` never falls under the recommendation, `round` fills tighter; never below 1 column.
		const slots = available / recommended;
		const n = Math.max(1, fit === "round" ? Math.round(slots) : Math.floor(slots));
		const width = available / n;

		row.style.setProperty("--page-column-even-w", width + "px");
		return { n, width, available, recommended, fit };
	}

	// My row's N and column width, or null when I am not in the mode.
	even(){ return this.page.column_even ? this.constructor.even(this.page.$row?.el, this.page.column_fit) : null; }

	// The room changed, or a column opened: size first, scroll second. `slide` is true only for a navigation. (doc/decisions.md)
	settle(slide){ this.even(); this.scroll(slide); }

	// Slide or jump? ⚠ Reduced motion is read HERE. Only `even` slides. (doc/watch-out.md)
	slide(){ return !!this.page.column_even && !matchMedia("(prefers-reduced-motion: reduce)").matches; }

	// Called on the HOST after every activation in its tree: the trail says where you are, then the newest column scrolls in.
	reveal(page){
		const host = this.page;
		host.$crumbs?.empty(() => page.crumbs(host));

		const row = host.$row?.el;
		if (!row) return;

		// ⚠ The row has no box on a cold load: the observer fires when it gets one, and on every resize. (doc/watch-out.md)
		if (!host.watching) (host.watching = new ResizeObserver(() => this.settle())).observe(row);

		// ⚠ One frame later: Router.mark() marks after activate(). This is the one settle that SLIDES. (doc/watch-out.md)
		requestAnimationFrame(() => this.settle(true));
	}

	// The deepest column on screen, by the smallest move. ⚠ `scrollBy` on the row, never `scrollIntoView`. (doc/watch-out.md)
	scroll(slide){
		const row = this.page.$row?.el;
		const body = [...row?.querySelectorAll(".page-column-body") ?? []].filter(el => el.offsetWidth).at(-1);
		if (!body) return;

		const to = body.getBoundingClientRect(), from = row.getBoundingClientRect();
		const dx = to.right > from.right ? to.right - from.right
			: to.left < from.left ? to.left - from.left : 0;

		if (dx) row.scrollBy({ left: dx, behavior: slide && this.slide() ? "smooth" : "auto" });
	}
}
