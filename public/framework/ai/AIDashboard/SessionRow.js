import { View, div, span, a, button } from "/app.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { dur } from "/framework/ai/AITask/stats.js";
import SessionTree from "./SessionTree.js";

/** SessionRow — one session in the dashboard: a node of the SessionTree, with its children nested under it when open.
 *  Line 1: fold arrow, origin icon, live dot, name, cost (rolled up through its children).
 *  Line 2: when, how long, model, children and own cost. Phone-first: two short lines, nothing else. Doc: doc/ai-dashboard-plan.md */
export default class SessionRow extends View {
	static MAX_DEPTH = 3;
	static usd(n){ return n >= 100 ? "$" + Math.round(n) : n >= 1 ? "$" + n.toFixed(2) : n > 0 ? "$" + n.toFixed(3).replace(/0+$/, "") : "$0"; }

	// Getters, not fields: prerender() runs inside View's constructor, before a subclass's fields exist.
	get classes(){ return "ad-row ad-depth-" + Math.min(this.node.depth, SessionRow.MAX_DEPTH) + (this.node.live ? " ad-row-live" : ""); }

	render(){
		const { node: n, dash } = this, s = n.s, open = dash.q.open.has(s.id), kids = n.kids.length, origin = SessionTree.ORIGINS[n.origin];
		div.c("ad-row-main", () => {
			if (kids) button.c("ad-fold", open ? "▾" : "▸").attr("type", "button").attr("title", open ? "Hide " + kids + " below" : "Show " + kids + " below").on("click", () => dash.toggle(s.id));
			else span.c("ad-fold");
			span.c("ad-origin", origin.icon).attr("title", origin.label);
			span.c("ad-dot" + (n.live ? " ad-dot-live" : "")).attr("title", n.live ? "working now" : s.state);
			a.c("ad-name").href("/framework/ai/sessions/" + s.id + "/").text(s.title || s.agent || s.folder || s.id.slice(0, 8));
			span.c("ad-usd", SessionRow.usd(n.rolled)).attr("title", kids ? `own ${SessionRow.usd(n.own)}, with ${n.count - 1} below ${SessionRow.usd(n.rolled)}` : "cost");
		});
		const bits = [s.last_activity ? age(s.last_activity) : null, s.wall_ms ? dur(s.wall_ms) : null, s.model?.split(" · ")[0], s.agent && s.agent !== s.title ? s.agent : null,
			kids ? `${n.count - 1} below · own ${SessionRow.usd(n.own)}` : null].filter(Boolean);
		div.c("ad-row-sub", bits.join(" · "));
		if (kids && open) div.c("ad-kids", () => n.kids.forEach(k => new SessionRow({ node: k, dash })));
	}
}
