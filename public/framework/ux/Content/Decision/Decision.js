import View, { div, span, ul, li, p } from "../../../core/View/View.js";
import ContentModule from "../ContentModule.js";

/* The option wall's look is ui/decision's (three-way chosen marking, contrast numbers). */
import "../../../ui/decision/decision.js";

/**
 * class Decision extends ContentModule — an ask, its options (each with a caveat), and the
 * one chosen. A click appends a `chose` line; the others stay visible and clickable so the
 * choice can change; the latest `chose` line for the id wins.
 *
 *   new Decision({ page, id, ask, options: [{ say, caveat }], why, log })
 *   new Decision({ page, log, ...legacyRecord })   // {id|title, chose, over|alternative, why}
 *
 * A legacy task.jsonl decision is normalized to the same shape, its `chose` pre-selected.
 */
export default class Decision extends ContentModule {

	/* One shape in, one shape out. `options` present = the settled shape; otherwise a
	 * legacy record: options = chose + over (or alternative), chosen = chose. */
	static normalize(d){
		d = d.decision ?? d;
		const say = o => typeof o === "string" ? { say: o } : { say: o.say ?? o.title ?? String(o.id ?? ""), caveat: o.caveat ?? o.why, key: o.id };
		const humanize = s => /s/.test(s) ? s : String(s).replace(/[-_]+/g, " ").replace(/^./, c => c.toUpperCase());
		const words = d.ask ?? d.question ?? d.about ?? d.title ?? d.topic ?? d.what ?? d.id ?? "Decision";

		if (d.options){
			const options = d.options.map(say);
			let chosen = d.chose?.option ?? d.chose;

			// `chose` in old logs is an option's id, its exact words, or the start of them —
			// or a summary matching none, in which case it becomes the first option.
			if (typeof chosen === "string" && chosen){
				const hit = options.find(o => o.key === chosen || o.say === chosen) ?? options.find(o => o.say.startsWith(chosen));
				if (hit) chosen = hit.say; else options.unshift({ say: chosen });
			}

			return { id: d.id, ask: humanize(words), options, why: d.because ?? d.why, chosen: typeof chosen === "string" ? chosen : undefined };
		}

		const over = d.over ?? (d.alternative ? [d.alternative] : []);
		const options = [d.chose, ...over].filter(Boolean).map(say);
		if (options[0]) options[0].why = d.why;

		return {
			id: d.id ?? String(words).slice(0, 40),
			ask: humanize(words),
			options, chosen: options[0]?.say, legacy_why: d.why,
		};
	}

	initialize(){
		Object.assign(this, this.constructor.normalize(this));
		super.initialize();
	}

	render(){
		this.draw();
		// One read, then show the latest `chose` for this id (later lines win).
		this.history().then(lines => {
			const line = lines.filter(l => l.chose?.decision === this.id).pop();
			if (line){ this.chosen = line.chose.option; this.draw(); }
		});
	}

	draw(){
		return this.empty(() => {
			if (this.ask && !this.bare) div.c("ux-content-ask", this.ask);
			this.wall();
			if (this.why && !this.legacy_why) p.c("ui-decision-because", this.why);
		});
	}

	wall(){
		return ul.c("ui-decision-options", () => this.options.forEach(o => li(() => this.option(o))));
	}

	option(o){ return new (this.readonly ? this.constructor.Shown : this.constructor.Option)({ decision: this, option: o }); }

	/* Local first (the card shows it at once), then the log. */
	choose(say){
		this.chosen = say;
		this.draw();
		return this.write({ chose: { decision: this.id, option: say, at: this.now(), by: this.who() } });
	}
}

Decision.prototype.classes = "ux-content-decision";

/* Every option is a real <button>: keyboard, screen reader, and a chosen state that is a
 * ground, a border AND the word "chosen" (ui/decision's rule — never colour alone). */
Decision.Option = class DecisionOption extends View {

	render(){
		const { say, caveat, why } = this.option;
		const chosen = this.decision.chosen === say;

		this.ac("ui-decision-option ux-content-option");
		if (chosen) this.ac("chosen");
		this.attr("type", "button").attr("aria-pressed", String(chosen));
		this.wire(say);

		if (chosen) span.c("ui-decision-mark", "chosen");
		div.c("ui-decision-say", say);
		if (caveat) p.c("ux-content-caveat", caveat);
		if (chosen && why) p.c("ui-decision-why", why);
	}
};

/* The write seam of one option — a subclass changes what a click does without redrawing. */
Decision.Option.prototype.wire = function(say){ this.click(() => this.decision.choose(say)); };

Decision.Option.prototype.tag = "button";

/* The same card with nothing to press: for a host that only SHOWS the record (the task
 * page's Decisions tab writes its own verdict lines, not a second kind of choice). */
Decision.Shown = class DecisionShown extends Decision.Option {
	wire(){ this.rc("ux-content-option").ac("ux-content-shown"); ["type", "aria-pressed"].forEach(a => this.el.removeAttribute(a)); }
};
Decision.Shown.prototype.tag = "div";

export { Decision };
