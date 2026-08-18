import View, { div, span, button, label, input } from "../../core/View/View.js";
import { tabs } from "./tools.js";
import { restore, set, settings } from "./settings.js";
import { reclaim } from "../Claim/claim.js";
import grip from "./grip.js";
import width from "./width.js";

View.stylesheet(import.meta, "devbar.css");

let $bar, $tabs, $body, app;

/* The dev rail — chrome for whoever is building the site, on every page.
 *
 * `dev-open` on <html> is the WHOLE state: the shell's push (`--devbar`, read by
 * `.app` in framework.css), the slide and what the ✕ undoes are all CSS off that one
 * class. Everything the rail remembers is one document in `settings.js`.
 * Design record: readme.md.
 *
 * ⚠ Mounted on <body>, deliberately OUTSIDE `.app` and its theme — this is tooling,
 * not content, and the site's type scale would otherwise size it. */
export default function devbar(a){
	app = a;

	$bar = div.c("dev-bar flex v", () => {
		// The width line is in the HEAD, not on a tab: it is the one piece of state
		// every tab's content depends on, and the four buttons that set it used to
		// live on a different screen from the readout. width.js says why.
		div.c("dev-head flex v", () => {
			div.c("dev-head-line flex v-center", () => {
				span.c("dev-title", "dev");
				span.c("dev-hint", "ctrl + \\");

				// ⚠ The global IS the state — Socket reads it live — and this is the one
				// knob deliberately not persisted through settings.js. Why: readme.md.
				label.c("dev-knob", () => {
					const $box = input().attr("type", "checkbox")
						.on("change", function(){ window.$BLOCKRELOAD = this.el.checked; });

					if (window.$BLOCKRELOAD) $box.attr("checked", true);
					span("block");
				}).attr("title", "Block live reload — window.$BLOCKRELOAD");

				button.c("dev-x", "✕")
					.attr("title", "Close (Ctrl + \\)")
					.attr("aria-label", "Close the dev rail")
					.click(() => toggle(false));
			});

			width(app);
		});

		$tabs = div.c("dev-tabs flex");
		$body = div.c("dev-body flex v");

		grip();
	});

	// ⚠ Dev chrome, not the page: ext/DesignTool's probe skips anything marked
	// this, so the rail never turns up in a measurement of the page beside it.
	$bar.attr("data-layout-ignore", "");

	// ⚠ After styles — inject() holds $app back for stylesheets, but nothing holds
	// <body>: mounted bare, the bar paints unstyled, then visibly slides away as
	// devbar.css's transform and its transition arrive in one style update.
	// ⚠ And the claim ring with it: an agent editing files reloads its own claimed tab
	// every few seconds, so the ring has to come back on boot. dev/Claim/readme.md.
	app.styles_loaded().then(() => { $bar.append_to(View.body()); reclaim(); });

	// ⚠ `code`, not only `key`: the character a backslash key produces moves with the
	// keyboard layout; the physical key does not.
	document.addEventListener("keydown", e => {
		if (!(e.ctrlKey || e.metaKey) || (e.key !== "\\" && e.code !== "Backslash")) return;
		e.preventDefault();
		toggle();
	});

	window.addEventListener("resize", devbar.refresh);

	restore().then(devbar.refresh);
	return $bar;
}

/* Everything in here reads the world at render time, so a navigation or a resize
 * makes it a lie. App calls this from `navigated()` — Router's documented seam.
 *
 * ⚠ Only the open tab renders. That is what keeps `layout` from downloading
 * ext/DesignTool and measuring the page on every navigation of every session. */
devbar.refresh = function(){
	if (!open()) return;

	const [name, shown] = tabs.find(([n]) => n === settings.tab) ?? tabs[0];

	$tabs?.empty(() => tabs.forEach(([n]) =>
		button.c("dev-tab", n).ac(n === name && "on").click(() => tab(n))));

	$body?.empty(() => shown.forEach(section => section(app)));
};

function tab(name){
	set({ tab: name });
	devbar.refresh();
}

devbar.tab = tab;

const html = document.documentElement;

const open = () => html.classList.contains("dev-open");

function toggle(on = !open()){
	html.classList.toggle("dev-open", on);
	set({ open: on });
	devbar.refresh();
}

devbar.toggle = toggle;

export { devbar };
