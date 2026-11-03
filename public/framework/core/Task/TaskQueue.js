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
	static MIN_SHARED = 2;
	static SIMILAR_N = 5;

	/** Filler words that would make two unrelated titles look alike (review 2026-10-24). */
	static STOP = new Set("with that this from into make every each when what them they their have should could would will also only more than then does sure show".split(" "));

	static words(s){ return new Set((String(s ?? "").toLowerCase().match(/[a-z]{4,}/g) ?? []).filter(w => !TaskQueue.STOP.has(w))); }

	static median(a){ if (!a.length) return null; a = [...a].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }

	/** importance x (1 + REASK_WEIGHT x re_asks) / (1 + est_usd / COST_K). Bigger runs first. */
	static score({ importance, re_asks, est_usd }){
		return +(importance * (1 + TaskQueue.REASK_WEIGHT * re_asks) / (1 + est_usd / TaskQueue.COST_K)).toFixed(3);
	}

	/** Estimate from real cost lines. `landed` is [{module, usd, title}]. Order: the median usd of the 5 landed tasks whose titles share the most words with `title` (2+ shared, 3+ such tasks); else the module median (3+); else all landed; else a fixed fallback. */
	static estimate(landed, module, title = ""){
		const w = TaskQueue.words(title), similar = [];
		if (w.size) for (const l of landed){ let n = 0; for (const x of TaskQueue.words(l.title)) if (w.has(x)) n++; if (n >= TaskQueue.MIN_SHARED) similar.push({ n, l }); }
		similar.sort((a, b) => b.n - a.n); // a stable sort: ties keep the landed order, so the estimate does not lean high or low
		const top = similar.slice(0, TaskQueue.SIMILAR_N);
		if (top.length >= TaskQueue.MIN_SAME_MODULE) return { usd: +TaskQueue.median(top.map(x => x.l.usd)).toFixed(2), basis: `median of ${top.length} similar landed tasks: ${top.slice(0, 2).map(x => `"${String(x.l.title).slice(0, 40)}"`).join(", ")}` };
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
		const importance = TaskQueue.IMPORTANCE[pl.big] ?? 1, re = TaskQueue.re_asks(asks, title), est = TaskQueue.estimate(landed, t.module, title);
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
