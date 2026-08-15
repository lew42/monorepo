import { Page, md, code, demo, div } from "/app.js";
import { Timeline } from "./Timeline.js";

export default new Page({
	meta: import.meta,
	title: "Timeline",
	description: "A general-purpose h/v timeline — CSS-variable positioning and zoom, greedy lane packing, window bands.",
	icon: "view_timeline",

	content(){
		code.js(`import { Timeline } from "/framework/ext/Timeline/Timeline.js";

new Timeline({ orientation: "h", zoom: 6, items: [
	{ from, to, label, kind: "task", url },   // a bar
	{ at, label, kind: "log" },                 // a dot
]});`);

		md("Every item gets `--t` (hours since the domain start) and `--d` (duration, hours) once, at render — position and size resolve in CSS. Zooming writes one property; flipping orientation swaps one class; neither re-renders.");

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				items: [
					{ from: now - 5 * H, to: now - 3 * H, label: "scoping", kind: "task", url: "#" },
					{ at: now - 4 * H, label: "wrote readme", kind: "log" },
					{ from: now - 3 * H, to: now - 1 * H, label: "building", kind: "task", url: "#" },
					{ from: now - 1 * H, label: "shipping", kind: "task", url: "#" },
				],
			});
		}, "The default: `h`, bars for spans, a dot for the log entry, the last bar open (no `to`) and running to now.");

		md("## Zoom");

		demo(() => {
			const now = Date.now(), H = 3600000;
			const items = [
				{ from: now - 6 * H, to: now - 4 * H, label: "design", kind: "task", url: "#" },
				{ from: now - 4 * H, to: now - 1 * H, label: "build", kind: "task", url: "#" },
				{ from: now - 1 * H, label: "verify", kind: "task", url: "#" },
			];
			div.c("flex gap wrap", () => {
				new Timeline({ zoom: 2, items });
				new Timeline({ zoom: 8, items });
			});
		}, "Two fixed zooms, side by side — the dilemma a video editor answers with a slider. `zoom` (em per hour) is a plain property; the slider itself is `ext/layout`'s job, the one control surface (phase 2).");

		md("## Orientation and lanes");

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				orientation: "v", reverse: true, zoom: 3,
				items: [
					{ from: now - 5 * H, to: now - 3 * H, label: "morning", kind: "task", url: "#" },
					{ from: now - 2 * H, to: now - 1 * H, label: "afternoon", kind: "task", url: "#" },
					{ at: now - 90 * 60000, label: "checked in", kind: "log" },
				],
			}).style("max-height", "16em");
		}, "`orientation: \"v\", reverse: true` — newest at the top. `.reverse` flips the inset (`right`/`bottom` instead of `left`/`top`); the ai page's rail uses exactly this mode.");

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				zoom: 6,
				items: [
					{ from: now - 5 * H, to: now - 3 * H, label: "tab 1 — step a", kind: "task", lane: "tab-1", url: "#" },
					{ from: now - 3 * H, to: now - 1 * H, label: "tab 1 — step b", kind: "task", lane: "tab-1", url: "#" },
					{ from: now - 4 * H, to: now - 2 * H, label: "tab 2 — fork", kind: "task", url: "#" },
					{ from: now - 2 * H, to: now, label: "tab 2 — fork b", kind: "task", url: "#" },
				],
			});
		}, "Sequential steps share a NAMED lane (`lane: \"tab-1\"`) even though they don't overlap. The un-named pair overlaps in time, so the greedy packer opens a second lane for it — stack depth IS the parallelism.");

		md("## Windows and nested children");

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				zoom: 6,
				items: [
					{ from: now - 5 * H, to: now, kind: "window", label: "32%" },
					{ from: now - 4 * H, to: now - 2 * H, label: "session", kind: "task", url: "#" },
				],
			});
		}, "`kind: \"window\"` spans the whole cross axis behind the lanes, sized to an actual 5h region — this is how the ai page draws the token-usage band.");

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				zoom: 10,
				items: [{
					from: now - 3 * H, to: now, label: "task — fan-out", kind: "task", url: "#",
					children: [
						{ from: now - 3 * H, to: now - 2 * H, kind: "agent", label: "fork a" },
						{ from: now - 2.5 * H, to: now - 1 * H, kind: "agent", label: "fork b" },
						{ at: now - 2.7 * H, kind: "log", label: "wrote file" },
						{ at: now - 1.5 * H, kind: "action", label: "edit" },
					],
				}],
			});
		}, "`children` nest inside the bar, positioned relative to ITS OWN `from` — a fork fan-out reads as a comb of slivers and dots.");

		md.details(import.meta, "readme.md", "Design record — the CSS-var approach, the lane algorithm, what's phase 2");

		md("Next: [the ai page](/framework/ai/) — this Timeline, filled with real task logs, as a catalog rail.");
	},
});
