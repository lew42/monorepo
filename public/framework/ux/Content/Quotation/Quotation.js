import { div, p, a, blockquote, details, summary } from "../../../core/View/View.js";
import ContentModule from "../ContentModule.js";

/**
 * class Quotation extends ContentModule — one owner prompt, read-only: the words, the time,
 * how it was said, and a link to where. Give it the fields directly, or `{ id, log }` and it
 * reads the log and merges every `prompt` line with that id, field by field (a cleaned `text`
 * arriving later fills in over the raw one).
 *
 *   new Quotation({ text, raw, at, by, via, url })
 *   new Quotation({ id: "p-…", log: "/…/page.jsonl" })
 */
export default class Quotation extends ContentModule {

	render(){
		this.draw();
		if (this.id && this.log_url()){
			this.history().then(lines => {
				const merged = Object.assign({}, ...lines.filter(l => l.prompt?.id === this.id).map(l => l.prompt));
				if (merged.id){ Object.assign(this, merged); this.draw(); }
			});
		}
	}

	draw(){
		return this.empty(() => {
			const words = this.text ?? this.raw ?? "";
			blockquote.c("ux-content-quote", words);

			if (this.raw && this.text && this.raw !== this.text){
				details(() => { summary("As first transcribed"); p(this.raw); });
			}

			div.c("ux-content-meta", box => {
				const parts = [this.when(this.at), this.via && `by ${this.via}`, this.by].filter(Boolean);
				box.append(parts.join(" · "));
				if (this.url){ if (parts.length) box.append(" · "); a("Where it was said").attr("href", this.url); }
			});
		});
	}
}

Quotation.prototype.classes = "ux-content-quotation";

export { Quotation };
