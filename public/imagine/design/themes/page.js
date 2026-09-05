import { Page, View, div, span, b, table, tr, td, md, p, img } from "/app.js";
import { spec } from "./mock.js";
import { generate, SEEDS } from "./generate.js";

View.stylesheet(import.meta, "themes.css");

const here = new URL(".", import.meta.url).pathname;

/**
 * The theme browser (2026-09-01). Not a page about themes — the browser itself:
 * a rail of themes under /imagine/'s columns host, each theme a column, the wall
 * of all of them open beside the rail at first paint.
 *
 * Five hand-built alternates + the six the generator makes live, every one of
 * them painted on the SAME mock UI, so the only variable in the whole page is
 * the token set. Ground truth: /imagine/design/color/ (29 tokens, one seam) and
 * styles/layers/theme/lew42/lew42.css.
 */

const THEMES = [
	["lew42",    "The one that ships. Montserrat, one orange, a lot of grey."],
	["press",    "Editorial. Cream stock, near-black serif ink, one oxblood, zero radius."],
	["phosphor", "A CRT. Mono, green, dark in BOTH modes — it declines the mode axis."],
	["bloom",    "High-key pastel. Nothing dark, 1em radius, and the only theme that lights its code box."],
	["oled",     "The mirror. Pure #000 / pure #fff, hairlines, no shadow in either mode.", "dark"],
	["riso",     "Two inks on newsprint — fluoro pink over midnight blue, hard 5px offset."],
];

// The custom properties a theme's own rule declares, read back OUT OF THE SHEET
// rather than retyped here — a hand-copied list is a list that goes stale, and
// the count is itself the claim ("the same ~20 properties, nothing more").
function declared(selector){
	const out = [];

	for (const sheet of document.styleSheets){
		let rules; try { rules = sheet.cssRules; } catch { continue; }

		for (const rule of rules ?? []) for (const r of rule.cssRules ?? [rule])
			if (r.selectorText === selector)
				for (const prop of r.style) if (prop.startsWith("--")) out.push([prop, r.style.getPropertyValue(prop).trim()]);
	}
	return out;
}

// Prose is capped at the reading measure; the walls below are not. A `fill`
// column has `max-width: none` by design, so at 3440 an uncapped paragraph runs
// 2900px — the tiles want that room, the sentences do not.
const note = text => div.c("themes-note", () => md(text));

const tokens = name => div.c("themes-tokens-box theme-" + name, () => {
	const rows = declared(".theme-" + name);

	table.c("themes-tokens", () => rows.forEach(([prop, value]) => tr(() => {
		td(prop);
		td(() => span.c("themes-dot").style("background", `var(${prop})`));
		td(value);
	})));

	if (!rows.length) p.c("muted", "The stylesheet had not parsed when this column drew — reload.");
});

/* ── one theme's column ──────────────────────────────────────────────────
   The mock twice, in FORCED light and dark islands (the colour study's trick),
   so the `light-dark()` pair is visible without touching the site's mode. */
const column = ([name, why]) => ({
	title: name, icon: "palette", width: "large",

	content(){
		note(`**${why}**`);
		div.c("themes-wall", () => {
			spec("light", `theme-${name} light`);
			spec("dark", `theme-${name} dark`);
		});
		note(name === "phosphor"
			? "Phosphor declares `color-scheme: dark` and no `.light`/`.dark` pair, so both islands above are the same picture — deliberately. Honouring the mode axis is a promise; a theme that has one look is better off saying so than shipping a `light-dark()` whose light half nobody drew."
			: "Every difference above is `light-dark()` inside the token, not a second rule. One file, two modes, and a token physically cannot exist in one and go missing in the other.");
		note("**Everything it declares** — read out of the stylesheet, not retyped:");
		tokens(name);
	},
});

/* ── the generated row ───────────────────────────────────────────────────
   Runs live. `--radius`/`--font` are the generator LYING and are labelled so. */
const generated = seed => {
	const { tokens, measured } = generate(seed);
	const n = r => r.toFixed(1) + ":1";
	const measure = (label, r) => span(() => { span(label + " "); b(n(r)); });

	return div.c("flex v gap").append(() => {
		spec(seed.name, "", tokens);
		span.c("themes-seed", `h ${seed.hue} · c ${seed.chroma} · ${seed.curve} · target ${seed.contrast}:1`);
		div.c("themes-ratio", () => {
			measure("ink", measured.ink);
			measure("subtle", measured.subtle);
			measure("prim-ink", measured.prim_ink);
			span("prim as text " + n(measured.prim_as_text) + (measured.prim_as_text < 4.5 ? " ✗" : " ✓"));
		});
	});
};

