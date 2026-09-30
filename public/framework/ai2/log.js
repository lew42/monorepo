import { div, a, span, small } from "/app.js";
import { when } from "./faces.js";
import { task_words } from "./groups.js";

/**
 * THE LOG TAB — everything in flight, one row per TASK (the owner, 2026-09-30, verbatim in
 * `ai/2026-09-30/page-audit/owner-words.md`): "anything that's being worked on should show up
 * in there... each card in on the log should have a status like dot green if it's like done...
 * and the yellow flashing is sort of like in progress... we definitely don't want heartbeats or
 * just kind of like, even minions that are part of a bigger task probably shouldn't appear as
 * their own log item."
 *
 * ONE ROW PER TASK, NEVER PER MINION — not a filter here, a fact of the data this reads:
 * `root.ai2.on_tasks(fn)` (`page.js`) hands back `groups.tasks`, which is already one `Member`
 * per TASK FOLDER (`groups.js`'s own `read_tasks()` — one `Member` per `ai/<date>/<slug>/`, no
 * matter how many agents (a mastermind, its minions) worked inside that one folder). A
 * heartbeat ping or a task-loop chase never becomes its own task folder, so it never becomes a
 * row here either — the same reason it never floods "Needs you" (`needs-rule.js`).
 *
 * SAME ROW, SAME CSS AS THE INBOX (the owner: "the same layout, the same CSS") — this draws the
 * exact classes `faces.js`'s `row()` draws for a rail card (`.ai2-row-head`, `.ai2-row-title`,
 * `.ai2-row-when`), with one thing added: the status dot.
 */

/** green ("done") · yellow, flashing ("progress") · red ("failed" — stalled or abandoned) —
 *  read off the SAME `task.jsonl` fields every other AI 2 view already reads, nothing new
 *  fetched. `m.logs` is `TaskJSONL`'s own array of every `{"log": {...}}` line replayed
 *  (`ext/JSONL/JSONL.js`) — a task-loop chase writes `{"log":{"chase":"escalated"}}`
 *  (`Servex/TaskLoop.js`) and the heartbeat writes `{"log":{"heartbeat":"escalated"}}`
 *  (`Servex/Heartbeat.js`) when it could not fix a stalled task on its own; either one, with no
 *  landing since, is "failed" here — closed by the owner with no landing reads the same way. */
export function task_status(m){
	if (m.landed_at && m.outcome) return "done";
	const escalated = (m.logs ?? []).some(l => l?.chase === "escalated" || l?.heartbeat === "escalated");
	if (escalated || (m.closed_by && !m.landed_at)) return "failed";
	return "progress";
}

const STATUS_LABEL = { progress: "in progress", done: "done", failed: "stalled — Servex could not fix it; take a look" };

function status_dot(status){
	span.c("ai2-status-dot ai2-status-" + status).attr("title", STATUS_LABEL[status] ?? status);
}

function log_row(m){
	const status = task_status(m), words = task_words(m);
	const base = `/framework/ai2/${m.date}/${m.slug}/`;
	a.c("ai2-row ai2-log-row").href(base).append(() => {
		div.c("ai2-row-head flex gap-25", () => {
			status_dot(status);
			span.c("ai2-row-title").text(words.title);
			small.c("ai2-row-when muted").text(when(m.last_at));
		});
		if (words.words) small.c("ai2-log-line muted").text(words.words);
	});
}

/** THE WHOLE TAB. `on_tasks` is `root.ai2.on_tasks` (page.js) — called once now, with whatever
 *  is already known, and again on every change. ONE THING NEVER JUMPS OUT FROM UNDER YOU: like
 *  the rail (page.js `order_rows()`), a change that would only REORDER rows already on screen
 *  is held behind a small "N updated ↑" pill instead of applied straight away; a brand new or
 *  removed row still redraws at once, because there is no existing position for those to jump
 *  out of. Tap the pill, or reload, to actually re-sort. */
export function log_view(on_tasks){
	let $pill, $rows, order = [], pending = 0;
	const $root = div.c("ai2-log-list", () => {
		$pill = span.c("ai2-updated ai2-log-updated").attr("hidden", "").attr("role", "button").attr("tabindex", "0");
		$rows = div.c("ai2-log-rows");
	});
	$pill.click(() => draw(latest, true));
	$pill.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); draw(latest, true); } });

	let latest = [];
	function draw(list, force){
		latest = list;
		const sorted = [...list].sort((a, b) => Date.parse(b.last_at ?? 0) - Date.parse(a.last_at ?? 0));
		const want = sorted.map(m => m.date + "/" + m.slug);
		const same_set = want.length === order.length && want.every(id => order.includes(id));
		const same_order = want.length === order.length && want.every((id, i) => id === order[i]);

		if (!force && order.length && same_set && !same_order){
			pending = want.filter((id, i) => id !== order[i]).length;
			$pill.el.hidden = !pending;
			if (pending) $pill.text(pending + (pending === 1 ? " updated ↑" : " updated ↑"));
			return;   // the set on screen is still right; only the ORDER would move — wait for a tap
		}

		order = want;
		pending = 0;
		$pill.el.hidden = true;
		$rows.empty(() => {
			if (!sorted.length) return void small.c("muted").text("Nothing in flight.");
			sorted.forEach(log_row);
		});
	}

	on_tasks(list => draw(list));
	return $root;
}

export default log_view;
