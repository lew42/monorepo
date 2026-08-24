import { View, div, span, h3, h4, p, button, progress } from "/app.js";
import { css } from "../../ui/parts.js";

/* Toggling display on .ux-wizard-steps / .ux-wizard-crumbs has to live entirely
 * inside @layer theme with NO util utility classes riding along on the same
 * element — .flex { display: flex } is @layer util and beats any @layer theme
 * rule at ANY specificity, media query or not (css skill, caveats.md). So these
 * two write their own flex/gap instead of borrowing the utilities.
 *
 * The root is `.wizard`, not a minted class — classify() (core/View) already
 * gives every Wizard instance that, free, off the class name, same as Sidebar
 * gets `.sidebar` with no line in Sidebar.css for it. */
css(`@layer theme {
	.wizard { container-type: inline-size; }

	.ux-wizard-steps { display: flex; flex-direction: column; gap: 0.5em; flex: 0 0 14em; min-width: 0; }
	.ux-wizard-steps button:disabled { opacity: 0.5; cursor: default; }

	.ux-wizard-crumbs { display: none; flex-direction: column; gap: 0.5em; }

	@container (width < 38em) {
		.ux-wizard-steps { display: none; }
		.ux-wizard-crumbs { display: flex; }
	}
}`);

/**
 * Wizard — the generic multi-step engine. Lessons, courses and multi-step
 * signup all extend this; it knows nothing about any of them.
 *
 *   new Wizard({
 *       steps: [
 *           { title: "Name", content(wizard){ … }, validate(wizard){ return !!wizard.values.name; } },
 *           { title: "Options", content(wizard){ … } },
 *           { title: "Confirm", content(wizard){ … } },
 *       ],
 *       done(wizard){ … },   // optional — assign() lets a caller override any seam per-instance
 *   });
 *
 * State is just `index` (current step) and `values` (whatever the step content
 * functions choose to write to). No persistence, no router coupling — a
 * caller that wants either builds it on top of the seams below.
 *
 * Indicator: a labeled rail of steps where there's room, "Step X of N" + a
 * <progress> bar under `--column` width (`ui/progress`'s own component — there
 * is no ui.progress(), the element already does this). Body is a reading
 * column (`.measure.start`) beside the rail.
 */
export class Wizard extends View {

	// Builds directly onto `this` — no inner wrapper div — so a caller's own
	// .ac()/.style() (the words demo, a subclass) lands on the real root.
	render(){
		this.index ??= 0;
		this.values ??= {};
		this.attempted = false;
		this.steps = (this.steps || []).map((s, i) => this.own_step(s, i));

		this.ac("flex wrap gap");

		this.$rail = div.c("ux-wizard-steps");
		div.c("flex-1 flex v gap", () => {
			this.$crumbs = div.c("ux-wizard-crumbs");
			this.$body = div.c("ux-wizard-body measure start");
			this.$controls = div.c("flex gap split");
		});

		this.update();
	}

	// A caller-declared step is a plain object; own_step() makes it an instance
	// of this.constructor.Step so a Wizard subclass can swap what a step IS
	// (code skill §3) without the caller ever writing a class.
	own_step(step, i){
		return Object.assign(step instanceof this.constructor.Step ? step : new this.constructor.Step(step), { i });
	}

	// ---- the four seams next() back() go() done() call through -------------

	next(){
		const ok = this.validate();
		if (ok && ok.then){ ok.then(valid => valid ? this.go(this.index + 1) : this.retry()); return this; }
		return ok ? this.go(this.index + 1) : this.retry();
	}

	back(){
		return this.go(this.index - 1);
	}

	go(i){
		if (i < 0 || i >= this.steps.length) return this;
		this.index = i;
		this.attempted = false;
		return this.update();
	}

	done(){
		const ok = this.validate();
		if (ok && ok.then){ ok.then(valid => valid && this.finish()); return this; }
		return ok ? this.finish() : this.retry();
	}

