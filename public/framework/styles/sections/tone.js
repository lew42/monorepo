import { div, span } from "/app.js";
import layout from "../../ext/layout/layout.js";
import { pick } from "../../ext/layout/controls.js";

/* Everything a tone is, in one file: the four names, what each one paints, and the
 * chips that switch between them. Design record: readme.md §3, §4, §11.
 *
 * The four surfaces the theme already defines. A fifth would be a section inventing
 * a colour the rest of the site does not have.
 */
export const TONES = ["surface", "wash", "prim", "dark"];

const COLOURED = { dark: 1, prim: 1 };

/* band(tone) — the style object a band wears. The one thing a band module does NOT
 * spell out inline, because a four-way token map cannot be written fifteen times.
 *
 * ⚠ An accent needs somewhere to be an accent. `--prim` text on a `prim` band
 * measures 1.06:1 — invisible — so a coloured band hands down `currentColor` and
 * every eyebrow on it stops trying.
 */
export const band = tone => ({
	background: tone === "dark"  ? "var(--ink)"
	          : tone === "prim"  ? "var(--prim)"
	          : tone === "wash"  ? "var(--wash)"
	          : "var(--surface)",
	color: COLOURED[tone] ? "var(--surface)" : "inherit",

	"--eyebrow": COLOURED[tone] ? "currentColor" : "var(--prim)",

	padding: "3.5em 2em",
});

/* The tone chips, as contextual panel content: `tones(page, $box)`, where `$box` is
 * the region the section renders into. A section module is `tone => view`, so
 * switching one is RE-RUNNING it — no state to keep, no stylesheet to toggle. The
 * choice lands on the page, so the band and a re-opened panel cannot disagree.
 *
 * Registered once, on the exhibit's render: the panel draws the nearest registration
 * at or above the selection, so clicking anything in the band finds these chips, and
 * a re-run cannot strand them.
 */
export default function tones(page, $box){
	const choose = tone => {
		page.tone = tone;
		$box.empty(() => page.section(tone));
	};

	layout.context($box, () => {
		span.c("layout-tag", "tone");
		div.c("layout-chips flex wrap", () => pick(TONES, choose, page.tone));
	});
}
