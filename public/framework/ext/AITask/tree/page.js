import { Page, div, p, a, span, md } from "/app.js";
import { Winner, TaskTree, counts } from "../nested.js";
import { tree_for_day } from "../tree.js";
import { switcher } from "./design.js";

/* Today's real tasks as a tree, in the winning design. `?date=YYYY-MM-DD` picks
   another day. The data is tree.js (built from each task.jsonl); the picture is
   nested.js. doc/nested.md. */

const local_day = (d = new Date()) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// The day on either side, for the prev / next links.
const shift = (date, by) => { const [y, m, d] = date.split("-").map(Number); return local_day(new Date(y, m - 1, d + by)); };

export default new Page({
	meta: import.meta,
	title: "Task tree",
	description: "A day's tasks as a tree: which ran at the same time, which waited, what is running now, and how far along each one is.",
	icon: "account_tree",
	children: "demo lanes outline flow",

	content(){
		const q = new URLSearchParams(location.search).get("date");
		const date = /^\d{4}-\d{2}-\d{2}$/.test(q || "") ? q : local_day();
		const here = "/framework/ext/AITask/tree/";

		// ⚠ No DOM after an await: the box is captured here, filled in the callback.
		div.c("ai-tree-page wide", async $box => {
			$box.append(() => {
				p(`The tasks of ${date}, as a tree. Tasks side by side ran at the same time; "then" means the next column waited for the one before it.`);
				div.c("ai-tree-designs", () => {
					a("← " + shift(date, -1)).attr("href", `${here}?date=${shift(date, -1)}`);
					a(shift(date, 1) + " →").attr("href", `${here}?date=${shift(date, 1)}`);
					a("The day's task list").attr("href", `/framework/ai/${date}/`);
				});
				switcher(null);
				this.$status = p.c("muted", "Reading the day's task logs…");
			});
			const roots = TaskTree.order(await tree_for_day(date).catch(e => (console.warn("tree_for_day", e), [])));
			this.$status.el.remove();
			$box.append(() => {
				if (!roots.length) return void p.c("muted", `No task logs found for ${date}.`);
				counts(roots);
				new Winner(roots).draw();
				md("How the tree is built — `parent_task` and `after` on a task's first line, the % rule, the phases: [doc/nested.md](/framework/ext/AITask/doc/nested/).");
			});
		});
	},
});
