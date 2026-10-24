// core/Task/TaskQueue.js — the task queue: open tasks the owner accepted into a priority, ranked by one score. DOM-free, no node imports: the page,
// Servex's TaskLoop and the tests all import this one class. The server adapter (Server/TaskQueue.mjs) only gathers the records and hands them in.
// Every field is computed from records (law 7). Formula and tuning numbers: ai/queue/readme.md.
export default class TaskQueue {

	/** Tuning numbers. Importance is the big thing in priority.md (1 is the most important); COST_K is the dollars at which cost halves a score. */
	static IMPORTANCE = { 1: 3, 2: 2, 3: 1 };
	static REASK_WEIGHT = 0.5;
	static COST_K = 2;
	static FALLBACK_USD = 1.5;
	static MIN_SAME_MODULE = 3;

	static words(s){ return new Set(String(s ?? "").toLowerCase().match(/[a-z]{4,}/g) ?? []); }

	static median(a){ if (!a.length) return null; a = [...a].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }

	/** importance x (1 + REASK_WEIGHT x re_asks) / (1 + est_usd / COST_K). Bigger runs first. */
	static score({ importance, re_asks, est_usd }){
		return +(importance * (1 + TaskQueue.REASK_WEIGHT * re_asks) / (1 + est_usd / TaskQueue.COST_K)).toFixed(3);
	}

	/** Estimate from real cost lines: the median usd of landed tasks in the same module (3+), else of all landed tasks, else a fixed fallback. `landed` is [{module, usd}]. */
	static estimate(landed, module){
		const own = landed.filter(l => l.module === module).map(l => l.usd);
		if (own.length >= TaskQueue.MIN_SAME_MODULE) return { usd: +TaskQueue.median(own).toFixed(2), basis: `median of ${own.length} landed ${module} tasks` };
		if (landed.length) return { usd: +TaskQueue.median(landed.map(l => l.usd)).toFixed(2), basis: `median of ${landed.length} landed tasks (few in ${module})` };
		return { usd: TaskQueue.FALLBACK_USD, basis: "fixed fallback" };
	}

	/** Sessions that asked for this again: refined asks ([{session, key, ask}]) sharing 3+ words with the title (or all of a short key), minus the first. */
	static re_asks(asks, title){
		const w = TaskQueue.words(title);
		if (w.size < 2) return 0;
		const sessions = new Set();
		for (const a of asks){ const k = TaskQueue.words(a.key ?? a.ask); let n = 0; for (const x of k) if (w.has(x)) n++; if (n >= 3 || (k.size && n === k.size && n >= 2)) sessions.add(a.session); }
		return Math.max(0, sessions.size - 1);
	}

	/** One queue row from an open task: `t` = {slug, url, module, state, usd, agent, lines} (lines = the task.jsonl lines, parsed). Null when the task carries no priority. */
	static row(t, { landed = [], asks = [] } = {}){
		const lines = t.lines ?? [], pl = lines.findLast(l => l.priority && typeof l.priority === "object")?.priority;
		if (!pl) return null;
		const first = lines[0] ?? {}, title = lines.findLast(l => typeof l.title === "string")?.title ?? first.title ?? first.assign?.title ?? t.slug;
		const wait = lines.findLast(l => l.wait)?.wait, approved = lines.findLast(l => l.approve)?.approve;
		const est = TaskQueue.estimate(landed, t.module), importance = TaskQueue.IMPORTANCE[pl.big] ?? 1, re = TaskQueue.re_asks(asks, title);
		return {
			id: t.slug, url: t.url, title, module: t.module, parent: first.parent ?? null, why_url: first.source ?? null, why: pl.why ?? "",
			big: pl.big ?? null, importance, re_asks: re, est_usd: est.usd, est_basis: est.basis, spent_usd: t.usd || 0,
			score: TaskQueue.score({ importance, re_asks: re, est_usd: est.usd }),
			state: t.state === "running" ? "running" : (wait && !approved ? "waiting" : "queued"),
			born: lines.find(l => l.ts)?.ts ?? "",
			agent: t.agent || (first.sessions?.[0]?.id ?? null),
		};
	}

	/** The queue: every open task with a priority, ranked best first (equal scores: the oldest task first), `rank` 1..n. */
	static build(open, ctx){
		return open.map(t => TaskQueue.row(t, ctx)).filter(Boolean).sort((a, b) => b.score - a.score || a.born.localeCompare(b.born)).map((r, i) => ({ ...r, rank: i + 1 }));
	}
}
