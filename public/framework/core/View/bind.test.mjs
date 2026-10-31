// view.bind: a view stays in step with one key of an Item (or a Property) and lets go when removed.
// Node: `node public/framework/core/View/bind.test.mjs`. Browser: /framework/core/Test/view/?file=core/View/bind.test.mjs
// Node has no DOM, so a tiny stand-in `document` is made below, and View.frame (the one-draw-per-frame
// scheduler) is replaced by a queue the test flushes by hand. A real browser uses its own document and raf.
import { test } from "../Test/Test.js";
import { View } from "./View.js";
import Item from "../Item/Item.js";
import { Property } from "../Property/Property.js";

class FakeEl {
	constructor(tag){ this.tag = tag; this.kids = []; this.parentNode = null; this._text = ""; this.writes = 0; this.style = {}; this.attrs = {};
		const set = new Set(); this.classList = { add: c => set.add(c), remove: c => set.delete(c), contains: c => set.has(c) }; }
	get textContent(){ return this._text; }
	set textContent(v){ this._text = String(v); this.writes++; this.kids = []; }
	appendChild(k){ k.parentNode = this; this.kids.push(k); return k; }
	append(...a){ a.forEach(x => x instanceof FakeEl ? this.appendChild(x) : (this._text += String(x))); }
	removeChild(k){ this.kids = this.kids.filter(x => x !== k); k.parentNode = null; }
	setAttribute(n, v){ this.attrs[n] = v; }
	getAttribute(n){ return this.attrs[n] ?? null; }
	set innerHTML(v){ this.kids.forEach(k => k.parentNode = null); this.kids = []; this._text = ""; }
	get innerHTML(){ return this._text; }
	get children(){ return this.kids; }
}
if (typeof document === "undefined") globalThis.document = { createElement: tag => new FakeEl(tag), head: new FakeEl("head") };

// Run fn with a manual frame queue; returns what the test needs to flush it.
function with_frames(fn){
	const real = View.frame, queue = [];
	View.frame = cb => queue.push(cb);
	const frames = { queued: () => queue.length, flush(){ const run = queue.splice(0); run.forEach(cb => cb()); return run.length; } };
	try { return fn(frames); } finally { View.frame = real; }
}

const listeners = item => item._on?.change?.length ?? 0;
const make_item = () => new Item({ data: { title: "one", note: "n" } });

test("bind runs now and again when its key changes", t => with_frames(frames => {
	const item = make_item(), seen = [];
	const view = new View();
	view.bind(item, "title", v => seen.push(v));
	t.eq(seen, ["one"], "ran once right away with the current value");
	item.set("title", "two");
	t.eq(seen, ["one"], "a change is drawn on the next frame, not instantly");
	frames.flush();
	t.eq(seen, ["one", "two"], "after the frame it ran with the new value");
	return view;
}));

test("bind ignores a change to another key", t => with_frames(frames => {
	const item = make_item(), seen = [];
	new View().bind(item, "title", v => seen.push(v));
	item.set("note", "changed");
	t.eq(frames.queued(), 0, "no frame was even asked for");
	frames.flush();
	t.eq(seen, ["one"], "fn did not run for the other key");
}));

test("bind with no fn writes the value as the view's text", t => with_frames(frames => {
	const item = make_item(), view = new View();
	view.bind(item, "title");
	t.eq(view.text(), "one", "text is the current value");
	item.set("title", "two"); frames.flush();
	t.eq(view.text(), "two", "text follows the key");
	return view;
}));

test("removing the view leaves zero listeners and stops the drawing", t => with_frames(frames => {
	const item = make_item(), seen = [], start = listeners(item), bound_before = View.bound_count;
	const host = new View(), view = new View().append_to(host);
	view.bind(item, "title", v => seen.push(v));
	t.eq(listeners(item), start + 1, "binding added one listener");
	item.set("title", "two");   // a draw is queued...
	view.remove();              // ...and the view leaves before the frame
	t.eq(listeners(item), start, "listener count is back to the start");
	frames.flush();
	t.eq(seen, ["one"], "the queued draw did not run after the view left");
	t.eq(View.bound_count, bound_before, "the live-bindings count is back to the start");
}));

test("emptying a parent releases the bindings of the views inside it", t => with_frames(frames => {
	const item = make_item(), start = listeners(item);
	const parent = new View();
	new View().append_to(parent).bind(item, "title");
	new View().append_to(parent).bind(item, "title");
	t.eq(listeners(item), start + 2, "two child views are bound");
	parent.empty();
	t.eq(listeners(item), start, "emptying the parent let both go");
}));

test("50 changes in one frame draw once", t => with_frames(frames => {
	const item = make_item(), seen = [], view = new View();
	view.bind(item, "title", v => { seen.push(v); view.text(v); });
	const writes_before = view.el.writes;
	for (let i = 1; i <= 50; i++) item.set("title", "t" + i);
	t.eq(frames.queued(), 1, "one frame was asked for, not fifty");
	frames.flush();
	t.eq(seen, ["one", "t50"], "fn ran for the start and once for the last value");
	t.eq(view.el.writes - writes_before, 1, "the element was written once");
	return view;
}));

test("a plain Property binds the same way, and a Property.of handle too", t => with_frames(frames => {
	const hover = new Property(false), seen = [];
	const view = new View();
	const off = view.bind(hover, v => seen.push(v));
	hover.set(true); frames.flush();
	t.eq(seen, [false, true], "a volatile Property is bound now and on change");
	t.eq(hover.listeners(), 1, "one listener while bound");
	off();
	t.eq(hover.listeners(), 0, "the returned unbind lets go");

	const item = make_item(), seen2 = [];
	new View().bind(Property.of(item, "title"), v => seen2.push(v));
	item.set("title", "two"); frames.flush();
	t.eq(seen2, ["one", "two"], "a Property.of handle follows the item's key");
}));

test("a throwing fn does not block a second binding", t => with_frames(frames => {
	const item = make_item(), seen = [], real_error = console.error, logged = [];
	console.error = (...a) => logged.push(a);
	try {
		new View().bind(item, "title", () => { throw new Error("boom"); });
		new View().bind(item, "title", v => seen.push(v));
		item.set("title", "two"); frames.flush();
		t.eq(seen, ["one", "two"], "the second binding still drew");
		t.ok(logged.length >= 2, "the failures were logged, not swallowed silently");
		t.ok(item.get("title") === "two", "the set itself went through");
	} finally { console.error = real_error; }
}));

test.optional("edge: a child's change to the same key does not draw the child's value", t => with_frames(frames => {
	const parent = new Item({ data: { title: "parent" } }), child = new Item({ data: { title: "child" } });
	child.parent = parent;
	const view = new View();
	view.bind(parent, "title");
	child.set("title", "child 2"); frames.flush();
	t.eq(view.text(), "parent", "the view shows the parent's own title");
}));
