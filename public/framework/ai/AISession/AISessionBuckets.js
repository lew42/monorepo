// Condense thousands of sessions into a few buckets, each with its own running totals. Doc: ai/sessions/doc/buckets.md
// Pure data: runs in the browser and in node. One row sits in exactly ONE bucket per index (kind, task, system, role),
// so a total never double counts; the indexes are different cuts of the same rows, never summed together.
export default class AISessionBuckets {

	// The `kind` rules, first match wins. Routine kinds roll up (hidden behind their bucket row) by default.
	static KINDS = [
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

	constructor(rows = []){
		for (const name of Object.keys(AISessionBuckets.INDEXES)) this.index[name] = {};
		rows.forEach(r => this.put(r));
	}

	static contribution(r){ return { n: 1, usd: r.usd ?? 0, tokens: r.tokens ?? 0, wall_ms: r.wall_ms ?? 0, last: r.last_activity ?? "" }; }

	/** Add a new row, or replace an existing one: only the buckets it was in and goes to change. */
	put(r){
		this.drop(r.id);
		const c = AISessionBuckets.contribution(r), keys = {};
		for (const [name, fn] of Object.entries(AISessionBuckets.INDEXES)){
			const key = keys[name] = fn(r);
			const b = this.index[name][key] ??= { n: 0, usd: 0, tokens: 0, wall_ms: 0, last: "" };
			b.n += c.n; b.usd += c.usd; b.tokens += c.tokens; b.wall_ms += c.wall_ms;
			if (c.last > b.last) b.last = c.last;
		}
		this.where.set(r.id, { keys, c });
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
		for (const r of rows){
			const k = AISessionBuckets.kind_of(r);
			if (!this.routine.has(k) || expand.has(k)){ out.push(r); continue; }
			if (seen.has(k)) continue;
			seen.add(k);
			out.push({ bucket: "kind", key: k, ...this.index.kind[k] });
		}
		return out;
	}

	toJSON(){ return { index: this.index }; }
}
