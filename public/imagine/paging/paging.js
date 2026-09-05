import { Page, View, div, span, a, icon, md, is } from "/app.js";
import { Stage } from "./stage.js";
import { Toolbar } from "./toolbar.js";
import { RAIL } from "./rail.js";
import { MECHANISMS } from "./words.js";

/* ⚠ RE-EXPORTED, not vestigial: three pages in /imagine/codrops/ import `MECHANISMS`
     from this module by name to say which of the four gestures they rebuilt. Moving
     it would break another realm silently. */
export { MECHANISMS };

View.stylesheet(import.meta, "paging.css");

/* ── THE PAGING REALM IS AN APP ────────────────────────────────────────────────

   `/imagine/paging/` is one screen: a left rail that never moves, and a middle that
   swaps. Every page in the realm is a page of that app — same url, same back
   button, same cold load — and clicking anything in the rail changes exactly one
   thing, the middle.

     Realm    the app itself. It owns the rail and the middle, and the middle IS
              `this.$pages`, so every descendant page mounts there by core's own
              container() rule and nothing had to be taught about it.

     Paging   the base class every page in the realm extends. It is a plain page in
              the middle — never a column — and it can put a `stage()` on screen.

   ⚠ WHY NOT COLUMNS. /imagine/ is a columns host, so by default every page under it
     opens as one more column of that row, and a deep link opens two columns at once
     (the owner, 2026-09-05: "a lot of links launch 2 columns at once… quite
     jarring"). Here the middle is one region, so the arrangement contract shows the
     DEEPEST page and hides its ancestors — a link three levels down still changes
     one thing. The rail is outside the region, so it cannot move at all.
     doc/decisions.md, "the realm is an app".                                     */

/* ⚠ A CLICKABLE THAT IS NOT A `<button>`. The site theme styles every `button` as a
     small uppercase CTA — `.theme-lew42 :is(button, .btn)` at (0,2,0), in the same
     layer — so a chip cannot win that at its own specificity, and the answer the
     styles docs already reached is a clickable span. The keyboard half is what a
     `<button>` gave for free, so it is restated here. */
export const press = (view, act) => view
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

/* ── ONE STORAGE NAMESPACE, and almost nothing in it ──────────────────────────
   Demos in this realm do not persist: a refresh puts every one of them back to the
   page it is (decision 4, 2026-09-05). The only writers left are the two EDITORS,
   Make and Build, whose drafts are things you made on purpose — and they still land
   under this one prefix, so one call forgets the realm and nothing else on the site.
   doc/persistence.md. */
export const NS = "paging:";
export const FULL_NS = "lew42:" + NS;

// ⚠ Collect the keys FIRST: `localStorage.key(i)` re-indexes on every removal, so
//   removing inside the walk skips every other match.
export function reset(){
	const keys = [];

	try {
		for (let i = 0; i < localStorage.length; i++){
			const key = localStorage.key(i);
			if (key?.startsWith(FULL_NS)) keys.push(key);
		}
		keys.forEach(key => localStorage.removeItem(key));
	} catch { /* private mode: nothing was persisted, so nothing needs clearing */ }

	return keys.length;
}

/* ── A PAGE IN THE MIDDLE ─────────────────────────────────────────────────────── */
export class Paging extends Page {

	/* ⚠ THE ONE LINE THAT TAKES THIS REALM OUT OF THE COLUMNS ROW. `column_host()`
	     finds the shallowest columnar ancestor and /imagine/ is one, so without this
	     every page here renders as a column of that row again. */
	column_host(){ return undefined; }

	/* ⚠ A `.md` FILE BESIDE A PAGE IS A PAGE — core's last-resort fallback. `Page.file()`
	     returns a plain object, so `add()` wraps it in a CORE `Page`, whose `column_host()`
	     finds /imagine/ and renders it as a column of that row — stepping straight out of
	     the app. `/imagine/paging/readme/` did exactly that (measured 2026-09-05: one
	     column body on a page that should have had none). One field on the child, which is
	     the deliberate version of the shadowing this realm keeps meeting by accident. */
	async child(name, levels){
		const kid = await super.child(name, levels);
		if (kid && !(kid instanceof Paging)) kid.column_host = () => undefined;
		return kid;
	}

	// The surface word a page may wear, stamped on its own view rather than on a
	// column body — there is no column body any more.
	render(){
		const view = super.render();
		if (this.surface) view.ac("paging-surface-" + this.surface);
		return view;
	}

