// Condense thousands of sessions into a few buckets, each with its own running totals. Doc: ai/sessions/doc/buckets.md
// Pure data: runs in the browser and in node. One row sits in exactly ONE bucket per index (kind, task, system, role),
// so a total never double counts; the indexes are different cuts of the same rows, never summed together.
export default class AISessionBuckets {

	// The `kind` rules, first match wins. Routine kinds roll up (hidden behind their bucket row) by default.
	static KINDS = [
		{ key: "voice",           routine: false, test: r => r.kind === "voice" },   // a voice session (Servex/agents/Sessions.js create(): `kind: "voice"` on line 1)
		{ key: "prompt-cleaning", routine: true,  test: r => /^(you-clean-up-one-chunk|read-this-numbered-cleaned|turn-this-outline-into|these-sentences-from-a-clean|you-are-cleaning-a-raw-speech)/.test(r.folder) },
		{ key: "clarity",         routine: true,  test: r => /^clarity/.test(r.agent ?? "") || /^you-are-servex-agent-clarity/.test(r.folder) },
		{ key: "reviewer",        routine: true,  test: r => /^(reviewer|checker|voter)/.test(r.agent ?? "") || /^you-are-servex-agent-(reviewe|checker|voter)/.test(r.folder) },
		{ key: "helper",          routine: true,  test: r => /^(helper|echo|assistant)/.test(r.agent ?? "") || /^you-are-on-duty/.test(r.folder) },
		{ key: "minion",          routine: false, test: r => /^minion/.test(r.agent ?? "") || /^(load-the-minion-skill|where-you-are-readmes)/.test(r.folder) },
		{ key: "mastermind",      routine: false, test: r => /^(mastermind|task)/.test(r.agent ?? "") },
		{ key: "short-run",       routine: true,  test: r => !r.agent && (r.wall_ms ?? 0) < 10 * 60000 && (r.usd ?? 0) < 1 },   // unnamed, short, cheap: quick-fix and other headless helper calls
		{ key: "owner-tab",       routine: false, test: r => !r.agent },
	];
	static SYSTEMS = ["servex", "data-grid", "page", "sessions", "dictat", "transcri", "design", "ui", "code", "ai", "perf", "echo", "refine"];

	static kind_of(r){ return AISessionBuckets.KINDS.find(k => k.test(r))?.key ?? "other"; }
	static task_of(r){ return r.parent ?? (/^(mastermind|task)/.test(r.agent ?? "") ? r.agent : null) ?? "(no task)"; }
	static role_of(r){ return (r.agent ?? "").replace(/[-\d].*/, "") || "(owner tab)"; }
	static system_of(r){
		const hay = `${r.parent ?? ""} ${r.agent ?? ""}`;
		return AISessionBuckets.SYSTEMS.find(s => hay.includes(s)) ?? "other";
	}
	static INDEXES = { kind: AISessionBuckets.kind_of, task: AISessionBuckets.task_of, system: AISessionBuckets.system_of, role: AISessionBuckets.role_of };

	index = {};        // index name -> bucket key -> { n, usd, tokens, wall_ms, last }
	where = new Map(); // row id -> { keys: {index: key}, c: contribution } so an update can subtract the old one
	routine = new Set(AISessionBuckets.KINDS.filter(k => k.routine).map(k => k.key));

	// `of(row)` maps a caller's row to the index-shaped record the rules read (the Sessions grid passes its session's `ix`);
	// a row it maps to null is never bucketed and always shown (a live row not yet indexed). `key(row)` is the row's id.
	constructor(rows = [], { of = r => r, key = r => r.id } = {}){
		this.of = of; this.key = key;
		for (const name of Object.keys(AISessionBuckets.INDEXES)) this.index[name] = {};
		rows.forEach(r => this.put(r));
	}

	static contribution(r){ return { n: 1, usd: r.usd ?? 0, tokens: r.tokens ?? 0, wall_ms: r.wall_ms ?? 0, last: r.last_activity ?? "" }; }

	/** Add a new row, or replace an existing one: only the buckets it was in and goes to change. */
	put(row){
		const r = this.of(row);
		if (!r) return;
		const id = this.key(row);
		this.drop(id);
		const c = AISessionBuckets.contribution(r), keys = {};
		for (const [name, fn] of Object.entries(AISessionBuckets.INDEXES)){
			const key = keys[name] = fn(r);
			const b = this.index[name][key] ??= { n: 0, usd: 0, tokens: 0, wall_ms: 0, last: "" };
			b.n += c.n; b.usd += c.usd; b.tokens += c.tokens; b.wall_ms += c.wall_ms;
			if (c.last > b.last) b.last = c.last;
		}
		this.where.set(id, { keys, c, sig: AISessionBuckets.sig(r) });
	}

