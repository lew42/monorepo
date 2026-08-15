import { View } from "/framework/core/View/View.js";

/* css: .drag-handle, .dragging, .drag-source, .drag-ghost, .drag-placeholder, .drag-items */
View.stylesheet(import.meta, "draggable.css");

export default class Draggable {

	constructor(...args){ this.assign(...args); this.initialize(); }

	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.handle ??= this.view;
		Draggable.registry.set(this.view.el, this);

		if (!this.handle) return;   // `handle: false` — a drop target, not a grip

		// ⚠ Own bound references, not view.on(): the DOM removes a listener by
		// reference and on() registers a wrapper arrow nothing can name again.
		this.handlers = {
			pointerdown:   e => this.grab(e),
			pointermove:   e => this.dragging && this.drag(e),
			pointerup:     e => this.dragging && this.release(e),
			pointercancel: () => this.cancel(),
		};
		for (const type in this.handlers)
			this.handle.el.addEventListener(type, this.handlers[type]);

		this.escape = e => e.key === "Escape" && this.cancel();
		this.handle.ac("drag-handle");
	}

	// ⚠ Capture is held for the WHOLE drag, so every later event lands back on the
	// handle — there is no document listener to leak and no bookkeeping to get wrong.
	grab(e){
		e.preventDefault();
		this.handle.el.setPointerCapture(this.pointer = e.pointerId);
		window.addEventListener("keydown", this.escape);

		this.dragging = true;
		this.from = { x: e.clientX, y: e.clientY };
		this.view.ac("dragging");
		this.start(e);
	}

	drag(e){ this.move(e.clientX - this.from.x, e.clientY - this.from.y, e); }

	release(e){
		const target = this.under(e);
		this.end();
		if (target && this.drop_check(target, e)) this.drop(target, e);
		else this.restore();
	}

	// pointercancel and Escape share this path: put the DOM back, commit nothing.
	cancel(){
		if (!this.dragging) return;
		this.end();
		this.restore();
	}

	end(){
		this.dragging = false;
		this.view.rc("dragging");
		window.removeEventListener("keydown", this.escape);
		if (this.handle.el.hasPointerCapture(this.pointer))
			this.handle.el.releasePointerCapture(this.pointer);
	}

	// ⚠ elementsFromPoint, not e.target: the dragged element keeps its pointer-events
	// and sits right under the cursor, so it is filtered out here by hand.
	under(e, ok = () => true){
		for (const el of document.elementsFromPoint(e.clientX, e.clientY)){
			if (this.view.el.contains(el)) continue;
			const found = Draggable.registry.get(el);
			if (found && ok(found)) return found;
		}
		return null;
	}

	drop_check(target, e){ return target !== this; }

	start(e){}
	move(dx, dy, e){}
	drop(target, e){}
	restore(){}

	destroy(){
		for (const type in this.handlers ?? {})
			this.handle.el.removeEventListener(type, this.handlers[type]);
		window.removeEventListener("keydown", this.escape);
		this.handle?.rc("drag-handle");
		Draggable.registry.delete(this.view.el);
	}
}

Draggable.registry = new WeakMap();

export { Draggable };
