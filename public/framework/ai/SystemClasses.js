import { div, a, span, small, strong, icon } from "/app.js";
import { file_link } from "/framework/ext/filesystem/file_link.js";

/* THE AI SYSTEM AS CLASSES (the owner, 2026-10-08: "show structure, not prose").
   `SystemClasses.CLASSES` is the hand-picked core API of each Servex class: the few members a newcomer
   should know, judged by reading the source, not weighted by a script. `SystemClasses.card()` draws one;
   `SystemClasses.liveAgents()` draws the running Servex's agents. Servex classes are node code, so they
   cannot be imported here, and this list is the card's data. Source of truth: the file named on
   each card. When a class changes shape, edit its entry.
   Not-yet-classes (loose functions that should become one) are listed in
   ai/sessions/2026/10/08/ai-system-docs-fa3e829d/ai-system-docs/findings.md. */
const CLASSES = [
	{ name: "Servex", icon: "hub", file: "Servex/Servex.js", doc: "/framework/servex/",
		gist: "The always-on process. It owns port 80, the logs, the dev servers, and holds every agent.",
		api: ["agents", "dispatcher", "pool", "usage", "heartbeat", "monitor", "command(name, verb)", "routes()", "health()", "listen(port)"] },
	{ name: "Agents", icon: "groups", file: "Servex/agents/Agents.js", doc: "/framework/servex/doc/roles/",
		gist: "Every live agent, and the one place that starts, wakes, sleeps and stops them.",
		api: ["live", "spawn(opts)", "send(id, text)", "wake(id)", "stop(id)", "list()", "counts()"] },
	{ name: "Dispatcher", icon: "alt_route", file: "Servex/agents/Dispatcher.js", doc: "/framework/servex/",
		gist: "Takes a prompt that arrives and routes it to the agent that owns it.",
		api: ["queue", "running", "dispatch(prompt)", "pump()", "listen()"] },
	{ name: "Prompt", icon: "edit_note", file: "public/framework/core/Task/Prompt.js", doc: "/framework/core/Task/",
		gist: "One thing the owner said, as a Task: the raw words (never lost), cleaned paragraphs with numbered sentences, replies anchored to them, and the asks made from it as its own tasks. Completion and cost roll up to the session.",
		api: ["raw", "paragraphs", "sentences", "replies", "tasks", "completion", "Prompt.trace(session, words)"] },
	{ name: "PromptRun", icon: "article", file: "public/framework/ext/Refine/PromptRun.js", doc: "/framework/ext/Refine/",
		gist: "The refine run's in-memory view-model of one prompt (raw, scored clean sentences, refined cards); its page shows the rendered result beside a live debug tree.",
		api: ["raw", "clean", "refined", "ms", "load({ clean, structure, ms })", "set(fields)", "sentence(n)", "view"] },
	{ name: "Session", icon: "history_toggle_off", file: "public/framework/ai/AISession/AISession.js", doc: "/framework/ai/classes/Session/",
		gist: "One Claude session's cost and state, computed in code from its transcript. Same file runs on the server and in the browser.",
		api: ["id", "ix", "s", "total_usd", "wall_ms", "render()", "on(fn)", "detail()", "Session.of(id)", "Session.all", "Session.apply_delta(line)"] },
	{ name: "Sessions", icon: "forum", file: "Servex/agents/Sessions.js", doc: "/framework/ai/sessions/",
		gist: "The owner's voice and chat sessions: what was said, which assistant answered, resumable.",
		api: ["create()", "resume(id)", "say(session, text)", "recent()", "summarize(id)", "brief(id)"] },
	{ name: "Assistant", icon: "support_agent", file: "Servex/agents/Assistant.js", doc: "/framework/servex/doc/roles/",
		gist: "A long-lived agent that answers the owner in a line and hands work on.",
		api: ["start()", "listen()", "heard(words)", "card_reply(card, text)", "route(text)"] },
	{ name: "Pool", icon: "inventory_2", file: "Servex/Pool.js", doc: "/framework/servex/doc/pool.md",
		gist: "Keeps a few warm git worktrees ready so a quick fix starts at once.",
		api: ["K", "slots", "take(caller)", "give_back(id)", "reclaim()", "sweep()"] },
	{ name: "Usage", icon: "speed", file: "Servex/Usage.js", doc: "/framework/servex/",
		gist: "Reads the weekly and five-hour limits into usage.json so everyone can check pace.",
		api: ["start()", "tick()", "pick()", "every"] },
	{ name: "Budget", icon: "savings", file: "Servex/Budget.js", doc: "/framework/servex/doc/budget.md",
		gist: "Enforces each task's Budget: line. 100% stops new spawns; 150% stops minions.",
		api: ["capped", "row(id)", "descendants(id)", "refuse(spawn)", "sweep()"] },
	{ name: "Heartbeat", icon: "monitor_heart", file: "Servex/Heartbeat.js", doc: "/framework/servex/doc/task-loop.md",
		gist: "Pings a task's silent owner and revives one that died, so open work keeps moving.",
		api: ["silent_ms", "revive_gap_ms", "agents", "tick()"] },
	{ name: "TaskLoop", icon: "sync", file: "Servex/TaskLoop.js", doc: "/framework/servex/doc/task-loop.md",
		gist: "Every few minutes, finds open tasks that went quiet and escalates them.",
		api: ["every_min", "quiet_min", "max_escalations", "tick()"] },
	{ name: "Worktrees", icon: "account_tree", file: "Servex/Worktrees.js", doc: "/framework/servex/doc/processes.md",
		gist: "Watches every git worktree: which are idle, finished, or safe to remove.",
		api: ["list()", "judge(wt)", "idle_enough(wt)", "salvage(wt)", "remove(wt)", "summary()"] },
	{ name: "Monitor", icon: "monitor", file: "Servex/Monitor.js", doc: "/framework/servex/",
		gist: "Watches CPU and RAM and raises a hot flag to the Servex mastermind.",
		api: ["every", "hot_cpu", "low_ram_gb", "notify"] },
];

