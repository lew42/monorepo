import View from "/framework/core/View/View.js";
import { vocab } from "./vocab.js";
import { grouped } from "./size.js";

/* Focus is a SELECTION, not document state: it rides the root panel as an id, exactly like
   `templates` rides it, and never reaches `toJSON`. An entry that READS it (`focus: true` —
   the inspector) never takes it, or an inspector clicked into would start inspecting itself.

   ⚠ THE INVARIANT (2026-08-19): **one selected panel per PAGE**, and every live view of it
   wears the ring — a page draws sixteen workspaces and a root draws into seven viewport
   boxes, so "per root" and "per box" were both too small and left rings behind. This file
   is the only writer of `.panel.focus` and `.panel-hover`; `rings()` is the only place a
   ring is written, `mark()` the only place a hover is. Record: doc/focus.md.

   css: .panel-hover (focus.css). The `.panel.focus` ring rule is still panel.css's. */
View.stylesheet(import.meta, "focus.css");

export const focused = item => { const root = item.root(); return root.find(root.focus); };

export const inspects = item => !!vocab(item)[item.get("template")]?.focus;

/* Two document events, and an import in NEITHER direction. `panel-focus` says the selection
   moved — the dev rail listens and points ext/DesignTool at the panel; `panel-unfocus` is
   anyone asking for it back, which is what Escape asks by hand. An `Item` event only reaches
   things holding the root, and nothing outside a workspace ever does. */
const announce = item => document.dispatchEvent(new CustomEvent("panel-focus", { detail: item ?? null }));

/* Clicking OFF: a click on anything that is not a workspace, and not a surface that acts on
   the selection — the rail, the workspace bar (its `+` adds beside the focused panel), the
   flow strip, the dev rail, the top layer — lets the selection go. doc/focus.md. */
const OFF = ".panel-workspace, .panel-workspace-wrap, .drawer, .panel-flow-bar, .dev-bar, dialog, [popover]";

/* ---- the page's boxes ------------------------------------------------------------------
   Every box a root currently draws into. `selection()` runs once per box (workspace.js's
   `mount()`), so this file already sees them all — no registry to keep in sync. */
const drawn = new WeakMap();     // root → Set of $root boxes
const wired = new WeakSet();     // roots whose document listeners are bound (once, not per box)

const live = root => {
	const set = drawn.get(root) ?? new Set();
	set.forEach($box => $box.el.isConnected || set.delete($box));
	return [...set];
};

/* The tree and every box's DOM come out of the SAME walk (`view()`), so pairing them needs
   no ids: one recursion hands back both directions at once. Rebuilt per gesture rather than
   cached — a redraw replaces every element, and tens of panels is nothing to walk. */
function pair(root){
	const els = new Map(), items = new Map();

	const walk = (item, el) => {
		if (!el) return;
		els.set(item, [...(els.get(item) ?? []), el]);
		items.set(el, item);

		const $kids = el.querySelector(":scope > .panel-items");
		if (!$kids) return;
		// ⚠ Filtered: `.panel-items` also holds grips, the insert bar and a drag placeholder.
		const views = [...$kids.children].filter(kid => kid.classList.contains("panel"));
		item.items.each((kid, i) => walk(kid, views[i]));
	};

	live(root).forEach($box => walk(root, $box.el.querySelector(":scope > .panel")));
	return { els, items };
}

/* THE one writer of the ring. Every ring on the DOCUMENT goes — that is the page-wide half
   — and then every live view of `target` takes one, so a root drawn into seven viewport
   boxes shows it in whichever box is on screen instead of in the last one drawn. */
function rings(root, target){
	document.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
	if (target) pair(root).els.get(target)?.forEach(el => el.classList.add("focus"));
}

/* The ancestor chain from `item` up to its root, OUTERMOST first, filtered to the splits
   wearing `group: on` (size.js's `grouped()`) — the one list both a click and Escape walk.
   Empty on any path with no group at all, which is plain innermost-wins (2026-08-19). */
const groups_on = item => {
	const path = [];
	for (let n = item; n; n = n.parent) path.unshift(n);
	return path.filter(grouped);
};

/* Where a click on `item` actually lands (2026-08-19, groups). A group is a door: the first
   click on anything inside an unopened one opens the OUTERMOST group on the path instead of
   the panel itself; a click already inside the focused group steps one group further in, or
   the leaf once no deeper group is left; a click on the panel already focused is a no-op —
   checked FIRST, because without it a re-click of an already-focused LEAF (never itself a
   group) would read as "nothing selected on this path" and jump back OUT to the outermost
   group. Off every path with no group, this is `item` — exactly what a plain click always
   did. ⚠ The HOVER reads this too (`mark()`): one function, two readers, so what lights up
   and what a click takes can never disagree. doc/focus.md. */
function drill(item){
	const root = item.root();
	const current = root.focus ? root.find(root.focus) : null;
	if (current === item) return item;

	const groups = groups_on(item);
	if (!groups.length) return item;

	const idx = groups.indexOf(current);
	if (idx === -1) return groups[0];
	return idx < groups.length - 1 ? groups[idx + 1] : item;
}

