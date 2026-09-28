import { JSONL } from "../JSONL/JSONL.js";

/**
 * One collaboration run — a mastermind's members through ordered phases to a
 * vote (and, since 2026-09-28, a decision tree the owner can overrule) —
 * replayed from a `collab.jsonl` log. One line, one verb; `live()` streams it
 * exactly like any other JSONL. Contract:
 * `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`.
 *
 *     const collab = await new Collab({ url: "…/collab.jsonl" }).live(redraw);
 *     collab.members             // Collab.Member[], each with its phase files, cost, status
 *     collab.phases              // Collab.Phase[], in order, each with its votes
 *     collab.tally(4)            // {"sonnet-b": 2, "haiku-a": 1} — phase 4's vote count
 *     collab.decisions           // Collab.Decision[] — the ask, the options, who actually won
 *     collab.winner              // {pick, file, caveats, cost} — the run's own conclusion
 */
export class Collab extends JSONL {
	static verbs = ["collab", "phase", "member", "vote", "tally", "winner", "decision", "chose"];

	// One entry per verb above, in the SAME order — apply() below reads this
	// instead of calling `this[verb]` the way JSONL.apply() does, because the
	// obvious lookup names (`member(id)`, `phase(n)`) would otherwise collide
	// with the verb handlers that share their name.
	static handlers = {
		collab: "start", phase: "on_phase", member: "on_member", vote: "on_vote",
		tally: "on_tally", winner: "on_winner", decision: "on_decision", chose: "on_chose",
	};

	members = [];
	phases = [];
	votes = [];
	decisions = [];
	tallies = {};
	cost = 0;

	apply(entry){
		for (const verb of Object.keys(entry))
			this.constructor.verbs.includes(verb) ? this[this.constructor.handlers[verb]](entry[verb]) : this.skip(verb, entry);
		return this;
	}

	// {question, kind, id, members: [{id, model}], phases: [{n, kind}]} — the run's own header line.
	start(v){
		Object.assign(this, v);
		this.members = (v.members ?? []).map(m => new this.constructor.Member(m));
		this.phases = (v.phases ?? []).map(p => new this.constructor.Phase(p));
	}

	// {n, kind, status, cost?} — merges onto the phase `start` already declared, or
	// appends one a short `collab` line never listed.
	on_phase(v){
		const p = this.phase(v.n) ?? this.phases[this.phases.push(new this.constructor.Phase(v)) - 1];
		Object.assign(p, v);
		if (v.status === "done" && v.cost) this.cost += v.cost;
	}

	// {id, phase, status, file, cost, agent, why?} — one member's own file for one phase.
	on_member(v){
		const m = this.member(v.id) ?? this.members[this.members.push(new this.constructor.Member({ id: v.id })) - 1];
		m.apply(v);
	}

	// {phase, member, pick, caveat} — a member never votes for itself (collab-format.md).
	on_vote(v){
		const vote = new this.constructor.Vote(v);
		this.votes.push(vote);
		this.phase(v.phase)?.votes.push(vote);
	}

	// {phase, counts, winner, caveats} — the mastermind's own read of one phase's votes.
	on_tally(v){ this.tallies[v.phase] = v; }

	// {pick, file, caveats, cost} — the run's own conclusion, once.
	on_winner(v){ this.winner = v; }

	// {id, phase, parent, ask, package, options, status, counts, chosen, runner_up, caveats}
	// — appended open, then rewritten decided: same id, later line wins (TaskJSONL's own rule).
	on_decision(v){
		const d = this.decision(v.id) ?? this.decisions[this.decisions.push(new this.constructor.Decision({ id: v.id })) - 1];
		d.apply(v);
	}

	// {decision, option, at, by} — the owner clicked a different option in the Decision
	// widget than the vote's own winner. See Collab.Decision.override().
	on_chose(v){ this.decision(v.decision)?.override(v); }

	/** The vote counts a `tally` line gave phase `n` — `{}` before one has arrived. */
	tally(n){ return this.tallies[n]?.counts ?? {}; }

	member(id){ return this.members.find(m => m.id === id); }
	phase(n){ return this.phases.find(p => p.n === n); }
	decision(id){ return this.decisions.find(d => d.id === id); }

	/** Decisions with no `parent` — the roots of the decision tree the view nests under. */
	root_decisions(){ return this.decisions.filter(d => !d.parent); }

	/** A decision's own children — `parent` naming its id (collab-format.md's "package deals"). */
	children_of(id){ return this.decisions.filter(d => d.parent === id); }
}

/** One member of a run: its id and model, its files and cost per phase, its live status. */
Collab.Member = class Member {
	files = {};
	cost = 0;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// One `member` line for one phase: keep the file, add its cost, remember the status.
	apply(v){
		this.status = v.status;
		if (v.why) this.why = v.why;
		if (v.phase != null) this.files[v.phase] = { file: v.file, cost: v.cost, status: v.status, agent: v.agent };
		if (v.cost) this.cost += v.cost;
	}
};

