import { div, button, is } from "/app.js";

const TONES = ["surface", "wash", "prim", "dark"];

/* A section, and the four tones it can be worn in.
 *
 *     toned(hero)
 *
 * Every section module is `tone => view`, so switching one is re-running it —
 * there is no state to keep and no stylesheet to toggle. The four names are the
 * four surfaces the theme defines, so this control cannot produce a colour the
 * rest of the site does not already use.
 */
export default function toned(render, start = "surface"){
	let $out;
	const $btns = [];

	const show = tone => {
		$btns.forEach($b => $b[$b.tone === tone ? "ac" : "rc"]("prim"));
		$out.empty(() => render(tone));
	};

	return div.c("toned flow", () => {
		div.c("flex gap wrap v-center", () =>
			TONES.forEach(tone => $btns.push(
				Object.assign(button(tone).click(() => show(tone)), { tone }))));

		$out = div.c("toned-out");

		show(start);
	});
}

export { toned, TONES };
