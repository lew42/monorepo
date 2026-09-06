import { Page } from "../Page/Page.class.js";
import View, { div, span } from "../View/View.js";
import { LAYOUTS, by_name } from "../Layout/layouts.js";
import { apply } from "../Layout/fixtures.js";
import { Dropdown } from "../../ext/Dropdown/dropdown.js";

View.stylesheet(import.meta, "Section.css");

/* ── A SECTION — one band inside a page ────────────────────────────────────────

   A Section is a PAGE you put inside a page. It starts as a plain div two and a
   half lines tall with nothing in it at all, and it has exactly one idea of its
   own: it can be handed an APPROVED LAYOUT from `core/Layout`, and that layout's
   named boxes become the section's slots. Its children mount into those slots by
   name. That is the whole class.

   It extends `Page`, so everything a page has arrives free and nothing here writes
   it: storage keyed on the section's own url (`store()`), children, `nearest()`,
   the six page words, previews, the whole naming machine. The owner asked for a
   sub page for exactly that reason.

     new Section({ url: "/…/band/" })                  a plain box, 2.5em tall
     new Section({ …, editing: true })                 hover it: a hairline and one control
     new Section({ …, layout: "main-aside",            two slots, filled by name
                   children: { Main: …, Aside: … } })

   EDITING IS OFF UNLESS CODE TURNS IT ON. A demo page or a doc page calls
   `section.edit()`; a visitor has no way to. There is no padding control and there
   never was one — the owner replaced that idea with approved layouts outright
   ("maybe having padding schemes isn't the way… yes, this is It").

   DEMOS DO NOT PERSIST. Picking a layout writes nothing: the choice lives on the
   instance, and a reload is the page again. Storage is inherited and works — it is
   for an editor to call, and an editor has to make saving visible.

   ⚠ EVERY VIEW PART IS `PageSection*`, and `.page-section-*` is the namespace
     (styles/css-scopes.txt). `Section` itself is safe — `Page` is not a `View`, so
     `View.classify()` never sees this class and mints nothing from its name — but
     `.section` is a live rule elsewhere on the site and `/imagine/sections` dodged
     the word entirely for that reason. `core/Layout` made the same call one file
     over: inside core/Page's namespace on purpose, because `Section extends Page`.

   ⚠ NO CLASS FIELDS FOR DEFAULTS. A subclass's field initializers run AFTER
     `super()` has finished, so a field here would overwrite the config that was
     just assigned. The defaults sit on the prototype at the bottom of this file.  */

export class Section extends Page {

	/* ── WHAT IT DRAWS ─────────────────────────────────────────────────────────
	   `render()` is overridden WHOLE, and this is the one real difference between a
	   Section and a Page: a page draws a title, a shell and the six words' frame; a
	   band draws none of that. No `.page` class either, so the arrangement contract
	   (which hides an unmarked `.page`) never has an opinion about a box a page
	   built inline.                                                              */
	render(){
		if (this.view) return this.view;

		this.view = div.c("page-section")
			.ac(this.editing && "page-section-editing")
			.append(() => { this.draw(); });

		this.watch();

		return this.view;
	}

	/* ── THE WIDTH RULE, ON A LIVE BOX ─────────────────────────────────────────
	   ⚠ THE BOX HAS NO SIZE YET when a page is built: a page is built detached, so
	     every rect reads 0 and the first draw cannot know whether its layout fits.
	     The observer answers the moment the box gets a size, and again every time
	     that size changes — which is exactly when the question needs asking again.
	     `core/Layout` learned the same thing one file over.
	   ⚠ IT REDRAWS ONLY WHEN THE ANSWER CHANGED. A redraw is a DOM change and a DOM
	     change fires the observer, so an unguarded one is an infinite loop. */
	watch(){
		if (this.observer || !this.view) return;

		this.observer = new ResizeObserver(() => {
			if ((this.drawn()?.name ?? null) !== this.drawn_name) this.redraw();
		});

		return this.observer.observe(this.view.el);
	}

