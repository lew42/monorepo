# Scoreboard — implementation (sonnet-b, from the winning names)

```js
import { JSONL } from "../JSONL/JSONL.js";

/**
 * The shared model scoreboard — `public/framework/ai/collab/scoreboard.jsonl`,
 * one `score` line per member per decision, appended by the collab runner and
 * corrected (never rewritten — an owner overrule adds two more lines for the
 * same decision, it does not edit the first) whenever the owner overrules a
 * vote. Groups by `model`, not by `member` id, because the owner's question
 * is "is this MODEL worth its cost", and one model runs under several member
 * ids across different collabs.
 *
 *     const board = await new Scoreboard({ url: "/framework/ai/collab/scoreboard.jsonl" }).load();
 *     board.models()             // one row per model: decisions, wins, win_rate, cost, …
 *     board.retire()             // model ids the owner's own rule says to phase out
 *     board.explain("haiku-a")   // one plain sentence
 */
export class Scoreboard extends JSONL {
	static verbs = ["score"];

	rows = [];

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// {score: {at, collab, decision, member, model, votes, won, cost, overrule?}}
	// — the only verb this file carries; anything else is reported, not eaten.
	apply(entry){
		if (!entry.score) return this.skip(Object.keys(entry)[0], entry);
		this.rows.push(entry.score);
		return this;
	}

	/** Every row for one model, in the order they were logged. */
	rowsFor(model){ return this.rows.filter(r => r.model === model); }

	/**
	 * One object per model found in `rows`: `model`, `decisions` (rows entered),
	 * `wins`, `win_rate` (wins / decisions), `votes` (summed), `cost` (summed),
	 * `cost_per_decision`, `cost_per_win` (null when there are no wins, so a
	 * page prints "—" instead of Infinity), and `overrules` (this model's own
	 * `overruleCount()`, folded in so a page's one table call already has it).
	 * The one method a scoreboard page calls to draw its whole table.
	 */
	models(){
		const ids = [...new Set(this.rows.map(r => r.model))];
		return ids.map(model => this.model(model));
	}

	/** One model's own row from `models()`'s shape, or `undefined` if it never entered. */
	model(id){
		const rows = this.rowsFor(id);
		if (!rows.length) return undefined;
		const decisions = rows.length;
		const wins = rows.filter(r => r.won).length;
		const votes = rows.reduce((sum, r) => sum + (r.votes ?? 0), 0);
		const cost = rows.reduce((sum, r) => sum + (r.cost ?? 0), 0);
		return {
			model: id,
			decisions,
			wins,
			win_rate: decisions ? wins / decisions : 0,
			votes,
			cost,
			cost_per_decision: decisions ? cost / decisions : 0,
			cost_per_win: wins ? cost / wins : null,
			overrules: this.overruleCount(id),
		};
	}

	/**
	 * How many times the owner clicked a different option than the vote picked.
	 * Called with a model id: that model's own count. Called with none: the
	 * total across every model — the number the owner asked to "see the
	 * decisions and disagree with the way things were voted on".
	 */
	overruleCount(model){
		const rows = model ? this.rowsFor(model) : this.rows;
		return rows.filter(r => r.overrule === true).length;
	}

	/**
	 * The automatic phase-out rule the owner asked for: a model with at least
	 * `minDecisions` rows, a `win_rate` under `maxWinRate`, AND a
	 * `cost_per_decision` above the median across all models that cleared
	 * `minDecisions` — both conditions must hold, because a cheap model that
	 * just doesn't win is a smaller problem than an expensive one that
	 * doesn't. Returns model ids, ready for the runner to check a new
	 * collab's member list against.
	 */
	retire({ minDecisions = 5, maxWinRate = 0.15 } = {}){
		const qualified = this.models().filter(m => m.decisions >= minDecisions);
		if (!qualified.length) return [];
		const median = this.constructor.median(qualified.map(m => m.cost_per_decision));
		return qualified
			.filter(m => m.win_rate < maxWinRate && m.cost_per_decision > median)
			.map(m => m.model);
	}

	/** One plain sentence for a model id — the thing a person actually reads. */
	explain(model){
		const m = this.model(model);
		if (!m) return `${model}: no decisions logged yet.`;
		const retiring = this.retire().includes(model);
		const pct = Math.round(m.win_rate * 100);
		const overruleNote = m.overrules ? `, overruled ${m.overrules === 1 ? "once" : `${m.overrules} times`}` : "";
		const costNote = `$${m.cost.toFixed(2)} total`;
		const verdict = retiring
			? " — recommend retiring: low win rate and costlier than the panel median"
			: "";
		return `${model}: ${m.decisions} decision${m.decisions === 1 ? "" : "s"}, ${m.wins} win${m.wins === 1 ? "" : "s"} (${pct}%)${overruleNote}, ${costNote}${verdict}.`;
	}

	/** Plain median of a number array — used only by `retire()`. */
	static median(nums){
		const sorted = [...nums].sort((a, b) => a - b);
		const mid = sorted.length >> 1;
		return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}
}

export default Scoreboard;
```

One judgment call: `models()`/`model(id)` recompute their totals from `rows`
on every call rather than caching, because the class's own doc promises "a
page that reloads the file always shows the current truth instead of a stale
total" — a cache would need its own invalidation the moment a `live()` stream
appends a row, which is more code than the recompute it would save.
