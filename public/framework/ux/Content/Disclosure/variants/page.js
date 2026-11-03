import { Page, div, h3, md } from "/app.js";
import Disclosure from "../Disclosure.js";
import { disclosure } from "../../fixtures.js";

/* Two rows only, in every variant — enough to see the gap, the box and the marker without
 * scrolling past a dozen copies of the same FAQ. */
const items = () => disclosure("faq").items.slice(0, 2);

/* One row of named variants: a class-word caption above each Disclosure. */
const row = (title, variants) => div.c("flow", () => {
	h3(title);
	div.c("grid gap auto", () => {
		for (const [word, opts] of variants) div.c("flex v gap-25", () => {
			md(`\`${word}\``);
			new Disclosure({ stack: "faq", items: items(), ...opts });
		});
	}).style("--column", "20em");
});

export default new Page({
	meta: import.meta,
	title: "Disclosure — variants",
	description: "Full-width summary/details styles, side by side: width, gap, background, colour and the expand icon.",
	icon: "expand_circle_down",

	content(){
		md(`Every box below is the same [Disclosure](../) module, just with one more word passed
in. **v1 — \`faq\` / \`flush\` / \`lines\` — is unchanged**; these are new, optional words on top
of it. The class word under each one is the word to pass.`);

		div.c("wide flow", () => {
			row("Full width vs inline — most summary/details on the web stay inline until opened; this module is full width by default", [
				["default (full width)", {}],
				["w-inline", { width: "inline" }],
			]);
			row("Gap between rows", [
				["gap-none", { gap: "none" }],
				["gap-small", { gap: "small" }],
				["gap-loose", { gap: "loose" }],
			]);
			row("Background & border", [
				["default (card)", {}],
				["box-shaded", { box: "shaded" }],
				["box-plain", { box: "plain" }],
			]);
			row("Colour scheme", [
				["default (neutral)", {}],
				["scheme-accent", { scheme: "accent" }],
				["scheme-dark", { scheme: "dark" }],
			]);
			row("The expand icon", [
				["default (+/-)", {}],
				["marker-chevron", { marker: "chevron" }],
				["marker-twirl", { marker: "twirl" }],
				["marker-chevron marker-left", { marker: "chevron", markerSide: "left" }],
			]);
		});

		md.details(import.meta, "../readme.md", "Disclosure readme");
	},
});

