import View, { div, h3, p, button } from "../../core/View/View.js";
import { Property } from "../../core/Property/Property.js";
import Question from "./Question.js";

/**
 * Form: a list of Questions that reads and writes one plain object.
 *   const form = Form.from({ title: "Check-in", questions: [{ id: "intro", type: "T09", label: "How was the intro?" }] });
 *   form.values()                      // { intro: null }   (-3..3, 0, "skip" or null for a Scale7)
 *   form.load({ intro: 2 })            // sets answers by id; unknown ids are ignored
 *   form.on("change", values => …)     // any answer changed
 *   form.on("submit", values => …)     // Submit pressed and no required question is empty
 * `layout: "list"` shows every question in a column. Doc: readme.md.
 */
export default class Form extends View {

	static layouts = ["list"];

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

	initialize(){
		this.items = [];
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
		this.actions();
	}

	actions(){
		div.c("fm-actions", () => {
			this.status = p.c("fm-status", "");
			button.c("prim", this.submit_text ?? "Submit").attr("type", "button").click(() => this.submit());
		});
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
		this.status.text(missing.length ? `Please answer: ${missing.length} required.` : "Thanks, sent.");
		if (!missing.length) this.sent.set({ ...this.values() });
		return !missing.length;
	}
}
