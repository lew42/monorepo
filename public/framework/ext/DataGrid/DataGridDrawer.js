/* DataGridDrawer — what a drawer is: it draws the grid's current rows its own way
 * (DataGridTable, DataGridRail). The shared part is paging: a variable-height list
 * draws the first `page_size` rows, and the next page when a sentinel scrolls into view
 * (or when "show more" is pressed). Rows that live on a server: a page passes has_more() and load_more() and appends with set_rows(). Doc: ext/DataGrid/doc/architecture.md. */
export default class DataGridDrawer {

	constructor(grid){
		this.grid = grid;
		this.rows = [];
		this.shown = 0;
	}

	// build(): draw the drawer's empty frame (called with the stage capturing). draw(rows, reset): fill it.
	build(){}
	draw(){}

	destroy(){ this.io?.disconnect(); }

	// `$into` gets the rows, `$more` is the sentinel after it, `scroller` is the element that scrolls.
	start_paging($into, $more, scroller, draw_one){
		this.$into = $into;
		this.$more = $more;
		this.draw_one = draw_one;
		this.io = new IntersectionObserver(entries => {
			if (entries.some(e => e.isIntersecting)) this.more();
		}, { root: scroller });
		this.io.observe($more.el);
	}

	draw_paged(rows, reset){
		this.rows = rows;
		const size = this.grid.page_size;
		this.shown = Math.min(rows.length, reset ? size : Math.max(this.shown, size));
		this.$into.empty(() => rows.slice(0, this.shown).forEach(r => this.draw_one(r)));
		this.sync_more();
	}

	more(){
		if (this.shown >= this.rows.length) return this.more_remote();   // remote rows: the page appends the next page with set_rows()
		const from = this.shown;
		this.shown = Math.min(this.rows.length, from + this.grid.page_size);
		this.$into.append(() => this.rows.slice(from, this.shown).forEach(r => this.draw_one(r)));
		this.sync_more();
		// Still in view after the append? Observing again reports it again.
		this.io.unobserve(this.$more.el);
		this.io.observe(this.$more.el);
		this.grid.changed();
	}

	/** The rows drawn are all there is here: if the page holds more elsewhere (has_more), it loads them (load_more appends with set_rows) and the next chunk is drawn. */
	more_remote(){
		if (!this.grid.has_more?.() || this.loading) return;
		this.loading = true;
		Promise.resolve(this.grid.load_more?.()).finally(() => { this.loading = false; if (this.shown < this.rows.length) this.more(); });
	}

	sync_more(){
		this.$more.el.style.display = this.shown < this.rows.length || this.grid.has_more?.() ? "" : "none";
	}
}