	static sig(r){ return `${r.usd}|${r.tokens}|${r.wall_ms}|${r.last_activity}|${r.agent}|${r.parent}|${r.folder}`; }

	/** Make the buckets match `rows`: only a new, changed or gone row touches its buckets (a live redraw recomputes a few, never all). Returns how many rows changed. */
	sync(rows){
		const seen = new Set();
		let touched = 0;
		for (const row of rows){
			const r = this.of(row);
			if (!r) continue;
			const id = this.key(row);
			seen.add(id);
			if (this.where.get(id)?.sig === AISessionBuckets.sig(r)) continue;
			this.put(row); touched++;
		}
		for (const id of [...this.where.keys()]) if (!seen.has(id)){ this.drop(id); touched++; }
		return touched;
	}

	drop(id){
		const w = this.where.get(id);
		if (!w) return;
		for (const [name, key] of Object.entries(w.keys)){
			const b = this.index[name][key];
			b.n -= w.c.n; b.usd -= w.c.usd; b.tokens -= w.c.tokens; b.wall_ms -= w.c.wall_ms;
			if (!b.n) delete this.index[name][key];   // `last` is only refreshed on the next full build
		}
		this.where.delete(id);
	}

	/** Every index must add up to the same grand total: the proof nothing is double counted. */
	check(){
		const out = {};
		for (const [name, buckets] of Object.entries(this.index)){
			out[name] = Object.values(buckets).reduce((a, b) => ({ n: a.n + b.n, usd: +(a.usd + b.usd).toFixed(4) }), { n: 0, usd: 0 });
		}
		return out;
	}

	/** The grid's rows: routine kinds collapse to one bucket row each, everything else stays a row. Nothing is deleted. */
	rollup(rows, { expand = new Set() } = {}){
		const out = [], seen = new Set();
		for (const row of rows){
			const r = this.of(row), k = r && AISessionBuckets.kind_of(r);
			if (!r || !this.routine.has(k) || expand.has(k)){ out.push(row); continue; }
			if (seen.has(k)) continue;
			seen.add(k);
			out.push({ bucket: "kind", key: k, ...this.index.kind[k] });
		}
		return out;
	}

	/** Children nest under their parent; a row whose parent is not in `rows` stays top-level. `parent_of(row)` names the parent id or null. */
	static nest(rows, parent_of, id_of){
		const shown = new Set(rows.map(id_of)), kids_of = new Map();
		const up = r => { const par = parent_of(r); return par && par !== id_of(r) && shown.has(par) ? par : null; };
		for (const r of rows){ const par = up(r); if (par) (kids_of.get(par) ?? kids_of.set(par, []).get(par)).push(r); }
		return { top: rows.filter(r => !up(r)), kids_of };
	}

	/** The grid's whole row order: routine kinds stay out unless open (`open_kinds`) or `all` (a search), the rest in `sort(rows)` order with children
	 * nested under their parent (collapsed until opened; all open when `all`). Runs in the browser (files path) and in node (the query source).
	 * Returns { out: the flat list, nests: Map(row -> { depth, kids, open }), kinds: [{ key, n, usd }] (one chip per routine kind present), listed: rows in the list }.
	 * Call it on rows already filtered; `buckets` is kept between calls so only changes are re-counted. Doc: ai/sessions/doc/buckets.md */
	static arrange(rows, { buckets, sort, open_kinds, open_ids, all = false, parent_of, id_of }){
		buckets.sync(rows);
		const present = new Set(), kept = [];
		for (const r of rows){
			const ix = buckets.of(r), k = ix && AISessionBuckets.kind_of(ix), routine = k && buckets.routine.has(k);
			if (routine) present.add(k);
			if (all || !routine || open_kinds.has(k)) kept.push(r);
		}
		const kinds = [...present].map(k => ({ key: k, n: buckets.index.kind[k].n, usd: buckets.index.kind[k].usd })).sort((x, y) => y.n - x.n);
		const { top, kids_of } = AISessionBuckets.nest(sort(kept), parent_of, id_of);
		const nests = new Map(), out = [];
		const place = (r, depth, seen) => {
			const kids = (kids_of.get(id_of(r)) ?? []).filter(k => !seen.has(id_of(k))), open = all || open_ids.has(id_of(r));
			nests.set(r, { depth, kids: kids.length, open });
			out.push(r);
			if (open) for (const k of kids) place(k, depth + 1, new Set([...seen, id_of(r)]));
		};
		top.forEach(r => place(r, 0, new Set([id_of(r)])));
		return { out, nests, kinds, listed: kept.length };
	}

	toJSON(){ return { index: this.index }; }
}
