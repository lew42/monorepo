import View, { span, p, legend } from "../../core/View/View.js";
import Answers from "./Answers.js";

/**
 * Question: a label, an optional hint, and one Answer.
 *   new Question({ id: "intro", type: "T09", label: "How was the intro?", hint: "Be honest", required: true })
 *   new Question({ id: "how", type: "chooseone", label: "How?", options: [["a", "A"], ["b", "B"]] })
 *   q.value            // the answer's value, read and write
 *   q.missing()        // true when it is required and still empty
 * `correct` (any value the answer can hold) makes it gradable: q.right(), and the quiz layout's score.
 * `type` is a type id ("T09") or an answer class name ("Scale7"). `options`, and any extra key in
 * `config` ({ markers: "faces" }), go to the Answer. A ready `answer` instance can be passed instead.
 */
export default class Question extends View {

	classify(){
		super.classify();
		this.ac("fm-question");
	}

	prerender(){
		this.tag = "fieldset";
		super.prerender();
	}

	get value(){ return this.answer.value; }
	set value(v){ this.answer.value = v; }

	missing(){ return !!this.required && this.answer.empty(); }

	graded(){ return this.correct !== undefined; }
	right(){ return this.graded() && this.answer.matches(this.correct); }

	// Show the grade: a green or red outline and the correct answer. grade(false) takes it away.
	grade(on = true){
		this.rc("fm-right"); this.rc("fm-wrong");
		this.key?.ac("fm-off");
		if (!on || !this.graded()) return this;
		this.ac(this.right() ? "fm-right" : "fm-wrong");
		this.key.text(this.right() ? "Correct" : "Correct answer: " + this.answer.say(this.correct)).rc("fm-off");
		return this;
	}

	// Mark or unmark "answer this one" (the form does it on submit).
	flag(on){
		if (on) this.ac("fm-missing"); else this.rc("fm-missing");
		return this;
	}

	render(){
		legend.c("fm-label", () => {
			span(this.label ?? this.id ?? "");
			if (this.required) span.c("fm-req", "*").attr("title", "required");
		});
		if (this.hint) p.c("fm-hint", this.hint);
		this.answer ??= Answers.make(this.type, { ...this.config, options: this.options });
		this.answer.parent = this;
		if (!this.answer.el.parentNode) this.append(this.answer);
		this.answer.on("change", () => this.flag(false));
		this.key = p.c("fm-key fm-off", "");
	}
}
