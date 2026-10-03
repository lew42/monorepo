import Draggable from "./Draggable.js";

/* A row you can grab, and — when it carries `$items` — a box other rows land in.
   Imports neither Item nor List: the only thing it calls is `item.move()`. */
export default class Sortable extends Draggable {

	initialize(){
		super.initialize();
		this.$items?.ac("drag-items");
	}

	start(){
		const box = this.view.el.getBoundingClientRect();

		// Stays INSIDE its own parent, never `document.body` — a ghost on body
		// sits outside every themed/scoped ancestor (dark islands, a card's own
		// font), so it rendered in the PAGE's font and colours instead of its
		// row's (2026-10-03, the owner). `position: fixed` still measures from
		// the viewport wherever it sits in the DOM, unless some ancestor between
		// it and <html> sets `transform`/`filter`/`contain` — none of this
		// framework's row containers do.
		this.ghost = this.view.el.cloneNode(true);
		this.ghost.classList.add("drag-ghost");
		Object.assign(this.ghost.style, { left: box.left + "px", top: box.top + "px", width: box.width + "px" });
		this.view.el.after(this.ghost);

		this.placeholder = document.createElement("div");
		this.placeholder.className = "drag-placeholder";
		this.placeholder.style.height = box.height + "px";
		this.view.el.before(this.placeholder);

		// Inline beats every layer: a util class (.flex etc.) in @layer util otherwise
		// outranks draggable.css's @layer theme rule and the source never hides.
		this.prior_display = this.view.style("display");
		this.view.style("display", "none");
		this.view.ac("drag-source");
	}

	move(dx, dy, e){
		this.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
		this.show(this.locate(e));
	}

	// Sortable commits a POSITION, so it does not use Draggable's single-target drop.
	// ⚠ Calls the TARGET LIST's own `move` (core/List/List.js) — never the Item
	// — because Item itself holds no list methods any more. Every caller of
	// Sortable gives its row Items an `items` List (Panel, the editor's blocks,
	// the Draggable demo all do), so `where.list.item.items` is always that list;
	// `from` is wherever the dragged item is parented RIGHT NOW, read fresh at
	// drop time rather than cached, so a drop still works after the item itself
	// moved some other way mid-drag.
	release(e){
		const where = this.locate(e);
		this.end();
		if (where) where.list.item.items.move(this.item, { before: where.before, from: this.item.parent?.items });
	}

	end(){
		super.end();
		this.ghost?.remove();
		this.placeholder?.remove();
		this.view.rc("drag-source");
		this.view.style("display", this.prior_display);
		this.ghost = this.placeholder = null;
	}

	// { list, before } — the innermost registered container under the cursor, and the
	// row to land before: an Item, or null to append. Never an index. Every candidate
	// container goes through drop_check, so one override covers preview and commit.
	// Override this whole method to change where a drop lands.
	locate(e){
		const list = this.under(e, box => box.$items && this.drop_check(box, e));
		return list && { list, before: list.before(e, this) };
	}

	// The first of my rows whose midpoint the cursor has not reached yet.
	before(e, dragged){
		for (const el of this.$items.el.children){
			if (el === dragged.placeholder || el === dragged.view.el) continue;
			const box = el.getBoundingClientRect();
			if (e.clientY < box.top + box.height / 2)
				return Draggable.registry.get(el)?.item ?? null;
		}
		return null;
	}

	// My row carrying `item` — where the placeholder goes. null appends.
	row(item){
		for (const el of this.$items.el.children)
			if (item && Draggable.registry.get(el)?.item === item) return el;
		return null;
	}

	// The placeholder IS the preview: the real node never moves, which is why
	// cancel() has nothing to put back.
	show(where){
		if (!where) return this.placeholder.remove();
		where.list.$items.el.insertBefore(this.placeholder, where.list.row(where.before));
	}
}

export { Sortable };
