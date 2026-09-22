import { div, span, button, small, p } from "../../core/View/View.js";
import dropdown from "../../ext/Dropdown/dropdown.js";
import { clock } from "../../ext/AITask/stats.js";

/* Past sessions and minions — the parts of the chat tab that read `GET
 * /ai-logs/` (the index) and `GET /ai-logs/<id>/subagents/` (one session's
 * minions), both new routes (`Server/plugins/AILogs.js`). An OLD dev server
 * answers neither — 404, or the SPA fallback's index.html — and `json()`
 * below turns both into `null`, which every caller here reads as "not
 * available yet", never as an error to throw. */

/* ⚠ The SPA fallback answers an unknown path with index.html and a 200 — the
   content-type IS the 404, same guard as every other fetch in this repo. */
async function json(url) {
	return fetch(url)
		.then(res => res.ok && !(res.headers.get("content-type") ?? "").includes("html") ? res.json() : null)
		.catch(() => null);
}

/** Every session on disk, newest-modified first — `null` on an old server. */
export const session_index = () => json("/ai-logs/");

/** One session's minions — `null` on an old server, `[]` for a session with none. */
export const minions_of = id => json(`/ai-logs/${id}/subagents/`);

const day = iso => iso ? new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" }) : "—";

/**
 * The session picker — a dropdown of every past session, newest first, each
 * option labelled by its date and its own first prompt so the owner can find
 * "the one where I said X" without opening it. `on_pick(id | null)` fires
 * with `null` for "Live" (back to the current mastermind session).
 *
 * Returns `null`, drawing nothing, when the index route is not there (old
 * server) — the caller shows the plain-sentence degrade note instead.
 */
export function session_picker(rows, current, on_pick) {
	if (!rows) return null;

	const options = [
		{ value: "", label: "Live — the current session" },
		...rows.map(r => ({ value: r.id, label: `${day(r.modified)} — ${r.first_prompt || "(no prompt read)"}` })),
	];

	return dropdown({ options, value: current ?? "", title: "Read a different session",
		pick: value => on_pick(value || null) });
}

/**
 * One session's minions, as a list: what it was told (one line), what it
 * reported (one line). Read-only — clicking one opens its transcript;
 * there is no way to type to a minion from here, and the caller says so once,
 * above this list, not on every row.
 */
export function minions_list(rows, on_open) {
	if (!rows?.length) return p.c("dev-val off", "no minions for this session");

	return div.c("dev-chat-minions flex v", () => rows.forEach(r =>
		button.c("dev-chat-minion").attr("type", "button").on("click", () => on_open(r)).append(() => {
			div.c("dev-chat-minion-brief", r.first_prompt || "(no brief read)");
			div.c("dev-chat-minion-report muted", r.last_text || "(still running, or reported nothing)");
			small.c("dev-chat-minion-time muted", clock(r.started));
		})));
}

export default { session_index, minions_of, session_picker, minions_list };
