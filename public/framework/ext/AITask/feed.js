import { View, div, p, pre, button, small } from "../../core/View/View.js";
import md from "../markdown/md.js";
import { parse, command, harness, trivial } from "./prompt.js";
import { message, fold } from "./message.js";
import { ref, clock, dur, elapsed } from "./stats.js";

View.stylesheet(import.meta, "feed.css");

const POLL_MS = 30000;   /* was 5000 — every poll re-fetched the whole transcript (3 MB) until Range landed */
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");

/**
 * feed(session_id) — the transcript as a live feed: turns newest-first,
 * expanded, no fold-bars. `ingest()` is the socket-ready seam — ONE parsed
 * line, prepended as a new turn or folded into the open one, no full
 * re-render. For now a refresh button + localhost polling drive it.
 */
export function feed(session_id){
	if (!session_id) return;
	const state = { seen: 0, pending: null, bytes: 0, tail: "", lines: [] };
	let $list, $stamp;

	const $feed = div.c("ai-feed", () => {
		div.c("ai-feed-bar flex split v-center", () => {
			$stamp = small.c("muted", "loading…");
			div.c("flex gap v-center", () => { ref(session_id); button("refresh").on("click", () => sync()); });
		});
		$list = div.c("ai-feed-list");
	});

	sync();
	if (LOCAL) poll();
	return $feed;

	async function poll(){
		while (document.contains($feed.el)){
			await new Promise(res => setTimeout(res, POLL_MS));
			if (document.visibilityState === "visible") await sync();
		}
	}
	async function sync(){
		const lines = await load(session_id, state);
		if (!lines){
			$stamp.text("unavailable");
			if (!state.seen) $list.empty(() => p("Transcript unavailable — feeds are served by the dev server only."));
			return;
		}
		lines.slice(state.seen).forEach(l => ingest(state, $list, l));
		state.seen = lines.length;
		$stamp.text(state.seen + " lines · " + clock(Date.now()));
	}
}

/* Incremental: asks for `Range: bytes=<seen>-`; a 206 appends only the new
   bytes (a partial trailing line waits in `state.tail`), a 200 (server without
   Range support, or a rewritten file) starts over. Measured 2026-08-17: the
   5 s poll re-downloaded a 3 MB transcript every time. */
async function load(id, state = { bytes: 0, tail: "", lines: [] }){
	const res = await fetch("/ai-logs/" + id, { headers: { Range: "bytes=" + state.bytes + "-" } }).catch(() => null);
	// The SPA fallback answers unknown paths with index.html and a 200 — a miss, not a hit.
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
	const text = await res.text();
	if (res.status !== 206){ state.bytes = 0; state.tail = ""; state.lines = []; }
	state.bytes += new TextEncoder().encode(text).length;
	const parts = (state.tail + text).split("\n");
	state.tail = parts.pop() ?? "";
	parts.filter(Boolean).forEach(line => { try { state.lines.push(JSON.parse(line)) } catch {} });
	return state.lines;
}

/* ⚠ `!l.isMeta` — a Skill load's injected body is a "user" text line with no
   wrapping tag; without this it renders as a genuine 49k-char turn (readme §3). */
function is_talk(l){
	return (l.type === "user" || l.type === "assistant") && !l.isMeta && l.message?.content;
}

function is_prompt(l){
	if (l.type !== "user" || l.isSidechain) return false;
	const c = l.message.content;
	return typeof c === "string" || c.some?.(b => b.type === "text");
}

/** One parsed line: prepend a new turn, or fold into the currently open one.
    A turn shows its prompt only — the owner's message IS the feed; the tool flow
    behind it (`fold`, same expando `message.js` uses for a thinking block)
    opens on click, so 2,400 lines of tool noise don't cost 235,000px. */
function ingest(state, $list, raw){
	if (!is_talk(raw)) return;
	if (is_prompt(raw)){
		finalize(state);
		state.pending = open_turn($list, { prompt: raw, flow: [] });
	} else {
		if (!state.pending) state.pending = open_turn($list, { prompt: null, flow: [] });
		push_flow(state.pending, raw);
	}
}

function push_flow(turn, raw){
	turn.t.flow.push(raw);
	if (turn.$flow) turn.$flow.append(() => message(raw));
	else turn.$turn.append(() => fold_flow(turn));
	turn.$bar.text(flow_label(turn.t.flow.length));
	turn.$meta.empty(() => meta_row(turn.t));
}

const flow_label = n => n === 1 ? "1 tool step" : n + " tool steps";

/* Lazy: a turn with no tool flow yet (the common last message of a run) gets
   no fold row at all, not an empty one. */
function fold_flow(turn){
	div.c("ai-fold", () => {
		turn.$bar = div.c("ai-fold-bar wash", flow_label(turn.t.flow.length))
			.on("click", e => e.currentTarget.parentElement.classList.toggle("open"));
		turn.$flow = div.c("ai-fold-body ai-turn-flow", () => turn.t.flow.forEach(message));
	});
}

/* A trivial prompt (no prose, no command) that never picked up any flow is
 * harness noise, not a turn — drop it once the next line proves nothing followed. */
function finalize(state){
	if (!state.pending) return;
	const { t, $turn } = state.pending;
	if (t.prompt && trivial(t.prompt) && !t.flow.length) $turn.remove();
	state.pending = null;
}

function open_turn($list, t){
	const turn = { t };
	turn.$turn = div.c("ai-turn wash", () => {
		turn.$meta = div.c("ai-meta muted", () => meta_row(t));
		if (t.prompt) prompt_body(t.prompt);
	});
	$list.el.insertBefore(turn.$turn.el, $list.el.firstChild);
	return turn;
}

function meta_row(t){
	const start = t.prompt?.timestamp ?? t.flow[0]?.timestamp;
	const end = t.flow.at(-1)?.timestamp ?? start;
	p(`${clock(start)} · ${dur(elapsed(start, end))}`);
	t.prompt?.uuid && ref(t.prompt.sessionId + "#" + t.prompt.uuid, "ref");
}

function prompt_body(l){
	const { prose, parts } = parse(l);
	harness(parts);
	const cmd = command(parts);
	if (cmd) pre.c("ai-cmd", cmd);
	if (prose) md(prose);
}
