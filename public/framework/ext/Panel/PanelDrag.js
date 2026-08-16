import Draggable from "/framework/ext/Draggable/Draggable.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import Panel from "./Panel.js";

const EDGE = 0.2;

/* A panel is a row you can grab and a box rows land in. ⚠ The handle is the grip
   alone, never the bar — a handle owning the bar swallows every button click. */
export class PanelDrag extends Sortable {

	/* ⚠ Three halves. `contains()` is strict, so `target !== this` is not redundant; and
	   `Draggable.registry` is one WeakMap for the whole document, so without the root
	   test a panel drops into an editor block — or into the `panel(fn)` demo further
	   down the same page — and two Item documents cross. */
	drop_check(target){
		return target !== this && target.item?.root() === this.item.root() && !this.item.contains(target.item);
	}

	// ⚠ Sortable sizes the placeholder in px for a vertical list; here flex-basis does it.
	start(){ super.start(); this.placeholder.style.height = ""; }

	move(dx, dy, e){
		this.ghost.style.transform = `translate(${dx}px, ${dy}px)`;

		const edge = this.edge(e);
		if (edge) return this.show_edge(edge);

		const into = this.centre(e);
		return into ? this.show_centre(into) : this.show(this.locate(e));
	}

	/* ⚠ Alt is read at DROP, not at grab — a copy is a decision you make once you can see
	   where it is going, and reading `pointerup` means `Draggable` needs no new state and no
	   modifier tracking of its own. Alt-dropping leaves the original where it was and lands
	   a LIVE duplicate: `Panel.mirror()` shares what it holds and how it looks, never its
	   share of the row it lands in. Only the EDGE path copies — a plain reorder is
	   `Sortable`'s and moving one row within its own list is never a duplicate. */
	release(e){
		const edge = this.edge(e);
		const into = edge ? null : this.centre(e);
		if (!edge && !into) return super.release(e);

		this.end();
		const arrival = e.altKey
			? new Panel({ data: { grow: this.item.get("grow") } }).mirror(this.item)
			: this.item;

		// The MIDDLE nests: the target becomes a container holding what it already had and
		// the arrival beside it. `split()`, never `divide()` — a drop aimed at the inside of
		// a panel must not become a sibling just because the parent happened to run that way.
		if (into) return void into.item.split(into.item.get("dir"), arrival);

		edge.panel.divide(edge.dir, arrival, edge.before);
	}

	// The axis is the destination's, so one scan reads a row of columns or a column of
	// rows. ⚠ Grips are children too and carry no Item — hence the registry test.
	before(e, dragged){
		const row = this.item.get("dir") !== "col";
		const at = row ? e.clientX : e.clientY;

		for (const el of this.$items.el.children){
			const found = Draggable.registry.get(el);
			if (!found || el === dragged.view.el) continue;

			const box = el.getBoundingClientRect();
			if (at < (row ? box.left + box.width / 2 : box.top + box.height / 2)) return found.item;
		}
		return null;
	}

	/* Drop INSIDE: the outer fifth of a leaf's body splits that leaf on that side.
	   Tested before locate(), which the enclosing split would otherwise always answer. */
	edge(e){
		const target = this.under(e, box => box.$body && this.drop_check(box, e));
		if (!target) return null;

		const box = target.$body.el.getBoundingClientRect();
		const x = (e.clientX - box.left) / box.width, y = (e.clientY - box.top) / box.height;
		if (Math.min(x, 1 - x, y, 1 - y) > EDGE) return null;

		const down = Math.min(y, 1 - y) < Math.min(x, 1 - x);
		return { target, panel: target.item, dir: down ? "col" : "row", before: down ? y < 0.5 : x < 0.5 };
	}

	/* Drop INSIDE the middle: the target becomes a container. Tested after `edge()` and
	   before `locate()`, which the enclosing split would otherwise always answer — the same
	   ordering the edge zones already needed, for the same reason. ⚠ A LEAF only: a split
	   already is a container, and dropping into the middle of one means the row, not a
	   second nesting nobody asked for. */
	centre(e){
		const target = this.under(e, box => box.$body && this.drop_check(box, e));
		return target && !target.item.items.length ? target : null;
	}

	// A frame rather than a half — it says "inside this", where the edge preview says
	// "beside it", and the two must never read as the same drop.
	show_centre(target){
		Object.assign(this.placeholder.style, { position: "absolute", inset: "15%" });
		target.$body.el.append(this.placeholder);
	}

	// The placeholder IS the preview in both modes — `.panel-body` contains its own
	// absolutes (container-type), so the zone needs no element of its own.
	show_edge(edge){
		const inset = edge.dir === "col" ? (edge.before ? "0 0 60% 0" : "60% 0 0 0")
			: edge.before ? "0 60% 0 0" : "0 0 0 60%";

		Object.assign(this.placeholder.style, { position: "absolute", inset });
		edge.target.$body.el.append(this.placeholder);
	}

	show(where){
		Object.assign(this.placeholder.style, { position: "", inset: "" });
		super.show(where);
	}
}
