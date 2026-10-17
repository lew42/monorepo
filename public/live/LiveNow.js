import { div, span, a } from "/app.js";
import { TaskTree } from "/framework/ai/AITask/nested.js";
import LiveToday from "./LiveToday.js";
import TaskState from "./TaskState.js";

/* The "Now" card: what is in flight, the last landings and what waits, computed from the session index and the task logs
 * (LiveToday.load), never typed by an agent. Spans today and yesterday (UTC) so the midnight roll drops nothing.
 * A card {type:"part-live", live:"now"} draws this (Live.js). The refresh is LiveToday's 30 s timer; a stream replaces it when the session writer exposes one (doc/notes.md). */
export default class LiveNow extends LiveToday {
	static LANDED = 5;
	static WAITING = 6;
	static FLIGHT = 8;
	static STALE = 30 * 6e4;   // an "active" session quiet for this long is not in flight

	static async load(){
		const now = new Date(), day = n => this.day(new Date(now - n * 864e5));
		const days = (await Promise.all([day(0), day(1)].map(d => super.load(d).catch(() => null)))).filter(Boolean);
		const tasks = days.flatMap(d => [...d.tasks.values()].flat());
		const rows = days.flatMap(d => d.rows).filter(r => r.state === "active" && now - Date.parse(r.last_activity ?? 0) < this.STALE);
		return {
			rows,
			landed: tasks.filter(t => t.closeout.state === "done" && t.end).sort((x, y) => this.when(y) - this.when(x)).slice(0, this.LANDED),
			waiting: tasks.filter(t => t.closeout.state !== "done"),
		};
	}

	// A task node's `end` is a time (ms) once the tree is built, or the logged string before.
	static when(t){ return typeof t.end === "number" ? t.end : Date.parse(t.end); }

	static link(t){
		const url = TaskTree.url(t), name = t.title || t.agent || "task";
		return url ? a.c("live-today-name", name).href(url) : span.c("live-today-name", name);
	}

	// The feed tile: its title, which opens the full view (/live/now/), like the Tasks card.
	static line(box){ return box.empty(() => this.tile()); }
	static tile(){ a.c("live-tasks-line", "Now").href("/live/now/"); }   // the tile is its title (doc/notes.md, 2026-10-16); the counts are on the page

	static draw({ rows, landed, waiting }){
		const group = (title, count, body) => div.c("live-now-group", () => { span.c("live-now-head", `${title} (${count})`); body(); });
		div.c("live-today", () => {
			group("In flight", rows.length, () => rows.length
				? (rows.slice(0, this.FLIGHT).forEach(r => div.c("live-today-row", () => {
					a.c("live-today-name", r.agent || r.title || r.id.slice(0, 8)).href(`/framework/ai/sessions/${r.id}/`);
					span.c("live-today-model", r.model || "");
					span.c("live-today-cost", `$${(r.usd || 0).toFixed(2)}`);
				})), rows.length > this.FLIGHT && a.c("live-today-name", `+ ${rows.length - this.FLIGHT} more`).href("/framework/ai/sessions/"))
				: span.c("live-today-model", "nothing running"));
			group("Last landed", landed.length, () => landed.forEach(t => div.c("live-today-task is-landed", () => {
				this.link(t);
				span.c("live-today-state is-landed", new Date(this.when(t)).toISOString().slice(5, 16).replace("T", " "));
			})));
			group("Waiting", waiting.length, () => waiting.slice(0, this.WAITING).forEach(t => div.c("live-today-task is-waiting", () => {
				this.link(t);
				span.c("live-today-state is-waiting", TaskState.label(t.closeout));
			})));
		});
	}
}
