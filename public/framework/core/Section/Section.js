import { Page } from "../Page/Page.class.js";
import View, { div, span } from "../View/View.js";
import { LAYOUTS, by_name } from "../Layout/layouts.js";
import { apply } from "../Layout/fixtures.js";
import { fits } from "../Layout/rules.js";
import { Dropdown } from "../../ext/Dropdown/dropdown.js";

View.stylesheet(import.meta, "Section.css");

// history and reasons: doc/Section-notes.md

// ⚠ EVERY VIEW PART IS `PageSection*`; `.page-section-*` is the namespace.
// `Section` extends Page; see doc/Section-notes.md about naming.

// ⚠ NO CLASS FIELDS FOR DEFAULTS: they run after super() and overwrite config.
// Defaults are on the prototype at the bottom of this file.

export class Section extends Page {

	render(){
		if (this.view) return this.view;

		this.view = div.c("page-section")
			.ac(this.editing && "page-section-editing")
			.append(() => { this.draw(); });

		this.watch();

		return this.view;
	}

	// ⚠ THE BOX HAS NO SIZE YET: built detached, rects read 0. Observer fires on resize.
	// ⚠ IT REDRAWS ONLY WHEN THE ANSWER CHANGED: unguarded observe creates infinite loop.
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

		// Mount every child the layout did not claim, in declaration order.
		this.children.forEach((child, name) => {
			if (child && !this.regions.has(name)) this.mount(this.view, child);
		});
	}

	edit(on = true){
		this.editing = on;
		return this.view ? this.redraw() : this;
	}

	overlay(){
		if (!this.editing) return;

		const stacked = this.entry() && !this.drawn();

		return div.c("page-section-overlay", () => {
			// Tell reader which layout is held and why it stacks (see doc/Section-notes.md).
			if (stacked) span.c("page-section-note muted", `stacked — ${this.entry().title} needs ${this.entry().widths[0]}px`);

			new this.constructor.Picker({ section: this, title: "Pick an approved layout" }).draw();
		});
	}

	// Reads page.json with extra keys: layout, editing. See doc/Section-notes.md.
	static props(data, mode){
		return {
			...super.props(data, mode),
			layout: data.layout ?? mode.layout,
			editing: data.editing ?? mode.editing ?? false,
		};
	}

	// Returns the layout entry by name from core/Layout's catalogue.
	entry(){ return by_name(this.layout) ?? null; }

	// Returns the layout to draw, or null if stacked below its floor. See doc/Section-notes.md.
	// ⚠ Stacking means DRAWING NO LAYOUT: use children in declaration order, not fallback's boxes.
	drawn(){
		const one = this.entry();
		return !one || fits(one, this.inner_width()) ? one : null;
	}

	// Pick a layout by name; "" puts the plain box back. Writes nothing to storage.
	pick(name){
		this.layout = name || null;
		return this.redraw();
	}

	// Applies the layout declaration, drawing one slot per box. See doc/Section-notes.md.
	arrange(entry){
		return apply(div.c("page-section-render"), entry.decl)
			.append(() => { entry.boxes?.forEach(box => this.slot(box)); });
	}

	// Draw one slot per box (e.g., Main -> main). Layout says shape, page says names.
	slot(box){
		const name = Page.slug(box.label);
		const $slot = apply(div.c("page-section-slot"), box.decl);
		const child = this.children.get(name);

		this.regions.set(name, $slot);

		if (child) this.mount($slot, child);
		else if (this.editing) $slot.append(() => { span.c("page-section-name muted", name); });

		return $slot;
	}

	// ⚠ APPEND the view, not a callback: page memoizes render(), so captured call won't move it.
	// ⚠ Add "default" class: without it the arrangement contract hides the child (Page.css).
	mount($box, child){
		return $box.append(child.assign({ app: this.app }).render().ac("default"));
	}

	// Returns this box's rendered width. Picker checks which layouts fit every time it opens.
	inner_width(){ return Math.round(this.view?.el.clientWidth ?? 0); }

	// Every approved layout, fitting ones first. Each has a `note` explaining why it fits.
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

// Icon glyph per column count (shows the layout's column structure in the picker).
const GLYPH = { 1: "view_agenda", 2: "view_column", 3: "view_week", 4: "grid_view" };

// ⚠ Dropdown is a plain class (not a View), so naming stays PageSection* deliberately.
// This way any next component here can also be a View without a naming collision.
Section.Picker = class PageSectionPicker extends Dropdown {

	// The trigger icon/label reflects this section's chosen layout (from entry()).
	chosen(){
		const entry = this.section.entry();
		return { icon: entry ? GLYPH[Math.min(entry.columns ?? 1, 4)] : "crop_free", label: entry?.title ?? "layout" };
	}

	// Rebuild the list every open (width may have changed; re-check which layouts fit).
	open(){
		this.value = this.section.layout ?? "";
		this.options = this.section.choices();
		this.$list.empty(() => { this.options.forEach(one => this.option(one)); });

		// ⚠ Check `fits && value`: every layout is in options; ask both to avoid returning empty list.
		if (!this.options.some(one => one.fits && one.value)) this.$list.append(() => { this.nothing(); });

		return super.open();
	}

	// ⚠ `pick()` is an OPTIONAL hook (called from Dropdown). Without it, clicks are swallowed.
	pick(value){ return this.section.pick(value); }

	list(){ return super.list().ac("page-section-list"); }

	// Non-fitting layouts are disabled rows (no click, no focus, no arrow key). Fitting ones are options.
	option(one){
		if (!one.fits)
			return div.c("page-section-unfit", () => { this.face(one); span.c("page-section-note muted", one.note); });

		return super.option(one).append(() => { span.c("page-section-note muted", one.note); });
	}

	// Message when empty: explain the narrowest layout width requirement.
	nothing(){
		const floor = Math.min(...LAYOUTS.filter(one => one.approved).map(one => one.widths[0]));

		return span.c("page-section-note muted",
			`Nothing is proven this narrow — the narrowest needs ${floor}px. Below its floor a layout stacks, so this box is already the stack.`);
	}
};

// ⚠ Defaults on prototype (not fields): field initializers run AFTER assign() and overwrite config.
// ⚠ `leaf: true`: section is itself, not a browseable page. Its children are slots, not cards.
Object.assign(Section.prototype, {
	editing: false,
	layout: null,
	leaf: true,
});

export default Section;
