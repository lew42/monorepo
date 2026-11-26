import View, { div, h3, p, span, button, progress } from "../../core/View/View.js";
import { Property } from "../../core/Property/Property.js";
import Question from "./Question.js";

/**
 * Form: a list of Questions that reads and writes one plain object.
 *   const form = Form.from({ title: "Check-in", questions: [{ id: "intro", type: "T09", label: "How was the intro?" }] });
 *   form.values()                      // { intro: null }   (-3..3, 0, "skip" or null for a Scale7)
 *   form.load({ intro: 2 })            // sets answers by id; unknown ids are ignored
 *   form.on("change", values => …)     // any answer changed
 *   form.on("submit", values => …)     // Submit pressed and no required question is empty
 * `layout`: "list" (default) shows every question in a column; "stepper" shows one at a time with Back, Next and a
 * progress bar; "quiz" is a stepper whose questions may carry a `correct` value, ending in a score. Doc: readme.md.
 */
export default class Form extends View {

	static layouts = ["list", "stepper", "quiz"];

	// json: { title?, questions: [{ id, type, label, hint?, required?, options?, config? }] } or just the array.
	static from(json, opts = {}){
		const list = Array.isArray(json) ? json : json.questions;
		return new Form({ title: Array.isArray(json) ? undefined : json.title, ...opts, questions: list });
	}

	get changes(){ return this._changes ??= new Property(0); }
	get sent(){ return this._sent ??= new Property(null); }

	on(event, cb){
		if (event === "change") this.changes.on("change", () => cb.call(this, this.values(), this));
		else if (event === "submit") this.sent.on("change", v => cb.call(this, v, this));
		else return super.on(event, cb);
		return this;
	}

	classify(){
		super.classify();
		this.ac("fm-form");
	}

	get stepping(){ return this.layout === "stepper" || this.layout === "quiz"; }
	get quiz(){ return this.layout === "quiz"; }

	initialize(){
		this.items = [];
		this.index = 0;
		this.finished = false;
		super.initialize();
	}

	render(){
		if (this.title) h3.c("fm-title", this.title);
		div.c("fm-questions", box => {
			(this.questions ?? []).forEach(q => {
				const item = q instanceof Question ? box.append(q) && q : new Question(q);
				item.answer.on("change", () => this.changes.set(this.changes.get() + 1));
				this.items.push(item);
			});
		});
		if (this.stepping) this.nav(); else this.actions();
		if (this.quiz) this.score_box = div.c("fm-score fm-off");
		if (this.stepping) this.show();
	}

	actions(){
		div.c("fm-actions", () => {
			this.status = p.c("fm-status", "");
			button.c("prim", this.submit_text ?? "Submit").attr("type", "button").click(() => this.submit());
		});
	}

	// stepper and quiz: the progress line, the bar, Back and Next (Next is Submit on the last question)
	nav(){
		this.nav_box = div.c("fm-nav", () => {
			this.count = span.c("fm-count", "");
			this.bar = progress.c("fm-bar-progress").attr("max", this.items.length);
			div.c("fm-actions", () => {
				this.back_btn = button("Back").attr("type", "button").click(() => this.go(this.index - 1));
				this.next_btn = button.c("prim", "").attr("type", "button").click(() => this.advance());
				this.status = p.c("fm-status", "");
			});
		});
	}

	// Show question i and hide the rest; every Question stays alive, so no answer is lost on the way.
	go(i){
		this.index = Math.max(0, Math.min(this.items.length - 1, i));
		return this.show();
	}

	show(){
		this.items.forEach((q, i) => { if (this.finished || i === this.index) q.rc("fm-off"); else q.ac("fm-off"); });
		const last = this.index === this.items.length - 1;
		this.count.text(`Question ${this.index + 1} of ${this.items.length}`);
		this.bar.attr("value", this.index + 1);
		this.back_btn.el.disabled = this.index === 0;
		this.next_btn.text(last ? (this.quiz ? "Finish" : this.submit_text ?? "Submit") : "Next");
		return this;
	}

	// Next: stay on a required question that is still empty, else move on; on the last one, submit.
	advance(){
		const q = this.items[this.index];
		if (q.missing()){
			q.flag(true);
			this.status.text("Please answer this one.");
			return false;
		}
		this.status.text("");
		if (this.index < this.items.length - 1){ this.go(this.index + 1); return true; }
		return this.submit();
	}

	// { right, total, results: { id: true|false } } over the questions that have a `correct`.
	score(){
		const graded = this.items.filter(q => q.graded());
		return { right: graded.filter(q => q.right()).length, total: graded.length, results: Object.fromEntries(graded.map(q => [q.id, q.right()])) };
	}

	// The quiz ends: every question is shown again, graded, under the score.
	reveal(){
		const { right, total } = this.score();
		this.finished = true;
		this.nav_box.ac("fm-off");
		this.items.forEach(q => q.grade(true));
		this.score_box.empty(() => {
			p.c("fm-score-line", `You got ${right} of ${total} right.`);
			button.c("prim", "Try again").attr("type", "button").click(() => this.reset());
		}).rc("fm-off");
		return this.show();
	}

	// Clear every answer and go back to the first question.
	reset(){
		this.finished = false;
		this.items.forEach(q => { q.answer.reset(); q.flag(false); q.grade(false); });
		this.nav_box?.rc("fm-off");
		this.score_box?.ac("fm-off");
		this.status?.text("");
		return this.stepping ? this.go(0) : this;
	}

	question(id){ return this.items.find(q => q.id === id); }

	values(){
		return Object.fromEntries(this.items.map(q => [q.id, q.value]));
	}

	load(values = {}){
		for (const [id, v] of Object.entries(values)){
			const q = this.question(id);
			if (q) q.value = v;
		}
		return this;
	}

	// The ids of the required questions still empty.
	missing(){
		return this.items.filter(q => q.missing()).map(q => q.id);
	}

	submit(){
		const missing = this.missing();
		this.items.forEach(q => q.flag(missing.includes(q.id)));
		if (missing.length){
			this.status.text(`Please answer: ${missing.length} required.`);
			if (this.stepping) this.go(this.items.findIndex(q => missing.includes(q.id)));
			return false;
		}
		if (this.quiz) this.reveal(); else this.status.text("Thanks, sent.");
		this.sent.set({ ...this.values() });
		return true;
	}
}
