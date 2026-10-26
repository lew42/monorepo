import View, { div, span, small, strong, a, p, button, details, summary, icon } from "/framework/core/View/View.js";
import AICost from "../AITask/AICost.js";
import PromptLog from "./PromptLog.js";
import SessionOutline from "./SessionOutline.js";
import Day from "/framework/core/Session/Day.js";

View.stylesheet(import.meta, "SessionOutline.css");

/** The session page's Overview: SessionOutline drawn. One box per child session (its name, state, model, cost line, "4 of 9 done", and the
 *  tasks it holds), then this session's own work, grouped by the prompt that asked for it. Every child's name links to that child's own page,
 *  the same page again, so the children of a child are its groups in turn. One full-width row per task; a done task opens its proof in place.
 *  Built with `new SessionOutlineView({ ready, sid })`: `ready` is the promise of the loaded SessionWork; `record(session)` is called with each
 *  replay of session.jsonl (SessionTasks), and the view redraws. Every dollar printed comes from AICost. */
export default class SessionOutlineView extends View {

	static ASK_ALL = 8;   // up to this many children, Servex is asked for every child's total at once; beyond it, only for the ones the reader opens

	initialize(){
		this.ac("soutline");
		this.mode = "ranked";
		this.open = new Map();      // fold key -> opened (true) or closed (false) by the reader; kept across a redraw
		this.costs = new Map();     // child session url -> the AICost.summary cost once it has arrived
		this.empty(() => p.c("muted", "Reading this session's record…"));
		this.ready.then(work => { this.tree = work.tree; return Promise.all([this.read_prompts(), this.read_snaps(work.tree)]); })
			.then(([prompts, snaps]) => { this.prompts = prompts; this.snaps = snaps; })
			.catch(() => {})
			.then(() => { this.loaded = true; this.draw(); });
	}

	/** Called with the replayed Session each time its record changes. */
	record(session){ this.session = session; if (this.loaded) this.draw(); }

	read_prompts(){ return PromptLog.read(this.sid).then(lines => PromptLog.fold(lines)).catch(() => ({})); }

	/** Every session's index snapshot (name, parent, state, model, cost) from the session's folder day to today: the day files the tree is built from. */
	async read_snaps(tree){
		const days = Day.range(tree?.day);
		const files = await Promise.all(days.map(day => fetch(`/framework/ai/sessions/${day}/index.json`).then(res => res.ok && !(res.headers.get("content-type") ?? "").includes("html") ? res.json() : null).catch(() => null)));
		return files.flatMap(json => json?.snapshots ?? []);
	}

	build(){ return new SessionOutline({ session: this.session, tree: this.tree, prompts: this.prompts ?? {}, snaps: this.snaps ?? [], self: this.sid, mode: this.mode }); }

	draw(){
		const outline = this.outline = this.build();
		this.on_draw?.(outline);   // the Timeline tab names the same child sessions
		this.empty(() => {
			this.head(outline);
			const kids = outline.groups.filter(g => g.kind === "child");
			if (kids.length) div.c("soutline-groups", () => kids.forEach((g, n) => this.child_group(g, n)));
			this.own_group(outline.groups.at(-1));
		});
		this.el.dataset.children = JSON.stringify(outline.found.counts); this.el.dataset.drawn = outline.drawn;   // how many children each source found, and tasks drawn: read by the proofs
	}

	/** The "N tasks drawn" count that used to sit here counted every record task INCLUDING Prompt and Question chat records, so it read
	 *  "201 tasks drawn" while every child card said "no tasks yet" — meaningless. Dropped rather than fixed here: "This session's own
	 *  work" below already gives the session's own real count (`progress_text`), and the bigger fix (not counting chat as work at all)
	 *  is the held "regroup Other work by Prompt" item. */
	head(outline){
		const n = outline.groups.filter(g => g.kind === "child").length;
		div.c("soutline-head", () => {
			strong.c("soutline-count", `Child sessions (${n})`);
			div.c("soutline-sort", () => {
				const set = mode => { if (this.mode !== mode){ this.mode = mode; this.draw(); } };
				button.c("soutline-toggle" + (this.mode === "ranked" ? " is-on" : ""), "Cost").attr("type", "button").attr("title", "Rank by cost, then recency").on("click", () => set("ranked"));
				button.c("soutline-toggle" + (this.mode === "newest" ? " is-on" : ""), "Newest").attr("type", "button").attr("title", "Sort by time only").on("click", () => set("newest"));
			});
		});
	}

