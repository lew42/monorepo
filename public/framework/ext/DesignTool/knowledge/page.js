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
		/* ⚠ `ranges.js` has cited this file since it was written and nothing linked it,
		   so the whole derivation of `taste/`'s eleven bands had no url. */
		lesson("Ideal ranges", "ideal-ranges.md",
			"Every number `taste/` scores against, where it came from, and the sweep that says which bands still separate anything."),
		lesson("False positives", "false-positives.md",
			"Fourteen classes of measurement that look sound and mean nothing. Every one was a real analyzer bug."),
		lesson("Responsiveness", "responsive.md",
			"Sweep by bisection, not by pixel. Robust layouts change signature at a handful of widths."),
		lesson("Thresholds", "thresholds.md", "Every number the rules use, and where it came from."),
		lesson("Floors and ceilings", "bounds.md",
			"A track with one bound instead of two is nearly every layout that breaks at an unchecked width."),
		lesson("Spending a widescreen", "widescreen.md",
			"What each shape actually uses of a 3440 screen, and the three ways to spend it."),
		lesson("Characters per line", "characters-per-line.md",
			"52em is not 75 characters on this site — it is 84 to 108, and which one depends on the copy."),
		lesson("Padding is not a misalignment", "alignment-vs-padding.md",
			"The near-miss window is exactly the site's padding scale. One repeated offset is the tell."),
		lesson("Blind spots", "blind-spots.md",
			"Layouts broken on purpose that the tool scores clean — the more dangerous direction."),
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
