import View, { small, span, button } from "/framework/core/View/View.js";
import MobileRow from "../mobile/MobileRow.js";
import MobileData from "../mobile/MobileData.js";

View.stylesheet(import.meta, "review.css");

/* One session in the review list: the phone row (MobileRow) with a plain title, a context line (what it belongs to),
   its slug small, its state as the dot (green approved, amber working, red leak, grey waiting) and an Approve button. */
export default class ReviewRow extends MobileRow {
	static DOT = { approved: "is-done", live: "is-running", leak: "is-blocked", waiting: "is-open" };
	static WORD = { approved: "approved", live: "working", leak: "leak", waiting: "waiting for you" };
	static ROLES = /^(mastermind|minion|reviewer|clarity|checker|voter|fixer|assistant|master-assistant)-/;

	/** The name a person reads: the record's title, else the agent name made into words ("minion-review-page" -> "Review page"). */
	static title(s){
		if (s.title) return s.title;
		const words = (s.agent ?? "").replace(ReviewRow.ROLES, "").replace(/[-_]+/g, " ").trim();
		return words ? words[0].toUpperCase() + words.slice(1) : "Untitled session " + s.id.slice(0, 8);
	}

	/** What it belongs to, in words, or null: "for Sessions and tasks deputy" or "started by voice-app". The role is already on the line above. */
	static context(r){
		if (r.up) return `for ${ReviewRow.title(r.up.snap)}`;
		if (r.snap.parent) return `started by ${r.snap.parent}`;
		return null;
	}

	render(){
		this.plain = ReviewRow.title(this.snap);
		this.row_snap = this.snap;
		this.snap = { ...this.snap, title: this.plain, usd: this.rolled, tree_usd: this.rolled };
		this.group = "rest";
		this.ac("rv-row", "rv-" + this.state);
		super.render();
	}

	dot_key(){ return this.state; }
	href(){ return MobileData.SESSIONS + this.snap.id + "/"; }

	/** The state word, what it belongs to, and the slug, small. */
	below(){
		const s = this.row_snap, slug = s.agent ?? (s.folder !== s.id ? s.folder : null);
		small.c("rv-context", () => {
			span.c("rv-state", this.by_parent ? "approved with its parent" : ReviewRow.WORD[this.state]);
			const ctx = ReviewRow.context(this);
			if (ctx) span(" · " + ctx);
			if (slug && slug !== this.plain) span.c("rv-slug", slug);
		});
	}

	after(){
		if (this.approved) return;
		button.c("rv-approve", "Approve").attr("type", "button")
			.attr("title", this.kids.length ? `Approve this session and the ${this.kids.length} it spawned` : "Approve this session")
			.click(e => { e.target.disabled = true; this.page.approve([this]); });
	}
}
