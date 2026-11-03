import { div, span, button, icon } from "../../core/View/View.js";
import { MIN, settings, rail, set } from "./settings.js";

/* THE PAGE'S WIDTH — the four presets that set it, and the number they promise,
 * on one line in the rail's head, on every tab.
 *
 * It is here because it is the one piece of state every tab's content depends on,
 * and it was the one controlled from a different screen than it was reported on:
 * the `page` tab showed the WINDOW (1920) and the `layout` tab showed the PAGE
 * (1648), 272px apart, neither labelled as which. Record: readme.md, doc/sizing.md. */

// icon, the page width it aims at, what to call it.
const SIZES = [
	["smartphone", 390, "mobile"],
	["tablet", 810, "tablet"],
	["desktop_windows", 1920, "desktop"],
	["tv", 3440, "mega"],
];

export default function width(app){
	div.c("dev-width flex v-center wrap", () => {
		sizes();
		const $px = span.c("dev-width-val");

		/* ⚠ `.app`'s CONTENT box is the only thing that moves when the rail is
		   dragged — the shell reserves the rail as `padding-inline-end`, so its
		   border box reads the full window at every rail width. A ResizeObserver
		   reports the content box by default, which is why one covers the grip, the
		   four presets and the window alike with no listener for any of them.
		   ⚠ THE APP'S OWN `$app`, never `document.querySelector(".app")`: this runs
		   inside `App.render()` and the shell does not reach the document until
		   `inject()`, several awaits later — the query comes back null and the
		   reading stays blank forever. An observer on a detached element just waits
		   for it to have a size. */
		new ResizeObserver(() => $px.text(reading(app.$app.el))).observe(app.$app.el);
	});
}

/* ⚠ THE CONTENT box, not the border box (above) — this is the number the presets
 * promise, `innerWidth - rail`. `em` rides along because every token on this site
 * is em off the body clamp, so it is the unit the layouts are written in. */
function reading(app){
	const cs = getComputedStyle(app);
	const px = Math.round(app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
	return `${px}px · ${(px / parseFloat(getComputedStyle(document.body).fontSize)).toFixed(0)}em`;
}

/* The rail is the only thing between the window and the page, so sizing the PAGE is
 * sizing the rail: `innerWidth - target`. A target this window cannot hold has no
 * rail width that reaches it — that button says so rather than quietly missing.
 *
 * ⚠ Lit off `settings.width`, not off a measurement: `.app` eases its push over
 *   0.18s, so anything measured right after a click reads mid-transition. */
function sizes(){
	const marks = [];
	const mark = () => marks.forEach(([$size, target]) =>
		$size.rc("on").ac(settings.width === innerWidth - target && "on"));

	div.c("dev-sizes flex gap", () => SIZES.forEach(([name, target, label]) => {
		const px = innerWidth - target;
		const $size = button.c("dev-size", () => icon(name)).attr("aria-label", `${label} — ${target}px`);
		marks.push([$size, target]);

		if (px < MIN){
			$size.attr("title", `${label} ${target} — needs a ${target + MIN}px window`);
			$size.el.disabled = true;
		} else {
			$size.attr("title", `${label} — ${target}px`);
			$size.click(() => { set({ width: rail(px) }); mark(); });
		}
	}));

	mark();
}

export { width };
