import Task from "./Task.js";
import View, { div, span, a, small, strong, icon } from "../View/View.js";

View.stylesheet(import.meta, "TaskView.css");

/* A task drawn at three sizes (chip, row, card); reads the task itself and redraws on its changes. doc: readme.md */
export default class TaskView extends View {
	static sizes = ["chip", "row", "card"];
	static PREVIEW = 3;   // a parent row previews this many open children
	static STAGE = { idle: "check_box_outline_blank", waiting: "hourglass_empty", running: "play_circle", paused: "pause_circle", stopped: "stop_circle", complete: "check_box", loading: "hourglass_top", missing: "error_outline" };   // the row's one control: its stage IS its checkbox
	static VERBS = [["start", "play_arrow", "Start"], ["pause", "pause", "Pause"], ["resume", "play_arrow", "Resume"], ["stop", "stop", "Stop"], ["approve", "check", "Approve"]];   // [verb, Material icon, label]: the buttons, shown when Task.can(verb)
	static SEGMENTS = 8;   // past this many children the bar is one meter and a count, so the title keeps the room
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

	// The one row look: one stage checkbox, title link, segmented bar. A parent is bigger and previews open children; a click expands all.
	row(){
		const t = this.task, kids = this.kids(), open = kids.filter(k => k.state !== "complete");
		this.expanded ??= false;
		this.ac(kids.length ? "is-parent" : "is-leaf");
		div.c("task-row-head", () => {
			icon(this.constructor.STAGE[t.state] ?? "help").ac("task-state-icon", "is-" + t.state).attr("title", t.state);
			const link = this.url() ?? t.data.path;
			(link ? a.c("task-row-title", this.title()).href(link) : strong.c("task-row-title", this.title())).click(e => e.stopPropagation());
			this.bar(kids);
			this.actions();
		}).click(() => { this.expanded = !this.expanded; this.redraw(); });
		if (!kids.length) return;
		const shown = this.expanded ? kids : open.slice(0, this.constructor.PREVIEW);
		div.c("task-row-kids", () => {
			shown.forEach(k => this.constructor.row(k));
			if (!this.expanded && open.length > shown.length) small.c("task-row-more", `+ ${open.length - shown.length} more open`).click(() => { this.expanded = true; this.redraw(); });
		});
	}

	// The verbs this task's state allows, as small icon buttons; a click saves the VERB (task.act), the row does not toggle.
	actions(){
		const verbs = this.constructor.VERBS.filter(([verb]) => this.task.can(verb));
		if (!verbs.length) return;
		span.c("task-actions", () => verbs.forEach(([verb, glyph, label]) => {
			const b = span.c("task-action", () => icon(glyph)).attr("role", "button").attr("title", label).attr("aria-label", label).attr("data-verb", verb);
			b.click(e => { e.stopPropagation(); this.task.act(verb); });
		}));
	}

	bar(kids){ this.constructor.draw_bar(kids.map(k => k.state)); }

	/** The one segmented bar, from child states: a segment each up to `max`, then a stacked meter. green done, amber running, red waiting or paused. */
	static draw_bar(states, max = this.SEGMENTS){
		if (!states.length) return;
		const done = states.filter(s => s === "complete").length;
		const tip = `${done} of ${states.length} complete`;
		const status = s => s === "complete" ? "is-lit" : s === "running" ? "is-running" : s === "waiting" || s === "paused" ? "is-blocked" : "task-seg-off";
		if (states.length > max) return void div.c("task-bar is-meter", () => {
			span.c("task-meter", () => ["is-lit", "is-running", "is-blocked"].forEach(c => {
				const n = states.filter(s => status(s) === c).length;
				if (n) span.c("task-meter-fill").ac(c).style({ width: Math.round(n / states.length * 100) + "%" });
			}));
			small.c("task-count", `${done}/${states.length}`);
		}).attr("title", tip);
		div.c("task-bar", () => states.forEach(s => span.c("task-seg").ac(status(s)))).attr("title", tip);
	}

	card(){
		const t = this.task;
		div.c("flex gap-50", () => { icon(t.get("icon") ?? "task_alt").style({ fontSize: "2rem" }); strong(this.title()); small.c("muted task-state", t.state); this.actions(); });
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
