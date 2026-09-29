import { View, div, span } from "/app.js";
import { compare } from "../compare.js";
import "/framework/ui/scale/scale.js";

// Recreation of the Figma section "2-Col: Sidebar + Content" — a small dashboard:
// an accent sidebar with a nav list and a user row, next to a white content area
// with three stat tiles and a recent-activity list. The Figma accent (#72c4ff)
// maps onto this site's one accent, `--prim`.
//
// SCALES, does not reflow (mastermind correction, 2026-09-28), via the shared
// `ui/scale` component (review finding 8): the card column is only ~400px at
// 1920, half the Figma's own 856px canvas, and reflowing a fixed mockup breaks
// it (text clips, tiles stack). `ui-scale`'s own font-size shrinks with the
// container, and every padding, gap, radius and font-size from here down is
// `em`, so the WHOLE panel is the same layout at any width. None of the
// site's own type scale or --gap/--pad tokens are used inside it — they are
// viewport-relative, not container-relative, and would not shrink with the
// panel. The Figma comparison image sits below the panel, outside the
// scaled container, at its own natural size.
View.stylesheet(import.meta, "view.css");

const NAV = ["Overview", "Analytics", "Settings", "Team", "Billing"];

const STATS = [
	["REVENUE", "$12,450"],
	["USERS", "1,247"],
	["GROWTH", "+18.2%"],
];

const ACTIVITY = [
	"New signup: alex@demo.com",
	"Payment received: $299",
	"Team invite accepted",
];

export default class Default extends View {

	render(){
		div.c("ui-scale", () => {
			div.c("ui-scale-body figma-dash-panel darken-1", () => {

				div.c("figma-dash-widget", () => {

					// Sidebar — the active item is a lighter rounded row; the user sits
					// in its own darker box pinned to the bottom.
					div.c("figma-dash-sidebar", () => {
						div.c("figma-dash-title", "Dashboard");

						div.c("figma-dash-nav", () => NAV.forEach((label, i) =>
							div.c("figma-dash-nav-item" + (i === 0 ? " active" : ""), label)));

						div.c("figma-dash-user", () => {
							span.c("figma-dash-user-avatar", "");
							div.c("figma-dash-user-info", () => {
								div.c("figma-dash-user-name", "JANE COOPER");
								div.c("figma-dash-user-role", "Admin");
							});
						});
					});

					// Content — a heading, three stat tiles side by side, and a
					// recent-activity box with three light rows on a darker fill.
					div.c("figma-dash-content", () => {
						div.c("figma-dash-content-title", "Overview");

						div.c("figma-dash-stats", () => STATS.forEach(([label, value]) =>
							div.c("figma-dash-tile", () => {
								div.c("figma-dash-tile-label", label);
								div.c("figma-dash-tile-value", value);
							})));

						div.c("figma-dash-activity", () => {
							div.c("figma-dash-activity-title", "RECENT ACTIVITY");
							ACTIVITY.forEach(line => div.c("figma-dash-activity-row", () => {
								div.c("figma-dash-activity-bar");
								span(line);
							}));
						});
					});
				});
			});
		}).style("--scale-width", "53.5");

		compare(new URL("figma.png", import.meta.url).href, "Figma: 2-Col Sidebar + Content section");
	}
}
