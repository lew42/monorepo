import { Page, div, a, p, span, small, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { watch_needs } from "/framework/ai2/needs.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { CardList } from "/framework/ai2/inbox.js";
import { row_view as session_row, merge as merge_sessions, get_json } from "../sessions/page.js";

View.stylesheet(import.meta, "dashboard.css");

/* THE DASHBOARD TAB — the owner's own words (owner-words.md): "/framework/ai's
 * default tab could show a grid-like dashboard that includes the inbox, but
 * also the log next to it, in a responsive way." Built as ONE Panel2 (Part 1):
 * its header is the full-width, minimal-height toolbar the owner asked for
 * ("a separate toolbar for the left and right side... that should be our
 * panel system"); its main is `.panel2-grid` holding five small tiles —
 * Stalled first (top priority), then In flight + queued, Inbox, Log, Sessions.
 *
 * EVERY TILE REUSES A REAL SOURCE (CLAUDE.md law 6) — see doc/decisions.md for
 * the table and why each one is the right source, not a guess:
 *   Inbox   → `watch_needs()` (ai2/needs.js) — the SAME ranked scan the real
 *             Inbox tab's score floor reads (`score_for()`).
 *   Log     → `CardList` (ai2/inbox.js) — the same card index the real Log
 *             tab's rail is built from, read directly instead of through the
 *             whole rail (which also builds a composer, flagging, live
 *             sockets — far more than a 5-row preview needs).
 *   Sessions→ `row_view()`/`merge()`, exported from `sessions/page.js` — the
 *             identical row the Sessions tab itself draws.
 *   Stalled / In flight → `tasks.json`, a file a sibling task
 *             (`stalled-and-budgets`) owns and writes; read defensively since
 *             it may not exist yet, and polled the same way as every other
 *             tile once it does.
 */

const TASKS_URL = "/framework/ai/tasks.json";
const SESSIONS_URL = "/framework/ai/sessions/";
const INBOX_URL = "/framework/ai/inbox/";
const POLL_MS = 20000;

function progress_bar(spent, budget){
	if (typeof budget !== "number" || budget <= 0)
		return div.c("dash-bar dash-bar-indeterminate").attr("title", "no budget set");
	const pct = Math.max(0, Math.min(100, Math.round(((spent ?? 0) / budget) * 100)));
	return div.c("dash-bar").attr("title", `$${(spent ?? 0).toFixed(2)} of $${budget.toFixed(2)}`)
		.append(() => div.c("dash-bar-fill").style("width", pct + "%"));
}

function task_row(t){
	const href = t.card ? "/framework/ai2/" + t.card + "/" : t.dir ? "/framework/ai/" + t.dir + "/" : null;
	const inner = () => {
		div.c("flex gap-50 v-center", () => {
			span.c("dash-task-title", t.title || t.dir || "Untitled task");
			if (t.agent) small.c("muted", t.agent);
		});
		if (t.why) small.c("muted dash-task-why", t.why);
		progress_bar(t.spent, t.budget);
	};
	return href ? a.c("dash-task-row").href(href).append(inner) : div.c("dash-task-row", inner);
}

function empty_tile(text){ return () => p.c("muted dash-empty", text); }

async function load_tasks(){
	const data = await get_json(TASKS_URL);
	return Array.isArray(data) ? data : Array.isArray(data?.tasks) ? data.tasks : null;
}

// Stalled and In-flight are two filtered views of the SAME file, polled on
// one shared timer (not two separate fetches racing each other every 20s).
// `on_tasks(fn)` calls `fn(tasks)` now and every refresh; returns a stop.
function task_poller(){
	const readers = new Set();
	let tasks = null, live = true;
	const tick = async () => {
		if (!live) return;
		if (!document.hidden){ tasks = await load_tasks(); readers.forEach(fn => fn(tasks)); }
		if (live) setTimeout(tick, POLL_MS);
	};
	tick();
	return {
		on_tasks(fn){ readers.add(fn); if (tasks !== undefined) fn(tasks); return () => readers.delete(fn); },
		stop(){ live = false; },
	};
}

function tasks_tile(title, filter, poller){
	const panel = new Panel2({ title });
	const stop = poller.on_tasks(tasks => {
		panel.main.empty(() => {
			if (tasks === null) return void empty_tile("No data yet — tasks.json hasn't been written.")();
			const rows = tasks.filter(filter);
			if (!rows.length) return void empty_tile("Nothing here right now.")();
			rows.forEach(t => panel.main.append(() => task_row(t)));
		});
	});
	return { panel, stop };
}

// Live — `watch_needs()` is the SAME shared scan the Inbox tab's score floor
// reads, already sorted highest-importance first. `on_ids` is told the top 5
// card ids every time they change, so the Log tile can exclude them.
function inbox_tile(on_ids){
	const panel = new Panel2({ title: "Inbox" });
	// ⚠ `/framework/ai/inbox/`, the real Inbox TAB, a sibling of this page —
	// not `this.url + "inbox/"`, which would read `/framework/ai/dashboard/
	// inbox/` and 404 (merge.mjs's own smoke test caught this live, 2026-10-02).
	panel.header.append(() => a.c("page-link", "See all").href(INBOX_URL));
	const stop = watch_needs(state => {
		const top = state.rows.slice(0, 5);
		on_ids(new Set(top.map(r => r.card).filter(Boolean)));
		panel.main.empty(() => {
			if (!top.length) return void empty_tile("Nothing needs you right now.")();
			top.forEach(r => a.c("dash-need-row").href(r.url).append(() => {
				span(r.title || r.question || "Untitled");
				small.c("muted", r.at ? age(r.at) : "");
			}));
		});
	});
	return { panel, stop };
}

// A plain, 5-row preview of the card index the real Log tab's rail is built
// from (`CardList`, ai2/inbox.js) — NOT the whole rail (composer, flagging,
// live sockets): a dashboard tile needs the rows, not the editing chrome.
// `get_excluded()` reads the Inbox tile's current top-5 ids at draw time, so
// "no duplicates" stays true as the Inbox tile's own ranking changes.
function log_tile(get_excluded){
	const panel = new Panel2({ title: "Log" });
	panel.header.append(() => a.c("page-link", "See all").href("/framework/ai/all-tasks/"));
	const list = new CardList();
	const draw = () => panel.main.empty(() => {
		if (!list.ok) return void empty_tile("Servex is not answering, so there is no log to show.")();
		const excluded = get_excluded();
		const rows = [...list.cards].filter(c => !excluded.has(c.id))
			.sort((a, b) => Date.parse(b.last ?? b.created ?? 0) - Date.parse(a.last ?? a.created ?? 0))
			.slice(0, 5);
		if (!rows.length) return void empty_tile("Nothing logged yet.")();
		rows.forEach(c => a.c("dash-task-row").href("/framework/ai2/" + c.id + "/").append(() => {
			div.c("flex gap-50 v-center", () => {
				span.c("dash-task-title", c.title || c.id);
				if (c.status) small.c("muted", c.status);
			});
			small.c("muted", age(c.last ?? c.created));
		}));
	});
	const stop = list.on(draw);
	list.start();
	return { panel, stop, redraw: draw };
}

// Live-ish — the same row the Sessions tab draws (`sessions/page.js`), top 5,
// re-polled on the same cadence. Returns a teardown, same shape as the other tiles.
function sessions_tile(){
	const panel = new Panel2({ title: "Sessions" });
	panel.header.append(() => a.c("page-link", "See all").href(SESSIONS_URL));
	const $list = div.c("dash-sessions-tile");
	panel.main.append($list);

	let snapshot_rows = [], live = true;
	const draw = agents => $list.empty(() => {
		const rows = merge_sessions(snapshot_rows, agents).slice(0, 5);
		if (!rows.length) return void empty_tile("No sessions with an id yet.")();
		rows.forEach(r => session_row(r, SESSIONS_URL));
	});
	const poll = async () => {
		if (!live) return;
		if (!document.hidden) draw((await get_json("/api/agents")) ?? []);
		if (live) setTimeout(poll, POLL_MS);
	};
	get_json(SESSIONS_URL + "sessions.json").then(snap => {
		snapshot_rows = snap?.rows ?? [];
		if (live) poll();
	});

	return { panel, stop: () => { live = false; } };
}

export default new Page({
	meta: import.meta,
	// ⚠ Blank on purpose: the Panel2 header right below already shows this
	// page's name as its own toolbar title (review finding, 2026-10-02 —
	// "Dashboard" said twice, the page's own h1 and the panel's). `tab_page()`
	// (overview.js) does the identical thing for a virtual tab on its own url;
	// the tab strip's own label comes from the folder name, not this field,
	// so blanking it changes nothing there.
	title: "",
	description: "A grid of live previews: what's stalled, what's running, the top of the inbox and the log, and every session.",
	icon: "dashboard",

	// `{"settings":{"tab":true,"weight":0}}` lives in settings.jsonl beside this
	// file — weight 0 sits it right after Inbox (which is always first,
	// hardcoded) and before Log (weight 1): the owner's own ask was for ONE
	// dashboard that already includes the inbox and the log, so the page that
	// shows both at a glance belongs closer to the front than either one on
	// its own (doc/decisions.md).

	content(){
		// ⚠ `wide`: a plain page's own track is the narrow prose column — a
		// grid of tiles left on it measured one column wide at 1920px,
		// regardless of `.panel2-grid`'s own `--column` (doc/decisions.md has
		// the exact numbers). `wide` is main + breakout, grows rightward.
		const shell = new Panel2({ title: "Dashboard" }).ac("wide");
		shell.header.append(() => small.c("muted", "stalled first — it's the one thing waiting on you"));

		this.$grid = div.c("grid auto gap panel2-grid dashboard-tiles");
		shell.main.append(this.$grid);
	},

	// ⚠ One synchronous `.empty(fn)` call builds every tile — nothing here is
	// a bare factory call floating after an `await` (`code` skill: "capturing
	// is synchronous"). Each tile function's own polling starts inside this
	// same synchronous pass and is torn down in `deactivated()`.
	activated(){
		this.stops = [];
		this.$grid.empty(() => {
			const poller = task_poller();
			this.stops.push(poller.stop);

			const stalled = tasks_tile("Stalled", t => t.state === "stalled", poller);
			this.stops.push(stalled.stop);

			const inflight = tasks_tile("In flight + queued", t => t.state === "building", poller);
			this.stops.push(inflight.stop);

			// Inbox before Log: both in that order visually (the brief's own
			// tile order). ⚠ `watch_needs()` inside `inbox_tile()` calls its
			// callback SYNCHRONOUSLY, before this line even returns, so a
			// plain `const log` referenced from inside that callback would
			// throw (read before initialization) on its very first call —
			// `redraw_log` is a mutable placeholder for exactly that reason.
			let need_ids = new Set(), redraw_log = () => {};
			const inbox = inbox_tile(ids => { need_ids = ids; redraw_log(); });
			const log = log_tile(() => need_ids);
			redraw_log = log.redraw;
			this.stops.push(inbox.stop, log.stop);

			const sess = sessions_tile();
			this.stops.push(sess.stop);
		});
	},

	deactivated(){ this.stops?.forEach(stop => stop()); this.stops = []; },
});
