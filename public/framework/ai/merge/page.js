import { Page } from "/app.js";
import ReadyToMerge from "./ReadyToMerge.js";

export default new Page({
	meta: import.meta,
	title: "Ready to merge",
	description: "Branches an agent marked ready: what was done, how it was reviewed, and the one Merge button.",
	icon: "merge",
	classes: "rm-page",
	content(){ new ReadyToMerge(); },
});
