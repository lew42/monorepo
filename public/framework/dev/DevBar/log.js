import { div, span, button, small, p } from "../../core/View/View.js";
import md from "../../ext/markdown/md.js";
import { clock } from "../../ext/AITask/stats.js";

/**
 * session_log({ url, live }) — one Claude transcript (a live session, a past
 * one, or a minion's own) read as a SCROLLABLE LOG OF COMPACT CARDS.
 *
 * Each card is one thing said — the owner's own words, or Claude's prose reply
 * — one line, a role and a local time. Click a card and it EXPANDS TO FILL
 * THE WHOLE BOX (the caller's box, which in `chat.js` is the whole dev bar
 * body) with the full text; a back button returns to the list, which is still
 * there, still scrolled where it was, because reading never rebuilds it.
 *
 * This is a SIBLING of `ext/AITask/conversation.js`, not a fork of it: the
 * owner asked for the dev bar's chat to read as a scrolling log of compact
 * cards you open one at a time (2026-09-19), where `conversation.js` reads as
 * one continuous stream of bubbles with tool noise folded inline — a genuinely
 * different shape, not a smaller version of the same one. What IS the same,
 * on purpose, because there is no reason for it to differ: the data source
 * (`/ai-logs/<id>`, `Range` tail polling) and the tolerant JSONL parsing.
 * Tool calls are left out of the log entirely here — a card exists only for a
 * real prompt or a real sentence Claude said, which is what keeps the log
 * short enough to scan (`code`#8, `doc/decisions.md`).
 *
 * `url` may be empty (no session known yet — the caller redraws once it is).
 * `live`: keep polling the tail for new lines; off for a past session or a
 * minion transcript, which never grow again.
 */
export function session_log({ url, live = false, agent = false } = {}) {
	const state = { bytes: 0, tail: "", lines: [], seen: 0, cards: 0 };
	let $wrap, $list, $reader, stick = true, stop = false;

	$wrap = div.c("dev-chat-logbox flex v", () => {
		$list = div.c("dev-chat-list flex v");
		$reader = div.c("dev-chat-reader flex v");
	});
	$reader.el.hidden = true;

	// Stick to the bottom for new lines UNLESS the owner scrolled up to read
	// back — a live tail that yanks you down mid-scroll is worse than a tail
	// that waits to be asked.
	$list.on("scroll", () => {
		const el = $list.el;
		stick = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
	});

	resync(url);
	if (live) poll();

	/** Point this same box at a different transcript — the session picker and
	    the minion list both reuse ONE log box rather than building a new one
	    per click, so the reading state (open or not) resets cleanly. `is_agent`
	    switches the isSidechain handling for a minion's OWN file, where it is
	    true on every line rather than marking a nested agent to exclude. */
	function resync(next, { is_agent = false } = {}) {
		url = next;
		agent = is_agent;
		state.bytes = 0; state.tail = ""; state.lines = []; state.seen = 0; state.cards = 0;
		$list.empty();
		show_list();
		if (url) sync();
		else $list.append(() => p.c("dev-val off", "no session yet"));
	}

	async function poll() {
		while (!stop && document.contains($wrap.el)) {
			await new Promise(res => setTimeout(res, POLL_MS));
			if (document.visibilityState === "visible") await sync();
		}
	}

	async function sync() {
		const lines = await load(url, state);
		if (!lines) {
			if (!state.cards) $list.append(() => p.c("dev-val off",
				"This transcript is served by the dev server only — restart it once to read this here."));
			return;
		}
		lines.slice(state.seen).forEach(ingest);
		state.seen = lines.length;
		if (stick) $list.el.scrollTop = $list.el.scrollHeight;
	}

	function ingest(l) {
		if (is_prompt(l, { sidechain_ok: agent })) {
			if (trivial(l)) return;
			return card("you", prose_of(l.message.content), l.timestamp);
		}
		const said = assistant_prose(l, { sidechain_ok: agent });
		if (said) card("claude", said, l.timestamp);
	}

	function card(role, text, at) {
		state.cards++;
		$list.append(() => {
			button.c("dev-chat-card dev-chat-" + role).attr("type", "button")
				.append(() => {
					span.c("dev-chat-card-role muted", role_label(role));
					span.c("dev-chat-card-text", one_line(text));
					small.c("dev-chat-card-time muted", clock(at));
				})
				.on("click", () => open(role, text, at));
		});
	}

	/* ⚠ `[hidden]` loses to a `flex` utility class (`code`#7, `ai.css`'s own
	   note on `.ai-chat-rail[hidden]`) — devbar.css's chat block carries the
	   matching override for `.dev-chat-list` and `.dev-chat-reader`. */
	function show_list() { $list.el.hidden = false; $reader.el.hidden = true; }
	function show_reader() { $list.el.hidden = true; $reader.el.hidden = false; }

	function open(role, text, at) {
		$reader.empty(() => {
			div.c("dev-chat-reader-head flex v-center", () => {
				button.c("dev-chat-back").attr("type", "button")
					.append(() => { span("‹"); span("back"); })
					.on("click", show_list);
				span.c("dev-chat-reader-who muted", role_label(role) + " · " + clock(at));
			});
			div.c("dev-chat-reader-body", () => md(text));
		});
		show_reader();
	}

	/* The composer's own optimistic line — it wrote into the run TASK's
	   task.jsonl (a different file from the transcript this box tails), so it
	   never arrives through `load()`; this is the only way it appears at all,
	   right away, the instant Send is pressed. */
	$wrap.inject = (role, text, at) => { card(role, text, at); if (stick) $list.el.scrollTop = $list.el.scrollHeight; };
	$wrap.resync = resync;
	$wrap.stop = () => { stop = true; };
	return $wrap;
}

