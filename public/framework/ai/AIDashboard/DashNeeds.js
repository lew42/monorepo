import { View, div, span, a, h2 } from "/app.js";
import { servex_url } from "/framework/dev/servex_url.js";
import CardDir from "../cards/CardDir.js";

/** DashNeeds — what waits on the owner: the decisions and questions agents asked (Servex `GET /waiting`, the same rule as the Inbox's "Needs you") and the branches ready to merge (Servex `GET /api/ready-to-merge`).
 *  Each is read once when the page opens: no live query, so the page's one live source stays free for "what is running". */
export default class DashNeeds extends View {
	static KINDS = { decision: "decision", question: "question", blocker: "blocker", fyi: "asked you" };
	static TOP = 3;

	get classes(){ return "ad-sec ad-needs"; }

	render(){
		h2.c("ad-h", "Needs you");
		this.$waiting = div.c("ad-block", () => div.c("ad-none", "Asking Servex…"));
		this.$merge = div.c("ad-block", () => div.c("ad-none", "Asking Servex…"));
		this.read(servex_url("/waiting")).then(rows => this.paint_waiting(rows));
		this.read(servex_url("/api/ready-to-merge")).then(rows => this.paint_merge(rows));
	}

	/** The rows, or null when Servex does not answer: a count is never drawn from a failed read. */
	read(url){
		return fetch(url, { signal: AbortSignal.timeout(15000) }).then(r => r.ok ? r.json() : null).then(rows => Array.isArray(rows) ? rows : null).catch(() => null);
	}

	/** The rows with repeats dropped: by card or id first, then by title. The count above still says how many Servex listed. */
	static unique(rows){
		const keys = new Set(), titles = new Set();
		return rows.filter(r => {
			const key = r.card || r.id, title = String(r.title || r.question || "").replace(/s+/g, " ").trim().toLowerCase();
			if ((key && keys.has(key)) || (title && titles.has(title))) return false;
			if (key) keys.add(key);
			if (title) titles.add(title);
			return true;
		});
	}

	title(r){ return String(r.title || r.question || r.card || "").replace(/\s+/g, " ").slice(0, 90); }

	paint_waiting(rows){
		this.$waiting.empty(() => {
			if (!rows) return void div.c("ad-none", "Servex did not answer, so the waiting count is not shown.");
			const by = {};
			rows.forEach(r => by[r.kind] = (by[r.kind] ?? 0) + 1);
			const kinds = Object.entries(by).map(([k, n]) => `${n} ${DashNeeds.KINDS[k] ?? k}${n > 1 && k !== "fyi" ? "s" : ""}`).join(" · ");
			a.c("ad-big").href("/framework/ai/inbox/").attr("target", "_self").attr("title", "The old Inbox lists them with the answer controls")
				.append(() => { span.c("ad-num", String(rows.length)); span.c("ad-what", "waiting on you"); });
			if (kinds) div.c("ad-sub", kinds);
			DashNeeds.unique(rows).slice(0, DashNeeds.TOP).forEach(r => a.c("ad-line").href(r.card ? CardDir.page(r.card) : "/framework/ai/inbox/").attr("target", "_self").append(() => { span.c("ad-kind", DashNeeds.KINDS[r.kind] ?? r.kind); span(this.title(r)); }));
		});
	}

	paint_merge(rows){
		this.$merge.empty(() => {
			if (!rows) return void div.c("ad-none", "Servex did not answer, so the ready-to-merge count is not shown.");
			a.c("ad-big").href("/framework/ai/merge/").attr("target", "_self").attr("title", "Each branch an agent marked ready, with a Merge button")
				.append(() => { span.c("ad-num", String(rows.length)); span.c("ad-what", rows.length === 1 ? "branch ready to merge" : "branches ready to merge"); });
			rows.slice(0, DashNeeds.TOP).forEach(r => a.c("ad-line").href("/framework/ai/merge/").attr("target", "_self").text(r.title || r.branch));
		});
	}
}
