import { Page, md, h2 } from "/app.js";
import { padding_ladder, nesting_table } from "./demos.js";

const doc = (title, file, description, after) => [title, {
	description,
	content(){
		const text = md.file(import.meta, file);
		return after ? text.then(() => { h2("Live"); after(); }) : text;
	},
}];

export default new Page({
	meta: import.meta,
	title: "Rules",
	description: "The dos and don'ts, one page each — and the live examples that keep them honest.",
	icon: "rule",

	children: [
		doc("Cascade", "cascade.md",
			"Where a declaration belongs. Constrain the container, never the items — the whole strategy in one line."),
		doc("Proportion", "proportion.md",
			"How much room a frame leaves. Two floors, one clamp — and why 20px on a 1000px card looks off.",
			padding_ladder),
		doc("Nesting", "nesting.md",
			"What can safely contain what. Plain blocks cannot break; six departures are what does.",
			nesting_table),
		doc("Robust", "robust.md",
			"Seven arrangements that hold from 400 to 3440 with no media query."),
		doc("Reuse", "reuse.md",
			"Before you define a new block. A near-duplicate is worse than either thing it sits between."),
	],

	content(){
		md("Rules for building layouts here — written to be **argued with**. Each one states its "
			+ "reasoning and its weight, so a later reader can tell a load-bearing rule from one "
			+ "afternoon's preference, and the live examples are measured by "
			+ "[DesignTool](/framework/ext/DesignTool/) as the page renders rather than asserted in prose.");

		md("`never` and `always` appear only where something actually breaks — a zero-width flex "
			+ "item, a clipped rail with no scrollbar. Everywhere else the rule explains itself and "
			+ "you decide.");

		this.previews();

		md("**The analyzer is the enforcement arm.** Every rule here that can be measured has a rule "
			+ "in `ext/DesignTool` with the same name and the same threshold — `cramped`, `pad-scale`, "
			+ "`double-pad`, `escape`, `measure`, `gutter`, `alignment`. When the two disagree, one of "
			+ "them is out of date and it is worth finding out which.");
	},
});
