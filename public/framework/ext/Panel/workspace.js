import View, { div } from "/framework/core/View/View.js";
import Panel from "./Panel.js";
import { PanelDrag, handle } from "./PanelDrag.js";
import { grip } from "./grip.js";
import { zoom_scrub } from "./tools.js";
import { edges } from "./split.js";
import { insert_bar } from "./insert.js";
import { sizing } from "./size.js";
import { scatter, resolve } from "./random.js";
import { vocab, tools } from "./vocab.js";
import { focus, focused, inspects, selection } from "./focus.js";
import { overlays, drain } from "./overlays.js";
import { views, paint, repaint, show, repaint_mirrors } from "./paint.js";
import { record } from "./flow.js";
import Workspace from "./Workspace/Workspace.js";

/* The two doors, the redraw, and the recursive `view()`. Its four neighbours — `vocab.js`,
   `focus.js`, `overlays.js`, `paint.js` — are read by this file and never read it back;
   readme.md says what each one is for.

   ⚠ Imports `Workspace/Workspace.js` for `workspace()`'s door — and `Workspace.js` imports
   `mount` back, below. A real cycle, deliberately: each side only USES the other's binding
   inside a function body, never at module-evaluation time, which is the one shape ESM
   resolves safely. Workspace/doc/decisions.md.

   css: .panel-workspace, .panel, .panel-body, .panel-items — plus `.drag-placeholder`, whose
   module is imported above, `.section-band`, which reaches a panel through templates.js's
   lazy import, and `.panel-controls`, a payload's claim that the body reserve `--panel-bar-h`
   for its top edge. `.panel-grip` is grip.css's.

   ⚠ IT LOADS `controls.css` TOO, AND THAT FILE USED TO BE `toolbar.css` — because the bar
     it was named after is deleted (2026-09-18). What is in it now is the ONE button box the
     rail, a seam's menu and the drag grip all share, and the strip the grip rides on. The
     sheet had no other owner once `toolbar.js` went; this file builds `.panel-bar` and is
     the module's front door, so it asks for it. doc/decisions.md. */
View.stylesheet(import.meta, "panel.css");
View.stylesheet(import.meta, "controls.css");

/* One managed leaf: a name from the T vocabulary, or content the call site draws — or a
   whole `Panel` tree, which is what `structure(seed)` hands back. No saver, so save()
   resolves false and nothing a visitor picks survives a reload. */
export default function panel(seed){
	const made = seed instanceof Panel ? seed
		: typeof seed === "string" ? new Panel({ data: { template: seed } })
		: new Panel({ draw: seed });

	return mount(made, div.c("panel-workspace flex"));
}

/* The persisted workspace — `Workspace`'s thin door. Every existing caller (`ext/editor`,
   `ext/files`, `space/compose`, this module's own page.js) keeps the exact call it always
   made; what comes back now carries a bar above the root instead of being the root's own
   box. Workspace/readme.md. */
export function workspace(options = {}){
	return new Workspace(options).$view;
}

/* One redraw per structural verb. ⚠ Module scope rather than mount's closure because `roll`
   needs it too, and one synchronous mutation window can never overlap another workspace's —
   nothing awaits between raising the flag and lowering it. */
let drawing;

/* Every box a ROOT currently draws into. `mount()` used to assume one; a `Workspace` may
   call it again for a second viewport of the SAME root — the readme's old trap ("three live
   mounts share one document — the last writer wins") was three INDEPENDENT roots each
   loading their own copy of one file. This is the fix: one root, one listener set, every
   box in its own Set redrawn together. Workspace/doc/decisions.md. */
const roots = new WeakMap();

/* One listener at the root, because Item events bubble. ⚠ Only STRUCTURE redraws: a
   `change` must not, or a chip click replaces the element its own control is holding.
   `flow` defaults true — every caller before `Workspace` existed got a recorder for free,
   and this keeps `panel()` and any other direct caller exactly as they were; `Workspace`
   is the one caller that ever passes `false`. */
export function mount(root, $root, { flow = true } = {}){
	const set = roots.get(root);

	// An EXTRA view of a root already wired: join its Set, draw once, done — the
	// listeners below are one-time, at the root, and would double every save otherwise.
	if (set){
		set.add($root);
		selection(root, $root);
		$root.empty(() => { view(root); });
		return $root;
	}

	const fresh = new Set([$root]);
	roots.set(root, fresh);

	const draw = () => {
		if (drawing) return;                    // resolve() mutates; its adds must not re-enter
		drawing = true;
		resolve(root, vocab(root));
		drawing = false;
		drain(root);                            // the PREVIOUS generation's observers, before it's gone
		fresh.forEach($r => $r.empty(() => { view(root); })); // block body: a returned View is re-appended
	};

	["change", "add", "remove"].forEach(event => root.on(event, () => root.save()));
	["add", "remove"].forEach(event => root.on(event, draw));

	root.on("change", () => repaint_mirrors(root));
	selection(root, $root);

	draw();

	// ⚠ AFTER the first draw, so the baseline frame is what a reader actually sees:
	// `resolve()` rolls every leaf still saying "random", and those adds are the seed
	// arriving, not a step somebody took. flow.js, doc/flow.md.
	if (flow) record(root, $root);

	return $root;
}

