/**
 * live.js — the ONE place this doc page reads real, running agents from.
 *
 * Servex (Servex/Servex.js) answers two read-only, CORS-open routes for any
 * page to fetch, no matter what url that page is served from:
 *   GET /api/agents         every agent this Servex process is holding right
 *                            now — id, role, model, state, session_id,
 *                            parent, turns, cost (Servex/agents/Agents.js,
 *                            Agent.card()).
 *   GET /api/card-agents?card=<id>   one card's own two agents (its fast
 *                            assistant and its manager) — see doc/where.md.
 *
 * FAIL SOFT, always. Servex is a dev-only convenience (CLAUDE.md: "no server
 * at runtime" in production) — a reader with it closed, or off the dev
 * machine, must see one plain line, never a console error or a failed
 * network request. `fetch_json` never throws; every caller gets `null` and
 * decides what "nothing yet" looks like.
 */
const BASE = () => new URLSearchParams(location.search).get("servex") || "http://127.0.0.1:8090";

async function fetch_json(path){
	try {
		const res = await fetch(BASE() + path, { signal: AbortSignal.timeout(4000) });
		if (!res.ok) return null;
		return await res.json();
	} catch { return null; }
}

/** Every agent Servex is holding, or `null` when Servex cannot be reached. */
export const agents = () => fetch_json("/api/agents");

/** One card's assistant + manager rows, or `null`. */
export const card_agents = card => fetch_json("/api/card-agents?card=" + encodeURIComponent(card));
