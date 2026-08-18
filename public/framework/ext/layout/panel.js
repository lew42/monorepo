import View from "../../core/View/View.js";
import drawer from "../drawer/drawer.js";
import { head, body, source } from "./body.js";

/* The SELECTION, and what it reads as in the rail. The rail itself is `ext/drawer` now
   (2026-08-16) — one per document, opened by anything, so a panel's properties and a
   selected element's words are the same surface rather than two. This file owns what is
   selected, what registered extra content above it, and redrawing after an edit.
   Design record: readme.md. */

const contexts = new WeakMap();

let $sel, host, wired;

// Extra panel content, drawn while `el` — or anything inside it — is the selection.
// The call site that knows what belongs there registers it; no marker is interpreted.
export function context(el, fn){
	el = el.el || el;
	contexts.set(el, [...(contexts.get(el) || []), fn]);
}

// The nearest registration at or above the selection — and what outlives it.
const host_of = el => { while (el && !contexts.has(el)) el = el.parentElement; return el; };

export function select($el){
	$sel?.rc("layout-selected");
	$sel = $el.ac("layout-selected");
	host = host_of($el.el);
	show();
}

/* ⚠ Deselecting no longer CLOSES the rail (the owner, 2026-08-16). It used to, and clicking
   anywhere on the page then threw away the reader's scroll position along with whatever
   they were reading. The selection clears, the rail says so, and only its ✕ shuts it —
   which is also why this no longer opens a rail that was already closed. */
export function deselect(){
	$sel?.rc("layout-selected");
	$sel = host = null;
	redraw();
}

/* ⚠ The difference is whether it may OPEN. `show()` opens — that is what selecting
   means. `redraw()` only restates a rail that is already up, and every path that is not
   a selection uses it: deselecting, and the click listener below, which fires on the ✕
   itself and reopened the rail a millisecond after it shut. */
const redraw = () => { if (drawer.showing()) show(); };

function show(){
	const $rail = drawer(($slot, $body) => {
		$slot.empty(() => head($sel));
		$body.empty(() => body($sel, contexts.get(host) || [], show));
	});

	// ⚠ Once, not per fill: `on()` adds a listener every call, and this one redraws.
	if (!wired){ wired = true; $rail.on("click", refresh); }
}

/* A re-render replaces the selection; its host does not move, so the rail lands there. If
   even the host is gone the rail stays open and says so — shutting it mid-edit would jolt
   the whole shell. */
function refresh(){
	if ($sel?.el.isConnected){
		const $code = document.querySelector(".drawer .layout-code");
		if ($code) $code.textContent = source($sel);

	} else if (host?.isConnected){
		select(new View({ el: host, capture: false }));

	} else {
		$sel = host = null;
		redraw();
	}
}

document.addEventListener("keydown", e => e.key === "Escape" && deselect());
window.addEventListener("popstate", deselect);

// ⚠ Capture phase: a rail click can redraw the rail, and `closest()` on the target it
// detached would then read as a click outside.
document.addEventListener("click", e => {
	if (!e.target.closest?.(".drawer, .layout-region, .layout-bar")) deselect();
}, true);
