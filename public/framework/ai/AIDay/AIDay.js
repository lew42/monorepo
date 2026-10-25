import { View, div, span, a, p, small, button } from "/app.js";
import QueryClient from "/framework/ext/Query/QueryClient.js";
import { fold } from "/framework/ai/AITask/message.js";
import Approvals from "/framework/ai/AISession/Approvals.js";
import ReadyToMerge from "/framework/ai/merge/ReadyToMerge.js";

View.stylesheet(import.meta, "AIDay.css");

/** AIDay: one day as a check-mark list. Every task that landed (✅) or is still open (⬜), a task under its parent task under its session.
 *  Rows come from the dev server's "tasks" query source (Server/SessionIndex.mjs, read from the sessions store); a changed row is pushed over the socket.
 *  Below the list: the day's log lines (day.jsonl) and the owner's dictations (chat lines in the day's records). Readme: readme.md. */
export default class AIDay extends View {
	static DAY = /\/(\d{4}-\d{2}-\d{2})\/?$/;
	static STORE = /sessions\/\d{4}\/\d\d\/\d\d\/(.*)$/;
	static usd(n){ return n >= 100 ? "$" + Math.round(n) : "$" + (n || 0).toFixed(2); }
	static hhmm(ms){ return ms ? new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : ""; }
	/** The first line of an outcome, markdown stripped. */
	static first(text){ return String(text ?? "").split("\n").map(l => l.trim()).find(Boolean)?.replace(/\*\*|`/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").slice(0, 160) ?? ""; }
	static shift(day, by){ const d = new Date(day + "T12:00:00"); d.setDate(d.getDate() + by); return d.toLocaleDateString("sv"); }
	static today(){ return new Date().toLocaleDateString("sv"); }
	/** "2026/10/20" → that day and each day after it up to today, at most 31, as "YYYY/MM/DD". */
	static days_from(day){
		const out = [], base = new Date(day.replaceAll("/", "-") + "T12:00:00"), today = AIDay.today();
		for (let i = 0; i < 31; i++){ const d = new Date(base.getTime() + i * 864e5).toLocaleDateString("sv"); if (d > today) break; out.push(d.replaceAll("-", "/")); }
		return out;
	}

	static done(n){ return !!n.r?.landed; }
	static when(n){ return n.r ? (n.r.landed ? n.r.landed_at : n.r.started) || 0 : 0; }
	static walk(nodes, fn){ nodes.forEach(n => { fn(n); AIDay.walk(n.kids, fn); }); }
	static title(n){ const t = n.r?.title || AIDay.first(n.r?.request) || n.rel.split("/").pop().replace(/-/g, " "); return t.length > 100 ? t.slice(0, 97) + "…" : t; }

	get classes(){ return "aid"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){
		this.day = /^\d{4}-\d{2}-\d{2}$/.test(this.day ?? "") ? this.day : location.pathname.match(AIDay.DAY)?.[1] ?? AIDay.today();
		this.rows = new Map();
		this.loading = true;
		this.error = "";
		this.snaps = new Map();       // "day/folder" -> session snapshot, or null when none was found
		this.approvals = new Map();   // snapshot day (2026/10/20) -> Approvals stream
		this.client = new QueryClient("tasks", { row: r => this.change(r), stale: () => this.ask() });
		super.initialize();
	}

	render(){
		const before = AIDay.shift(this.day, -1), after = AIDay.shift(this.day, 1);
		div.c("aid-nav", () => {
			a.c("aid-link", "‹ " + before).href(`/framework/ai/${before}/`);
			if (after <= AIDay.today()) a.c("aid-link", after + " ›").href(`/framework/ai/${after}/`);
		});
		this.$head = div.c("aid-head");
		if (this.day === AIDay.today()) div.c("aid-merge", () => { div.c("aid-mhead", "Ready to merge"); new ReadyToMerge(); a.c("aid-link", "Task queue, best first →").href("/framework/ai/queue/").attr("target", "_self"); });
		this.$list = div.c("aid-list");
		div.c("aid-more", () => {
			fold("Prompts of the day (the owner's dictations)", () => this.prompts());
			fold("Log lines of the day", () => this.log_lines());
			a.c("aid-link", "Sessions of this day, by origin →").href(`/framework/ai/?day=${this.day}`).attr("target", "_self");
		});
		this.paint();
		this.ask();
	}

	// ── data ─────────────────────────────────────────────────────────────
	/** Two asks: tasks that landed this day from any folder (most work lands in an older session's folder), then this day's folders.
	 *  The folder-day ask goes last because the server pushes changed rows for the client's last query only. */
	async ask(){
		const ask = field => this.client.ask({ where: [{ field, op: "eq", value: this.day }], limit: 1000 }, { timeout: 20000 });
		const landed = await ask("landed_day"), res = await ask("day");
		this.loading = false;
		if (res.error) { this.error = res.error; return this.paint(); }
		this.error = "";
		this.rows = new Map([...(landed.rows ?? []), ...res.rows].map(r => [r.id, r]));
		this.paint();
		await this.find_snaps();
		this.paint();
	}

	/** Each session root's snapshot, matched by folder name and folder day. Approvals keys by snapshot id. A snapshot is filed in the index of the
	 *  session's LAST active day, so this reads every day index from the folder's day to today (at most 31), as SessionWork.find_snaps does. */
	async find_snaps(){
		const roots = this.tree().filter(s => s.kids.length), days = new Map();
		const index = d => days.get(d) ?? days.set(d, fetch(`/framework/ai/sessions/${d}/index.json`).then(r => r.ok && !(r.headers.get("content-type") ?? "").includes("html") ? r.json() : null).catch(() => null)).get(d);
		await Promise.all(roots.map(async s => {
			const day = (s.r?.day ?? s.day ?? this.day).replaceAll("-", "/"), key = day + "/" + s.rel;
			if (this.snaps.has(key)) return;
			let snap = null;
			for (const d of AIDay.days_from(day)){
				snap = (await index(d))?.snapshots?.find(x => x.folder === s.rel && (x.day ?? day).replaceAll("-", "/") === day) ?? null;
				if (snap) break;
			}
			this.snaps.set(key, snap);
			if (snap){
				snap.day ??= day;   // one day for the stream, the approval lookup and the write (review n3)
				const d = snap.day.replaceAll("-", "/");
				if (!this.approvals.has(d)){ const st = Approvals.of_day(d); st.on(() => this.paint()); this.approvals.set(d, st); }
			}
		}));
	}

	snap(s){ return this.snaps.get((s.r?.day ?? s.day ?? this.day).replaceAll("-", "/") + "/" + s.rel); }
	approval(snap){ return this.approvals.get((snap.day ?? "").replaceAll("-", "/"))?.of(snap.id) ?? null; }
	async approve(snap, $note){
		const ok = await this.approvals.get(snap.day.replaceAll("-", "/")).approve([snap]);
		if (!ok) $note.text("Not saved: approving writes the session's own record, which needs the local dev server.");
	}

	change(r){ this.rows.set(r.id, r); this.paint(); }

	/** A row's path inside its day folder: "session-ab/task/sub". */
	rel(r){ return r.dir.match(AIDay.STORE)?.[1] ?? r.slug; }

	/** Roots are sessions; a task nests under its nearest ancestor row, else directly under its session (made up when the session has no row, linked to its own dated folder). */
	tree(){
		const nodes = [...this.rows.values()].map(r => ({ r, rel: this.rel(r), kids: [] })), by = new Map(nodes.map(n => [n.rel, n])), roots = new Set();
		for (const n of nodes){
			const up = n.rel.split("/").slice(0, -1);
			while (up.length && !by.has(up.join("/"))) up.pop();
			if (up.length) { by.get(up.join("/")).kids.push(n); continue; }
			const top = n.rel.split("/")[0];
			if (top === n.rel) roots.add(n);
			else { if (!by.has(top)) by.set(top, { r: null, rel: top, kids: [], day: n.r.day, url: n.r.url.slice(0, n.r.url.indexOf("/" + top + "/") + top.length + 2) }); by.get(top).kids.push(n); roots.add(by.get(top)); }
		}
		return [...roots];
	}

	// ── drawing ──────────────────────────────────────────────────────────
	paint(){
		if (this.el) this.el.dataset.ready = String(!this.loading);
		const roots = this.tree(), tasks = [];
		roots.forEach(s => AIDay.walk(s.kids, n => tasks.push(n)));
		const landed = tasks.filter(AIDay.done).length, usd = tasks.reduce((s, n) => s + (n.r?.usd || 0), 0);
		this.$head.empty(() => {
			if (this.loading) return void span.c("aid-what", "Asking the server what happened…");
			span.c("aid-count", String(landed));
			span.c("aid-what", ` landed · ${tasks.length - landed} open${usd > 0 ? " · " + AIDay.usd(usd) : ""}`);
		});
		this.$list.empty(() => {
			if (this.loading) return;
			if (this.error) return void p.c("aid-empty", this.error === "no socket" || this.error === "no source"
				? "This list is read from the store by the dev server, and a static copy has no one to ask. The day's sessions are linked below."
				: "Could not ask the server: " + this.error);
			if (!tasks.length) return void p.c("aid-empty", "No task was opened or landed on this day.");
			roots.filter(s => s.kids.length).sort((x, y) => this.latest(y) - this.latest(x)).forEach(s => this.session(s));
		});
	}

	/** The newest time at or under a node, so a busy session floats up. */
	latest(n){ let t = AIDay.when(n); AIDay.walk(n.kids, k => t = Math.max(t, AIDay.when(k))); return t; }

	session(s){
		let landed = 0, open = 0;
		AIDay.walk(s.kids, n => AIDay.done(n) ? landed++ : open++);
		div.c("aid-session", () => {
			div.c("aid-shead", () => {
				a.c("aid-sname", s.r?.title || s.r?.agent || s.rel).href(s.r?.url ?? s.url ?? `/framework/ai/sessions/${this.day.replaceAll("-", "/")}/${s.rel}/`);
				const day = s.r?.day ?? s.day;
				if (day && day !== this.day) span.c("aid-from", "started " + day);
				span.c("aid-sum", `${landed} ✅ · ${open} ⬜`);
				const snap = this.snap(s);
				if (snap && this.approval(snap)) span.c("aid-approved", "approved");
				else if (snap) button.c("aid-approve", "Approve").attr("type", "button").attr("title", "Approve this session and everything in it")
					.click(e => { e.target.disabled = true; this.approve(snap, $note); });
			});
			const $note = div.c("aid-note");
			if (this.snap(s) === null) small.c("aid-nosnap", "No snapshot of this session was found in its day's index, so it cannot be approved here.");
			this.level(s.kids);
		});
	}

	/** Open first, then newest first; children nest one step in. */
	level(nodes){
		[...nodes].sort((x, y) => (AIDay.done(x) - AIDay.done(y)) || (AIDay.when(y) - AIDay.when(x))).forEach(n => {
			div.c("aid-task " + (AIDay.done(n) ? "aid-done" : "aid-open"), () => {
				div.c("aid-row", () => {
					span.c("aid-mark", AIDay.done(n) ? "✅" : "⬜");
					span.c("aid-time", AIDay.hhmm(AIDay.when(n)));
					a.c("aid-name", AIDay.title(n)).href(n.r?.url ?? "#");
				});
				const out = AIDay.done(n) ? AIDay.first(n.r?.outcome) : (n.r?.state ?? "");
				if (out) div.c("aid-out", out);
				if (n.kids.length) div.c("aid-kids", () => this.level(n.kids));
			});
		});
	}

	// ── the folds below the list ─────────────────────────────────────────
	log_lines(){
		return div.c("aid-lines", async $l => {
			const res = await fetch(`/framework/ai/sessions/${this.day.replaceAll("-", "/")}/day.jsonl`).catch(() => null);
			const ok = res?.ok && !(res.headers.get("content-type") ?? "").includes("html");
			const lines = ok ? (await res.text()).split("\n").flatMap(l => { try { const o = JSON.parse(l).log; return o ? [o] : []; } catch { return []; } }) : [];
			$l.append(() => lines.length
				? lines.sort((x, y) => Date.parse(y.at) - Date.parse(x.at)).forEach(l => div.c("aid-line", `${AIDay.hhmm(Date.parse(l.at))} ${l.task ? l.task + ": " : ""}${l.msg}`))
				: p.c("aid-empty", "No log lines for this day."));
		});
	}

	/** The owner's chat lines from the records of rows that have any. */
	prompts(){
		return div.c("aid-lines", async $l => {
			const rows = [...this.rows.values()].filter(r => r.chats > 0).slice(0, 40), found = [];
			await Promise.all(rows.map(async r => {
				for (const f of ["session.jsonl", "task.jsonl"]){
					const res = await fetch(r.url + f).catch(() => null);
					if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) continue;
					(await res.text()).split("\n").forEach(l => { try { const c = JSON.parse(l).chat; if (c?.from?.kind === "owner" && c.text) found.push({ ...c, url: r.url }); } catch {} });
					return;
				}
			}));
			found.sort((x, y) => Date.parse(x.at) - Date.parse(y.at));
			$l.append(() => found.length
				? found.forEach(c => div.c("aid-line", () => { span.c("aid-time", AIDay.hhmm(Date.parse(c.at))); a.c("aid-name", c.text.slice(0, 300)).href(c.url); }))
				: p.c("aid-empty", "No dictations recorded in this day's store."));
		});
	}
}
