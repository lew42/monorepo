import View, { div, span, a, input, button, icon } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import { Search } from "./Search.js";

View.stylesheet(import.meta, "Search.css");

const PAGE = 40;   // cards drawn before the "more" control — never the whole corpus
const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/**
 * Omnibox — the search box. A slim field pinned to the bottom-centre of the
 * window; type in it and it grows upward into a wall of result cards.
 *
 *   omnibox(app);        // build it, appended and listening
 *   app.omnibox.unmount();  // gone — DOM, hotkeys, all of it
 *
 * ⚠ Lives on ONE page now, not the whole site: `core/Search/page.js` builds it
 *   in `activated()` and calls `unmount()` in `deactivated()` (2026-09-06 — a
 *   site-wide box was breaking other pages). `mount()`/`unmount()` are the seam;
 *   nothing else calls them.
 *
 * `/` (when you are not already typing somewhere) and Ctrl/Cmd+K open it, Escape
 * closes it, the arrow keys walk the wall and Enter opens the card. The ⌃/⌄ button
 * moves the whole box to the top of the window and remembers that you did.
 *
 * The corpus and the ranking are `Search` — this file is only the picture of them.
 */
export class Omnibox extends View {

	render(){
		this.query = "";
		this.active = -1;
		this.shown = PAGE;
		this.matches = [];
		this.search = new Search();
		this.store = new Page.Store({ page: { store_key: "omnibox" } });

		this.bar();
		this.chips();
		this.results();

		this.place(this.store.get({ place: "bottom" }).place);
	}

	// Bound once, so `unmount()` can remove the exact function `mount()` added —
	// an inline arrow can only ever be added, never found again to remove.
	mount(){
		this._hotkey ??= e => this.hotkey(e);
		this._outside ??= e => this.outside(e);
		document.addEventListener("keydown", this._hotkey);
		document.addEventListener("pointerdown", this._outside, true);
		return this;
	}

	// The page that owns me calls this on the way out: no listeners left behind
	// on `document`, and no `.omnibox` element left in the DOM either.
	unmount(){
		document.removeEventListener("keydown", this._hotkey);
		document.removeEventListener("pointerdown", this._outside, true);
		this.close();
		this.remove();
		return this;
	}

	// ════ THE THREE REGIONS, top to bottom when open ════════════════════════
	// DOM order is bar → chips → results; `.omnibox.bottom` reverses the flex so
	// the field stays at the window's edge and the results grow up out of it.

	// ⚠ `grid gap`, and the wall declares its own tracks — NOT the `.grid.auto`
	// utility, which is auto-FIT: with three matches it collapses the empty tracks
	// and draws three enormous cards. `--column` is still the one knob, so 3440
	// gets seven columns and 400 gets one. Same reason framework.css special-cases
	// a wall of `.page-preview`; the rule is in Search.css because a util-layer
	// utility cannot be overridden from a module's theme layer.
	results(){
		return this.$results = div.c("omnibox-results", () => {
			this.$wall = div.c("omnibox-wall grid gap");
			this.$more = div.c("omnibox-more");
		});
	}

	// ⚠ No `flex v gap` utilities here. A utility sits in `@layer util`, which beats
	// this module's `@layer theme` at any specificity — so `.flex` would keep the
	// chips on screen while the box is closed and nothing would say why. The three
	// declarations it would have given are in Search.css instead.
	chips(){ return this.$chips = div.c("omnibox-chips"); }

	bar(){
		return this.$bar = div.c("omnibox-bar flex v-center gap", () => {
			icon("search");

			this.$input = input().ac("omnibox-input flex-1")
				.attr("type", "text")
				.attr("aria-label", "Search this site")
				.attr("placeholder", "Search this site")
				.on("focus", () => this.open())
				.on("input", e => this.type(e.target.value))
				.on("keydown", e => this.keys(e));

			this.$status = span.c("omnibox-status muted");
			this.$place = button.c("omnibox-btn").click(() => this.flip());
			button.c("omnibox-btn omnibox-hint", "esc").click(() => this.close());
		});
	}

	// ════ OPENING AND CLOSING ═══════════════════════════════════════════════

	// Building the corpus is ~838 dynamic imports, so it waits for the first person
	// who actually searches — and then draws itself as it arrives, rather than
	// holding a blank box for a second.
	open(){
		if (this.showing) return this;
		this.showing = true;
		this.tc("open", true);
		this.$input.el.focus();
		this.search.build(() => this.soon());
		this.draw();
		return this;
	}

	close(){
		this.showing = false;
		this.tc("open", false);
		this.$input.el.blur();
		return this;
	}

	// A click anywhere else puts the box away — the one gesture nobody has to learn.
	outside(e){
		if (this.showing && !this.el.contains(e.target)) this.close();
	}

	// ⚠ `/` only when nothing editable has focus: inside any field — including this
	// one — it must type a literal slash, because urls contain them.
	hotkey(e){
		if (e.key === "Escape" && this.showing) return void this.close();

		const el = document.activeElement;
		const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

		if (e.key === "/" && !typing) e.preventDefault();
		else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") e.preventDefault();
		else return;

		this.open();
		this.$input.el.select();
	}

	// ════ WHERE THE BOX SITS — the one thing it remembers ═══════════════════

	place(where){
		this.where = where === "top" ? "top" : "bottom";
		this.tc("top", this.where === "top");
		this.tc("bottom", this.where === "bottom");

		this.$place.empty(() => icon(this.where === "top" ? "vertical_align_bottom" : "vertical_align_top"))
			.attr("title", this.where === "top" ? "Move the search box to the bottom" : "Move the search box to the top");

		return this;
	}

