import { Page } from "/app.js";
import TestView from "../TestView.js";
import TestBlocks from "../TestBlocks.js";
import { div, h3, ul, li, a } from "../../View/View.js";
import item from "../../Item/Item.steps.js";
import list from "../../List/List.steps.js";
import task from "../../Task/Task.steps.js";

/* Watch a class's core test run: the steps node runs (`node public/framework/core/<Class>/<Class>.steps.test.mjs`),
   drawn live here. ?test=Item|List|Task picks one; ?step waits for Next and pauses DevTools after each step.
   ?file=core/Item/act.test.mjs runs a test file written with test("name", fn) instead: one block per test (TestBlocks.js).
   One page for both: they are the same job, watching a test run, and one URL is easier to remember than two. */
const FILES = ["core/Item/act.test.mjs", "core/Item/replay.test.mjs", "core/Item/line-format.test.mjs", "core/Item/hooks.test.mjs", "core/Item/call.test.mjs", "core/Item/item-core.test.mjs"];   // test files that run in a browser; add one when you convert it
export default new Page({
	meta: import.meta,
	title: "Watch a test run",
	label: "Test view",
	description: "A class's core test, step by step: every object it makes drawn live, every line it saves beside it. The same steps run in node.",
	icon: "play_circle",
	width: "wide",
	content(){
		const q = new URLSearchParams(location.search);
		const file = q.get("file");
		if (file) return void new TestBlocks({ file: "/framework/" + file.replace(/^\/?(framework\/)?/, "") }).ac("wide");
		div.c("flex v gap", () => {
			h3("Test files with a page view");
			ul(() => FILES.forEach(f => li(() => a(f).href("?file=" + f))));
		});
		new TestView({ tests: { Item: item, List: list, Task: task }, name: q.get("test") ?? "Item", stepping: q.has("step") }).ac("wide");
	},
});
