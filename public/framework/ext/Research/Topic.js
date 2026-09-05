import { div, p, a, span } from "../../core/View/View.js";
import { Program } from "./Program.js";

/**
 * ONE topic of a program, for a topic whose minion wrote no page of its own:
 * the question, the curated pages beside the log (a verdict), the credence
 * legend, and EVERY entry — the front shows the newest twenty across all
 * topics; this shows all of one. The whole opt-in is a page.js beside the log:
 *
 *   export default new Program.Topic({ meta: import.meta, title: "Users" });
 *
 * Without it a topic dir is not a page, so `<topic>/verdict.md` has nothing to
 * hang from and 404s (2026-09-04). Every Program step is a method, so this
 * overrides four and inherits the rest — the entry card, the badge, the source.
 *
 * ⚠ `ResearchTopic`, not `Topic`: classify() stamps every constructor name as a
 *   class, and `.topic` is a word other CSS could own.
 * ⚠ No field or method named `topic` — `is: "topic"` pages reach `this.topic()`.
 */
export class ResearchTopic extends Program {

	/** My dir name is my topic. */
	slug(){ return this.url.replace(/\/$/, "").split("/").at(-1); }
	topic_list(){ return [this.slug()]; }
	log_url(){ return this.url + "log.jsonl"; }

	/* listing() walked directory.json down to MY dir; its `.md` files are the
	   curated pages, and `page` is false by definition — I am the page. */
	found(log, dir){
		log.page = false;
		log.pages = (dir?.children ?? []).filter(f => f.name.endsWith(".md")).map(f => f.name.slice(0, -3));
	}

	draw(){
		this.$live.empty(() => {
			const all = this.all();
			this.question ??= all.findLast(e => e.kind === "question")?.title;   // the seed — all() is newest first
			this.head(all);
			this.pages();
			this.legend(all);
			this.stream(all);
			this.foot(all);
		});
	}

	/** The read of the log — `verdict` first, then whatever else was curated. */
	pages(){
		const pages = [...(this.logs[0]?.pages ?? [])].sort((x, y) => (y === "verdict") - (x === "verdict"));
		if (!pages.length) return;

		div.c("research-topics flow", () => {
			p.c("h4 muted", "The read");
			div.c("research-topics-row grid auto gap", () => pages.forEach(name =>
				div.c("research-card surface flex v gap").append(() => {
					a.c("research-card-name h3").href(this.url + name + "/").text(name);
				})));
		});
	}

	/** All of it, not the front's twenty. */
	stream(all){ this.cap = all.length; super.stream(all); }

	foot(all){
		const t = this.logs[0]?.tally() ?? { bad: 0, unparsed: 0 };
		const marks = [t.bad && `${t.bad} refused by the schema`, t.unparsed && `${t.unparsed} torn`].filter(Boolean);
		p.c("muted", () => {
			span().text(`${all.length} entries${marks.length ? ", " + marks.join(", ") : ""} — the raw log is `);
			a().href(this.url + "log.jsonl").text("log.jsonl");
		});
	}
}

Program.Topic = ResearchTopic;