export default new Page({
	meta: import.meta,
	title: "Themes",
	description: "Six themes on one mock UI, a generator that makes six more from four numbers, and the seam that makes both possible.",
	icon: "palette",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink) — this study has no shots/ of its own (its
	// subject IS a live page), so one was taken for this purpose.
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/mock-wall.jpg").attr("alt", nav.label));
	},

	content(){
		md("A rail of themes. Open one for both modes and every token it declares.");
	},

	children: [
		{
			title: "The wall", icon: "grid_view", width: "fill", classes: "default",

			content(){
				note("**One class is the whole theme system.** `.theme-lew42` on the app div declares ~20 custom properties; every component downstream reads them and nothing reads a colour. Swap the word, swap the site.\n\nCustom properties cascade, so that same class works on a *box* — which is the only reason a wall of themes can exist on one page. Every tile below is the identical mock UI under a different wrapper class.");

				div.c("themes-wall", () => THEMES.forEach(([name, , mode]) => spec(name, `theme-${name} ${mode ?? ""}`)));

				note("Six looks, six blocks of tokens, **one mock** — `oled` is shown in its dark half, where it has a point; every other tile follows your own mode. Open a theme in the rail for its two modes and its full declaration; [Generated](./generated/) makes six more from four numbers each; [Proposal](./proposal/) is what shipping this costs.");

				note("**Three things the seam does not carry**, found by building on it:\n\n1. **A nested theme cannot undo the outer one's component rules.** `lew42.css` styles `button` as `.theme-lew42 :is(button, .btn)` — every tile above is *inside* `.theme-lew42`, so it inherits lew42's uppercase CTA voice no matter which class it wears. Tokens cascade; selectors do not stand down. In production this is invisible (one theme class, on the root); in a *browser* it is the whole reason a preview can lie.\n2. **`--card-shadow` is a colour inside a geometry the theme cannot reach** (`0 1px 2px`, `0 6px 18px` — `Page.css:654`). `riso` wants a hard 5px offset, which is a different shadow, not a different colour, so it has to write a rule. The missing token is the shadow itself, not its colour.\n3. **Lighting the code box costs ten more tokens.** `--code-bg` is dark in both modes and the ten `--syn-*` are flat and tuned for it. `bloom` and `press` light theirs, so both restate the syntax palette — the trap the [colour study](../color/) predicted, confirmed.");
			},
		},

		...THEMES.map(column),

		{
			title: "Generated", icon: "auto_awesome", width: "fill",

			content(){
				note("**Four numbers in, a token set out** — hue, chroma, which end of the lightness curve the surfaces sit on, and a contrast floor. Runs live in this page (`generate.js`, no dependencies): OKLCH → sRGB, then a twenty-step bisection that *solves* each ink token's lightness against the surface it will actually sit on. The ratios under each tile are measured after the fact, never the target that was asked for.");

				div.c("themes-wall", () => SEEDS.forEach(seed => generated(seed)));

				note("**What generation guarantees.** Every ink token clears its floor *by construction*, because it was solved rather than picked. The last figure under each tile is the point: `--prim` measures **2.8–3.0:1 as text** on every light seed — under AA, exactly the shape of the live defect the colour study found in `ext/AITask` (2.25:1) and `ext/toc` (2.01:1), where a component painted text with the *fill* token. A generator cannot make that mistake, because the fill and the ink are two different solves and the ink's floor is an input.");

				note("**What it cannot.** The bottom two dials of every set — `--radius` and `--font` — are the generator lying. It derives radius from chroma and the family from the curve because they have to be *something*, and nothing about a hue implies a serif. `riso`'s hard offset, `phosphor`'s refusal of light mode, `press`'s cream-not-white paper: none is derivable, all three are the reason those themes are worth looking at. Also single-mode by construction — these are flat hex, not `light-dark()`; pairing two runs on one hue is how you would emit the mode axis.");

				note("**The honest verdict:** algorithmic themes are the right way to make the *floor* — twenty accessible starting points in a second, none of which can ship a contrast bug. They are not a way to make a theme anyone remembers.");
			},
		},

		{
			title: "Proposal", icon: "checklist", width: "large",

			content(){
				note("**Where a theme lives.** One directory per theme beside the one that ships — `styles/layers/theme/<name>/<name>.css`, tokens only, `@layer theme`, plus a `<name>.js` if the theme needs behaviour the way `lew42.js` loads its font. Each block in this page's `themes.css` is already that file: unscoped `.theme-<name>`, in the right layer, lift-and-drop.");

				note("**How one is chosen.** The class is the API, so choosing is one string on the app div and remembering it is `page.store()` — core's own handle over `localStorage`, keyed on the page's url (`Page.class.js:552`). Site-wide the key wants to be the *app's*, not a page's: `store_key: \"theme\"` on the root page gives one stable key, and the picker is the mode toggle's shape — one control, one place, in the sidebar footer beside light/dark. Two axes, orthogonal: `class=\"app theme-press dark\"`.");

				note("**What an author owes.** Not 29 tokens — **20**. Three are pure aliases (`--syn-keyword`, `--syn-builtin`, `--syn-error` all read `--prim`) and `--sidebar-ink` reads `--ink`; skip all four and they follow. Two are shape, not colour: `--card-shadow` and `--card-ring` swap *mechanism* by mode in lew42 (shadow in light, ring in dark), so a theme picks both or neither. Ten more — `--code-*` and `--syn-*` — are owed only if the theme lights its code box; leave the box dark and the flat palette is already correct.");

				note("**Three next steps.**\n\n1. **Promote `press` and `oled` into `styles/layers/theme/`, and put the picker in the sidebar footer.** Two files moved verbatim, one control, `store_key: \"theme\"` on the root. ~3h.\n2. **Give the shadow a token.** `--card-lift` holding the whole `box-shadow` value, not just its colour, so `Page.css:654` reads one property and `riso` stops needing a rule. Touches one line of core and every theme's declaration. ~2h.\n3. **Fold the generator into `ext/`, four sliders and a Copy button.** It is already dependency-free and produces a valid block; what it lacks is somewhere to put the output. That is the cheapest path to twenty accessible themes. ~4h.");

				note("**What I would cut first:** `bloom`. It is the least distinguishable tile on the wall at a glance and it costs the most to maintain — the only theme carrying a full second syntax palette.");
			},
		},
	],
});