	// ⚠ `empty()`, never a new view: the box is already in the page, and replacing
	//   it strands whatever put it there. Same rule `Page.redraw()`-shaped code all
	//   over this site learned the hard way.
	redraw(){
		this.view?.[this.editing ? "ac" : "rc"]("page-section-editing");
		this.view?.empty(() => { this.draw(); });
		return this;
	}

	draw(){
		const entry = this.drawn();

		this.regions = new Map();
		this.drawn_name = entry?.name ?? null;

		this.overlay();
		if (entry) this.arrange(entry);

		/* Every child the layout did not claim, in declaration order. With no layout
		   that is ALL of them, which is why a section with children and no layout is
		   simply a stack — and why content is never silently dropped. */
		this.children.forEach((child, name) => {
			if (child && !this.regions.has(name)) this.mount(this.view, child);
		});
	}

	// Editing is turned on BY CODE: a demo page or a doc page calls this, a real
	// page never does. `editing: true` in the config is the same switch, said once.
	edit(on = true){
		this.editing = on;
		return this.view ? this.redraw() : this;
	}

	/* ── THE OVERLAY — the smallest thing that works ───────────────────────────
	   A hairline outline (Section.css) and ONE control in the corner. It is
	   `position: absolute` and moves only `opacity`, so hovering a section shifts
	   ZERO pixels — `ext/Playground` measured its way to that rule over a ten-point
	   hover sweep and it is not worth re-learning.                               */
	overlay(){
		if (!this.editing) return;

		const stacked = this.entry() && !this.drawn();

		return div.c("page-section-overlay", () => {
			// The one sentence a stacked section owes its reader: WHICH layout it is
			// holding, and why you are not looking at it. Never blocking, and inside
			// the overlay — so it appears on hover and moves nothing.
			if (stacked) span.c("page-section-note muted", `stacked — ${this.entry().title} needs ${this.entry().widths[0]}px`);

			new this.constructor.Picker({ section: this, title: "Pick an approved layout" }).draw();
		});
	}

	/* ── FROM A `page.json` ────────────────────────────────────────────────────
	   The third way a page arrives — data that describes one — and a Section reads
	   the same file a Page does, plus one key: `layout`.

	       { "title": "Team", "layout": "main-aside", "children": ["main", "aside"] }

	   ⚠ `Page.from()` already does all of this and CANNOT be inherited: it says
	     `new Page(…)` in the middle, so a subclass calling it gets a Page back. One
	     word there — `new this(…)` — would hand it to every subclass at once;
	     `core/Page/` was outside this task's write fence, so the read is repeated
	     here and the finding is logged for whoever owns that file next. The
	     CHILDREN still go through core's own reader: only the root is a Section.
	   ⚠ NO DOM IN HERE. It is async, so it builds no view — the caller captures its
	     box synchronously and fills it in a `.then()`. */
	static async from(source, adopt){
		const url  = typeof source === "string" ? source.replace(/\/?$/, "/") : null;
		const data = url ? await Page.read_json(url + "page.json") : source;
		if (!data) return null;

		const mode = data.mode ?? {};

		const section = new Section({
			url, title: data.title, icon: data.icon, description: data.description,
			layout: data.layout ?? mode.layout,
			editing: data.editing ?? mode.editing ?? false,
		}, adopt);

		for (const name of data.children ?? [])
			section.add(name, (url && await Page.from(url + name + "/")) ?? { title: name });

		return section;
	}

	/* ── THE LAYOUT ────────────────────────────────────────────────────────────
	   `layout` is one word: the `name` of an entry in `core/Layout`'s catalogue.
	   The catalogue is plain data with no imports, so reading it here costs a page
	   nothing and cannot disagree with the layout pages themselves.              */
	entry(){ return by_name(this.layout) ?? null; }

