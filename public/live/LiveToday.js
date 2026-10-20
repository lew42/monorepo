import { div, span, a } from "/app.js";
import { tree_for_day } from "/framework/ai/AITask/tree.js";
import { TaskTree } from "/framework/ai/AITask/nested.js";
import TaskState from "./TaskState.js";
import AISessionRows from "/framework/ai/AISession/AISessionRows.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

/* The "Today" card: today's sessions (the day index the session writer keeps) with each session's tasks (tree_for_day) under it.
 * Read at render time. A view that names `logs` (LiveNow: the task logs of what is in flight) is redrawn when one of them grows (a JSONL tail over the dev socket, any host); the 30 s timer runs only where the socket is down or a view has no logs to tail, and every 2 min as a backstop (the watcher does not push .json, so a new session shows by a tail or the backstop). A Live card of type "part-live" with live:"today" draws this (Live.js). */
export default class LiveToday {
	static STATE = { running: "in flight", landed: "landed", waiting: "waiting", stopped: "stopped" };

	// Today's UTC day, the folder name the session index uses.
	static day(now = new Date()){ return now.toISOString().slice(0, 10); }

	static async load(day = this.day()){
		const [y, m, d] = day.split("-");
		const index = await AISessionRows.get_json(`/framework/ai/sessions/${y}/${m}/${d}/index.json`);
		const roots = await tree_for_day(day).catch(() => []);
		const tasks = new Map();   // agent name -> its task nodes
		TaskTree.walk(roots, n => n.agent && (tasks.get(n.agent) ?? tasks.set(n.agent, []).get(n.agent)).push(n));
		// each task's own log decides done / finished / waiting-on-X (TaskState)
		const all = [...tasks.values()].flat();
		await Promise.all(all.map(async t => {
			const url = TaskTree.url(t), res = url && await fetch(url + "task.jsonl").catch(() => null);
			const text = res?.ok && !res.headers.get("content-type")?.includes("html") ? await res.text() : null;
			t.closeout = text ? TaskState.classify(TaskState.parse(text)) : t.state === "landed" ? { state: "done" } : { state: "waiting", on: "? (no log to read)" };
		}));
		const active = new Set((index?.snapshots ?? []).filter(s => s.state === "active").map(s => s.agent));   // an active agent's task is in flight, whatever its log says
		all.forEach(t => { if (t.closeout.state === "finished" && active.has(t.agent)) t.closeout = { state: "waiting", on: "its own agent (still active)" }; });
		const counts = { done: all.filter(t => t.closeout.state === "done").length };
		counts.waiting = all.length - counts.done;
		const rows = (index?.snapshots ?? []).filter(s => s.first_at).sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
		return { day, rows, tasks, counts };
	}

	// Draws into the open container: one block per session, its tasks nested under it.
	static draw(data){
		const { rows, tasks, day, counts } = data, usd = rows.reduce((s, r) => s + (r.usd || 0), 0);
		div.c("live-today", () => {
			span.c("live-today-sum", `${day}: ${rows.length} sessions, $${usd.toFixed(2)}; tasks: ${counts.done} done, ${counts.waiting} waiting`);
			rows.forEach(r => div.c("live-today-session", () => {
				div.c("live-today-row", () => {
					a.c("live-today-name", r.agent || r.title || r.id.slice(0, 8)).href(`/framework/ai/sessions/${r.id}/`);
					span.c("live-today-model", r.model || "");
					span.c("live-today-cost", `$${(r.usd || 0).toFixed(2)}`);
					span.c(`live-today-state is-${r.state}`, r.state);
					if (r.parent) span.c("live-today-parent", () => { span("from "); span.c("live-today-by", r.parent); });
				});
				(tasks.get(r.agent) ?? []).forEach(t => div.c(`live-today-task is-${t.closeout.state}`, () => {
					const url = TaskTree.url(t), name = t.title || t.agent || "task";
					url ? a.c("live-today-name", name).href(url) : span.c("live-today-name", name);
					span.c(`live-today-state is-${t.closeout.state === "done" ? "landed" : "waiting"}`, TaskState.label(t.closeout));
				}));
			}));
		});
	}

	// Fills `box` (a View) now, when a tailed log grows (draw -> data.logs), and on the timer (see the class comment).
	static into(box, view = "draw"){
		let first = true, ticks = 0, later;
		const socket = Socket.singleton(), tails = new Map();   // task log url -> its JSONL tail
		const stop = () => { clearInterval(timer); clearTimeout(later); tails.forEach(j => j.unsubscribe()); };
		const tail = logs => (logs ?? []).forEach(url => {
			if (tails.has(url)) return;
			const log = new JSONL({ url });
			tails.set(url, log);
			log.live(() => { clearTimeout(later); later = setTimeout(go, 800); });   // fires on lines appended after the first replay
		});
		const go = async () => {
			if (!first && !box.el.isConnected) return stop();   // the card was redrawn away
			first = false;
			try { const data = await this.load(); box.empty(() => this[view](data)); if (!socket.disabled) tail(data.logs); }
			catch (e) { box.empty(() => span("Could not read today's sessions: " + e.message)); }
		};
		const timer = setInterval(() => (!socket.connected || !tails.size || ++ticks % 4 === 0) && go(), 30000);
		return go();
	}
}
