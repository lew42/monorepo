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
	background: tone === "dark"  ? "var(--bg)"
	          : tone === "prim"  ? "var(--prim)"
	          : tone === "wash"  ? "var(--wash)"
	          : "var(--surface)",

	/* ⚠ A COLOURED BAND IS AN ALWAYS-DARK ISLAND, and this one line is the whole
	 *   mechanism: `light-dark()` reads `color-scheme` at the element it is USED on,
	 *   so every token inside the band flips at once — `--ink` and `--line`, the
	 *   `--fill-aNN` rungs, `--surface`, `--wash`, `--tint`. Without it a default
	 *   `button` on a `prim` band is near-black `--ink` on `--fill-a08`, which DARKENS
	 *   the orange: measured 3.4:1 the moment framework.css's button fill went alpha.
	 *   It also gives `layouts/home/page.js` the "background twin of `.muted`" it says
	 *   it never had — `.tint` and `.wash` on a band now paint white, not black.
	 *   `styles/doc/stacking.md` §5.
	 *
	 * ⚠ `--bg`, not `--ink`, for the dark tone — and that is what makes the line
	 *   HONEST rather than merely convenient. `--ink` inverts with the mode (a `dark`
	 *   band was dark in light mode and LIGHT in dark mode), and an island that
	 *   inverts cannot declare a fixed `color-scheme`: the same declaration would flip
	 *   the band's own background with it. `--bg` is the theme's one floor that stays
	 *   dark in both modes, which is exactly what an always-dark island is. */
	colorScheme: COLOURED[tone] ? "dark" : "inherit",
	/* ⚠ Repainted, not inherited: `color` inherits as a RESOLVED value, so a band
	   under a light-mode page would keep the page's near-black ink whatever
	   `color-scheme` says here. */
	color: COLOURED[tone] ? "var(--ink)" : "inherit",

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
