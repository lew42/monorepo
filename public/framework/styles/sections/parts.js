import { div, p, span, icon, button } from "/app.js";
import { pill } from "../parts.js";

/* The pieces these fifteen sections share. Nothing here names a colour, so a
 * section retints with the theme. Design record: readme.md.
 */
const COLOURED = { dark: 1, prim: 1 };

export const band = tone => ({
	background: tone === "dark"  ? "var(--ink)"
	          : tone === "prim"  ? "var(--prim)"
	          : tone === "wash"  ? "var(--wash)"
	          : "var(--surface)",
	color: COLOURED[tone] ? "var(--surface)" : "inherit",

	/* ⚠ An accent needs somewhere to be an accent. `--prim` text on a `prim` band
	   measures 1.06:1 — invisible — so a coloured band hands down `currentColor`
	   and the eyebrow stops trying. */
	"--eyebrow": COLOURED[tone] ? "currentColor" : "var(--prim)",

	padding: "3.5em 2em",
});

/* A section is a band with a measure inside it: the band bleeds, the words don't.
 * `--section` is the one number that differs between a column of reading and a
 * card wall, so a band widens itself at the call site.
 *
 * ⚠ `flex v gap`, NOT `flow` — flow is PAGE rhythm in em, resolved against the
 * heading's own font-size, which put 96px above a hero's h1. */
export const section = (tone, ...args) =>
	div.c("section-band", () =>
		div.c("flex v gap", ...args).style({ maxWidth: "var(--section, 34em)", marginInline: "auto" })
	).style(band(tone));

export const eyebrow = text => p.c("h4", text)
	.style({ color: "var(--eyebrow, var(--prim))", letterSpacing: "0.08em", opacity: "0.85" });

// No `.btn` — this IS a button. `.btn` exists to make a non-button look like one.
export const cta = (text, kind) => button.c(kind, text);

// `pad flex v` + a small gap, never `pad flow`: flow's `* + h3` gap resolves
// against the h3's own font-size, which sat a card title 72px under its icon.
export const feature = (name, heading, body) =>
	div.c("pad flex v surface", () => {
		icon(name);
		p.c("h3", heading);
		p.c("muted", body);
	}).style("gap", "0.5em");

export const price = (plan, cost, ...lines) =>
	div.c("pad flex v surface", () => {
		// alignSelf: a flex column stretches its items, and a stretched pill is a bar
		span.c("h4", plan).style({ ...pill, alignSelf: "flex-start" });
		p.c("h1", cost);
		lines.forEach(l => p.c("muted", l));
		cta("Choose " + plan, "prim");
	}).style("gap", "0.5em");

export const stat = (label, value) =>
	div.c("pad flex v", () => {
		p.c("h4 muted", label);
		p.c("h1", value);
	}).style("gap", "0.1em");

export { pill };