/* ── the data layer — a sibling of conversation.js's, not a fork ─────────── */

const POLL_MS = 4000;

/* ⚠ The SPA fallback answers an unknown path with index.html and a 200 — the
   content-type IS the 404 (the same guard every fetch in this repo needs). */
async function load(url, state) {
	if (!url) return null;
	const res = await fetch(url, { headers: { Range: "bytes=" + state.bytes + "-" } }).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
	const text = await res.text();
	if (res.status !== 206) { state.bytes = 0; state.tail = ""; state.lines = []; }
	state.bytes += new TextEncoder().encode(text).length;
	const parts = (state.tail + text).split("\n");
	state.tail = parts.pop() ?? "";
	parts.filter(Boolean).forEach(line => { try { state.lines.push(JSON.parse(line)); } catch { /* torn line */ } });
	return state.lines;
}

/* Same filtering conversation.js uses, client-side, for the same reason: a
   Skill load or a system reminder arrives as a tagless "user" text line and
   must never be read as something the owner typed.
   ⚠ `isSidechain` excludes a nested agent's own chatter FROM A TOP-LEVEL
   session's file — but a MINION's own transcript legitimately carries it on
   every line, so a minion's reader passes `{ sidechain_ok: true }`. */
function is_prompt(l, { sidechain_ok = false } = {}) {
	if (l.type !== "user" || l.isMeta) return false;
	if (!sidechain_ok && l.isSidechain) return false;
	const c = l.message?.content;
	return typeof c === "string" ? !!c.trim() : c?.some?.(b => b.type === "text" && b.text?.trim());
}

function assistant_prose(l, { sidechain_ok = false } = {}) {
	if (l.type !== "assistant" || (!sidechain_ok && l.isSidechain)) return null;
	const c = l.message?.content;
	const text = typeof c === "string" ? c : (c ?? []).filter(b => b.type === "text").map(b => b.text).join("\n\n");
	return text?.trim() || null;
}

const prose_of = c => typeof c === "string" ? c : (c ?? []).filter(b => b.type === "text").map(b => b.text).join("\n");

/* A caveat or stdout echo standing alone, arriving as a real "user" line with
   nothing a person actually said in it — the harness tags conversation.js
   already knows to strip before deciding a line is worth a card. */
const HARNESS_TAG = /<(local-command-caveat|local-command-stdout|local-command-stderr|command-name|command-message|command-args|system-reminder|task-notification|ide_selection|ide_opened_file)>[\s\S]*?<\/\1>/g;
const trivial = l => !prose_of(l.message.content).replace(HARNESS_TAG, "").trim();

/* "you" is the owner's own words; "sent" is the composer's own optimistic line
   (not yet a real turn — nobody has replied); everything else is Claude's. */
const role_label = role => role === "you" ? "you" : role === "sent" ? "sent → mastermind" : "claude";

const one_line = (s, n = 140) => {
	const line = (s ?? "").trim().split("\n").find(x => x.trim()) ?? "";
	return line.length > n ? line.slice(0, n - 1) + "…" : line;
};

export default session_log;
