import Task from "./Task.js";
import View, { div, span, a, small, strong, icon } from "../View/View.js";

View.stylesheet(import.meta, "TaskView.css");

/* A task drawn at three sizes (chip, row, card); reads the task itself and redraws on its changes. doc: readme.md */
export default class TaskView extends View {
	static sizes = ["chip", "row", "card"];
	static PREVIEW = 3;   // a parent row previews this many open children
	static STAGE = { idle: "radio_button_unchecked", waiting: "hourglass_empty", running: "play_circle", paused: "pause_circle", stopped: "stop_circle", complete: "check_circle", loading: "hourglass_top", missing: "error_outline" };
	static chip(task){ return new this({ task, size: "chip" }); }
	static row(task){ return new this({ task, size: "row" }); }
	static card(task){ return new this({ task, size: "card" }); }

	initialize(){
		this.size ??= "card";
		this.redraw = () => this.empty(() => this[this.size]());
		this.ac("task-view", "task-" + this.size);
		if (this.size === "chip") this.style({ display: "flex", gap: ".5em", alignItems: "center" });
		this.redraw();
		this.task.on("change", this.redraw);
		if (this.size !== "chip") this.watch_kids();
		if (this.size === "card") this.task.tasks.on("delta", this.redraw);
		if (this.size === "card") this.task.content.on("delta", this.redraw);   // add, remove, reorder only; a subtask view redraws itself
	}

	// Children read their own files first; redraw once they have, and whenever one changes (its bar segment).
	watch_kids(){
		const kids = [...(this.task._tasks ?? [])];
		kids.forEach(k => k.on("change", this.redraw));
		const pending = kids.map(k => k.ready).filter(Boolean);
		if (pending.length) Promise.all(pending).then(this.redraw);
	}
	kids(){ return [...(this.task._tasks ?? [])]; }

	title(){ return this.task.get("title") ?? this.task.id ?? "?"; }
	url(){ return this.task.get("url") ?? this.task.get("href") ?? null; }
	percent(){ return Math.round(this.task.completion * 100) + "%"; }

	chip(){
		icon(this.task.get("icon") ?? "task_alt");
		span(this.title());
	}

	// The one row look: checkbox, stage icon, title link, segmented bar. A parent is bigger and previews open children; a click expands all.
	row(){
		const t = this.task, kids = this.kids(), open = kids.filter(k => k.state !== "complete");
		this.expanded ??= false;
		this.ac(kids.length ? "is-parent" : "is-leaf");
		div.c("task-row-head", () => {
			icon(t.state === "complete" ? "check_box" : "check_box_outline_blank");
			icon(this.constructor.STAGE[t.state] ?? "help").ac("task-state-icon", "is-" + t.state).attr("title", t.state);
			const link = this.url() ?? t.data.path;
			(link ? a.c("task-row-title", this.title()).href(link) : strong.c("task-row-title", this.title())).click(e => e.stopPropagation());
			this.bar(kids);
		}).click(() => { this.expanded = !this.expanded; this.redraw(); });
		if (!kids.length) return;
		const shown = this.expanded ? kids : open.slice(0, this.constructor.PREVIEW);
		div.c("task-row-kids", () => {
			shown.forEach(k => this.constructor.row(k));
			if (!this.expanded && open.length > shown.length) small.c("task-row-more", `+ ${open.length - shown.length} more open`);
		});
	}

	bar(kids){
		if (!kids.length) return;
		const done = kids.filter(k => k.state === "complete").length;
		div.c("task-bar", () => kids.forEach(k => span.c("task-seg").ac(k.state === "complete" ? "is-lit" : "task-seg-off"))).attr("title", `${done} of ${kids.length} complete`);
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
		const kids = this.kids();
		if (kids.length) div.c("task-card-kids", () => kids.forEach(k => this.constructor.row(k)));
	}
}

Task.View = TaskView;
