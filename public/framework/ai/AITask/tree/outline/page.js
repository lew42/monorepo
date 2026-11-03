import { Outline } from "../../nested.js";
import { design_page } from "../design.js";

export default design_page(import.meta, Outline, {
	title: "Outline",
	description: "Nested tasks as an indented outline: every group of subtasks badged \"together\" or \"then\", the % at the end of each row.",
	icon: "account_tree",
	intro: "Outline: read top to bottom, indented by depth. Each group of subtasks carries a badge: \"together\" runs at the same time, \"then\" waits for the group above it. The % is at the end of every row.",
});
