import { View, div, span, label, input } from "/app.js";
import { compare } from "../compare.js";
import "/framework/ui/scale/scale.js";

// Recreation of the Figma section "UI Controls" — four little galleries: toggles,
// chips, three separately-boxed "Progress & Sliders" groups (metadata.xml really
// has three, each with its own heading — plain, then darken-2, then a lighter
// fill), and counter badges.
//
// SCALES, does not reflow (mastermind correction, 2026-09-28, same as card 5),
// via the shared `ui/scale` component (review finding 8): `ui-scale`'s own
// font-size is set from its own width (16px at the Figma's real 856px), and
// every padding, gap, radius and font-size below it is `em` — none of the
// site's own type scale or --gap/--pad tokens, which are viewport- not
// container-relative. See `ui-reuse.md` beside the task brief for why these
// controls are hand-built rather than `ui/badge`/`ui/progress` (review finding 2).
View.stylesheet(import.meta, "view.css");

const TOGGLES = [
	["Dark mode", true],
	["Notifications", false],
	["Auto-save", true],
];

const CHIPS = [
	["Design", true], ["Tokens", false], ["Variables", true],
	["Themes", false], ["Mobile", false], ["Adaptive", true],
];

const BARS = [["Upload", 72], ["Processing", 45]];

const BADGES = [["Inbox", 12], ["Updates", 3], ["Tasks", 28]];

// One toggle: a real checkbox (so it actually flips on a click) hidden under a
// styled track. `label` already puts a click on the whole row onto the input.
const toggle = (text, checked) => label.c("figma-ctrl-toggle", () => {
	const box = input().attr("type", "checkbox").ac("figma-ctrl-toggle-input");
	if (checked) box.attr("checked", "");
	span.c("figma-ctrl-toggle-track");
	span(text);
});

// One progress row: a label + its percent on one line, then a thin track with a
// fill sized by the percent.
const bar = (text, pct) => div.c("figma-ctrl-bar", () => {
	div.c("figma-ctrl-bar-row", () => {
		span(text);
		span(pct + "%");
	});
	div.c("figma-ctrl-bar-track", () => div.c("figma-ctrl-bar-fill").style("width", pct + "%"));
});

// The two BOXED "Progress & Sliders" groups (one darker, one lighter) — each
// gets its own sentence-case heading, unlike the section's own small uppercase
// label above the first, plain group.
const progress_group = extra => div.c("figma-ctrl-progress-group " + extra, () => {
	div.c("figma-ctrl-progress-title", "Progress & Sliders");
	BARS.forEach(([text, pct]) => bar(text, pct));
});

export default class Default extends View {

	render(){
		div.c("ui-scale", () => {
			div.c("ui-scale-body figma-ctrl-panel darken-1", () => {

				div.c("figma-ctrl-title", "UI Controls");

				div.c("figma-ctrl-section", () => {
					div.c("figma-ctrl-group-title", "Toggles");
					div.c("figma-ctrl-toggles", () => TOGGLES.forEach(([text, on]) => toggle(text, on)));
				});

				div.c("figma-ctrl-section", () => {
					div.c("figma-ctrl-group-title", "Tags & Chips");
					div.c("figma-ctrl-chips", () => CHIPS.forEach(([text, accent]) =>
						span.c("figma-ctrl-chip" + (accent ? " accent" : ""), text)));
				});

				div.c("figma-ctrl-section figma-ctrl-progress-section", () => {
					div.c("figma-ctrl-group-title", "Progress & Sliders");
					BARS.forEach(([text, pct]) => bar(text, pct));
					progress_group("dark");
					progress_group("light");
				});

				div.c("figma-ctrl-section", () => {
					div.c("figma-ctrl-group-title", "Badges & Counters");
					div.c("figma-ctrl-badges", () => BADGES.forEach(([text, count]) =>
						div.c("figma-ctrl-badge", () => {
							span(text);
							span.c("figma-ctrl-count", String(count));
						})));
				});
			});
		}).style("--scale-width", "53.5");

		compare(new URL("figma.png", import.meta.url).href, "Figma: UI Controls section");
	}
}