	/* THE ENTRY ACTUALLY DRAWN — and it is not always the one that was picked.
	   BELOW ITS FLOOR A LAYOUT STACKS (the owner, addendum: "below its floor a
	   layout stacks to a named fallback… and the fallback is the thing being judged
	   there"). A two-column grid in a 276px box is not a two-column layout with a
	   problem; it is 4,433px of column, measured, before this method existed.

	   ⚠ Stacking here means DRAWING NO LAYOUT, and that is a decision worth reading:
	     a section's stack is its own children in declaration order, which is exactly
	     what `stack` — the fallback of every multi-column layout in the catalogue
	     but one — describes. Taking the fallback's own BOXES instead would hand the
	     content a set of slot names it was never written for (`First`, `Second`,
	     `Third`), and content in a slot it does not belong to is worse than content
	     in a stack. doc/slots.md. */
	drawn(){
		const one = this.entry();
		return !one || fits(one, this.inner_width()) ? one : null;
	}

	// Pick one, by name. `""` puts the plain box back. Nothing is written to
	// storage — see the note at the top of this file.
	pick(name){
		this.layout = name || null;
		return this.redraw();
	}

	/* THE ARRANGEMENT, APPLIED. The entry's `decl` IS the layout — the same
	   declarations the layout page prints and the fixtures pour into — and one slot
	   is drawn per box. Every slot is a REGION under the box's name, which is the
	   Map `Page.container()` already reads, so a child mounts here with no new rule
	   to write. It is what `Page.Frame` does for a bar, a rail or an aside. */
	arrange(entry){
		return apply(div.c("page-section-render"), entry.decl)
			.append(() => { entry.boxes?.forEach(box => this.slot(box)); });
	}

	// One box → one slot. `Main` is the slot `main`, so a child called `main` lands
	// in it: the layout says the shape and the page says the names, once each.
	slot(box){
		const name = Page.slug(box.label);
		const $slot = apply(div.c("page-section-slot"), box.decl);
		const child = this.children.get(name);

		this.regions.set(name, $slot);

		if (child) this.mount($slot, child);
		else if (this.editing) $slot.append(() => { span.c("page-section-name muted", name); });

		return $slot;
	}

	/* ⚠ The child's view is APPENDED, never built inside the captor. A page
	     MEMOIZES its view, so on the second draw `child.render()` builds nothing at
	     all and a captured call would append nothing — the slot would silently come
	     up empty after one pick. Passing the View to `append()` moves it either way.
	   ⚠ `default`, because nothing ROUTES to a slot: without the mark the
	     arrangement contract hides the child (Page.css). Same line as `Frame.region()`. */
	mount($box, child){
		return $box.append(child.assign({ app: this.app }).render().ac("default"));
	}

	/* ── WHICH LAYOUTS FIT — LayoutRule #1, asked of THIS box ──────────────────
	   The width is read LIVE off the rendered section, so a box that was resized
	   offers a different list; the picker asks again every time it opens.        */
	inner_width(){ return Math.round(this.view?.el.clientWidth ?? 0); }

	/* Every approved layout, with the rule already asked, fitting ones first.
	   `note` is a plain sentence either way — a greyed row that does not say why it
	   is greyed teaches nothing. */
	choices(){
		const room = this.inner_width();

		const all = LAYOUTS.filter(one => one.approved).map(one => ({
			value: one.name,
			label: one.title,
			icon: GLYPH[Math.min(one.columns ?? 1, 4)],
			fits: fits(one, room),
			note: fits(one, room)
				? `from ${one.widths[0]}px`
				: `needs ${one.widths[0]}px — this box is ${room}px`,
		}));

		return [
			{ value: "", label: "No layout", icon: "crop_free", fits: true, note: "a plain box again" },
			...all.filter(one => one.fits),
			...all.filter(one => !one.fits),
		];
	}
}

/* ⚠ THIS BELONGS TO `core/Layout`. It is `rules.js`'s first rule with the reporting
     taken off, and a second copy of a rule is one edit from disagreeing with the
     first — `Layout.fits(width)` is where it should live. `core/Layout/` was outside
     this task's write fence; logged in the task log for whoever owns it next.
   ⚠ Only the FLOOR is asked. Every entry's ceiling is 3440 and above a ceiling a
     layout HOLDS rather than stretching (the owner, addendum 4), so a ceiling can
     never make a layout unfit — it is not a silent omission.
   ⚠ `!room ||` — a box that has not been laid out yet measures 0, and a picker that
     greys the whole catalogue because it was asked too early is a lie. */
