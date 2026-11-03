import { View, div, span, a, p, button } from "/app.js";
import { servex_url } from "/framework/dev/servex_url.js";

View.stylesheet(import.meta, "ReadyToMerge.css");

/** ReadyToMerge — one card per branch an agent marked `ready:`. The rows come from Servex
 *  GET /api/ready-to-merge (Server/ReadyToMerge.mjs); Merge POSTs /api/merge {branch, head?}, which runs
 *  Server/merge.mjs and answers {ok, out, why}. Whatever merge.mjs says is shown in the card, never retried.
 *  The list has three loading states, shown in words: loading, Servex not answering (retrying), Servex's error text. */
export default class ReadyToMerge extends View {
	get classes(){ return "rm-list"; }

	static TIMEOUT = 8000;   // ms to wait for the list before calling Servex "not answering"
	static RETRY = 4000;     // ms between tries

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){ this.rows = null; this.state = "loading"; this.text = ""; this.tries = 0; super.initialize(); }

	render(){
		this.$body = div.c("rm-body");
		this.paint();
		this.load();
	}

	async load(){
		const url = servex_url("/api/ready-to-merge");
		this.tries++;
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(this.constructor.TIMEOUT) });
			let data = null; try { data = await res.json(); } catch {}
			if (!res.ok) throw Object.assign(new Error(data?.why || `HTTP ${res.status}`), { answered: true });
			this.rows = data; this.state = "ready";
			return this.paint();
		} catch (e) {
			const secs = this.constructor.RETRY / 1000;
			if (e.answered) { this.state = "error"; this.text = `Servex answered with an error: ${e.message}. Trying again in ${secs}s (try ${this.tries}).`; }
			else { this.state = "down"; this.text = `Servex isn't answering at ${new URL(url, location.href).origin} (${e.name === "TimeoutError" ? `no answer in ${this.constructor.TIMEOUT / 1000}s` : e.message}). Trying again in ${secs}s (try ${this.tries}).`; }
		}
		this.paint();
		setTimeout(() => this.load(), this.constructor.RETRY);
	}

	paint(){
		this.$body.empty(() => {
			if (this.state === "loading") return p.c("rm-none", "Loading the merge list…");
			if (this.state !== "ready") return p.c(`rm-none rm-${this.state}`, this.text);
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
			// the worktree's own server, open on the phone over the home Wi-Fi until the merge (Servex/doc/worktree-preview.md)
			if (r.preview) div.c("rm-preview", () => { span("Try it on your phone: "); a(r.preview).href(r.preview).attr("target", "_blank"); });
			const out = div.c("rm-out");
			const latest = r.stale && r.latest, head = r.head.slice(0, 9);
			let note = "", can = !!r.worktree;
			if (!r.worktree) note = "No worktree holds this branch, so the button cannot merge it.";
			else if (r.stale && !latest.ok) {
				can = false;
				note = `New commits landed after it was marked ready (${r.sha.slice(0, 9)} → ${head}), and they cannot merge yet. ${latest.why} ${r.agent ? `${r.agent} marked it ready: ask that agent` : "Ask the agent that marked it ready"} to fix this.`;
			} else if (r.stale) note = `New commits landed after it was marked ready (${r.sha.slice(0, 9)} → ${head}). The review still covers them.`;
			const b = button.c("rm-merge", r.stale ? `Merge latest (${head})` : "Merge").attr("type", "button");
			if (!can) b.attr("disabled", "disabled");
			if (note) out.text(note);
			b.on("click", () => this.merge(r, b, out));
		});
	}

	async merge(r, b, out){
		b.attr("disabled", "disabled").text("Merging…");
		let answer;
		try {
			const res = await fetch(servex_url("/api/merge"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branch: r.branch, ...(r.stale ? { head: r.head.slice(0, 9) } : {}) }), signal: AbortSignal.timeout(960000) });
			answer = await res.json();
		} catch (e) { answer = { ok: false, why: `Servex did not answer: ${e.message}` }; }
		b.text(answer.ok ? "Merged" : "Refused");
		out.ac(answer.ok ? "rm-ok" : "rm-bad").text([answer.ok ? "Merged." : answer.why, answer.warn, answer.out].filter(Boolean).join("\n"));
	}
}
