import { View, span, small } from "/app.js";
import AISessionView from "./AISessionView.js";

// One rolled-up bucket, drawn as a single grid row (or rail card): "▸ 2,914 prompt-cleaning sessions · $123 ·
// show". A click shows or hides the sessions inside it. The totals are AISessionBuckets' running ones. Doc: ai/sessions/doc/buckets.md
export default class AISessionBucketView extends View {

	static LABELS = { "prompt-cleaning": "prompt-cleaning", "short-run": "short headless", clarity: "clarity check", reviewer: "review", helper: "helper" };

	// Getters: prerender() runs inside View's constructor, before a subclass's fields exist.
	get classes(){ return this.card ? "sessions-bucket sessions-bucket-card" : "sessions-bucket"; }

	prerender(){
		super.prerender();
		this.attr("role", "button").attr("tabindex", "0").attr("aria-expanded", String(!!this.open))
			.attr("title", this.open ? "Hide these sessions again" : "Show every session in this group");
		this.on("click", e => { e.preventDefault(); this.toggle(); });
		this.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); this.toggle(); } });
	}

	render(){
		const b = this.row, name = AISessionBucketView.LABELS[b.key] ?? b.key;
		span.c("sessions-fold", this.open ? "▾" : "▸");
		span.c("sessions-row-title", `${b.n.toLocaleString()} ${name} session${b.n === 1 ? "" : "s"}`);
		small.c("muted", `${AISessionView.usd(b.usd)} · routine, one row · ${this.open ? "hide" : "show"}`);
	}
}
