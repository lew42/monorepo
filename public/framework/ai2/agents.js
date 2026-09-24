import { div, span, small, button } from "/app.js";
import { servex_base } from "./inbox.js";

/**
 * THE CARD'S AGENTS: one row for each agent working on this card (its assistant
 * and its manager) — its id, its state, and how full its context window is.
 * Compact and Recycle are the two ways to make room.
 *
 * Servex answers `GET /api/card-agents?card=<id>`. This asks NOTHING until Servex
 * says it has the route: a Servex running the code appends `{"card-agents": 1}` to
 * its `features` log at boot (the way `cards_ready` reads `{"cards": 1}`). An older
 * Servex has no CORS answer for the route, and the browser would log an error.
 * The rows refresh every 10 seconds, and stop by themselves when the card's
 * page is redrawn or closed.
 */
const short = n => (n >= 1000 ? Math.round(n / 1000) + "k" : String(n ?? 0));
const url = (path) => servex_base() + path;

const ACTIONS = [
	["compact", "Compact", "The agent writes a summary of its work into the card, then restarts from that summary."],
	["recycle", "Recycle", "The agent restarts fresh, reading only the card's log."],
];

let ready = null;
const has_route = () => ready ??= fetch(url("/log/features?n=50"))
	.then(r => (r.ok ? r.json() : []))
	.then(list => Array.isArray(list) && list.some(e => e?.["card-agents"]))
	.catch(() => false);

export default function agents_panel(card_id){
	const $box = div.c("ai2-agents");
	const path = "/api/card-agents?card=" + encodeURIComponent(card_id);

	// `$box` is captured now, synchronously: after an await the "current box" is gone.
	const paint = list => $box.empty(() => {
		list.forEach(a => {
			div.c("ai2-agent flex v-center wrap gap-25", () => {
				span.c("ai2-agent-id").text(a.id);
				span.c("ai2-chip").text(a.state ?? "?");
				const pct = a.pct == null ? null : Math.max(0, Math.min(100, a.pct));
				div.c("ai2-agent-bar", () => {
					div.c("ai2-agent-fill" + (pct >= 80 ? " hot" : "")).attr("style", "width:" + (pct ?? 0) + "%");
				});
				small.c("muted").text(`${short(a.context)} tokens · ${pct == null ? "?" : pct}% of ${short(a.window)}`);
				ACTIONS.forEach(([verb, label, title]) => {
					button.c("ai2-word").attr("type", "button").attr("title", title).text(label)
						.click(() => fetch(url(`/api/agent/${encodeURIComponent(a.id)}/${verb}`), { method: "POST" })
							.catch(() => null).then(refresh));
				});
			});
		});
	});

	function refresh(){
		if (!$box.el.isConnected && refresh.seen) return clearInterval(refresh.timer);
		return fetch(url(path))
			.then(r => (r.ok && (r.headers.get("content-type") ?? "").includes("json") ? r.json() : null))
			.catch(() => null)
			.then(list => { if (Array.isArray(list)) paint(list); });
	}
	// Give the box one tick to land in the page before "not connected" means "gone".
	has_route().then(ok => {
		if (!ok) return;
		refresh.timer = setInterval(refresh, 10000);
		refresh().then(() => { refresh.seen = true; });
	});
	return $box;
}