	// The primary button / Enter key call this — advance if there's a next
	// step, finish if this is the last one. A subclass overrides this ONE
	// method to change what "the main action" does; next()/done() stay put.
	advance(){
		return this.index === this.steps.length - 1 ? this.done() : this.next();
	}

	// ---- the two things a failed gate or a finish change -------------------

	validate(){
		const step = this.steps[this.index];
		return step.validate ? step.validate(this) : true;
	}

	retry(){
		this.attempted = true;
		this.$body.empty(() => this.step_content());
		return this;
	}

	finish(){
		this.complete = true;
		return this.update();
	}

	// Every rebuild throws the old buttons away, so a keyboard user who was IN
	// the wizard (Wizard.Keys's listener needs a focused descendant to bubble
	// from) would otherwise land on document.body after every step and lose
	// Enter/arrows until they clicked back in. Restore focus to the new
	// primary button, but only if focus was already inside — never steal it
	// on the FIRST render, where nothing has been touched yet.
	update(){
		const had_focus = this.el.contains(document.activeElement);

		this.$rail.empty(() => this.steps.forEach(step => this.step_button(step)));
		this.$crumbs.empty(() => this.crumbs());
		this.$body.empty(() => this.step_content());
		this.$controls.empty(() => this.controls());

		if (had_focus) this.$controls.el.querySelector("button.prim")?.focus();

		return this;
	}

	// ---- the pieces composed — each exposed so a subclass overrides ONE ----

	step_button(step){
		const $b = button(step.label()).click(() => step.i <= this.index && this.go(step.i));
		if (step.i === this.index) $b.ac("prim").attr("aria-current", "step");
		if (step.i > this.index) $b.attr("disabled", "");
		return $b;
	}

	crumbs(){
		div.c("h4 muted", `Step ${this.index + 1} of ${this.steps.length}`).attr("aria-live", "polite");
		return progress().attr("max", this.steps.length).attr("value", this.index + 1).style("width", "100%");
	}

	step_content(){
		if (this.complete) return this.summary();
		return this.steps[this.index].content.call(this, this);
	}

	// The base's own default "done" screen — overridden by passing `done()`
	// at construction (assign lets a caller shadow any method per-instance)
	// or by a named subclass.
	summary(){
		div.c("flow", () => {
			h3("All set");
			p(`${this.steps.length} of ${this.steps.length} steps done.`);
			div.c("flex v gap", () => {
				for (const key in this.values)
					div.c("flex split", () => { span.c("muted", key); span(String(this.values[key])); });
			}).style("--gap", "0.3em");
		});
	}

	controls(){
		if (this.complete) return;
		const last = this.index === this.steps.length - 1;

		const $back = button("Back").click(() => this.back());
		if (this.index === 0) $back.attr("disabled", "");

		button.c("prim", last ? "Finish" : "Next").click(() => this.advance());
	}
}

// A caller writes { title, content, validate } — own_step() wraps it in this
// so this.constructor.Step is always what a step IS, swappable per code skill §3.
Wizard.Step = class WizardStep {
	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }
	label(){ return this.title; }
};

/* ---- the mixin-vs-subclass experiment, shipped side ------------------------
 * Both ways were built on keyboard nav; the verdict and the losing mixin code
 * are in doc/decisions.md. Subclass won — composes via super(), inherits the
 * static side (this.constructor.Step keeps working), removable by simply not
 * instantiating it. A mixin applied to Wizard.prototype can't call super, so a
 * second mixin that also wants render() silently deletes the first's — proven
 * in doc/decisions.md, not asserted. */
Wizard.Keys = class WizardKeys extends Wizard {

	render(){
		super.render();
		this.on("keydown", e => this.on_keydown(e));
	}

	on_keydown(e){
		const editing = e.target.matches?.("input, textarea, select, [contenteditable]");

		if (e.key === "Enter" && e.target.tagName !== "BUTTON"){
			e.preventDefault();
			this.advance();
		} else if (e.key === "ArrowRight" && !editing){
			this.advance();
		} else if (e.key === "ArrowLeft" && !editing){
			this.back();
		}
	}
};

export default Wizard;