	/* ONE SENTENCE, saying what to DO. Not what you are about to be shown — the
	   showing is right below it. (Every "Every page on this site is three things…"
	   opening in this realm was deleted on 2026-09-05: if a reader can understand
	   the sentence they did not need it, and if they cannot it is noise.) */
	lede(text){
		const words = text ?? this.takeaway;
		return words ? md(words).ac("paging-lede") : null;
	}

	/* PUT A CONFIGURED PAGE ON SCREEN — the stage, its hover toolbar, and the drawer
	   button. One call, and it is the same call on the hub, on a preset, on a block
	   page and on a made page. `config` is the seven words; anything else is handed
	   to the Stage (its own `pages`, for instance).

	   ⚠ `.wide` — inside the middle's page grid, `main` is capped at the 40em reading
	     measure and a stage in it would waste every pixel past it at 1920 and 3440.
	     `wide` starts on the same left edge as the prose and takes all the leftover.
	     (Measured 2026-09-05: the old hub used 1551px of a 3440 row — 55% dead.) */
	stage(config, extra){
		let stage;

		/* ⚠ ONE WRAPPER, and the toolbar is INSIDE it — that is what makes "hover the
		     stage" mean the same thing as "the toolbar appears". A toolbar drawn as a
		     sibling of the stage would need its own hover target, and pointing at the
		     stage would not be it. `position: relative` here, `absolute` on the bar. */
		div.c("paging-frame wide", () => {
			stage = this.$stage = new Stage({ config, ...extra, page: this });
			this.$toolbar = new Toolbar({ stage, page: this });
		});

		return stage;
	}
}

/* ── THE APP ──────────────────────────────────────────────────────────────────── */
export class Realm extends Paging {

	// A shell is its own screen, not a column: mounting beside the row's host is the
	// arrangement contract's own sibling rule, and /imagine/ stands down. The same
	// line /imagine/shells/Shell.js uses, for the same reason.
	container(){ return this.mounts_in(this.app.$pages, "app.$pages — the paging realm is its own screen"); }

	/* ⚠ Overriding render() is ALSO what skips core's `render_column()`. The rail is
	     built ONCE, outside `$pages`, so no navigation can touch it; `$pages` is the
	     middle, which is what makes every descendant mount there with no page in the
	     realm knowing anything about it (core's `container()` walks up for `$pages`).
	   ⚠ `.pages` on the middle is deliberate, not decoration: core's Router scrolls
	     `view.closest(".pages")` back to the top on every navigation, and Page.css
	     gives a `.pages` region its own scrollbar. Without the class the middle would
	     keep the last page's scroll position on arrival. */
	render(){
		if (this.view) return this.view;

		this.view = div.c("page paging-app", () => {
			this.$rail = div.c("paging-app-rail", () => { this.rail(); });

			this.$pages = div.c("pages paging-app-centre", () => {
				this.$home = div.c("paging-home flow", () => {
					if (is.fn(this.content)) this.content();
				});
			});
		});

		return this.view;
	}

	// ── the rail ─────────────────────────────────────────────────────────────
	// Sections of nav grids — the owner's own ask ("I like these nav grids… multiple
	// sections of nav grids could be useful"). The data is `rail.js`; this is the paint.
	rail(){
		a.c("paging-app-home").href("/imagine/paging/").append(() => {
			icon("auto_stories");
			span("Paging");
		});

		RAIL.forEach(section => this.section(section));

		a.c("paging-app-out").href("/imagine/").append(() => {
			icon("arrow_back");
			span("Back to Imagine");
		});
	}

	section({ title, note, items }){
		return div.c("paging-sec", () => {
			span.c("paging-sec-head", title);
			if (note) span.c("paging-sec-note", note);

			div.c("paging-grid", () => items.forEach(item => this.tile(item)));
		});
	}

	// One nav-grid tile: an icon and a label, and the whole tile is the link.
	tile({ url, title, icon: glyph }){
		return a.c("paging-tile").href(url).append(() => {
			icon(glyph ?? "description").ac("paging-tile-icon");
			span.c("paging-tile-words", title);
		});
	}
}

/* ── ONE ROW — a child, and the icon of what clicking it does ─────────────────
   The last survivor of the old stage. `templates/families.js` draws the navigation
   family out of it (four rows, each wearing its mechanism's glyph), and `.paging-item`
   is still in the stylesheet for it. Everything else that used it went in the
   2026-09-05 rebuild. */
Paging.Item = class PagingItem extends View {

	render(){
		this.attr("href", this.url);           // nullish writes nothing
		this.ac(this.chosen && "paging-item-on");

		if (this.glyph) icon(this.glyph);
		span.c("paging-item-words", this.words);
		icon(this.sign).ac("paging-sign");

		if (this.act) press(this, this.act);
	}
};

export default Paging;
export { Stage, Toolbar };
