import { Lanes } from "../../nested.js";
import { design_page } from "../design.js";

export default design_page(import.meta, Lanes, {
	title: "Lanes",
	description: "Nested tasks as lanes: each phase a column, left to right, with \"then\" between; tasks in one column run at the same time.",
	icon: "view_week",
	intro: "Lanes: read left to right. Each column is one phase, and the tasks in it run at the same time. \"Then\" means the next column waits for the one before it. A task with its own subtasks draws its own lanes inside its card.",
});