export const fits = (layout, room) => !room || room >= (layout.widths?.[0] ?? 0) - 1;

// A picture for the shape, not for the name: how many columns it divides into.
const GLYPH = { 1: "view_agenda", 2: "view_column", 3: "view_week", 4: "grid_view" };

/* ── THE ONE CONTROL ───────────────────────────────────────────────────────────
   `ext/Dropdown` — imported, never copied. It brings the top layer with it, which
   is the whole reason: an open list is promoted out of every `overflow: hidden`
   ancestor, and a section lives inside plenty of them. Outside-click, Escape and
   the arrow keys are its own too.

   ⚠ `Dropdown` is a plain class, not a `View`, so `classify()` mints no CSS class
     from `PageSectionPicker` — the name is still `PageSection*` because the next
     part someone adds here may well be a View, and one naming rule is cheaper than
     two.                                                                        */
Section.Picker = class PageSectionPicker extends Dropdown {

	// The trigger reads the SECTION, so it can never disagree with what is on
	// screen: the layout's name, or the word "layout" when there is none.
	chosen(){
		const entry = this.section.entry();
		return { icon: entry ? GLYPH[Math.min(entry.columns ?? 1, 4)] : "crop_free", label: entry?.title ?? "layout" };
	}

	// Rebuilt on every open: the section's width decides which layouts fit and the
	// section can be resized between two opens — drag a demo's handle and watch the
	// list change.
	open(){
		this.value = this.section.layout ?? "";
		this.options = this.section.choices();
		this.$list.empty(() => { this.options.forEach(one => this.option(one)); });

		// ⚠ `fits && value` — every layout is in `options` whether it fits or not, so
		//   asking only for a value found thirty of them and the empty state never
		//   drew (measured at a 400 viewport, where nothing fits).
		if (!this.options.some(one => one.fits && one.value)) this.$list.append(() => { this.nothing(); });

		return super.open();
	}

	/* ⚠ `pick` is the hook `Dropdown.option()` calls (`this.pick?.(o.value)`) — an
	     OPTIONAL one, so a picker without it swallows every click and nothing
	     throws: the list closed, the trigger went back to saying "layout", and the
	     section never changed. Measured before this method existed. */
	pick(value){ return this.section.pick(value); }

	list(){ return super.list().ac("page-section-list"); }

	/* A layout that does not fit is NOT an option — it is a row saying why, so it
	   cannot be clicked, cannot be focused, and cannot be reached with the arrow
	   keys (which walk `.dropdown-option`). A fitting one is the dropdown's own
	   option with its range added. */
	option(one){
		if (!one.fits)
			return div.c("page-section-unfit", () => { this.face(one); span.c("page-section-note muted", one.note); });

		return super.option(one).append(() => { span.c("page-section-note muted", one.note); });
	}

	// A list with nothing in it says so, and says the one useful thing: what the
	// narrowest layout on the site needs.
	nothing(){
		const floor = Math.min(...LAYOUTS.filter(one => one.approved).map(one => one.widths[0]));

		return span.c("page-section-note muted",
			`Nothing is proven this narrow — the narrowest needs ${floor}px. Below its floor a layout stacks, so this box is already the stack.`);
	}
};

/* The defaults, on the PROTOTYPE — a declared value shadows one with no code, and a
   class field here would land after `assign()` and wipe the config instead.
   ⚠ `leaf: true`: a section presents ITSELF, not its children — they are its slots,
     not pages a reader browses to — so it spends none of its parent's load budget
     and never appears on someone else's wall of cards. */
Object.assign(Section.prototype, {
	editing: false,
	layout: null,
	leaf: true,
});

export default Section;
