import { Page } from "/app.js";
import TestView from "../TestView.js";
import item from "../../Item/Item.steps.js";
import list from "../../List/List.steps.js";
import task from "../../Task/Task.steps.js";

/* Watch a class's core test run: the steps node runs (`node public/framework/core/<Class>/<Class>.steps.test.mjs`),
   drawn live here. ?test=Item|List|Task picks one; ?step waits for Next and pauses DevTools after each step. */
export default new Page({
	meta: import.meta,
	title: "Watch a test run",
	label: "Test view",
	description: "A class's core test, step by step: every object it makes drawn live, every line it saves beside it. The same steps run in node.",
	icon: "play_circle",
	width: "wide",
	content(){
		const q = new URLSearchParams(location.search);
		new TestView({ tests: { Item: item, List: list, Task: task }, name: q.get("test") ?? "Item", stepping: q.has("step") }).ac("wide");
	},
});
