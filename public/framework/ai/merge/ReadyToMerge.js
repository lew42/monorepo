import { View, div, span, a, p, button } from "/app.js";
import { servex_url } from "/framework/dev/servex_url.js";

View.stylesheet(import.meta, "ReadyToMerge.css");

/** ReadyToMerge — one card per branch an agent marked `ready:`. The rows come from Servex
 *  GET /api/ready-to-merge (Server/ReadyToMerge.mjs); Merge POSTs /api/merge {branch}, which runs
 *  Server/merge.mjs and answers {ok, out, why}. Whatever merge.mjs says is shown in the card, never retried. */
export default class ReadyToMerge extends View {
	get classes(){ return "rm-list"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){ this.rows = null; this.error = ""; super.initialize(); }

	render(){
		this.$body = div.c("rm-body");
		this.load();
	}

	async load(){
		try {
			const res = await fetch(servex_url("/api/ready-to-merge"), { signal: AbortSignal.timeout(20000) });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			this.rows = await res.json();
		} catch (e) {
			this.error = `Servex did not give the merge list (${e.message}). If this feature is new, Servex needs a restart.`;
		}
		this.paint();
	}

	paint(){
		this.$body.empty(() => {
			if (this.error) return p.c("rm-none", this.error);
			if (!this.rows.length) return p.c("rm-none", "Nothing waiting to merge.");
			this.rows.forEach(r => this.card(r));
		});
	}

	card(r){
		div.c("rm-card", () => {
			a.c("rm-title", r.title).href(r.task_url).attr("target", "_self");
			div.c("rm-what", r.what || "No description was logged with the ready line.");
			div.c("rm-meta", () => {
				span.c("rm-review", r.review);
				span.c("rm-branch", `${r.branch} @ ${r.sha.slice(0, 9)}`);
			});
			const out = div.c("rm-out");
			const note = r.stale ? "The branch moved after it was marked ready; ask the agent to mark it ready again."
				: !r.worktree ? "No worktree holds this branch, so the button cannot merge it." : "";
			const b = button.c("rm-merge", "Merge").attr("type", "button");
			if (note) { b.attr("disabled", "disabled"); out.text(note); }
			b.on("click", () => this.merge(r, b, out));
		});
	}

	async merge(r, b, out){
		b.attr("disabled", "disabled").text("Merging…");
		let answer;
		try {
			const res = await fetch(servex_url("/api/merge"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branch: r.branch }), signal: AbortSignal.timeout(960000) });
			answer = await res.json();
		} catch (e) { answer = { ok: false, why: `Servex did not answer: ${e.message}` }; }
		b.text(answer.ok ? "Merged" : "Refused");
		out.ac(answer.ok ? "rm-ok" : "rm-bad").text([answer.ok ? "Merged." : answer.why, answer.warn, answer.out].filter(Boolean).join("\n"));
	}
}
