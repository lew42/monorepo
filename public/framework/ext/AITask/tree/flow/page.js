import { Flow } from "../../nested.js";
import { design_page } from "../design.js";

export default design_page(import.meta, Flow, {
	title: "Flow",
	description: "Nested tasks as a node graph: the parent on the left, a column per phase, an arrow for every \"waits for\".",
	icon: "schema",
	intro: "Flow: a graph. The parent task is on the left, each phase is a column, and every arrow means \"waits for\". Green arrows come from finished tasks, dashed ones lead to tasks still waiting. A task's own subtasks show as small marks inside its box.",
});
