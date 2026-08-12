import View, { div } from "../../core/View/View.js";
import { head, body, source } from "./body.js";

/* The right drawer: one per document, opened by a selection. It PUSHES rather than
   covers — `--drawer` is the inline-end rail the app shell yields (framework.css),
   declared here on the same element the panel inherits its width from, so the
   reserved strip and the panel are one number. Design record: readme.md. */

const DRAWER = "19rem";

const contexts = new WeakMap();

let $panel, $shell, $sel, host;

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
	open();
}

export function deselect(){
	$sel?.rc("layout-selected");
	$sel = host = null;
	$panel?.rc("on");
	$shell?.style("--drawer", "");
}

function open(){
	$panel ||= build();
	$panel.ac("on");
	$shell.style("--drawer", DRAWER);

	$panel.empty(() => {
		head($sel, deselect);
		div.c("layout-body flex v", () => body($sel, contexts.get(host) || [], open));
	});
}

/* ⚠ Inside `.app`, not on `<body>`: colour-scheme is forced there (App/mode.js), so a
   panel on the body renders light while the page around it is dark — and `--drawer`
   is only read on `.app`, so the push would be lost too. */
function build(){
	$shell = new View({ el: document.querySelector(".app") || document.body, capture: false });

	return new View({ capture: false }).ac("layout-panel flex v")
		.on("click", refresh)
		.append_to($shell);
}

/* A re-render replaces the selection; its host does not move, so the panel lands
   there. If even the host is gone the drawer stays open and says so — shutting it
   mid-edit would jolt the whole shell. */
function refresh(){
	if ($sel?.el.isConnected){
		const $code = $panel.el.querySelector(".layout-code");
		if ($code) $code.textContent = source($sel);

	} else if (host?.isConnected){
		select(new View({ el: host, capture: false }));

	} else {
		$sel = host = null;
		open();
	}
}

document.addEventListener("keydown", e => e.key === "Escape" && deselect());
window.addEventListener("popstate", deselect);

// ⚠ Capture phase: a panel click can redraw the panel, and `closest()` on the target
// it detached would then read as a click outside.
document.addEventListener("click", e => {
	if (!e.target.closest?.(".layout-panel, .layout-region, .layout-bar")) deselect();
}, true);
