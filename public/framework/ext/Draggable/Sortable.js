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

		this.ghost = this.view.el.cloneNode(true);
		this.ghost.classList.add("drag-ghost");
		Object.assign(this.ghost.style, { left: box.left + "px", top: box.top + "px", width: box.width + "px" });
		document.body.append(this.ghost);

		this.placeholder = document.createElement("div");
		this.placeholder.className = "drag-placeholder";
		this.placeholder.style.height = box.height + "px";
		this.view.el.before(this.placeholder);

		this.view.ac("drag-source");
	}

	move(dx, dy, e){
		this.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
		this.show(this.locate(e));
	}

	// Sortable commits a POSITION, so it does not use Draggable's single-target drop.
	release(e){
		const where = this.locate(e);
		this.end();
		if (where) this.item.move(where.list.item, where.before);
	}

	end(){
		super.end();
		this.ghost?.remove();
		this.placeholder?.remove();
		this.view.rc("drag-source");
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
