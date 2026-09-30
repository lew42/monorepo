import { button } from "/framework/core/View/View.js";
import tabs from "./tabs.js";
import select from "./select.js";
import rail from "./rail.js";

/* THE ☰ — a menu button in the top right of every page (the owner, 2026-09-28: "each
   page could have like a little menu button in the top right… that kind of makes it
   look obvious that when you click over there the right sidebar appears").

   One click opens the drawer on its tabs (tabs.js); a second click, or the drawer's
   own ✕, shuts it. Called once by the site, in app.js's `render()`, so it is built
   inside `.app` and reads the push tokens there (drawer.css places it).

   ⚠ Not drawn inside a frame: an embedded page (a demo in an iframe) is not a page
   of its own, and a ☰ in every frame would stack menus inside menus. */
export default function menu(app){
	tabs.app = app;
	if (window.top !== window) return null;

	// While the drawer is open on its tabs, any content element on the page can be
	// selected (select.js); shut, the page reads exactly as before.
	select.start();

	const $menu = button.c("drawer-menu", "☰")
		.attr("type", "button")
		.attr("title", "Menu — AI, sessions, dictation, settings")
		.attr("aria-label", "Open the page menu")
		.click(() => tabs.toggle());

	// A url that names a tab (`?drawer=sessions`) opens on it — once the styles are in,
	// so the rail never paints unstyled and slides.
	const routed = tabs.routed();
	if (routed) app.styles_loaded().then(() => tabs.open(routed));

	// The mobile bottom rail (rail.js) — the drawer's other way in below 52em, on
	// every page. Hidden entirely above that breakpoint (rail.css), so this is
	// free to call here unconditionally rather than app.js needing to know about
	// a second piece of drawer chrome.
	rail(app);

	return $menu;
}

// App's `navigated()` seam: the drawer's tabs follow the page, and so does the
// mobile ✦ sheet's own header path and open voice session (`ext/drawer/rail.js`'s
// `navigated()`, voice-on-panel 2026-09-29).
menu.navigated = () => { tabs.navigated(); rail.navigated?.(); };

export { menu, tabs };
