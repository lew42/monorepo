import { Page, md } from "/app.js";

const lesson = (title, file, description) => [title, {
	description,
	content(){ return md.file(import.meta, file); },
}];

export default new Page({
	meta: import.meta,
	title: "Knowledge",
	description: "What the tool has learned about layout — and about its own false positives.",
	icon: "menu_book",

	children: [
		lesson("Ratios", "ratios.md", "Why every threshold is dimensionless, and the six that matter."),
		lesson("False positives", "false-positives.md",
			"Six classes of box that make a sound measurement meaningless. Every one was a real analyzer bug."),
		lesson("Responsiveness", "responsive.md",
			"Sweep by bisection, not by pixel. Robust layouts change signature at a handful of widths."),
		lesson("Thresholds", "thresholds.md", "Every number the rules use, and where it came from."),
	],

	card: "two",

	content(){
		md("Lessons, one file each. They are written to be **read by whoever fixes the layout next** — "
			+ "human or agent — so each one states the measurement, the threshold, and what the "
			+ "threshold was calibrated against.");

		md("Firmness is earned. `never` and `always` appear only where something actually breaks "
			+ "— a zero-width parent, a clipped rail with no scrollbar. Everything else states its "
			+ "reasoning and its weight, so a later reader can tell a load-bearing rule from one "
			+ "afternoon's preference.");

		this.previews();

		md("These are the **analyzer's** notes — what it measures and what it learned not to flag. "
			+ "For how to *build* a layout in the first place — the cascade, proportion, nesting, "
			+ "reuse — read [the rules](/framework/styles/rules/), which carry live examples this "
			+ "tool measures as they render.");
	},
});