function view(item){
	let $bar, $handle, $body, $items;
	const dir = item.get("dir") === "col" ? "col" : "row";
	const t = tools(item);

	const $panel = div.c("panel flex v", () => {
		$bar = div.c("panel-bar", () => { if (item.parent) $handle = handle(); });

		if (item.leaf()){
			// ⚠ Here, where the body is created — `paint()` empties it but never replaces it.
			$body = div.c("panel-body");
			overlays(item, $body);
		} else {
			// ⚠ A block body: `each()` returns the List, and append_fn appends a returned
			// value — a bare `[object Object]` text node in every split.
			$items = div.c("panel-items flex").ac(dir === "col" && "v")
				.append(() => { item.items.each((kid, i) => { if (i) grip(); view(kid); }); });

			// The `+` that rides the split's gaps — a sibling of the children, absolutely
			// positioned, so offering it never nudges the layout it offers to change.
			if (t.insert) $items.append(() => insert_bar(item, $items));
		}
	}).style("--panel-grow", item.get("grow"))
		.ac(item.id === item.root().focus && "focus")
		/* A panel's own bar or body, and nothing else: innermost wins without anyone
		   stopping an event, and ⚠ a GRIP is excluded — pointer capture retargets the
		   click at the end of a resize, and a drag between two panels was focusing the
		   split that holds them. */
		.click(e => {
			if (e.target.closest(".panel-bar, .panel-body")?.parentElement !== $panel.el) return;
			if (!inspects(item)) focus(item);
		});

	/* Sizing is real LAYOUT, not a tool — never gated by `tools(item)`, because a workspace
	   with every overlay off still has to know how wide its panels are. */
	sizing(item, $panel);

	/* ── THE STRIP AT THE TOP OF A PANEL, AND WHAT IS LEFT ON IT ──────────────────
	   A drag grip. That is all.

	   ⚠ THE FLOATING BAR IS DELETED (2026-09-18, `toolbar.js` with it). It carried FIFTEEN
	     icons in 2026-08-19 and was cut to four — split into columns, split into rows, tune,
	     close — because "nobody could remember them and half of them were clipped". Those
	     four are now four ROWS in the rail (`properties.js`): split is one row of two
	     buttons, close is the rail's own Close row, and `tune` is not needed because
	     selecting a panel opens the rail (`tools.js`). The reason is the one this realm has
	     measured twice: a control that floats over the thing it controls is not a control —
	     it covers what you are trying to read, and it appears and disappears under the
	     pointer. `doc/decisions.md`, and the report at `ai/2026-09-17/editor-select/`.

	   ⚠ WHAT THE BAR'S `T` OBJECT CARRIED IS NOT LOST: `offer()`, `vocab()`, `roll()`,
	     `sow()` and `copy()` are all still reachable — the rail draws every one of those
	     words, and the seam's own menu draws the sizes. The one thing that had no other home
	     was the magnifier, which never lived in the row anyway (it draws ON the body), so it
	     is built here directly. */
	if ($body && t.zoom) $bar.append(() => { zoom_scrub(item, $body); });

	// ⚠ Out here, not in the builder above: `edges()` takes `$panel`, which the builder's
	// own callback runs too early to see — the const is assigned only once `div.c()` returns.
	if ($body && t.edges) $panel.append(() => edges(item, $panel));

	if ($body) paint(item, $body);

	// Join this item's renderings — and let go of the ones a redraw has already detached.
	const shown = views.get(item) ?? views.set(item, new Set()).get(item);
	shown.forEach(v => v.$panel.el.isConnected || shown.delete(v));
	shown.add({ $panel, $body, $items });
	new PanelDrag({ view: $panel, handle: $handle ?? false, $items, $body, item });
	return $panel;
}

/* ⚠ `roll()` AND `sown()` ARE DELETED (2026-09-18) — the two functions the bar's `T`
     object carried. They were already dead: `toolbar.js` read `T.tool` and nothing else,
     so `T.roll`, `T.sow`, `T.copy`, `T.names`, `T.entries`, `T.display` and `T.repaint`
     had no reader at all, and the rail (`properties.js`) has its own door to every one of
     those words. They went out with the bar rather than sitting here unreachable.
     `doc/decisions.md`. */

export { panel, Panel, scatter, vocab, tools, focused, repaint, show };
