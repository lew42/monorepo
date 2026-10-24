import { View, div, span, a, button } from "/app.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { dur } from "/framework/ai/AITask/stats.js";
import SessionTree from "./SessionTree.js";
import Review from "./Review.js";

/** SessionRow — one session in the dashboard: a node of the SessionTree, with its children nested under it when open.
 *  Line 1: fold arrow, state dot, plain title, cost (rolled up through its children), Approve.
 *  Line 2: state, when, how long, model, the slug (agent or folder) small, children and own cost. Doc: readme.md */
export default class SessionRow extends View {
	static MAX_DEPTH = 3;
	static ROLES = /^(mastermind|minion|reviewer|clarity|checker|voter|fixer|assistant|master-assistant)-/;
	static usd(n){ return n >= 100 ? "$" + Math.round(n) : n > 0 ? "$" + n.toFixed(2) : "$0"; }

	/** The name a person reads: the record's title, else the agent name made into words ("minion-review-page" -> "Review page"). */
	static title(s){
		if (s.title) return s.title;
		const words = (s.agent ?? "").replace(SessionRow.ROLES, "").replace(/[-_]+/g, " ").trim();
		return words ? words[0].toUpperCase() + words.slice(1) : s.folder ?? s.id.slice(0, 8);
	}
	/** The slug, shown small beside the title: the agent name, else the folder. */
	static slug(s){ return s.agent ?? (s.folder !== s.id ? s.folder : null); }

	// Getters, not fields: prerender() runs inside View's constructor, before a subclass's fields exist.
	get classes(){ return "ad-row ad-depth-" + Math.min(this.node.depth, SessionRow.MAX_DEPTH) + " ad-is-" + (this.node.state ?? "waiting"); }

	render(){
		const { node: n, dash } = this, s = n.s, open = dash.q.open.has(s.id), kids = n.kids.length, origin = SessionTree.ORIGINS[n.origin], st = Review.STATES[n.state] ?? Review.STATES.waiting;
		div.c("ad-row-main", () => {
			if (kids) button.c("ad-fold", open ? "▾" : "▸").attr("type", "button").attr("title", open ? "Hide " + kids + " below" : "Show " + kids + " below").on("click", () => dash.toggle(s.id));
			else span.c("ad-fold");
			span.c("ad-dot").attr("title", st.hint);
			a.c("ad-name").href("/framework/ai/sessions/" + s.id + "/").attr("title", origin.label + " · " + (s.title ?? "")).text(SessionRow.title(s));
			span.c("ad-usd", SessionRow.usd(n.rolled)).attr("title", kids ? `own ${SessionRow.usd(n.own)}, with ${n.count - 1} below ${SessionRow.usd(n.rolled)}` : "cost");
			if (!n.approved) button.c("ad-approve", "Approve").attr("type", "button").attr("title", kids ? `Approve this session and the ${n.count - 1} below it` : "Approve this session").on("click", e => { e.target.disabled = true; dash.approve([n]); });
		});
		div.c("ad-row-sub", () => {
			span.c("ad-state", n.by_parent ? "approved with its parent" : st.label).attr("title", st.hint);
			const bits = [s.last_activity ? age(s.last_activity) : null, s.wall_ms ? dur(s.wall_ms) : null, s.model?.split(" · ")[0], kids ? `${n.count - 1} below · own ${SessionRow.usd(n.own)}` : null].filter(Boolean);
			if (bits.length) span(" · " + bits.join(" · "));
			const slug = SessionRow.slug(s);
			if (slug && slug !== SessionRow.title(s)) span.c("ad-slug", slug);
		});
		if (kids && open) div.c("ad-kids", () => n.kids.forEach(k => new SessionRow({ node: k, dash })));
	}
}
