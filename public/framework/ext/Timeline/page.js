import { Doc, md, code, demo, div } from "/app.js";
import { Timeline } from "./Timeline.js";

export default new Doc({
	meta: import.meta,
	title: "Timeline",
	description: "A general-purpose h/v timeline — CSS-variable positioning and zoom, greedy lane packing, window bands.",
	icon: "view_timeline",

	subject: Timeline,
	properties: "orientation reverse zoom lane from to items",
	methods: "render span lay end item ruler live",
	notes: "phase-2 decisions",
	files: "Timeline.js Timeline.css page.js readme.md",

	overview: [{ title: "Orientation & lanes", icon: "swap_vert", content(){

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
		}, "`orientation: \"v\", reverse: true` — newest at the top. `.reverse` flips the inset (`right`/`bottom` instead of `left`/`top`); the ai-log adapter (`ai.js`) used to run exactly this mode.");

		md("## Named lanes");

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
		}, "Sequential steps share a NAMED lane (`lane: \"tab-1\"`) even though they don't overlap. The un-named pair overlaps in time, so the greedy packer opens a second lane for it — stack depth IS the parallelism. ⚠ This `lane` (a string, an item field) is a different thing from the constructor's own `lane` (a number, em per lane) — see `doc/property/lane.md`.");

	} }, { title: "Windows & nested children", icon: "layers", content(){

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				zoom: 6,
				items: [
					{ from: now - 5 * H, to: now, kind: "window", label: "32%" },
					{ from: now - 4 * H, to: now - 2 * H, label: "session", kind: "task", url: "#" },
				],
			});
		}, "`kind: \"window\"` spans the whole cross axis behind the lanes, sized to an actual 5h region — this is how a token-usage band would be drawn.");

		md("## Nested children");

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
		}, "`children` nest inside the bar, positioned relative to ITS OWN `from` — a fork fan-out reads as a comb of slivers and dots. Not mini-packed (phase 2): overlapping children can visually collide.");

	} }],

	content(){

		code.js(`import { Timeline } from "/framework/ext/Timeline/Timeline.js";

new Timeline({ orientation: "h", zoom: 6, items: [
	{ from, to, label, kind: "task", url },   // a bar
	{ at, label, kind: "log" },                 // a dot
]});`, "framework/ext/Timeline/page.js");

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
		}, "Two fixed zooms, side by side — the dilemma a video editor answers with a slider. `zoom` (em per hour) is read once at construction; a live slider is `ext/layout`'s job, not built here (phase 2).");

		md("## Running item");

		demo(() => {
			const now = Date.now(), H = 3600000;
			new Timeline({
				zoom: 6,
				items: [
					{ from: now - 3 * H, label: "long-running build", kind: "task", url: "#" },
					{ from: now - 1 * H, to: now - 0.5 * H, label: "quick check", kind: "task", url: "#" },
				],
			});
		}, "The first bar is open (no `to`) and runs to now. It gets its own lane instead of sharing one with the later item that starts well inside its still-open span — `lay()` and `item()` agree on when an open item ends (`end()`).");

		md("Not to be confused with [`ui.timeline()`](/framework/ui/timeline/) — a dated list with no time axis, sharing only the English name.");

		md("Next: [ext/AITask](/framework/ext/AITask/) — the AI dashboard this Timeline fed for part of one day, before the step/cost card rail replaced it. This module still stands on its own; its `ai.js` adapter has no callers today.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
