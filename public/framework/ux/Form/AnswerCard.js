import View, { div, span, p, pre } from "../../core/View/View.js";
import Question from "./Question.js";
import "./Answer.js";

/**
 * AnswerCard: one answer type on the docs page: its id and name, a live question, the value it stores
 * (as JSON, updating as you answer), and the native element behind it.
 *   new AnswerCard({ answer: Scale7 })      // the class, not an instance
 */
export default class AnswerCard extends View {

	classify(){
		super.classify();
		this.ac("fm-card");
	}

	render(){
		const A = this.answer;
		const ex = A.example ?? {};
		div.c("fm-card-head", () => {
			span.c("fm-card-id", A.type);
			span.c("fm-card-name", A.title);
		});
		const q = new Question({ type: A.type, label: ex.label, hint: ex.hint, options: ex.options, config: ex.config });
		const json = pre.c("fm-json", "");
		const show = () => json.text(JSON.stringify(q.value));
		q.answer.on("change", show);
		show();
		p.c("fm-card-meta", () => {
			span(`stores ${A.shape}`);
			span(` · native ${A.native}`);
			if (A.use) span(` · ${A.use}`);
		});
		this.question = q;
	}
}
