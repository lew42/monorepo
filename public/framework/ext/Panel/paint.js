import { place } from "./toolbar.js";
import { sizing } from "./size.js";
import { text_apply, text_commit } from "./persist.js";
import { repeat_apply } from "./repeat.js";
import { vocab } from "./vocab.js";

/* One panel's own DOM, never the tree — `workspace.js` owns the recursive `view()` and the
   structural redraw, and everything here rewrites what is already on screen. Imports flow
   one way: this file reads the surface modules, and none of them reads it back. */

/* The current DOM of every drawn panel, rewritten on each draw — so a control living in
   ANOTHER panel (the `properties` inspector) can reach the one it is editing. Weak, because
   a closed panel's entry should go when the panel does. `view()` is its only writer. */
export const views = new WeakMap();

/* One panel's chrome resynced from its own data: what the bar writes by hand as it clicks,
   for an inspector that is holding no part of its target. */
export function repaint(item){
	const seen = views.get(item);
	if (!seen) return item;

	sizing(item, seen.$panel);
	seen.$items?.[item.get("dir") === "col" ? "ac" : "rc"]("v");
	if (seen.$body) paint(item, seen.$body);
	return item;
}

/* Which way a leaf's body lays its own content out. One class, swapped — display.css says
   what each one means, so nothing here decides a layout. */
export function show(item, $body){
	const mode = item.get("display");
	return $body.rc("panel-d-block panel-d-flex panel-d-grid").ac("panel-d-" + mode);
}

/* One panel's body redrawn from its template — never the tree, so `set()` only saves. */
export function paint(item, $body){
	// ⚠ FIRST. A template redraw destroys everything the user typed into this body, and a
	// run still being typed into has not been written down yet — `text.js` saves on blur.
	text_commit($body);

	place($body, item.get("align"));
	show(item, $body);

	const known = vocab(item)[item.get("template")];
	// ⚠ A chosen name this vocabulary lacks draws NOTHING (two writers: the T menu, generate.js).
	if (!known && item.data.template) console.warn(`panel: no template named "${item.data.template}" — its body stays blank.`);

	// panel(fn)'s own content, until somebody picks from T — an explicit choice wins.
	const template = known ?? { draw(){} };
	const draw = item.data.template ? template.draw : item.draw ?? template.draw;

	$body.empty(() => draw($body, item));

	/* The template drew; now the user's own edits go back on top of it. ⚠ Synchronous, so a
	   template that draws synchronously never flashes its own copy — a LAZY one lands a tick
	   later and `text.js`'s own observer replays onto that. */
	text_apply($body, item);

	// Same hook, same reason: a repeat run's saved clones and its `+` tile, so a
	// synchronously-drawn template never flashes without them either.
	repeat_apply($body, item);
}

/* Live duplicates, on every `change` the root hears. ⚠ `change` carries key/value/old and
   NOT the item that raised it (`Item.emit`), so there is nothing here to match a master
   against — and with tens of panels, repainting every LINKED panel on any change is far
   cheaper than growing the event signature that four other listeners already read.
   ⚠ Masters are linked too: a shared key is written to the MASTER, so a duplicate edited on
   the copy would leave the original showing the old value — invisible while `tone` was the
   loudest shared key, obvious the moment `text` joined them. No echo: `repaint()` redraws
   DOM and never calls `set()`, so this cannot re-enter. */
export function repaint_mirrors(root){
	const masters = new Set();
	root.walk(panel => panel.data.mirror && masters.add(panel.data.mirror));
	root.walk(panel => (panel.data.mirror || masters.has(panel.id)) && repaint(panel));
}