	// ---- groups -----------------------------------------------------------------------------------------------------------------

	/** A fold that remembers whether the reader opened it (`this.open` survives a redraw). `open_by_default` only decides the first draw. */
	fold(key, cls, head, body, open_by_default = false){
		const d = details.c(cls, () => { summary.c("soutline-sum", head); div.c("soutline-body", body); });
		d.el.open = this.open.get(key) ?? open_by_default;
		d.el.addEventListener("toggle", () => { this.open.set(key, d.el.open); if (d.el.open) d.el.dispatchEvent(new CustomEvent("soutline-open")); });
		return d;
	}

	progress_text(g){ return g.total ? `${g.done} of ${g.total} done` : "no tasks yet"; }

	when(at){
		if (!at) return "";
		const d = new Date(at);
		return d.toDateString() === new Date().toDateString() ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" });
	}

	static tab_of(snap){ return AICost.is_tab(snap ? { source: /^vscode/.test(snap.agent ?? "") ? "vscode" : "servex", id: snap.id } : null, null); }

	child_group(g, n){
		const c = g.child, id = c.id ?? c.name, url = AICost.session_url(id), snap = c.snap, key = "c:" + c.key, tab = SessionOutlineView.tab_of(snap);
		let $cost;
		const paint = () => { if ($cost) $cost.el.textContent = AICost.cost_line({ cost: this.costs.get(url) ?? AICost.known_cost(url), own_usd: snap?.usd ?? null, tab }).text; };
		const ask = () => { if (!this.costs.has(url)) AICost.summary(url).then(ans => { if (ans?.summary?.cost) this.costs.set(url, ans.summary.cost); paint(); }); };
		const d = this.fold(key, "soutline-group card" + (g.state === "stopped" ? " is-dropped" : ""), () => {
			div.c("soutline-title", () => {
				a.c("soutline-name", g.name).href(url).on("click", e => e.stopPropagation());
				small.c("soutline-state", [g.state, snap?.model && AICost.model_name(snap.model)].filter(Boolean).join(" · "));
			});
			div.c("soutline-meta", () => { small.c("muted", `${this.when(g.at)}${g.at ? " · " : ""}${this.progress_text(g)}`); $cost = small.c("muted soutline-cost", ""); });
			paint();
		}, () => this.items(g.items, key), n < 2 && g.items.length > 0);
		d.el.addEventListener("soutline-open", ask);
		if (d.el.open || this.outline.found.list.length <= SessionOutlineView.ASK_ALL) ask();
	}

	own_group(g){
		div.c("soutline-own", () => {
			div.c("soutline-own-head", () => {
				strong.c("soutline-own-title", g.name);
				small.c("muted", this.progress_text(g));
				this.self_cost();
			});
			if (!g.groups.length) return void p.c("muted", this.outline.found.list.length ? "No work of its own yet." : "No tasks or child sessions recorded for this session yet.");
			div.c("soutline-groups", () => g.groups.forEach(sub => {
				const key = "p:" + (sub.prompt ?? sub.kind);
				this.fold(key, "soutline-group card", () => {
					div.c("soutline-title", () => strong.c("soutline-name", sub.name));
					div.c("soutline-meta", () => small.c("muted", `${this.when(sub.at)}${sub.at ? " · " : ""}${this.progress_text(sub)}`));
				}, () => this.items(sub.items, key), sub.kind !== "other" || g.groups.length === 1);
			}));
		});
	}

	/** This session's own cost line, from AICost: its own spend at once, "with children" once Servex has added them up. */
	self_cost(){
		const url = AICost.session_url(this.sid), snap = (this.snaps ?? []).find(s => s.id === this.sid), tab = SessionOutlineView.tab_of(snap);
		const $c = small.c("muted soutline-cost", "");
		const paint = cost => { $c.el.textContent = AICost.cost_line({ cost, own_usd: snap?.usd ?? null, tab }).text; };
		paint(AICost.known_cost(url));
		AICost.summary(url).then(ans => paint(ans?.summary?.cost ?? null));
	}

