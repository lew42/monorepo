import { Page, View, div, span, button, md } from "/app.js";
import { MECHANISMS } from "/imagine/paging/paging.js";

/* Ported from Codrops' "Expanding Rounded Menu" (MIT) — see expand-menu.css for the
   licence note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "expand-menu.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large — `fill` claims the row's leftover; see grid-hover/page.js's comment for
   the measurement). Own layout: prose, then the stage (a pill bar over a CSS-grid panel
   that grows/shrinks by `grid-template-rows: 0fr → 1fr`, no JS height measuring). Regions:
   one. Preview: default card. */

const COLUMNS = [
	{ title: "New In", links: ["Coats", "Knitwear", "Footwear"] },
	{ title: "Discounts", links: ["Sale", "Outlet", "Last chance"] },
	{ title: "Trending", links: ["Editor's picks", "Most viewed", "Restocked"] },
];

export default new Page({
	meta: import.meta,
	title: "Expanding menu",
	description: "Click Menu: the pill bar grows in place into a full nav panel.",
	icon: MECHANISMS.expand.icon,
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md(`**Codrops' Expanding Rounded Menu, rebuilt.** Click **Menu** below: the small rounded bar grows downward into a full navigation panel, in place — the bar never moves and nothing behind it shifts. That is this realm's own [\`expand\`](/imagine/paging/mechanisms/expand/) mechanism: "${MECHANISMS.expand.does}." Click **Back** to shrink it again.`);

		let stage_el;

		div.c("codrops-expand-stage", ($stage) => {
			stage_el = $stage.el;

			div.c("codrops-expand-scrim");

			div.c("codrops-expand-menu", () => {
				div.c("codrops-expand-bar", () => {
					button.c("codrops-expand-link unbutton", "Menu").click(() => stage_el.classList.add("is-open"));
					div.c("codrops-expand-links", () => {
						["Clothing", "Dresses", "Accessories"].forEach(name => span.c("codrops-expand-link", name));
					});
				});

				div.c("codrops-expand-panel", () => {
					div.c("codrops-expand-panel-inner", () => {
						div.c("codrops-expand-columns", () => {
							COLUMNS.forEach(col => {
								div.c("codrops-expand-column", () => {
									span.c("codrops-expand-column-title", col.title);
									col.links.forEach(link => span.c("codrops-expand-link", link));
								});
							});
						});
						button.c("codrops-expand-back unbutton", "Back").click(() => stage_el.classList.remove("is-open"));
					});
				});
			});
		});

		md("**What carried over:** the mechanism itself — a rounded pill bar that grows in place into a full panel, unchanged in spirit. **What didn't:** GSAP's timeline (the original staggers seven separate tweens — a background cover image sliding in over 1.6s, four content elements drifting, the panel sliding down, then the tagline and social links fading in 0.6s later — across `power3`/`power4` eases); this port is two CSS transitions (`grid-template-rows` for the panel's height, `opacity` for a plain colour scrim standing in for the image reveal) and nothing else animates. The nav columns are the original's own labels; the background photography is a CSS gradient. `prefers-reduced-motion` drops both transitions — the panel snaps open and closed instead of growing.");
	},
});
