import { place } from "./toolbar.js";
import { word_vars } from "./glyphs.js";
import { sizing } from "./size.js";
import { text_apply, text_commit } from "./persist.js";
import { repeat_apply } from "./repeat.js";
import { vocab } from "./vocab.js";

/* One panel's own DOM, never the tree — `workspace.js` owns the recursive `view()` and the
   structural redraw, and everything here rewrites what is already on screen. Imports flow
   one way: this file reads the surface modules, and none of them reads it back. */

/* EVERY live rendering of every drawn panel — a root mounted in N boxes (the playground's
   seven) has N — so a control living in ANOTHER panel, or the rail, can reach the one it is
   editing wherever it is shown. Weak, because a closed panel's entries should go when the
   panel does. `view()` (workspace.js) is the only writer; it prunes the detached ones as it
   adds. ⚠ It held ONE entry per item until 2026-08-19 — the last box drawn — so a repaint
   could land on a hidden twin pane while the box under the pointer showed nothing (the
   owner: "works on refresh, not on select"; the sweep's and the selection task's finding). */
export const views = new WeakMap();
export const views_of = item => [...(views.get(item) ?? [])].filter(v => v.$panel.el.isConnected);
// One rendering, for a reader that only needs a sample — the knob reading a computed value.
export const view_of = item => views_of(item)[0];

/* One panel's chrome resynced from its own data, in every box that shows it: what the bar
   writes by hand as it clicks, for an inspector that is holding no part of its target. */
export function repaint(item){
	views_of(item).forEach(seen => {
		sizing(item, seen.$panel);
		seen.$items?.[item.get("dir") === "col" ? "ac" : "rc"]("v");
		if (seen.$body) paint(item, seen.$body);
	});
	return item;
}

/* Which way a leaf's body lays its own content out: one class, plus the words that tune it
   as one custom property each (`glyphs.js`'s `WORDS` says which). display.css says what
   every one of them means, so nothing here decides a layout — and this stays the SINGLE
   writer of both, which is what lets one file read a body's arrangement off one source. */
export function show(item, $body){
	const mode = item.get("display");
	return $body.rc("panel-d-block panel-d-flex panel-d-grid").ac("panel-d-" + mode).style(word_vars(item));
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
