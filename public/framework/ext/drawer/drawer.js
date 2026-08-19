import View, { div, button } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";

/* The right rail — one per document, and it PUSHES rather than covers: `--drawer` is the
   inline-end strip `.app` yields (framework.css), declared here on the same element the
   rail inherits its width from, so the reserved strip and the rail are one number.

   Imports View and the resize edge it shares with dev/DevBar, nothing else. Anything may
   open it and it knows none of them — which is the whole reason it left ext/layout, where
   it was reachable only by that module's own selection. Design record: readme.md.
   css: .drawer, .drawer-head, .drawer-slot, .drawer-body, .drawer-x. */
View.stylesheet(import.meta, "drawer.css");

/* ⚠ TWO tokens, because `--drawer` doubles as open/shut — `close()` clears it, which
   would throw away a width you dragged. The width lives in `--drawer-w`, `--drawer`
   reads through to it, and one localStorage key carries it across a reload. */
const WIDE = "var(--drawer-w, 19rem)";
const KEY = "lew42-drawer-w";
const MIN = 200;

/* ⚠ The page keeps its 26rem reading column: past that `.app` stops widening its push
   (`--rail-floor`, framework.css) and the rail would be wider than the strip it reserves
   — the two numbers that have to stay one number. drawer.css's sheet breakpoint mirrors
   the same 26rem by hand. */
const FLOOR = 26 * parseFloat(getComputedStyle(document.documentElement).fontSize);

let $rail, $shell, $slot, $body, fill;

/* Show something in the rail, opening it if it was shut. `fn($slot, $body)` fills the two
   slots with `empty(fn)`; the ✕ beside `$slot` is the rail's own and is never handed over,
   so nothing a caller draws can leave the rail with no way out. Returns the rail. */
export default function drawer(fn){
	build();
	fill = fn;

	$rail.ac("on");
	$shell.style("--drawer", WIDE);
	drawer.refresh();

	return $rail;
}

// The same content again, for a caller whose subject changed under it.
drawer.refresh = () => { if (fill && drawer.showing()) fill($slot, $body); };

/* ⚠ The ONLY thing that shuts the rail (the owner, 2026-08-16). It used to close whenever the
   selection cleared, which took the reader's scroll position and whatever they were
   reading with it every time they clicked the page. Losing a selection is not a reason to
   lose the rail — a caller redraws it saying so instead. */
drawer.close = () => {
	$rail?.rc("on");
	$shell?.style("--drawer", "");
};

drawer.showing = () => !!$rail?.hc("on");

// What the grip writes on every move: clamp it, put it on the shell, hand it back so the
// number that gets remembered is the one that was actually applied.
function size(px){
	const w = Math.round(Math.max(MIN, Math.min(px, innerWidth - FLOOR)));
	$shell.style("--drawer-w", w + "px");
	return w;
}

/* ⚠ Inside `.app`, not on `<body>`: colour-scheme is forced there (App/mode.js), so a rail
   on the body renders light while the page around it is dark — and `--drawer` is read on
   `.app` alone, so the push would be lost too. */
function build(){
	if ($rail) return;

	$shell = new View({ el: document.querySelector(".app") || document.body, capture: false });
	$rail = new View({ capture: false }).ac("drawer flex v").append_to($shell);

	// The width you left it at, before the first paint of the rail.
	const saved = localStorage.getItem(KEY);
	if (saved) $shell.style("--drawer-w", saved);

	// The head is pinned and the body scrolls under it — a rail whose ✕ scrolls away is a
	// rail you cannot shut.
	$rail.append(() => {
		div.c("drawer-head flex v-center split", () => {
			$slot = div.c("drawer-slot flex v-center");
			button.c("drawer-x", "✕").click(drawer.close).attr("title", "Close");
		});

		$body = div.c("drawer-body flex v");

		// ⚠ The resize edge lives INSIDE the rail's box (ext/grip), so a shut rail takes
		// it off screen with it — a strip hanging past this edge would pointer-capture
		// clicks on every page for as long as the drawer existed.
		grip({ write: size, done: w => localStorage.setItem(KEY, w + "px") });
	});
}

export { drawer };
