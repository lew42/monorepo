import Draggable from "/framework/ext/Draggable/Draggable.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import { div } from "/framework/core/View/View.js";

/* css: .panel-grip — panel.css, loaded by workspace.js's View.stylesheet(). */

const EDGE = 0.2, MIN = 40;

/* The divider. It reads pixels and writes GROW FRACTIONS to both neighbours, so the
   split keeps its proportions when the window changes size. */
export function grip(){
	return div.c("panel-grip").on("pointerdown", function(e){
		e.preventDefault();

		const el = this.el, prev = el.previousElementSibling, next = el.nextElementSibling;
		const a = Draggable.registry.get(prev)?.item, b = Draggable.registry.get(next)?.item;
		if (!a || !b) return;

		const row = !el.parentElement.classList.contains("v");
		const from = row ? e.clientX : e.clientY;
		const [pa, pb] = [prev, next].map(node => row ? node.offsetWidth : node.offsetHeight);
		const total = a.get("grow") + b.get("grow");

		let ga = a.get("grow"), gb = b.get("grow");
		el.setPointerCapture(e.pointerId);

		coalesce(el, ev => {
			const delta = Math.max(MIN - pa, Math.min(pb - MIN, (row ? ev.clientX : ev.clientY) - from));
			ga = round(total * (pa + delta) / (pa + pb));
			gb = round(total - ga);
			prev.style.setProperty("--panel-grow", ga);
			next.style.setProperty("--panel-grow", gb);
		});

		el.addEventListener("pointerup", () => { a.set("grow", ga); b.set("grow", gb); }, { once: true });
	});
}

const round = n => Math.round(n * 1000) / 1000;

/* ⚠ A pointer outruns the screen: a 240Hz mouse fires four moves per paint and one
   move here re-lays-out the whole workspace. Lifted from ext/demo/stage.js rather than
   imported — a widget has no business depending on the demo chrome. */
export function coalesce(el, move){
	let event, frame;

	const track = ev => { event = ev; frame ??= requestAnimationFrame(() => { frame = null; move(event); }); };

	el.addEventListener("pointermove", track);
	el.addEventListener("pointerup", () => el.removeEventListener("pointermove", track), { once: true });
}

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
		edge ? this.show_edge(edge) : this.show(this.locate(e));
	}

	release(e){
		const edge = this.edge(e);
		if (!edge) return super.release(e);

		this.end();
		edge.panel.divide(edge.dir, this.item, edge.before);
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