	// ---- tasks ------------------------------------------------------------------------------------------------------------------

	items(list, scope){
		if (!list.length) return void p.c("muted soutline-none", "Nothing filed here yet.");
		div.c("soutline-list", () => list.forEach(i => this.item(i, scope)));
	}

	static state_icon(state){
		if (state === "complete") return icon("check_circle").ac("soutline-state", "is-done").attr("title", "done");
		if (state === "running") return span.c("soutline-state is-running").attr("title", "running");
		if (state === "stopped") return icon("radio_button_unchecked").ac("soutline-state", "is-dropped").attr("title", "dropped");
		return icon("radio_button_unchecked").ac("soutline-state", "is-open").attr("title", state ?? "open");
	}

	/** One task: ONE full-width row. A done task, or one with subtasks, is a fold: the row is its summary, the proof and the subtasks sit under it.
	 *  A Prompt or Question record (chat, not work) shows its own words as a link to the Timeline instead of a plain title — it has no page of
	 *  its own yet (that's the Tasks-view redesign, still open), but the Timeline already lists every prompt in time order. */
	item(i, scope){
		const key = scope + "/" + i.kind + ":" + i.id, done = i.state === "complete", kids = i.kids.length, cls = "soutline-item" + (i.state === "stopped" ? " is-dropped" : "");
		const chat = i.record_type === "Prompt" || i.record_type === "Question";
		const row = () => div.c("soutline-row", () => {
			SessionOutlineView.state_icon(i.state);
			div.c("soutline-main", () => {
				if (chat) a.c("soutline-ttl soutline-chat-link", i.title).href(AICost.session_url(this.sid) + "?tab=timeline").on("click", e => e.stopPropagation());
				else span.c("soutline-ttl", i.title);
				if (chat) small.c("muted soutline-chat-meta", `${i.record_type} · ${this.when(i.at)}`);
				this.agent_line(i);
			});
			if (kids){ const { done: d, total } = SessionOutline.progress(i.kids); small.c("muted soutline-prog", `${d}/${total}`); }
		});
		if (!done && !kids) return void div.c(cls, row);
		this.fold(key, cls, row, () => { if (done) this.proof(i); if (kids) div.c("soutline-kids", () => i.kids.forEach(k => this.item(k, key))); });
	}

	/** The child session on the task's row: model · cost · state · link. The cost is AICost's short form of the session's own spend. */
	agent_line(i){
		const c = i.child, snap = c?.snap;
		if (!c) return;
		small.c("soutline-agent muted", () => {
			span([snap?.model && AICost.model_name(snap.model), snap?.usd != null && AICost.short(snap.usd), snap?.state ?? i.node?.state].filter(Boolean).join(" · "));
			a.c("soutline-link", "session →").href(AICost.session_url(c.id ?? c.name)).on("click", e => e.stopPropagation());
		});
	}

	/** A done task's proof, in place: what it says it did (outcome), what shows it (evidence, links), the commit, and where it ran. */
	proof(i){
		const t = i.task, get = k => t?.get_one?.(k);
		const outcome = get("outcome"), commits = [...(t?.commits ?? [])];
		const refs = [get("evidence"), get("links")].flat().filter(Boolean).map(x => typeof x === "string" ? { href: x, text: x } : { href: x?.href ?? x?.url, text: x?.text ?? x?.title ?? x?.href ?? x?.url }).filter(x => x.href);
		div.c("soutline-proof", () => {
			if (outcome) p.c("soutline-outcome", String(outcome));
			if (refs.length) div.c("soutline-refs", () => refs.forEach(r => /^(\/|https?:)/.test(r.href) ? a.c("soutline-ref", r.text).href(r.href) : span.c("muted", r.text)));
			if (commits.length) small.c("muted soutline-commit", "commit " + commits.map(h => String(h).slice(0, 7)).join(" "));
			const url = get("path") ?? i.node?.url;
			if (url) a.c("soutline-ref", "Open the task →").href(url);
			if (i.child) a.c("soutline-ref", "Session that did it →").href(AICost.session_url(i.child.id ?? i.child.name));
			if (!outcome && !refs.length && !commits.length) small.c("muted", "No outcome, evidence or commit is recorded on this task.");
		});
	}
}
