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
	// Said out loud, so a caller that wrote state somewhere else (the menu's `?drawer=`
	// word in the url, tabs.js) can take it back when the ✕ shuts the rail.
	window.dispatchEvent(new Event("drawer-close"));
};

drawer.showing = () => !!$rail?.hc("on");

// Whose content is showing: the fill function last handed to `drawer()`. The menu
// compares it with its own, so its ☰ can tell "open on my tabs" from "open on a
// selection's words" and toggle only the first.
drawer.filled_by = () => fill;

/* THE PAGE THE DRAWER IS ABOUT — a site path with a trailing slash. Normally the
   address bar's; a host that shows a different page inside itself (AI 2 embedding a
   real page in its detail area) sets it, and `null` hands it back to the address bar.
   No argument reads it. Every tab reads this, never `location.pathname`, and a change
   fires `drawer-page` so the open tab redraws (tabs.js). doc/tabs.md. */
let about = null;
drawer.page = function(path){
	if (!arguments.length) return about ?? location.pathname;
	about = path ? String(path).replace(/\/?$/, "/") : null;
	window.dispatchEvent(new Event("drawer-page"));
	return drawer.page();
};

// What the grip writes on every move: clamp it, put it on the shell, hand it back so the
// number that gets remembered is the one that was actually applied.
function size(px){
	const w = Math.round(Math.max(MIN, Math.min(px, innerWidth - FLOOR)));
	$shell.style("--drawer-w", w + "px");
	return w;
}

/* ⚠ Inside `.app`, not on `<body>`: colour-scheme is forced there (App/mode.js), so a rail
   on the body renders light while the page around it is dark — and `--drawer` is read on
   `.app` alone, so the push (and the site's own Montserrat — both are `.app`-scoped) would
   be lost too.
 *
 * **THE RACE THIS USED TO LOSE** (review fix #2, `ai/2026-09-30/one-dictation/minion-chat/`,
 * found proving `ux/Dictate/chat.js`'s font requirement): `menu.js`'s auto-open — a url that
 * already names an open tab, `?drawer=…` — calls this the moment `app.styles_loaded()`
 * resolves, which is only every `<link>` tag finishing, NOT the page itself: `core/App/App.js`'s
 * own `instantiate()` still has to `await this.load()` (the Router, every page module) before
 * `inject()` ever appends the real `.app` div to the document at all. Stylesheets, small files
 * on a warm cache, can easily win that race — confirmed live, `document.readyState` was still
 * `"interactive"` here. `document.querySelector(".app")` found nothing, fell back to
 * `document.body`, and the old code CACHED that wrong parent forever (the guard right below,
 * `if ($rail) return`) — every tab in this drawer then inherited the wrong font and the wrong
 * colour scheme, not just the one caller that happened to trigger the race.
 *
 * A real user click on ☰ never hits this: by the time anyone can click, the page has already
 * painted, so `.app` is always there. Only that one background, url-triggered path can run
 * early — so rather than making every caller of `drawer()` wait on a promise (a dozen call
 * sites, several outside this file), this still builds AT ONCE, same as always, and only
 * self-heals in the rare case it had to guess: `window.app.ready` (`core/App/App.js`'s own
 * "the target exists and is in the document" moment, used the same way all over `/core/new/1/site/`)
 * resolves once, after `inject()`; if the real `.app` turns up somewhere else once it does, this
 * moves the rail into it — a DOM `appendChild` on a node that already has a parent detaches it
 * from the old one, so nothing double-mounts. */
function build(){
	if ($rail) return;

	const first = document.querySelector(".app");
	$shell = new View({ el: first || document.body, capture: false });
	$rail = new View({ capture: false }).ac("drawer flex v").append_to($shell);

	if (!first) Promise.resolve(window.app?.ready).then(() => {
		const real = document.querySelector(".app");
		if (real && real !== $shell.el){ $shell.el = real; real.appendChild($rail.el); }
	});

	// The width you left it at, before the first paint of the rail.
	const saved = localStorage.getItem(KEY);
	if (saved) $shell.style("--drawer-w", saved);

	// The head is pinned and the body scrolls under it — a rail whose ✕ scrolls away is a
	// rail you cannot shut.
	$rail.append(() => {
		div.c("drawer-head flex v-center split", () => {
			$slot = div.c("drawer-slot flex v-center");
			button.c("drawer-x", "✕").click(() => drawer.close()).attr("title", "Close");
		});

		$body = div.c("drawer-body flex v");

		// ⚠ The resize edge lives INSIDE the rail's box (ext/grip), so a shut rail takes
		// it off screen with it — a strip hanging past this edge would pointer-capture
		// clicks on every page for as long as the drawer existed.
		grip({ write: size, done: w => localStorage.setItem(KEY, w + "px") });
	});
}

export { drawer };
