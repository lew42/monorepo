import { Page, div, p, a, md } from "/app.js";
import { details, summary } from "../../../core/View/View.js";
import { Winner, TaskTree, counts } from "../nested.js";
import { tree_for_day } from "../tree.js";
import { switcher } from "./design.js";

/* A day's real tasks as a tree, in the winning design. `?date=YYYY-MM-DD` picks
   another day. The data is tree.js (built from each task.jsonl); the picture is
   nested.js. doc/nested.md.

   Order, most important first: the counts, then what is in flight (running,
   waiting, stopped), then the landed tasks folded under "N landed", then the
   words and the other views. */

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
			$box.append(() => p.c("muted", `Reading the task logs of ${date}…`));
			const roots = TaskTree.order(await tree_for_day(date).catch(e => (console.warn("tree_for_day", e), [])));
			$box.empty(() => {
				if (!roots.length) p.c("muted", `No task logs found for ${date}.`);
				else {
					const live = roots.filter(n => n.state !== "landed"), landed = roots.filter(n => n.state === "landed");
					counts(roots);
					if (live.length) new Winner(live).draw();
					else p.c("muted", "Nothing is running.");
					if (landed.length) details.c("ai-tree-landed", () => {
						summary(`${landed.length} landed ${landed.length === 1 ? "task" : "tasks"}, with their subtasks`);
						new Winner(landed).draw();
					});
				}
				p(`The tasks of ${date}, as a tree. Tasks side by side ran at the same time; "then" means the next column waited for the one before it.`);
				md("Waiting and series only show once a task's log carries `after`, and new spawns write it from 2026-09-29 on; older logs read as parallel. [The demo](/framework/ext/AITask/tree/demo/) shows both.");
				div.c("ai-tree-designs", () => {
					a("← " + shift(date, -1)).attr("href", `${here}?date=${shift(date, -1)}`);
					a(shift(date, 1) + " →").attr("href", `${here}?date=${shift(date, 1)}`);
					a("The day's task list").attr("href", `/framework/ai/${date}/`);
				});
				switcher(null);
				md("How the tree is built — `parent_task` and `after` on a task's first line, the % rule, the phases: [doc/nested.md](/framework/ext/AITask/doc/nested/).");
			});
		});
	},
});
