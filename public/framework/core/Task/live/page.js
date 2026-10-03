import { Page, div, p, span, button } from "/app.js";
import Task from "../Task.js";

/* THE DEMO: a real Task with two subtasks, driven entirely from buttons — no
   reload, nothing saved (Task doesn't need a file to prove the state machine;
   core/Item/live/ is the one that demos SAVING). `/framework/core/Task/` is the
   data model; this is the same thing, live, on a page you can click around on. */

function fresh(){
	const root = new Task({ id: "root", data: { title: "Ship the feature" } });
	["Write the code", "Review it"].forEach((title, i) =>
		root.tasks.add(new Task({ id: "s" + i, data: { title } })));
	return root;
}

export default new Page({
	meta: import.meta,
	title: "Live",
	description: "Start, pause and finish a real Task with subtasks — no reload. Try to finish it too early and watch it refuse.",
	icon: "checklist",
	width: "large",

	initialize(){
		this.root = fresh();
		this.message = "";
	},

	render_content(){
		let $status, $message, $tree;

		const row = (task, { indent } = {}) => div.c("flex gap v-center pad surface", () => {
			span(task.get("title") ?? task.id).style("flex", "1");
			span.c("muted", task.state);
			button("Start").click(() => { task.start(); draw(); });
			button("Pause").click(() => { task.pause(); draw(); });
			button("Resume").click(() => { task.resume(); draw(); });
			button("Finish").click(() => {
				const before = task.state;
				task.finish();
				this.message = task.state === before && before !== "finished"
					? (task === this.root ? "Refused — a subtask isn't finished yet." : `Refused — can't finish from "${before}".`)
					: "";
				draw();
			});
		}).style({ "--gap": "0.5em", "--pad": "0.6em", "margin-left": indent ? "1.5em" : "0" });

		const draw = () => {
			const prog = this.root.progress();
			$status.empty(() => span.c("h4 muted",
				`progress ${prog.done}/${prog.total} · duration ${(this.root.duration() / 1000).toFixed(1)}s`));

			$message.empty(() => {
				if (this.message) p.c("muted", this.message).style("color", "var(--error)");
			});

			$tree.empty(() => {
				row(this.root);
				div.c("flex v gap", () => { this.root.tasks.forEach(t => row(t, { indent: true })); });
			});
		};

		const $page = div.c("flex v gap wide", () => {
			p.c("page-content-lede", "Start the parent, then press its Finish before both subtasks are finished — it refuses and says why, right here. Finish both subtasks, then Finish the parent again: it works.");
			div.c("flex gap", () => button("Reset").click(() => { this.root = fresh(); this.message = ""; draw(); }));
			$status = div.c("flex gap wrap");
			$message = div.c("flex gap");
			$tree = div.c("flex v gap");
		});

		draw();
		this._interval = setInterval(draw, 500);   // so "duration" visibly ticks while running

		return $page;
	},
});
