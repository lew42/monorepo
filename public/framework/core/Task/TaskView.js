import Task from "./Task.js";
import View, { div, span, a, small, strong, icon } from "../View/View.js";

/* A task drawn at three sizes (chip, row, card); reads the task itself and redraws on its changes. doc: readme.md */
export default class TaskView extends View {
	static sizes = ["chip", "row", "card"];
	static chip(task){ return new this({ task, size: "chip" }); }
	static row(task){ return new this({ task, size: "row" }); }
	static card(task){ return new this({ task, size: "card" }); }

	initialize(){
		this.size ??= "card";
		this.redraw = () => this.empty(() => this[this.size]());
		this.ac("task-view", "task-" + this.size);
		if (this.size !== "card") this.style({ display: "flex", gap: ".5em", alignItems: "center" });
		this.redraw();
		this.task.on("change", this.redraw);
		if (this.size === "card") this.task.tasks.on("delta", this.redraw);
		if (this.size === "card") this.task.content.on("delta", this.redraw);   // add, remove, reorder only; a subtask view redraws itself
	}

	title(){ return this.task.get("title") ?? this.task.id ?? "?"; }
	url(){ return this.task.get("url") ?? this.task.get("href") ?? null; }
	percent(){ return Math.round(this.task.completion * 100) + "%"; }

	chip(){
		icon(this.task.get("icon") ?? "task_alt");
		span(this.title());
	}

	row(){
		icon(this.task.get("icon") ?? "task_alt");
		strong(this.title());
		small.c("muted task-state", this.task.state);
		small.c("muted", this.percent());
	}

	card(){
		const t = this.task;
		div.c("flex gap-50", () => { icon(t.get("icon") ?? "task_alt").style({ fontSize: "2rem" }); strong(this.title()); small.c("muted task-state", t.state); });
		const facts = [["complete", this.percent()], ["priority", t.priority?.score], ["commits", t.commits.map(h => h.slice(0, 7)).join(" ")], ["session", t.session], ["module", t.module]];
		for (const [k, v] of facts) if (v !== undefined && v !== null && v !== "") div(() => { small.c("muted", k + ": "); span(String(v)); });
		for (const line of [t.expected].flat()) if (line) div(() => { small.c("muted", "expected: "); span(String(line)); });   // string | string[]: one line each
		for (const item of t._content ?? []){
			const text = item.get?.("text") ?? item.get?.("title") ?? item.data?.text ?? item.data?.title;
			if (text) div.c("task-content", String(text));
		}
		if (this.url()) a("Open").attr("href", this.url());
	}
}

Task.View = TaskView;
