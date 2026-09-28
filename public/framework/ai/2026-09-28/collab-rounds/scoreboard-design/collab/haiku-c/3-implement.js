import { JSONL } from "../../../../../../../public/framework/ext/JSONL/JSONL.js";

/**
 * Reads the shared model performance log (public/framework/ai/collab/scoreboard.jsonl)
 * and surfaces per-model statistics, retirement guidance, and human-readable summaries.
 * Extends JSONL for consistency with Collab and Collab.Decisions.
 */
export class Scoreboard extends JSONL {
  static verbs = ["score"];

  rows = [];

  constructor(...args) {
    super();
    this.assign(...args);
  }

  assign(...args) {
    return Object.assign(this, ...args);
  }

  /**
   * JSONL hook: process one entry from the jsonl stream.
   * Pushes entry.score onto rows; anything else goes to this.skip().
   */
  apply(entry) {
    if (!entry.score) return this.skip(Object.keys(entry)[0], entry);
    this.rows.push(entry.score);
    return this;
  }

  /**
   * Returns array of aggregated per-model stats, one object per unique model.
   * Each object has: model, decisions, wins, win_rate, votes, cost,
   * cost_per_decision, cost_per_win, overrules.
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
   * Returns one model's stats from models(), or undefined if not found.
   */
  model(id) {
    return this.models().find(m => m.model === id);
  }

  /**
   * Returns the number of times the owner overruled for one model,
   * or across every model if no argument is given.
   * Counts rows where overrule === true.
   */
  overruleCount(model) {
    if (model === undefined) {
      return this.rows.filter(r => r.overrule).length;
    }
    return this.rows.filter(r => r.model === model && r.overrule).length;
  }

  /**
   * Returns array of model ids that meet retirement criteria.
   * A model is retired if it has >= minDecisions rows, win_rate < maxWinRate,
   * AND cost_per_decision > median across all models that cleared minDecisions.
   * Defaults: minDecisions = 5, maxWinRate = 0.15.
   */
  retire(opts = {}) {
    const { minDecisions = 5, maxWinRate = 0.15 } = opts;
    const candidates = this.models().filter(m => m.decisions >= minDecisions);
    
    if (!candidates.length) return [];
    
    const costs = candidates.map(m => m.cost_per_decision).sort((a, b) => a - b);
    const median = costs.length % 2 
      ? costs[costs.length >> 1]
      : (costs[costs.length / 2 - 1] + costs[costs.length / 2]) / 2;
    
    return candidates
      .filter(m => m.win_rate < maxWinRate && m.cost_per_decision > median)
      .map(m => m.model);
  }

  /**
   * Returns one plain sentence summarizing a model's performance.
   * E.g. "haiku-a: 3 decisions, 0 wins (0%), overruled once, $0.04 total — recommend retiring: no wins yet and costlier than the panel median."
   */
  explain(modelId) {
    const m = this.model(modelId);
    if (!m) return `${modelId}: no data`;
    
    const winPct = Math.round(m.win_rate * 100);
    const overruleText = m.overrules === 0 ? "never overruled" 
      : m.overrules === 1 ? "overruled once"
      : `overruled ${m.overrules} times`;
    
    let sentence = `${modelId}: ${m.decisions} decision${m.decisions === 1 ? "" : "s"}, ${m.wins} win${m.wins === 1 ? "" : "s"} (${winPct}%), ${overruleText}, $${m.cost.toFixed(2)} total`;
    
    const retired = this.retire().includes(modelId);
    if (retired) {
      const reason = m.wins === 0 ? "no wins yet" : `${winPct}% win rate`;
      sentence += ` — recommend retiring: ${reason} and costlier than the panel median.`;
    } else {
      sentence += ".";
    }
    
    return sentence;
  }
}

export default Scoreboard;
