import { div, p, span, a, h2, h3, icon, button } from "/app.js";
import { surface, pill } from "../components/parts.js";

/* The looks these sections share, as token-valued style objects — the house
 * answer (see components/parts.js). Nothing here names a colour, so a section
 * retints with the theme and this file never has an opinion about the brand.
 *
 * `band` is the one idea worth the name: a full-width strip with its own fill,
 * which is what a "section" mostly is. The three tones are the three surfaces
 * the theme already defines, so a page can alternate them and stay in palette. */
const COLOURED = { dark: 1, prim: 1 };

export const band = tone => ({
	background: tone === "dark"  ? "var(--ink)"
	          : tone === "prim"  ? "var(--prim)"
	          : tone === "wash"  ? "var(--wash)"
	          : "var(--surface)",
	color: COLOURED[tone] ? "var(--surface)" : "inherit",

	/* An accent needs somewhere to be an accent. On a `prim` band, `--prim` text is
	   1.06:1 against its own background — measured, and invisible. On `dark` it is
	   1.80:1, because in dark mode the "dark" band is the LIGHT one. So a coloured
	   band hands down `currentColor` and the eyebrow stops trying. */
	"--eyebrow": COLOURED[tone] ? "currentColor" : "var(--prim)",

	padding: "3.5em 2em",
});

/* A section is a band with a measure inside it. The band bleeds; the words don't
 * — which is the whole composition.
 *
 * `--section` rather than a second helper or a `wide` class: reading wants 34em
 * and a card wall does not, and the difference between those two is ONE NUMBER.
 * A band widens itself at the call site — `section(…).style("--section", "60em")`
 * — which is the same token-override move `--column` makes on a grid.
 *
 * `flex v gap`, NOT `flow`: flow is PAGE rhythm, and its tokens are em — resolved
 * against the heading's own font-size, which put 96px above a hero's h1 (2em on
 * a 48px h1, measured). A laid-out container owns its spacing with `gap`. */
export const section = (tone, ...args) =>
	div.c("section-band", () =>
		div.c("flex v gap", ...args).style({ maxWidth: "var(--section, 34em)", marginInline: "auto" })
	).style(band(tone));

/* De-emphasis derived from the band's own ink, never from `--subtle`: a fixed grey
   is only readable on the bands it was picked against. `--subtle` on the `prim`
   band measured 1.06:1 — invisible. `currentColor` has already been chosen to
   contrast with whatever is behind it, so a mix of it cannot fail the same way. */
export const muted = { color: "color-mix(in srgb, currentColor 68%, transparent)" };

export const eyebrow = text => p.c("h4", text)
	.style({ color: "var(--eyebrow, var(--prim))", letterSpacing: "0.08em", opacity: "0.85" });

/* No `.btn` — this IS a button. `.btn` exists to make a non-button look like
 * one, and adding it to a real <button> is how the contrast bug got found. */
export const cta = (text, kind) => button.c(kind, text);

/* `pad flex v` + a small gap, never `pad flow` — the card/ page documents why:
 * flow's `* + h3` gap resolves against the h3's own font-size, so a card title
 * sat 72px under its icon. A component's rhythm is its own gap. */
export const feature = (name, heading, body) =>
	div.c("pad flex v", () => {
		icon(name);
		p.c("h3", heading);
		p(body).style(muted);
	}).style({ ...surface, gap: "0.5em" });

export const price = (plan, cost, ...lines) =>
	div.c("pad flex v", () => {
		// alignSelf: a flex column stretches its items, and a stretched pill is a bar
		span.c("h4", plan).style({ ...pill, alignSelf: "flex-start" });
		p.c("h1", cost);
		lines.forEach(l => p(l).style(muted));
		cta("Choose " + plan, "prim");
	}).style({ ...surface, gap: "0.5em" });

export const stat = (label, value) =>
	div.c("pad flex v", () => {
		p.c("h4", label).style(muted);
		p.c("h1", value);
	}).style("gap", "0.1em");

export { surface, pill };
