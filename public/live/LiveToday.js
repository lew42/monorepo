import { div, span, a } from "/app.js";
import { tree_for_day } from "/framework/ai/AITask/tree.js";
import { TaskTree } from "/framework/ai/AITask/nested.js";
import AISessionRows from "/framework/ai/AISession/AISessionRows.js";

/* The "Today" card: today's sessions (the day index the session writer keeps) with each session's tasks (tree_for_day) under it.
 * Read at render time, redrawn every 30 s. A Live card of type "part-live" with live:"today" draws this (Live.js). */
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
		const rows = (index?.snapshots ?? []).filter(s => s.first_at).sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
		return { day, rows, tasks };
	}

	// Draws into the open container: one block per session, its tasks nested under it.
	static draw(data){
		const { rows, tasks, day } = data, usd = rows.reduce((s, r) => s + (r.usd || 0), 0);
		div.c("live-today", () => {
			span.c("live-today-sum", `${day}: ${rows.length} sessions, $${usd.toFixed(2)}`);
			rows.forEach(r => div.c("live-today-session", () => {
				div.c("live-today-row", () => {
					a.c("live-today-name", r.agent || r.title || r.id.slice(0, 8)).href(`/framework/ai/sessions/${r.id}/`);
					span.c("live-today-model", r.model || "");
					span.c("live-today-cost", `$${(r.usd || 0).toFixed(2)}`);
					span.c(`live-today-state is-${r.state}`, r.state);
					if (r.parent) span.c("live-today-parent", () => { span("from "); span.c("live-today-by", r.parent); });
				});
				(tasks.get(r.agent) ?? []).forEach(t => div.c("live-today-task", () => {
					const url = TaskTree.url(t), name = t.title || t.agent || "task";
					url ? a.c("live-today-name", name).href(url) : span.c("live-today-name", name);
					span.c(`live-today-state is-${t.state}`, this.STATE[t.state] ?? t.state);
				}));
			}));
		});
	}

	// Fills `box` (a View) now and again every 30 s while it is on the page.
	static into(box){
		let first = true;
		const go = async () => {
			if (!first && !box.el.isConnected) return clearInterval(timer);   // the card was redrawn away
			first = false;
			try { const data = await this.load(); box.empty(() => this.draw(data)); }
			catch (e) { box.empty(() => span("Could not read today's sessions: " + e.message)); }
		};
		const timer = setInterval(go, 30000);
		return go();
	}
}
