import { div, a, span, icon } from "../../core/View/View.js";

/**
 * pathbar(app) — the head's own address line, replacing the word "DEV": a
 * home icon, then `/ part / part / part` in the mono font, ONE solid
 * background behind the whole bar (never one pill per part), each part its
 * own link to that ancestor url with a hover highlight on just that part, the
 * slashes plain text between them.
 *
 * The owner's words (2026-09-19): "fix the route section — we don't need to
 * put a label on it, it's pretty self-evident. Use the code font... the slash
 * itself is the home page… use a little home icon as the base... you
 * wouldn't need to click the slash if you have a home icon. And this is
 * going to be instead of where it says DEV up there: a very slim title bar
 * with the path name on it... I definitely like the hover regions where you
 * can hover each part and it'll highlight."
 *
 * ⚠ THE ACTIVE PAGE's url, not `location.pathname` — the same guard
 * `tools.js`'s old `route()` section carried: `Router.go()` loads a page
 * before it pushes history, so during `navigated()` the address bar is one
 * hop behind the page that is actually on screen.
 *
 * Long paths: the bar SCROLLS, starting scrolled to its own right edge (the
 * current page's own name), so a deep url truncates from the LEFT — the page
 * you are on stays put, and dragging the bar (or a wheel with shift) reaches
 * the parts that scrolled out. Proved at 250px on a nine-part deep url:
 * doc/decisions.md.
 */
export default function pathbar(app) {
	const page = app?.router?.active;
	const parts = (page?.url ?? location.pathname).split("/").filter(Boolean);

	let $bar;
	$bar = div.c("dev-pathbar", () => {
		a.c("dev-pathbar-home").href("/").attr("title", "/ — home").attr("aria-label", "home")
			.append(() => icon("home"));

		parts.forEach((name, i) => {
			span.c("dev-pathbar-slash", "/");
			a.c("dev-pathbar-part", name).href("/" + parts.slice(0, i + 1).join("/") + "/").attr("title", name);
		});
	});

	// ⚠ NOT a synchronous read here — the bar's later SIBLINGS (the hint, the
	// two knobs, the ✕) are built right after this function returns, inside
	// the SAME head-line callback, and flexbox does not know how much room
	// they will take from this bar until they exist. Measured a bar reading
	// nearly the WHOLE head's width (nothing yet competing for it) and
	// scrolling to an end that stopped being the end the moment those
	// siblings landed. `requestAnimationFrame` runs after the browser has
	// laid out everything the rest of this tick built.
	requestAnimationFrame(() => { $bar.el.scrollLeft = $bar.el.scrollWidth; });

	return $bar;
}
