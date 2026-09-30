/* stalled(ask, owner_row, now) — ONE pure function, no fs, no clock read: the
 * caller (Asks.js's tick) hands in `now` so a test can fix it.
 *
 * THE RULE. An ask whose status is already `landed` or `dropped` is never
 * stalled — it's closed, nothing to notice. Any other ask (routed, building,
 * already stalled) IS stalled when its owner agent:
 *
 *   - is `stopped` or `gone` (the registry's own words for a dead session), or
 *   - has NO registry row at all — never registered, or the registry lost it
 *     (treated the same as gone: nobody is going to answer for this ask), or
 *   - is `dormant` with nothing queued to wake it (a dormant agent with a
 *     message already waiting is about to speak — not stalled), or
 *   - has gone SILENT for more than 2 hours: no turn (`last_at`) and no new
 *     line in its own task.jsonl (`last_task_line_at`) more recent than that.
 *
 * `owner_row` is assembled by the caller, not read here: the agent's registry
 * row (`list_agents`'s own shape — `state`, `last_at`, …), plus
 * `last_task_line_at` (the owner's task dir's last task.jsonl line) and
 * `queued` (how many messages are waiting for it). `owner_row` is `null`/
 * falsy when the agent never registered. */

const SILENT_MS = 2 * 60 * 60 * 1000;   // 2 hours

export function stalled(ask, owner_row, now){
	const at = now instanceof Date ? now.getTime() : Number(now);
	const status = ask?.status;
	if (status === "landed" || status === "dropped") return { stalled: false, why: "closed" };

	if (!owner_row) return { stalled: true, why: `no registry row for owner "${ask?.owner ?? "?"}"` };

	if (owner_row.state === "stopped") return { stalled: true, why: "owner agent stopped" };
	if (owner_row.state === "gone") return { stalled: true, why: "owner agent gone (its host process died)" };
	// dormant is judged on its own — never falls through to the silence check below, so a
	// dormant agent with nothing queued yet but a recent `last_at` is still correctly stalled,
	// and one with something queued is never wrongly stalled just for lacking a `last_at`.
	if (owner_row.state === "dormant")
		return owner_row.queued > 0
			? { stalled: false, why: "owner agent dormant, something queued to wake it" }
			: { stalled: true, why: "owner agent dormant, nothing queued to wake it" };

	const seen = [owner_row.last_at, owner_row.last_task_line_at]
		.map(t => (t ? Date.parse(t) : NaN))
		.filter(Number.isFinite);
	const last_seen = seen.length ? Math.max(...seen) : NaN;
	if (!Number.isFinite(last_seen)) return { stalled: true, why: "owner agent has never been seen (no turn, no task line)" };

	const silent_ms = at - last_seen;
	if (silent_ms > SILENT_MS) return { stalled: true, why: `owner agent silent ${Math.round(silent_ms / 60000)} min` };

	return { stalled: false, why: "owner agent active" };
}

stalled.SILENT_MS = SILENT_MS;