	flip(){
		this.place(this.where === "top" ? "bottom" : "top");
		this.store.patch({ place: this.where });
		this.$input.el.focus();
		return this;
	}

	// ════ TYPING ════════════════════════════════════════════════════════════

	type(value){
		this.query = value;
		this.restart();
	}

	// A chip is the same event as a keystroke: the wall is a different wall now,
	// so the highlight and the "show more" budget both start again.
	filter(group, value){
		this.search.filters.toggle(group, value);
		this.restart();
		this.$input.el.focus();
	}

	restart(){
		this.shown = PAGE;
		this.active = -1;
		this.draw();
	}

	keys(e){
		if (e.key === "Escape"){
			this.stop(e);
			return void this.close();
		}

		// Enter with nothing highlighted opens the top match — the common case is
		// type three letters and press Enter, never type-arrow-enter.
		if (e.key === "Enter"){
			const row = this.matches[Math.max(this.active, 0)];
			if (row){ this.stop(e); this.go(row); }
			return;
		}

		if (!ARROWS.includes(e.key) || !this.matches.length) return;

		// ⚠ Left/Right stay with the TEXT until the wall has the highlight —
		// moving the caret is what they must do while you are still editing.
		const sideways = e.key === "ArrowLeft" || e.key === "ArrowRight";
		if (this.active < 0 && sideways) return;

		this.stop(e);

		const columns = this.columns();
		const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[e.key];
		const last = Math.min(this.matches.length, this.shown) - 1;

		// The first arrow press lands on the first card, whichever arrow it was.
		this.active = this.active < 0 ? 0 : Math.min(Math.max(this.active + step, 0), last);
		this.draw();
	}

	stop(e){ e.preventDefault(); e.stopPropagation(); }

	// How many cards a row of the wall holds right now — so ArrowDown moves DOWN a
	// wall rather than one card along it. Read off the live grid, never assumed.
	columns(){
		const tracks = getComputedStyle(this.$wall.el).gridTemplateColumns;
		return Math.max(tracks.split(" ").filter(Boolean).length, 1);
	}

	go(row){
		this.app.router.go(row.url);
		this.close();
	}

	// ════ DRAWING ═══════════════════════════════════════════════════════════

	// The corpus reports progress every 40 pages, ~21 times in the first second.
	// One repaint per frame is plenty, and it keeps the wall from thrashing under
	// a reader who is already typing into it.
	soon(){
		if (this.pending) return;
		this.pending = requestAnimationFrame(() => { this.pending = 0; this.draw(); });
	}

	draw(){
		if (!this.showing) return this;

		this.matches = this.search.rank(this.query);
		this.$status.text(this.progress());
		this.draw_chips();
		this.draw_wall();
		return this;
	}

	progress(){
		const { read, candidates, rows, done } = this.search;
		if (done) return `${rows.length} pages`;
		return candidates ? `reading the site — ${read} / ${candidates}` : "reading the site…";
	}

	draw_chips(){
		const groups = this.search.filters.groups();

		this.$chips.empty(() => groups.forEach(({ group, label: heading, options }) => {
			div.c("omnibox-group flex gap wrap v-center", () => {
				span.c("omnibox-group-label muted", heading);

				options.forEach(({ value, label, count }) => {
					const on = this.search.filters.chosen(group, value);

					button.c("omnibox-chip", () => {
						span(label);
						span.c("omnibox-chip-count muted", String(count));
					}).ac(on && "on").click(() => this.filter(group, value));
				});
			});
		}));
	}

	draw_wall(){
		const shown = this.matches.slice(0, this.shown);

		this.$wall.empty(() => {
			if (!shown.length) return void span.c("omnibox-empty muted", this.nothing());
			shown.forEach((row, i) => this.card(row, i));
		});

		this.$more.empty(() => {
			const left = this.matches.length - shown.length;
			if (!left) return;

			button.c("omnibox-btn omnibox-show-more", `Show ${Math.min(left, PAGE)} more — ${left} still to come`)
				.click(() => { this.shown += PAGE; this.draw(); });
		});

		this.$wall.el.querySelector(".omnibox-card.active")?.scrollIntoView({ block: "nearest" });
	}

	nothing(){
		if (!this.search.done) return "Nothing yet — still reading the site.";
		return this.search.filters.count()
			? "Nothing matches. Turn a chip off, or clear the words."
			: "Nothing matches those words.";
	}

	// A real anchor, so Ctrl-click still opens a new tab and the Router handles the
	// plain click by itself — nothing here has to reimplement navigation.
	card(row, i){
		return a.c("omnibox-card surface").href(row.url).ac(i === this.active && "active").append(() => {
			div.c("omnibox-card-head flex gap v-center", () => {
				if (row.icon) icon(row.icon);
				span.c("omnibox-card-title", row.title);
			});
			span.c("omnibox-card-url muted", row.url);
			if (row.description) span.c("omnibox-card-desc muted", row.description);
		}).click(() => this.close());
	}
}

/* Called from `core/Search/page.js`'s `activated()` — once per visit to that
 * page, not once for the site. `deactivated()` calls `app.omnibox.unmount()`.
 *
 * ⚠ Into `app.$app`, not `<body>`: the box is site UI and has to inherit the theme
 * class the app paints. `.app` sets no transform, so `position: fixed` inside it is
 * still the window. And after `styles_loaded()`, or the box paints unstyled first —
 * the same trap dev/DevBar documents one line above its own mount. */
export default function omnibox(app){
	const box = new Omnibox({ app, capture: false });
	app.styles_loaded().then(() => box.append_to(app.$app));
	box.mount();
	return app.omnibox = box;
}

export { omnibox };
