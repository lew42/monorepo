import { div, span, textarea, button, p } from "../../../core/View/View.js";
import ContentModule from "../ContentModule.js";

/**
 * class Question extends ContentModule — an ask, a text field and a button. Submitting
 * appends an `answer` line; the latest answer shows beneath and can be edited again.
 *
 *   new Question({ page, id, ask, hint, log })
 */
export default class Question extends ContentModule {

	render(){
		this.draw();
		this.history().then(lines => {
			const line = lines.filter(l => l.answer?.question === this.id).pop();
			if (line){ this.latest = line.answer; this.draw(); }
		});
	}

	draw(){
		return this.empty(() => {
			div.c("ux-content-ask", this.ask);
			if (this.hint) p.c("ux-content-hint", this.hint);
			this.field();
			if (this.latest) this.answered();
		});
	}

	field(){
		this.$field = textarea.c("ux-content-field").attr("aria-label", this.ask)
			.attr("placeholder", "Your answer…")
			.on("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) this.submit(); });
		div.c("ux-content-row", () => {
			button.c("prim", this.latest ? "Save new answer" : "Answer").attr("type", "button").click(() => this.submit());
			span.c("ux-content-hint", "Ctrl + Enter also sends it");
		});
	}

	answered(){
		const a = this.latest;
		return div.c("ux-content-answer", () => {
			div.c("ux-content-hint", `Answered ${this.when(a.at)}${a.by ? ` · ${a.by}` : ""}`);
			p(a.text);
			button.c("ux-content-edit").attr("type", "button").append("Edit").click(() => {
				this.$field.el.value = a.text;
				this.$field.el.focus();
			});
		});
	}

	submit(){
		const text = this.$field.el.value.trim();
		if (!text) return;

		this.latest = { question: this.id, text, at: this.now(), by: this.who() };
		this.draw();
		return this.write({ answer: this.latest });
	}
}

Question.prototype.classes = "ux-content-question";

export { Question };
