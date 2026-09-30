import View, { div, span, ul, li, p } from "../../../core/View/View.js";
import ContentModule from "../ContentModule.js";

/* The option wall's look is ui/decision's (three-way chosen marking, contrast numbers). */
import "../../../ui/decision/decision.js";
View.stylesheet(import.meta, "decision.css");

/**
 * class Decision extends ContentModule — an ask, its options (each with a caveat), and the
 * one chosen. A click appends a `chose` line; the others stay visible and clickable so the
 * choice can change; the latest `chose` line for the id wins.
 *
 *   new Decision({ page, id, ask, options: [{ say, caveat }], why, log })
 *   new Decision({ page, log, ...legacyRecord })   // {id|title, chose, over|alternative, why}
 *
 * A legacy task.jsonl decision is normalized to the same shape, its `chose` pre-selected.
 *
 * A record written by Server/decide.mjs also carries rank, confidence, recommended (an option
 * id), sources, depends_on and each option's `then`; they show as a head row, a
 * "recommended" mark and a sources line. `nested` (option id → child records, given by
 * Decisions.js) draws each child decision INSIDE the option that leads to it.
 */
export default class Decision extends ContentModule {

	/* One shape in, one shape out. `options` present = the settled shape; otherwise a
	 * legacy record: options = chose + over (or alternative), chosen = chose. */
	static normalize(d){
		d = d.decision ?? d;
		const say = o => typeof o === "string" ? { say: o } : { say: o.say ?? o.text ?? o.title ?? String(o.id ?? ""), caveat: o.caveat ?? o.caveats?.join(" ") ?? o.why, key: o.id, then: o.then };
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

			// decide.mjs's fields — absent on older records, and then nothing extra is drawn.
			const extra = {};
			for (const k of ["rank", "confidence", "recommended", "sources", "depends_on", "status", "decided_by"]) if (d[k] != null) extra[k] = d[k];

			return { id: d.id, ask: humanize(words), options, why: d.because ?? d.why, chosen: typeof chosen === "string" ? chosen : undefined, ...extra };
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

	/* Decided by default (Server/decide.mjs, 2026-09-29): a record with `status: "decided"` already
	 * names its winner — the recommended option — before anyone has clicked anything. Remember that
	 * starting point as `default_chosen`/`default_decided_by` so an owner's later CLEAR (tapping
	 * their own choice again, see `unchoose`) has something honest to fall back to, instead of
	 * landing on "nothing chosen" for a decision the system already made. */
	initialize(){
		Object.assign(this, this.constructor.normalize(this));
		if (this.status === "decided" && this.recommended != null && this.chosen === undefined){
			const winner = this.options.find(o => o.key === this.recommended);
			if (winner){ this.default_chosen = winner.say; this.default_decided_by = "system"; }
		}
		this.chosen ??= this.default_chosen;
		this.decided_by ??= this.default_decided_by ?? null;
		super.initialize();
	}

	render(){
		this.draw();
		// One read, then show the latest `chose` for this id (later lines win).
		this.history().then(lines => {
			const line = lines.filter(l => l.chose?.decision === this.id).pop();
			if (!line) return;
			// A real click always wins. `option: null` is a deliberate CLEAR (the un-choose tap,
			// or a UI bug's accidental pick undone) — it reverts to the system's own default, not
			// to "nothing chosen", because the record itself is still `status: "decided"`.
			if (line.chose.option != null){ this.chosen = line.chose.option; this.decided_by = line.chose.by; }
			else { this.chosen = this.default_chosen; this.decided_by = this.default_decided_by ?? null; }
			this.draw();
		});
	}

	draw(){
		return this.empty(() => {
			this.head();
			if (this.ask && !this.bare) div.c("ux-content-ask", this.ask);
			this.wall();
			if (this.why && !this.legacy_why) p.c("ui-decision-because", this.why);
			this.cited();
		});
	}

	/* Rank, confidence and status as one quiet row; nothing for a record that has none. */
	head(){
		const bits = [];
		if (this.rank != null) bits.push(["ux-content-rank", `Rank ${this.rank}`]);
		if (this.confidence != null) bits.push(["ux-content-confidence", `${Math.round(this.confidence * 100)}% confident`]);
		if (this.chosen && this.decided_by) bits.push(["ux-content-status", `Decided by ${this.decided_by}`]);
		if (bits.length) div.c("ux-content-decision-head", () => bits.forEach(([c, t]) => span.c(c, t)));
	}

	cited(){
		if (this.sources?.length) p.c("ux-content-sources", "Sources: " + this.sources.join(", "));
	}

	/* The options side by side; then, full width below the row, each option's child decisions. */
	wall(){
		ul.c("ui-decision-options", () => this.options.forEach(o => li(() => this.option(o))));
		this.options.forEach(o => { const kids = this.kids(o); if (kids.length) this.branch(o, kids); });
	}

	/* The child decisions an option leads to: from `nested` (Decisions.js), by option id. */
	kids(o){ return (o.key != null && this.nested?.[this.id]?.[o.key]) || []; }

	/* "Choose this → then decide:" and each child, drawn as a whole Decision of its own. */
	branch(o, kids){
		return div.c("ux-content-then", () => {
			div.c("ux-content-then-label", `If “${o.say}” → then decide:`);
			kids.forEach(k => new this.constructor({ ...k, page: this.page, log: this.log, card: this.card, by: this.by, readonly: this.readonly, nested: this.nested }));
		});
	}

	option(o){ return new (this.readonly ? this.constructor.Shown : this.constructor.Option)({ decision: this, option: o }); }

	/* A genuine tap on an option: the option already chosen clears back to the system's own
	 * default (a deliberate, undoable override — the owner, 2026-09-29: a stray tap during a
	 * scroll used to become "chosen" with no way to undo it); any other option is chosen. */
	pick(say){ return this.chosen === say ? this.unchoose() : this.choose(say); }

	/* Local first (the card shows it at once), then the log. */
	choose(say){
		this.chosen = say;
		this.decided_by = this.who();
		this.draw();
		return this.write({ chose: { decision: this.id, option: say, at: this.now(), by: this.who() } });
	}

	/* Clears an owner's own override — back to whatever the system already had (its recommended
	 * option, marked "chosen by the system"), or to nothing chosen when there was no default. */
	unchoose(){
		this.chosen = this.default_chosen;
		this.decided_by = this.default_decided_by ?? null;
		this.draw();
		return this.write({ chose: { decision: this.id, option: null, at: this.now(), by: this.who() } });
	}
}

Decision.prototype.classes = "ux-content-decision";

/* Every option is a real <button>: keyboard, screen reader, and a chosen state that is a
 * ground, a border AND the word "chosen" (ui/decision's rule — never colour alone). */
Decision.Option = class DecisionOption extends View {

	render(){
		const { say, caveat, why } = this.option;
		const chosen = this.decision.chosen === say;
		// Three marks look alike but mean different things: the system's own default pick
		// (undoable — tap it to clear), someone's real, deliberate tap (also undoable, the same
		// way), and a pre-decide.mjs legacy record that carries no `decided_by` at all — that one
		// keeps the old, neutral "chosen" wording rather than guessing at who or how.
		const by_system = chosen && this.decision.decided_by === "system";
		const by_someone = chosen && !by_system && this.decision.decided_by;

		this.ac("ui-decision-option ux-content-option");
		if (chosen) this.ac("chosen");
		if (by_system) this.ac("ux-content-system-chosen");
		this.attr("type", "button").attr("aria-pressed", String(chosen));
		this.wire(say);

		if (chosen) span.c("ui-decision-mark", by_system ? "chosen by the system" : by_someone ? "your choice" : "chosen");
		else if (this.option.key != null && this.option.key === this.decision.recommended) span.c("ui-decision-mark ux-content-recommended", "recommended");
		div.c("ui-decision-say", say);
		if (caveat) p.c("ux-content-caveat", caveat);
		if (chosen && why) p.c("ui-decision-why", why);
	}
};

/* A deliberate tap, not one that only landed here because a scroll was still moving (the owner,
 * 2026-09-29, on the phone: scrolling past a decision card silently chose an option, with no way
 * to undo it). Between this element's own `pointerdown` and the `click` the browser fires from
 * it, two things say the finger was really scrolling, not tapping: the touch itself moved more
 * than ~10px, or a scroll happened anywhere (`capture: true` catches it however deep the
 * scrolling element sits — `scroll` doesn't bubble, but capturing does not need it to). Either
 * one means ignore this click. A click with no `pointerdown` before it — keyboard Enter/Space,
 * a screen reader's activation — always goes through; only a touch/pointer gesture is guarded. */
function guarded_click(view, cb){
	let down = null;
	const mark_scrolled = () => { if (down) down.scrolled = true; };
	view.on("pointerdown", e => {
		down = { x: e.clientX, y: e.clientY, scrolled: false };
		window.addEventListener("scroll", mark_scrolled, { capture: true, passive: true });
	});
	view.on("pointerup", () => window.removeEventListener("scroll", mark_scrolled, { capture: true }));
	view.click(e => {
		if (down){
			const moved = Math.hypot((e.clientX ?? down.x) - down.x, (e.clientY ?? down.y) - down.y) > 10;
			const scrolled = down.scrolled;
			down = null;
			if (moved || scrolled) return;
		}
		cb();
	});
}

/* The write seam of one option — a subclass changes what a click does without redrawing. */
Decision.Option.prototype.wire = function(say){ guarded_click(this, () => this.decision.pick(say)); };

Decision.Option.prototype.tag = "button";

/* The same card with nothing to press: for a host that only SHOWS the record (the task
 * page's Decisions tab writes its own verdict lines, not a second kind of choice). */
Decision.Shown = class DecisionShown extends Decision.Option {
	wire(){ this.rc("ux-content-option").ac("ux-content-shown"); ["type", "aria-pressed"].forEach(a => this.el.removeAttribute(a)); }
};
Decision.Shown.prototype.tag = "div";

export { Decision };
