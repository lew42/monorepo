import { div, p } from "../../../core/View/View.js";
import ContentModule from "../ContentModule.js";
import Decision from "./Decision.js";

/**
 * class Decisions extends ContentModule — every decision in a log, ranked and nested.
 *
 * Reads the log once, keeps the latest `decision` line per id, and draws the top-level ones
 * (no `depends_on`, or a parent that isn't in this log) in rank order, 1 first. A child
 * decision is drawn inside its parent, under the option that leads to it.
 *
 *   {"place": {"module": "/framework/ux/Content/Decision/Decisions.js"}}   // on a card: a "Decisions" tab
 *   new Decisions({ page, log })   or   new Decisions({ records: [...] })  // records: no fetch
 *
 * The records are written by Server/decide.mjs; a Decision here is the same Decision as
 * anywhere else, so a click still appends a `chose` line.
 */
export default class Decisions extends ContentModule {

	render(){
		const $box = div.c("ux-content-decisions");
		if (this.records) return this.fill($box, this.records);

		// ⚠ No DOM after an await: the box is captured now and filled in the callback.
		this.history().then(lines => this.fill($box, lines.filter(l => l.decision).map(l => l.decision)));
	}

	/** Latest line per id wins; → { roots, nested: { parent: { option: [child…] } } }. */
	static tree(records){
		const by = new Map();
		for (const r of records) if (r?.id) by.set(r.id, r);
		const order = (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity);
		const nested = {}, roots = [];

		for (const r of by.values()) {
			const up = r.depends_on;
			if (up && by.has(up.decision)) ((nested[up.decision] ??= {})[up.option] ??= []).push(r);
			else roots.push(r);
		}
		Object.values(nested).forEach(opts => Object.values(opts).forEach(list => list.sort(order)));
		return { roots: roots.sort(order), nested };
	}

	fill($box, records){
		const { roots, nested } = this.constructor.tree(records);
		$box.empty(() => {
			if (!roots.length) return p.c("ux-content-hint", "No decisions yet. Server/decide.mjs writes them here.");
			roots.forEach(r => new Decision({ ...r, page: this.page, log: this.log, card: this.card, by: this.by, readonly: this.readonly, nested }));
		});
	}
}

Decisions.prototype.classes = "ux-content-decisions-host";

export { Decisions };
