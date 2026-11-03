import View, { button, span } from "../../core/View/View.js";

/**
 * class Pagination extends View — `ui/pagination`'s row, opened up: the current page is
 * remembered on the instance instead of the caller, and `go(n)` fires the one-wire.
 *
 *   const p = new Pagination({ pages: ["1","2","3","…","12"], current: 2, onChange(n){ … } });
 *   p.go(3)             pick a page, fire onChange
 *   p.draw(pages, cur)  re-render from fresh data — the caller still owns it
 *
 * `pages` is display labels, `"…"` renders as an ellipsis and is never clickable — the
 * same array `ui/pagination/page.js`'s `pager()` builds by hand.
 */
export default class Pagination extends View {

	render(){
		this.style("--gap", "0.3em");
		this.draw();
	}

	/* Full rebuild — the Tree precedent (`draw()` resets everything the new data
	 * says): the caller owns the page list, so there is nothing here to diff. */
	draw(pages, current){
		this.pages = pages ?? this.pages;
		this.current = current ?? this.current;
		this.buttons = new Map();
		return this.empty(() => { this.prev(); this.list(); this.next(); });
	}

	list(){ this.pages.forEach(label => this.page(label)); }

	page(label){
		if (label === "…") return span.c("muted", label);

		const $b = button.c(+label === this.current && "prim", label).click(() => this.go(+label));
		this.buttons.set(label, $b);
		return $b;
	}

	prev(){ return button("‹ Prev").click(() => this.go(this.current - 1)); }
	next(){ return button("Next ›").click(() => this.go(this.current + 1)); }

	/* The state: which page is current. Toggles the class on two buttons rather
	 * than rebuilding the row — the Filter precedent (`set()`). ⚠ Never below 1;
	 * there is no upper clamp because the caller's `pages` may elide the total
	 * behind "…", the same reason the template's own `go()` never checked either. */
	go(page){
		page = Math.max(1, page);
		this.buttons.get(String(this.current))?.rc("prim");
		this.current = page;
		this.buttons.get(String(this.current))?.ac("prim");
		return this.changed();
	}

	// The seam — `Tree.selected_change` / `Filter.changed` copied one rung over:
	// a subclass overrides this ONE method; `onChange` still works as a callback.
	changed(){
		this.onChange?.(this.current);
		return this.current;
	}
}

/* ⚠ Prototype, not class fields — see ux/Menu/Menu.js for why. */
Pagination.prototype.tag = "div";
Pagination.prototype.classes = "flex wrap v-center gap";
Pagination.prototype.pages = ["1"];
Pagination.prototype.current = 1;

export { Pagination };