const by_name = Object.fromEntries(CLASSES.map(c => [c.name, c]));
const SERVEX = "http://localhost/api/agents";

export class SystemClasses {

	static find(name){ return by_name[name]; }

	/* One class: icon + name on a dark card, its gist, then its core API as plain unboxed
	   items (no cards inside the card). The source file is the second link. */
	static card(c){
		return div.c("card page-surface-dark flex v gap-35 ai-class-card", () => {
			a.c("flex gap-50", () => { icon(c.icon).style({ fontSize: "2rem" }); strong(c.name); })
				.attr("href", c.doc).style({ textDecoration: "none", color: "inherit", alignItems: "center" });
			small.c("muted", c.gist);
			div.c("flex wrap gap-50", () => c.api.forEach(m => span.c("ai-class-api", m).style({ fontFamily: "var(--mono, monospace)", fontSize: ".8em" })));
			small(() => a("source").attr("href", file_link(c.file)));
		});
	}

	static cards(names){
		const list = (names ? names.map(SystemClasses.find) : CLASSES).filter(Boolean);
		return div.c("wide", () => list.forEach(c => SystemClasses.card(c)))
			.style({ display: "grid", gap: "var(--gap, 1rem)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))" });
	}

	/* LIVE INSTANCES: the agents the running Servex holds right now. Fetched from Servex's own
	   /api/agents (port 80); if Servex is not running, a quiet line says so. The box is captured
	   now and filled in the callback (no DOM after an await). */
	static liveAgents(limit = 12){
		const box = div.c("ai-live-agents flex v gap-25");
		small.c("muted", "Live from Servex.");
		fetch(SERVEX).then(r => r.json()).then(rows => {
			const live = rows.filter(r => r.state !== "stopped").sort((x, y) => String(y.started_at).localeCompare(String(x.started_at))).slice(0, limit);
			box.append(() => live.forEach(r => div.c("flex gap-50", () => {
				icon(r.role === "mastermind" ? "psychology" : r.role === "minion" ? "engineering" : "smart_toy");
				strong(r.id);
				small.c("muted", [r.role, r.model?.replace("claude-", ""), r.state, "$" + (r.cost ?? 0).toFixed(2)].filter(Boolean).join(" · "));
			}).style({ alignItems: "center" })));
		}).catch(() => box.append(() => small.c("muted", "Servex is not answering, so no agents to show.")));
		return box;
	}

	static CLASSES = CLASSES;

}

export default SystemClasses;
