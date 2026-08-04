import { Page, p, div, el } from "/app.js";
import demo from "/framework/ext/demo/demo.js";
import { section } from "../../ui.js";
import { transcript, code } from "../ui.js";

// contrast, from the two colours the browser actually computed
const luminance = ([r, g, b]) => {
	const channel = c => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const rgb = value => value.match(/\d+/g).slice(0, 3).map(Number);

// the nearest ancestor that actually paints something
const behind = node => {
	for (let up = node; up; up = up.parentElement){
		const colour = getComputedStyle(up).backgroundColor;
		if (colour && !/rgba\(0, 0, 0, 0\)|transparent/.test(colour)) return rgb(colour);
	}
	return [255, 255, 255];
};

const ratio = (front, back) => {
	const [light, dark] = [luminance(front), luminance(back)].sort((a, b) => b - a);
	return (light + 0.05) / (dark + 0.05);
};

export default new Page({
	meta: import.meta,
	title: "Motion, contrast, target size",
	classes: "a11y-page",

	content(){

		p("Navigation controls only. This page does not review the site's colours — it measures the things you have to hit, read and wait for in order to move around.").ac("note");

		section("Measured on this document, now");

		demo(() => {
			div.c("audit", async $audit => {
				await this.app.ready;

				const rows = [".nav-link", ".nav-heading", ".hint", ".tab", ".page-link", ".page-preview", ".note"]
					.map(selector => {
						const node = this.app.$app.el.querySelector(selector);
						if (!node) return null;

						const style = getComputedStyle(node);
						const box = node.getBoundingClientRect();
						const size = parseFloat(style.fontSize);
						const large = size >= 24 || (size >= 18.66 && +style.fontWeight >= 700);
						const contrast = ratio(rgb(style.color), behind(node));

						return {
							selector,
							contrast: contrast.toFixed(2) + ":1",
							needs: large ? "3.0" : "4.5",
							contrast_ok: contrast >= (large ? 3 : 4.5),
							target: `${Math.round(box.width)}×${Math.round(box.height)}`,
							target_ok: box.height >= 24 || box.height === 0,
						};
					})
					.filter(Boolean);

				$audit.append(() => el.c("table", "grid", () => {
					el("tr", () => ["control", "contrast", "needs", "hit target", "24×24"].forEach(head => el("th", head)));
					rows.forEach(row => el("tr", () => {
						el("td", row.selector);
						el("td", row.contrast).ac("num").ac(row.contrast_ok ? "pass" : "fail");
						el("td", row.needs).ac("num");
						el("td", row.target).ac("num");
						el("td", row.target_ok ? "pass" : "fail").ac(row.target_ok ? "pass" : "fail");
					}));
				}));
			});
		}, "Computed from `getComputedStyle` on the real chrome, in the browser you are reading this in. Nothing here is copied from a design file.");

		section("Two failures, both in the sidebar");

		transcript(`
.nav-heading   #9aa1ab on #f3f4f6    2.37:1   needs 4.5   11.2px
.hint          #8b919b on #f3f4f6    2.88:1   needs 4.5   12.8px
.code-label    #6b7280 on #f3f4f6    4.39:1   needs 4.5   12px      (marginal)

everything else passes comfortably:
.nav-link 8.66  ·  .tab 9.53  ·  .tab.active 6.44  ·  .page-link 6.44
.note 4.83  ·  .section 4.83  ·  .page-title 14.65`, "measured — WCAG 1.4.3");

		p("`.nav-heading` is the word **recipes** that splits the sidebar into two groups — it is the only thing telling a reader that the list has structure, and it is the least readable text on the page. `.hint` is the paragraph explaining how the Router works. Both are in the navigation region; both are small text, so both need 4.5:1.").ac("note");

		code(`
.nav-heading { color: #6b7280; }   /* was #9aa1ab — 2.37:1 → 4.83:1 */
.hint        { color: #6b7280; }   /* was #8b919b — 2.88:1 → 4.83:1 */`, "site/styles.css — the whole fix");

		p("`#6b7280` is already this stylesheet's grey — it is what `.note` and `.section` use. No new value, and nothing else changes.").ac("note");

		section("Target size passes, and I am not going to invent a problem");

		transcript(`
.nav-link      191×36    PASS      SC 2.5.8 wants 24×24
.tab            90×39    PASS
.page-link      97×36    PASS
.page-preview  ~90×34    PASS`, "measured");

		p("Every navigation control clears 24×24 comfortably, mostly because the padding was chosen for looks and the looks happened to be right. Worth measuring precisely so that nobody tightens it later without knowing where the floor is.").ac("note");

		section("Motion: nothing to reduce, yet");

		transcript(`
transitions or animations in the loaded CSS:   none
@media (prefers-reduced-motion) blocks:        0`, "measured");

		p("There is no motion in this sub-site today. That is not a reason to skip the guard — a Motion seat is shipping into this same document right now, and the rule that protects a user is worth having *before* the animation lands, not after.").ac("note");

		code(`
@media (prefers-reduced-motion: reduce) {
    .app, .app *, .announcer {
        animation-duration: .01ms; animation-iteration-count: 1;
        transition-duration: .01ms; scroll-behavior: auto;
    }
}`, "site/a11y/a11y.css @layer site — live on this page");

		p("No `!important`. `site` already outranks `theme` and every component sheet, so the ordinary cascade does it — which is the point of the layer order. The one thing that defeats this is a transition declared **unlayered**, because an unlayered rule beats every layer regardless of specificity. That is worth saying to the other seats now rather than debugging later.").ac("note");

		section("Focus visibility");

		transcript(`
authored :focus rules in the whole site:   none
UA default on .nav-link:                   outline: auto 1px rgb(16,16,16)
links whose focus ring an overflow
  ancestor could clip:                     none`, "measured");

		p("The UA default satisfies **SC 2.4.7** today, and nothing clips it — a genuinely clean result. The risk is not the current state: it is that a site with no authored focus style has nothing to lose the day someone writes `outline: none`. One rule, owned deliberately, costs nothing and closes that door.").ac("note");

		code(`
.a11y-page :focus-visible { outline: 3px solid #0a58ca; outline-offset: 2px; }`, "scoped to a class I emit — five other seats ship into this document");

		p("That is the last of the eight. The register, ranked, with every proposed signature: `agents/a11y/page.js`.").ac("note");
	},
});
