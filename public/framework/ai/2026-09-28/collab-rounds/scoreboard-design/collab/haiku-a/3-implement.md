# Implementation: Scoreboard Class

```javascript
import { JSONL } from "../JSONL/JSONL.js";

/**
 * Per-model performance tracking across collaboration decisions.
 * Reads public/framework/ai/collab/scoreboard.jsonl (append-only).
 * Groups by model (not member, since one model runs under several member ids).
 * Everything is computed from rows on demand — pages always see current truth.
 */
export class Scoreboard extends JSONL {
	static verbs = ["score"];

	rows = [];

	apply(entry) {
		if (!entry.score) return this.skip(Object.keys(entry)[0], entry);
		this.rows.push(entry.score);
		return this;
	}

	/**
	 * Per-model stats: decisions entered, wins, win_rate, votes summed, cost summed,
	 * cost_per_decision, cost_per_win (null if no wins), and overrules count.
	 * This is the one call a scoreboard page makes to draw its whole table.
	 */
	models() {
		const by = new Map();
		for (const r of this.rows) {
			const m = by.get(r.model) ?? by.set(r.model, {
				model: r.model,
				decisions: 0,
				wins: 0,
				votes: 0,
				cost: 0,
				overrules: 0
			}).get(r.model);
			m.decisions++;
			if (r.won) m.wins++;
			m.votes += r.votes ?? 0;
			m.cost += r.cost ?? 0;
			if (r.overrule) m.overrules++;
		}
		return [...by.values()].map(m => ({
			...m,
			win_rate: m.decisions ? m.wins / m.decisions : 0,
			cost_per_decision: m.decisions ? m.cost / m.decisions : 0,
			cost_per_win: m.wins ? m.cost / m.wins : null
		}));
	}

	/**
	 * One model's stats from models(), or undefined if not found.
	 * Convenience for pages that already know which model they want.
	 */
	model(id) {
		return this.models().find(m => m.model === id);
	}

	/**
	 * Count of rows where overrule is true.
	 * Called with a model id: count for that model.
	 * Called with no argument: total count across all models.
	 */
	overruleCount(model) {
		if (model == null) {
			return this.rows.filter(r => r.overrule).length;
		}
		return this.rows.filter(r => r.model === model && r.overrule).length;
	}

	/**
	 * Model ids to retire: at least minDecisions rows, win_rate under maxWinRate,
	 * AND cost_per_decision above the median (among models that cleared minDecisions).
	 * Implements the owner's rule: cheap models that don't win are a smaller problem
	 * than expensive ones that don't win; both conditions must hold.
	 */
	retire(opts = {}) {
		const { minDecisions = 5, maxWinRate = 0.15 } = opts;
		const models = this.models();
		const qualified = models.filter(m => m.decisions >= minDecisions);
		
		if (!qualified.length) return [];
		
		const costs = qualified.map(m => m.cost_per_decision).sort((a, b) => a - b);
		const median = costs.length % 2
			? costs[costs.length >> 1]
			: (costs[costs.length / 2 - 1] + costs[costs.length / 2]) / 2;
		
		return qualified
			.filter(m => m.win_rate < maxWinRate && m.cost_per_decision > median)
			.map(m => m.model);
	}

	/**
	 * Plain-sentence summary of one model's performance, for display instead of numbers.
	 * Example: "haiku-a: 3 decisions, 0 wins (0%), overruled once, $0.04 total —
	 * recommend retiring: low win rate and above-median cost."
	 */
	explain(modelId) {
		const m = this.model(modelId);
		if (!m) return `${modelId}: no data`;

		const decisions = m.decisions === 1 ? "1 decision" : `${m.decisions} decisions`;
		const wins = m.wins === 1 ? "1 win" : `${m.wins} wins`;
		const winRate = (m.win_rate * 100).toFixed(0);
		const cost = `$${m.cost.toFixed(2)}`;

		let result = `${modelId}: ${decisions}, ${wins} (${winRate}%)`;
		
		if (m.overrules > 0) {
			const overrules = m.overrules === 1 ? "overruled once" : `overruled ${m.overrules} times`;
			result += `, ${overrules}`;
		}
		
		result += `, ${cost} total`;
		
		if (this.retire().includes(modelId)) {
			result += " — recommend retiring: low win rate and above-median cost.";
		}

		return result;
	}
}

export default Scoreboard;
```

## Judgment Calls

In `explain()`, I only show the overrule count when it's > 0, to keep output concise for the common case where a model was never overruled; in `models()`, the overrules count lives on each model object, so `explain()` uses `m.overrules` directly rather than calling `overruleCount()` again for efficiency.