/* Escape's target: one level OUT of `drill()`, exactly reversed — the group just inside the
   current selection, then the one outside that, then nothing (a real unfocus, at the top).
   A leaf or a selection with no group above it unfocuses on the first press, same as always. */
function step_out(item){
	const groups = groups_on(item);
	const idx = groups.indexOf(item);

	if (idx !== -1) return idx > 0 ? groups[idx - 1] : null;
	return groups.length ? groups[groups.length - 1] : null;
}

/* The one write, and it repeats itself on purpose: landing on the panel ALREADY selected
   repaints the ring and re-announces. ⚠ It used to return early — measured 2026-08-19, that
   is how the rail ended up showing something else while the ring stayed put: `ext/layout`'s
   own document listener redraws the shared rail on EVERY click (its capture-phase
   `deselect()`), so a click that announces nothing leaves the rail owned by somebody else.
   Announcing every time is also what repairs a ring a redraw or another root left behind. */
function land(root, target){
	root.focus = target.id;
	rings(root, target);
	mark();
	root.emit("focus", target);
	announce(target);
}

/* Letting go. `tell: false` is another root announcing that IT has the selection now — the
   event that made us let go is already in flight, and a second one would fight it. */
function drop(root, tell = true){
	if (!root.focus) return;
	delete root.focus;

	live(root).forEach($box => $box.el.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus")));
	mark();
	root.emit("focus", null);
	if (tell) announce(null);
}

// Escape: one group out, then the next, then a real drop.
function back_out(root){
	if (!root.focus) return;
	const current = root.find(root.focus);
	const next = current && step_out(current);
	next ? land(root, next) : drop(root);
}

export function focus(item){
	land(item.root(), drill(item));
}

/* ---- hover: "this is what a click selects" ---------------------------------------------
   One pointer, one page, so where it rests is module state — and a SELECTION change re-asks
   (`mark()` from `land()`/`drop()`), because drilling into a group changes the answer with
   the pointer standing still. */
let pointed;

function hover(root, el){
	if (pointed?.el === el) return;
	pointed = el ? { root, el } : null;
	mark();
}

function mark(){
	document.querySelectorAll(".panel-hover").forEach(el => el.classList.remove("panel-hover"));
	if (!pointed) return;

	const { items } = pair(pointed.root);
	const item = items.get(pointed.el);
	// An inspector's click takes no selection (workspace.js), so nothing may promise one.
	if (!item || inspects(item)) return;

	const target = drill(item);
	// The target is `item` or an ancestor of it, so it is on the way up from this box's own
	// element — never `views.get()`, which would light a panel in some other box.
	for (let el = pointed.el; el; el = el.parentElement?.closest(".panel"))
		if (items.get(el) === target)
			// The selected panel already wears the strong ring; a second, weaker one on top
			// of it says nothing.
			return void (el.classList.contains("focus") || el.classList.add("panel-hover"));
}

/* Every way a workspace GAINS or LOSES its selection, wired once per mount. */
export function selection(root, $root){
	const set = drawn.get(root) ?? drawn.set(root, new Set()).get(root);
	set.add($root);

	// Per BOX, because the pointer is in exactly one of them.
	$root.el.addEventListener("mouseover", e => hover(root, e.target.closest?.(".panel")));
	$root.el.addEventListener("mouseleave", () => hover(root, null));

	/* ⚠ Everything below is per ROOT, not per box. Seven viewport boxes used to bind seven
	   copies: the first Escape stepped out of a group, the second copy read the NEW state and
	   stepped out again, and the copies that ran after `root.focus` was gone returned early
	   with their own box's ring still on screen. */
	if (wired.has(root)) return;
	wired.add(root);

	/* Focus clears when its panel leaves the tree, and nothing takes its place. ⚠ In a
	   microtask, because `move()` is a remove followed by an insert — a drag of the focused
	   panel would otherwise unfocus it mid-flight. */
	root.on("remove", () => queueMicrotask(() => {
		if (!root.focus || root.find(root.focus)) return;
		drop(root);
	}));

	/* ⚠ On the document, and unbinding itself once this root draws nothing that is still in
	   the document: the root outlives every DOM it draws, so nothing else is ever going to
	   remove them. */
	const listen = (event, fn, capture) => document.addEventListener(event, function hear(e){
		if (!live(root).length) return document.removeEventListener(event, hear, capture);
		fn(e);
	}, capture);

	listen("keydown", e => { if (e.key === "Escape") back_out(root); });
	listen("panel-unfocus", () => back_out(root));

	/* The page-wide half, with no registry: ANOTHER root announced a selection (or a drop),
	   so this one lets go — quietly, since the announcement is already travelling. */
	listen("panel-focus", e => { if (e.detail?.root() !== root) drop(root, false); });

	/* Clicking off. A click that acts on the selection is guarded by OFF; everything else —
	   page prose, a heading, the background — means "nothing, please". ⚠ CAPTURE phase, the
	   same trap `ext/layout` records: a control that redraws its own bar (the Workspace's
	   viewport buttons call `draw_bar()`) has DETACHED the clicked button by the time a
	   bubbling listener runs, and `closest()` on a detached node reads as a click outside —
	   measured 2026-08-19: every viewport switch silently dropped the selection. */
	listen("click", e => { if (!e.target.closest?.(OFF)) drop(root); }, true);
}
