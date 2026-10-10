import { Page, View, div, p, h4, md } from "/app.js";

View.stylesheet(import.meta, "colors.css");

/* Figma Sept-2026, Page 7, frame "Color Schemes" (112:11362). Every nested shade is a black or white
   overlay at an alpha, so one rule works on any parent. Contrast is computed from the same numbers. */
const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };
const over = (base, white, alpha) => base.map(v => Math.round(v + ((white ? 255 : 0) - v) * alpha));

class Scheme {
	constructor({ name, base, text }){ Object.assign(this, { name, base, text }); }

	// steps: [["darken"|"lighten", alpha], ...] - each nested inside the one before it.
	draw(steps, bg = this.base, cls = this.name.toLowerCase(), label = this.name){
		div.c(`fg-scheme ${cls}`, () => {
			h4(label);
			p(`Text on this card: ${ratio(bg, this.text).toFixed(1)} : 1 contrast`);
			p.c("fg-muted", "Secondary text specimen");
			const [[kind, alpha] = [], ...rest] = steps;
			kind && this.draw(rest, over(bg, kind === "lighten", alpha), `fg-nested fg-${kind}-${Math.round(alpha * 100)}`, `${Math.round(alpha * 100)}% ${kind}`);
		});
	}
}

export default new Page({
	meta: import.meta,
	title: "Color Schemes",
	description: "Figma's nested cards rebuilt: each level is a black or white overlay, and contrast is computed, not eyeballed.",
	icon: "palette",
	content(){
		md("Each card sits on the one before it. A nested card is just the parent with a **black or white overlay** (`10%`, `50%`), so nothing is hard-coded per level. Under every title is the contrast of its text, calculated from those overlays.");
		div.c("fg-row", () => {
			new Scheme({ name: "White", base: [255, 255, 255], text: [0, 0, 0] }).draw([["darken", .1]]);
			new Scheme({ name: "Prime", base: [114, 196, 255], text: [255, 255, 255] }).draw([["darken", .25]]);
			new Scheme({ name: "Dark", base: [103, 95, 86], text: [255, 255, 255] }).draw([["darken", .1], ["darken", .5], ["lighten", .1]]);
		});
		md("## Can light mode nest as deep?\nSame idea, four levels of black overlay on white. Dark text stays readable until roughly half the card is black.");
		div.c("fg-row", () => {
			new Scheme({ name: "White", base: [255, 255, 255], text: [0, 0, 0] }).draw([["darken", .1], ["darken", .25], ["darken", .5]]);
		});
	},
});
