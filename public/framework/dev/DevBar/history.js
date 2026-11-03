import { div, span, button, small, p, label, input } from "../../core/View/View.js";
import Socket from "../Socket/Socket.js";
import session_log from "./log.js";
import { session_index, minions_of, minions_list } from "./sessions.js";

/**
 * history(app) — the dev bar's `sessions` tab: HISTORY only. The live
 * conversation moved to "the mastermind log" (`says.js`, now the first
 * section of the default `page` tab) once the owner pointed out the old
 * `chat` tab and the page-tab log "look like the same thing" — this tab is
 * what is left once the live view is gone: every past session, newest
 * first, and a session's own minions underneath once you open it.
 *
 * A session is HIDDEN by default when it reads as a test/headless run
 * rather than a real conversation with the owner — `is_test_run()` below —
 * because the owner's own complaint was a dropdown "listing many sessions
 * all dated September 19th" that "gives no useful information" ("one
 * session's text is 'Reply with just the word one'"). The "show test runs"
 * checkbox is the escape hatch for whatever this heuristic still misses.
 *
 * Reuses `chat.js`'s own former look throughout (`.dev-chat-*` — a session
 * row is shaped exactly like a minion row already was) rather than
 * inventing a parallel set of classes for the same two things: a clickable
 * card with a title line and a muted line under it. `log.js` (one
 * transcript as a scrolling log of compact cards) and `sessions.js` (the
 * `/ai-logs/` data layer, the minions list UI) are shared with whatever
 * else reads a session's own file — this file is only the LIST and the
 * "which one am I reading" wiring around them.
 */
export default function history(app) {
	const socket = Socket.singleton();
	// Off localhost there is no dev server to read a transcript from — the
	// same rule the mastermind log (`says.js`) and `ask.js`'s "ai" tab follow.
	if (socket.disabled) return;

	let rows = null;      // GET /ai-logs/ rows, newest first, or null on an old server
	let show_tests = false;
	let viewing = null;   // the session id `$minions_row` is currently fetching for

	let $toggle_row, $list, $back_row, $log, $minions_row;

	const $view = div.c("dev-chat flex v", () => {
		$toggle_row = div.c("dev-hist-toggle-row");
		$back_row = div.c("dev-chat-back-row flex v-center gap");
		$back_row.el.hidden = true;

		$list = div.c("dev-chat-list flex v");
		$log = session_log({ live: false });
		$log.el.hidden = true;
		$minions_row = div.c("dev-chat-minions-row");
	});

	boot();
	return $view;

	async function boot() {
		rows = await session_index();
		draw_toggle();
		draw_list();
	}

	/* ── the list ──────────────────────────────────────────────────────── */

	function draw_toggle() {
		$toggle_row.empty(() => {
			if (!rows?.some(is_test_run)) return;   // nothing this heuristic would hide — no reason to offer the switch
			label.c("dev-knob", () => {
				input().attr("type", "checkbox")
					.on("change", function () { show_tests = this.el.checked; draw_list(); });
				span("show test runs");
			});
		});
	}

	function draw_list() {
		$list.empty(() => {
			if (!rows) return $list.append(() => p.c("dev-val off",
				"restart the dev server once to read past sessions here."));
			const shown = rows.filter(r => show_tests || !is_test_run(r));
			if (!shown.length) {
				p.c("dev-val off", rows.length ? "every session here reads as a test run — \"show test runs\" above." : "no sessions yet");
				return;
			}
			shown.forEach(session_row);
		});
	}

	// The same face `sessions.js`'s own `minions_list()` draws for a minion
	// row — a title line, a muted line under it — a session and a minion are
	// both "one thing that was said to Claude, and what came of it".
	function session_row(r) {
		button.c("dev-chat-minion").attr("type", "button")
			.click(() => open_session(r.id))
			.append(() => {
				div.c("dev-chat-minion-brief", r.first_prompt || "(no prompt read)");
				div.c("flex v-center gap", () => {
					small.c("muted", full_stamp(r.started ?? r.modified));
					if (r.subagents) small.c("muted", `${r.subagents} minion${r.subagents === 1 ? "" : "s"}`);
				});
			});
	}

	/* ── reading one session, or one of its minions ───────────────────────
	   The list (and its toggle) and the reader share this one box — the
	   list hides rather than being torn down and rebuilt, so returning to
	   it costs nothing and its own scroll position is never lost. */

	function open_session(id) {
		viewing = id;
		show_reader();
		$back_row.empty(() => button.c("dev-chat-linkback").attr("type", "button")
			.append(() => { span("‹"); span("back to sessions"); })
			.on("click", show_list_view));
		$log.resync(`/ai-logs/${id}`);
		draw_minions(id);
	}

	function open_minion(session_id, row) {
		show_reader();
		$back_row.empty(() => {
			button.c("dev-chat-linkback").attr("type", "button")
				.append(() => { span("‹"); span("back to the session"); })
				.on("click", () => open_session(session_id));
			span.c("muted", "reading a minion — read-only.");
		});
		$log.resync(`/ai-logs/${session_id}/subagents/${row.file}`, { is_agent: true });
	}

	function show_list_view() {
		$back_row.el.hidden = true;
		$toggle_row.el.hidden = false;
		$list.el.hidden = false;
		$log.el.hidden = true;
		$minions_row.empty();
	}

	function show_reader() {
		$back_row.el.hidden = false;
		$toggle_row.el.hidden = true;
		$list.el.hidden = true;
		$log.el.hidden = false;
	}

	async function draw_minions(id) {
		$minions_row.empty();
		const rows2 = await minions_of(id);
		if (viewing !== id) return;   // the owner picked something else while this was in flight
		$minions_row.empty(() => {
			if (!rows2?.length) return;
			div.c("dev-chat-minions-head muted", `${rows2.length} minion${rows2.length === 1 ? "" : "s"} — read-only`);
			minions_list(rows2, row => open_minion(id, row));
		});
	}
}

/* No "did it call a tool" signal exists in the session index yet
   (`Server/plugins/AILogs.js`'s own `summarize_session()` counts prompts,
   not tool calls) — approximated with what IS there: a short first prompt
   (a real question or brief reads longer than this in practice), or a
   session that never got past its own first turn. This will not catch
   every test run — the "show test runs" checkbox above is the escape
   hatch for whatever it misses; a real tool-call count in the index, the
   day someone needs one, is a one-line addition to that same streaming
   pass, not a rewrite of this. */
function is_test_run(row) {
	const words = (row.first_prompt || "").trim();
	return words.length < 40 || (row.prompts ?? 0) <= 1;
}

function full_stamp(iso) {
	if (!iso) return "—";
	return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export { history };
