import { div, span, small, button } from "/app.js";
import { servex_base, servex_fetch } from "./inbox.js";

/**
 * THE CARD'S AGENTS: one row for each agent working on this card (its assistant
 * and its manager) — its id, its state, and how full its context window is.
 * Compact and Recycle are the two ways to make room.
 *
 * Servex answers `GET /api/card-agents?card=<id>`. This asks NOTHING until Servex
 * says it has the route: a Servex running the code appends `{"card_agents": 1}` to
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
const has_route = () => ready ??= servex_fetch(url("/log/features?n=50"))
	.then(r => (r.ok ? r.json() : []))
	.then(list => Array.isArray(list) && list.some(e => e?.card_agents))
	.catch(() => false);

export default function agents_panel(card_id){
	const $box = div.c("ai2-agents");
	const path = "/api/card-agents?card=" + encodeURIComponent(card_id);

	// `$box` is captured now, synchronously: after an await the "current box" is gone.
	let drawn;
	const paint = list => { const sig = JSON.stringify(list); if (sig === drawn) return; drawn = sig; draw(list); };
	const draw = list => $box.empty(() => {
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
						.click(() => servex_fetch(url(`/api/agent/${encodeURIComponent(a.id)}/${verb}`), { method: "POST" })
							.catch(() => null).then(refresh));
				});
			});
		});
	});

	function refresh(){
		if (!$box.el.isConnected && refresh.seen) return clearInterval(refresh.timer);
		return servex_fetch(url(path))
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

/* WHAT A CARD'S AGENTS COST — the sum of `cost` over `/api/card-agents` (every
   message sent from the card to its assistant and its manager, through the
   SDK; the same agent turns also count inside a master session, and that
   double count is wanted). `null` until Servex answers with a `cost` field:
   an older Servex sends none. Fetched one card at a time, cached 30 s. */
const costs = new Map();
let queue = Promise.resolve();

/* ONE list for every card: the rail asks agent_cost() for each of ~390 cards, and
   each ask used to fetch the whole /api/agents list — 398 identical fetches, 3.6 MB,
   on one card page load (measured 09-29). Shared, and refetched at most every 30 s. */
let agents_list = null;
const all_agents = () => {
	if (agents_list && Date.now() - agents_list.at < 30000) return agents_list.list;
	const list = servex_fetch(url("/api/agents"))
		.then(r => r.ok && (r.headers.get("content-type") ?? "").includes("json") ? r.json() : [])
		.catch(() => []);
	agents_list = { at: Date.now(), list };
	return list;
};

export function agent_cost(card_id, then){
	const hit = costs.get(card_id);
	if (hit && Date.now() - hit.at < 30000) return hit.usd;
	if (!hit?.busy){
		costs.set(card_id, { ...hit, busy: true, at: hit?.at ?? 0 });
		queue = queue.then(async () => {
			let usd = null;
			try {
				// The number: `cost` on Servex's `/api/agents` records for this card's assistant and manager, found by name (`assistant-<slug>`, `manager-<slug>`).
				const list = await all_agents();
				const slug = card_id.split("/").pop();
				const mine = Array.isArray(list) ? list.filter(a => (a.id === "assistant-" + slug || a.id === "manager-" + slug) && typeof a.cost === "number") : [];
				const spent = mine.reduce((n, a) => n + a.cost, 0);
				if (spent > 0) usd = spent;
			} catch {}
			const changed = usd !== hit?.usd;
			costs.set(card_id, { usd, at: Date.now() });
			if (changed) then?.();
		});
	}
	return hit?.usd ?? null;
}
