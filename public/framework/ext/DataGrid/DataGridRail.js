import View, { div, a, button } from "../../core/View/View.js";
import DataGridDrawer from "./DataGridDrawer.js";

// `.flush-stack` (rows touching, no padding or gap) lives in the Inbox stylesheet; reuse it, don't copy it.
View.stylesheet(import.meta, "../../ux/Inbox/Inbox.css");

/* DataGridRail — draws the rows as a stack of cards, one `.card` per row, flush to its box.
 * The card's inside is the grid's `card(row)` hook; the card is a link when `href(row)` is given. */
export default class DataGridRail extends DataGridDrawer {

	build(){
		this.$rail = div.c("datagrid-rail flush-stack");
		this.$more = div.c("datagrid-more", () => {
			button.c("datagrid-more-btn", "Show more").on("click", () => this.more());
		});
		this.start_paging(this.$rail, this.$more, this.$rail.el, r => this.draw_card(r));
		// The sentinel sits INSIDE the scrolling stack, after the cards.
		this.$rail.el.appendChild(this.$more.el);
	}

	draw(rows, reset){
		if (reset) this.$rail.el.scrollTop = 0;
		this.rows = rows;
		const size = this.grid.page_size;
		this.shown = Math.min(rows.length, reset ? size : Math.max(this.shown, size));
		this.$rail.empty(() => rows.slice(0, this.shown).forEach(r => this.draw_card(r)));
		this.$rail.el.appendChild(this.$more.el);
		this.sync_more();
	}

	more(){
		super.more();
		this.$rail.el.appendChild(this.$more.el);
	}

	draw_card(row){
		const g = this.grid;
		const href = g.link(row);
		(href ? a : div).c("card datagrid-card", $c => {
			if (href) $c.attr("href", href);
			g.card(row);
		});
	}
}
