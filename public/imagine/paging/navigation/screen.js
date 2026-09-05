import { Page, div, a, span, h1, icon } from "/app.js";

/* ── A FULL SCREEN WITH A RAIL THAT NEVER MOVES ────────────────────────────────
   The owner's question, 2026-09-05:

     "how to get stable navigation that doesn't jump, going from a full-screen page
      down to sub pages. I'm not sure that's even possible, unless you have a left
      sidebar nav?"

   It is possible, and a left rail is indeed the way. Two classes do it:

     PagingNavScreen  the screen. It mounts BESIDE /imagine/'s row rather than in it
                      (`container()`), draws its own rail and a centre box, and
                      names that box as the region every child mounts into.
     PagingNavSub     a child. All it overrides is `render()` — a page inside a
                      columns tree renders itself as a COLUMN unless it says
                      otherwise, and a column is `display: contents`, which would
                      delete the box we just reserved.

   Why nothing moves: the rail and the centre are both sized by one flex row whose
   height is the viewport. A sub page changes what is INSIDE the centre; the centre
   itself is the same rectangle before and after, and it scrolls its own content.

   Measured, three navigations at 1280 and 3440: rail 0px, centre 0px, both numbers.
   /imagine/paging/navigation/doc/measurements/                                    */

export class PagingNavScreen extends Page {

	// ⚠ /imagine/ is a columns host and `column_host()` finds the SHALLOWEST columnar
	//   ancestor, so by default every page under it is a column of that one row. This
	//   is not a column; it is the whole app. Mounting beside the row's host is the
	//   arrangement contract's own sibling rule — the ancestor stands down.
	//   (Prior art, and where this shape came from: imagine/shells/Shell.js.)
	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a full screen is not a column"); }

	// ⚠ Overriding render() is ALSO what skips core's `render_column()`.
	//   `hides-nav` (/styles.css) takes the site's own strip away.
	render(){
		if (this.view) return this.view;

		this.regions = new Map();

		this.view = div.c("page paging-nav-screen hides-nav", () => {
			this.rail();
			this.$centre = div.c("paging-nav-centre");
		});

		// EVERY child mounts in the centre. `container()` on a child reads this map
		// before it asks anything about columns, so one line is the whole wiring.
		this.children.forEach((child, name) => this.regions.set(name, this.$centre));

		this.arrive();

		return this.view;
	}

	rail(){
		const links = div.c("paging-nav-rail", () => {
			div.c("paging-nav-rail-name", this.title);

			this.children.forEach((child, name) => {
				const nav = this.nav_for(name);

				a.c("paging-nav-rail-link").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span(nav.label);
				});
			});

			a.c("paging-nav-rail-link paging-nav-rail-out").href(this.parent.url).append(() => {
				icon("arrow_back");
				span("Back to Navigation");
			});
		});

		// ⚠ These links were built after the router's marking pass, so they missed it.
		this.app?.router?.mark_links();

		return links;
	}

	/* THE CENTRE IS NEVER EMPTY. Arriving at the screen's own url routes nothing
	   deeper, so the first child is built here and marked `default` — the
	   arrangement contract's word for "shown without being routed to". navigation.css
	   stands it down the moment a real one opens.
	   ⚠ `app` is handed down explicitly: a default child is never routed to, so
	     `child()` — the usual place a page is given the app — never runs for it. */
	arrive(){
		Promise.resolve(this.child([...this.children.keys()][0]))
			.then(page => { if (page) this.$centre.append(page.assign({ app: this.app }).render().ac("default")); })
			.catch(error => console.error(`${this.log_label()} could not build its first panel:`, error));
	}
}

/* A SUB PAGE. One override, for one reason: without it core renders this as a
   column of /imagine/'s row (`display: contents`) and the centre box holds nothing. */
export class PagingNavSub extends Page {

	render(){
		if (this.view) return this.view;

		this.view = div.c("page flow paging-nav-sub", () => {
			if (this.title) h1.c("page-title", this.title);
			typeof this.content === "function" ? this.content() : this.content;
		});

		return this.view;
	}
}