/** One phase, in order: its kind, its status, its cost, the votes cast in it. */
Collab.Phase = class Phase {
	votes = [];
	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }
};

/** One member's pick for one phase, plus the one improvement it would add. */
Collab.Vote = class Vote {
	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }
};

/**
 * One decision the runner itemized from a vote phase — the ask, the options in
 * ux/Content's own `{key, say, caveat}` shape (so `ux/Content/Decision/Decision.js`
 * draws it directly), the vote's own pick (`chosen`, `counts`, `runner_up`), and —
 * once the owner has clicked a different option in that widget — `final` and
 * `overruled`. `package: true` means the options are whole signature sets voted
 * as one; `parent` names the decision this one is nested under.
 */
Collab.Decision = class Decision {
	options = [];
	overruled = false;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// {id, phase, parent, ask, package, options, status, counts, chosen, runner_up, caveats}
	apply(v){ Object.assign(this, v); }

	// The owner's own `chose` line: `option` is the option's SAY text (Decision.js writes
	// what it clicked, not the key), so it is matched back to `chosen`'s key here.
	override(v){
		const say = this.options.find(o => o.key === this.chosen)?.say;
		this.overruled = v.option !== say;
		this.final = this.options.find(o => o.say === v.option)?.key ?? v.option;
		this.by = v.by;
	}

	/** What actually stands: the owner's pick once there is one, else the vote's own winner. */
	winner(){ return this.final ?? this.chosen; }
};

/**
 * The shared model scoreboard — `public/framework/ai/collab/scoreboard.jsonl`,
 * one `score` line per member per decision, appended by the runner and corrected
 * (never replaced — same rule as everywhere else in this file) whenever the owner
 * overrules a vote. `models()` is the table the page draws; `retire()` is the
 * owner's own rule for phasing a model out (owner-words-3.md, collab-format.md
 * "Added 14:15"): at least 5 decisions, under 15% wins, cost above the median.
 */
Collab.Scoreboard = class Scoreboard extends JSONL {
	static verbs = ["score"];

	rows = [];

	apply(entry){
		if (!entry.score) return this.skip(Object.keys(entry)[0], entry);
		// ⚠ Keyed by collab + decision + member, not decision + member alone — the
		// same decision id ("d-1") is reused by every run, so a key without `collab`
		// collapsed six different runs' rows for one member into one (2026-09-28).
		const v = entry.score;
		const row = this.rows.find(r => r.collab === v.collab && r.decision === v.decision && r.member === v.member);
		row ? Object.assign(row, v) : this.rows.push({ ...v });
		return this;
	}

	/** Per model: decisions entered, wins, win rate, votes received, cost, cost per win. */
	models(){
		const by = new Map();
		for (const r of this.rows){
			const m = by.get(r.model) ?? by.set(r.model, { model: r.model, decisions: 0, wins: 0, votes: 0, cost: 0 }).get(r.model);
			m.decisions++;
			if (r.won) m.wins++;
			m.votes += r.votes ?? 0;
			m.cost += r.cost ?? 0;
		}
		return [...by.values()].map(m => ({
			...m,
			win_rate: m.decisions ? m.wins / m.decisions : 0,
			cost_per_win: m.wins ? m.cost / m.wins : null,
			cost_per_decision: m.decisions ? m.cost / m.decisions : 0,
		}));
	}

	/** Model ids that have earned enough decisions to judge and are underperforming on both counts. */
	retire(){
		const rows = this.models().filter(m => m.decisions >= 5);
		if (!rows.length) return [];
		const costs = rows.map(m => m.cost_per_decision).sort((a, b) => a - b);
		const median = costs.length % 2 ? costs[costs.length >> 1] : (costs[costs.length / 2 - 1] + costs[costs.length / 2]) / 2;
		return rows.filter(m => m.win_rate < 0.15 && m.cost_per_decision > median).map(m => m.model);
	}
};

/**
 * The shared name index — `public/framework/ai/collab/decisions.jsonl`, one
 * `named` line per class/property/method a WINNING design package decided
 * (collab-format.md "Added 14:25"). `for(module, member)` is the one static
 * method `ext/Doc` calls to draw its own ⋯ menu after a name it finds there —
 * nothing else in `ext/Doc` needs to know this module exists.
 */
Collab.Decisions = class Decisions extends JSONL {
	static verbs = ["named"];

	rows = [];
	named(v){ this.rows.push(v); }

	/** The live page's own link for the decision that named `member` on `module`,
	 *  or `undefined` when nothing has. Reads the shared file once per page load. */
	static async for(module, member){
		this.cached ??= new this({ url: "/framework/ai/collab/decisions.jsonl" }).load();
		const rows = (await this.cached).rows;
		const row = rows.find(r => r.module === module && (r.member === member || `${r.class}.${r.member}` === member));
		return row && `/framework/ext/Collab/?src=/framework/ai/${row.collab}/collab.jsonl#${row.decision}`;
	}
};

export default Collab;
