import View, { div, span, button } from "../../core/View/View.js";
import { sections } from "./tools.js";
import { restore, set } from "./settings.js";
import grip from "./grip.js";

View.stylesheet(import.meta, "devbar.css");

let $bar, $body, app;

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
		div.c("dev-head flex v-center", () => {
			span.c("dev-title", "dev");
			span.c("dev-hint", "ctrl + \\");
			button.c("dev-x", "✕")
				.attr("title", "Close (Ctrl + \\)")
				.attr("aria-label", "Close the dev rail")
				.click(() => toggle(false));
		});

		$body = div.c("dev-body flex v");

		// Last, so the pill paints over the edge it straddles.
		grip();
	}).append_to(View.body());

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

// Everything in here reads the world at render time, so a navigation or a resize
// makes it a lie. App calls this from `navigated()` — Router's documented seam.
devbar.refresh = function(){
	if (open()) $body?.empty(() => sections.forEach(section => section(app)));
};

const html = document.documentElement;

const open = () => html.classList.contains("dev-open");

function toggle(on = !open()){
	html.classList.toggle("dev-open", on);
	set({ open: on });
	devbar.refresh();
}

devbar.toggle = toggle;

export { devbar };
