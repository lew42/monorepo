import { Doc, md, code, div, span } from "/app.js";
import dropdown from "./dropdown.js";

const OPTIONS = [
	{ value: "block", label: "block", icon: "view_agenda" },
	{ value: "flex", label: "flex", icon: "view_column" },
	{ value: "grid", label: "grid", icon: "grid_on" },
];

export default new Doc({
	meta: import.meta,
	title: "Dropdown",
	description: "One choice out of a list — a trigger showing its picture and its name, and a list that opens in the top layer, so nothing can clip it.",
	icon: "arrow_drop_down_circle",

	files: "dropdown.js dropdown.css page.js readme.md",
	notes: "decisions",

	content(){

		code.js(`import dropdown from "/framework/ext/Dropdown/dropdown.js";

dropdown({
    options: [
        { value: "block", label: "block", icon: "view_agenda" },
        { value: "flex",  label: "flex",  icon: "view_column" },
        { value: "grid",  label: "grid",  icon: "grid_on" },
    ],
    value: "flex",
    pick: name => item.set("display", name),
});`);

		md("**Pick one.** Click it, or press ↓ on the trigger and walk the list with the arrow keys. It closes on a pick, on Escape, or on a click anywhere else — none of which is code in this module: an `auto` popover brings all three.");

		let value = "flex";
		const $live = div.c("flex gap v-center");

		const draw = () => $live.empty(() => {
			dropdown({ options: OPTIONS, value, title: "Display", pick: v => { value = v; draw(); } });
			span.c("muted", "display: " + value);
		});

		draw();

		md("**The list is never clipped.** It opens in the browser's *top layer*, above every `overflow: hidden` ancestor, and `dropdown.js` measures its place off the trigger — below it, or above when there is no room below, clamped to the viewport either way. That is the whole reason this module exists: [`doc/decisions.md`](./doc/decisions.md).");

		md("**Where it earns its keep:** the panel rail. A workspace, a panel and the rail are all `overflow: hidden`, and every picker drawn inside one used to be cut off — 365 of them at 1280 on one page. Open [Panel](/framework/ext/Panel/), click a panel, and pick its **template** or its **display** from the rail on the right.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
