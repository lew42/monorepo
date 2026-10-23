import Day from "/framework/core/Session/Day.js";
import SessionTree from "../../doc/variants/SessionTree.js";

/* Everything the mobile variant reads, in one place (doc: readme.md here). Three files, all computed by node, nothing typed:
   the day's sessions/YYYY/MM/DD/index.json (one snapshot per session), sessions/session-tree.json (parent and role per
   session id) and ai/index.json (every task, read through SessionTree). */
export default class MobileData {

	static SESSIONS = "/framework/ai/sessions/";
	static HOME = MobileData.SESSIONS + "v/mobile/";
	static cache = new Map();

	static json(url){
		if (!this.cache.has(url)) this.cache.set(url, fetch(url).then(r => r.ok ? r.json() : null).catch(() => null));
		return this.cache.get(url);
	}

	static async day(day){ return (await this.json(`${this.SESSIONS}${day}/index.json`))?.snapshots ?? []; }
	static async tree(){ return (await this.json(this.SESSIONS + "session-tree.json")) ?? {}; }

	/** The sessions of the last `days` days, newest day first, each once. A snapshot is stamped with the day file it came from (`_day`). */
	static async days(days, from = new Date()){
		const seen = new Map();
		for (let i = 0; i < days; i++){
			const day = Day.path(new Date(from.getFullYear(), from.getMonth(), from.getDate() - i));
			for (const s of await this.day(day)) if (!seen.has(s.id)) seen.set(s.id, { ...s, _day: day });
		}
		return [...seen.values()];
	}

	/** One session by id: scans the last 14 day files once. */
	static async find(id){
		this.all ??= this.days(14);
		return (await this.all).find(s => s.id === id) ?? null;
	}

	/** The session's folder day ("2026/10/20"): its `day` field, else the day file it was found in. */
	static dir_day(snap){ return snap.day ? snap.day.replaceAll("-", "/") : snap._day; }
	static dir_url(snap){ return `${this.SESSIONS}${this.dir_day(snap)}/${snap.folder}/`; }
	static session_url(id){ return this.HOME + id + "/"; }
	static task_url(id, rel){ return this.HOME + id + "/" + rel + "/"; }

	/** The session's tasks as a tree (SessionTree.Node); null for a session with no folder or no task. */
	static async tasks(snap){
		if (!snap.folder) return null;
		const t = await SessionTree.load(this.dir_day(snap), snap.folder);
		return t.root.kids.length ? t : null;
	}

	// ---- what a session is -----------------------------------------------------------------------------

	/** One of "VS Code tab", "voice", "mastermind", "minion"; any other agent keeps its role word (reviewer, assistant...). */
	static kind(snap, tree){
		const role = tree[snap.id]?.role, agent = snap.agent ?? tree[snap.id]?.agent ?? "";
		if (snap.kind || /^v-/.test(snap.id) || role === "voice") return "voice";
		if (role === "minion" || agent.startsWith("minion")) return "minion";
		if (agent === "vscode-mastermind" || (!agent && !role && !snap.parent && !tree[snap.id])) return "VS Code tab";
		if (/mastermind/.test(role ?? "") || agent.includes("mastermind")) return "mastermind";
		return role ?? (agent.replace(/-.*/, "") || "session");
	}

	static parent(snap, tree){ return tree[snap.id]?.parent ?? snap.links?.parent ?? null; }

	/** Sessions with no parent anywhere in the tree: the missing-link list for the report. */
	static orphans(snaps, tree){
		return snaps.filter(s => ["minion", "mastermind"].includes(this.kind(s, tree)) && !this.parent(s, tree));
	}

	/** The tasks the session itself did, from ai/index.json (`session` = its id): where a session without a task folder keeps its outcome. */
	static async owned(snap){
		const [index] = await SessionTree.files(this.dir_day(snap));
		return index.tasks.filter(t => t.session === snap.id);
	}

	// ---- groups of the day --------------------------------------------------------------------------

	/** Needs you / Running / Done / the rest. Needs you = an alert or a red flag on the session, or a task waiting on someone.
	    Done = it has an outcome line (a landed task). The rest = idle with nothing landed. */
	static group(snap, tasks, line){
		if (snap.alerts > 0 || snap.flags > 0 || tasks?.root.all().some(n => n.state === "waiting")) return "needs";
		if (snap.state === "active") return "running";
		return line ? "done" : "rest";
	}

	/** The one line a finished session ends on: its latest landed task's, in its folder or owned by it. */
	static async outcome(snap, tasks){
		const own = (await this.owned(snap).catch(() => [])).filter(t => t.landed_at && t.line).map(t => ({ line: t.line, at: t.landed_at }));
		const here = (tasks?.root.all() ?? []).filter(n => n.landed && n.line).map(n => ({ line: n.line, at: n.ended }));
		return [...own, ...here].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0]?.line ?? null;
	}

	static usd(n){ return "$" + (n ?? 0).toFixed(n >= 100 ? 0 : 2); }

	static ago(iso){
		const m = Math.round((Date.now() - Date.parse(iso ?? "")) / 6e4);
		return isNaN(m) ? "" : m < 1 ? "just now" : m < 90 ? m + " min ago" : m < 2880 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
	}

	// ---- task status: the owner's rules (mobile-cards.md) -----------------------------------------------------
	// green done, amber running, red waiting or paused (blocked), grey open; a stopped task is dropped and not counted.

	static states(nodes){ return nodes.map(n => n.state).filter(s => s !== "stopped"); }
}
