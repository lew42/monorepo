import { View, div, p, pre, button, small } from "../../core/View/View.js";
import md from "../markdown/md.js";
import { parse, command, harness, trivial } from "./prompt.js";
import { message } from "./message.js";
import { ref, clock, dur, elapsed } from "./stats.js";

View.stylesheet(import.meta, "feed.css");

const POLL_MS = 5000;
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");

/**
 * feed(session_id) — the transcript as a live feed: turns newest-first,
 * expanded, no fold-bars. `ingest()` is the socket-ready seam — ONE parsed
 * line, prepended as a new turn or folded into the open one, no full
 * re-render. For now a refresh button + localhost polling drive it.
 */
export function feed(session_id){
	if (!session_id) return;
	const state = { seen: 0, pending: null };
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
		const lines = await load(session_id);
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

async function load(id){
	const res = await fetch("/ai-logs/" + id).catch(() => null);
	// The SPA fallback answers unknown paths with index.html and a 200 — a miss, not a hit.
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
	const text = await res.text();
	return text.split("\n").filter(Boolean).flatMap(line => {
		try { return [JSON.parse(line)] } catch { return [] }
	});
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

/** One parsed line: prepend a new turn, or fold into the currently open one. */
function ingest(state, $list, raw){
	if (!is_talk(raw)) return;
	if (is_prompt(raw)){
		finalize(state);
		state.pending = open_turn($list, { prompt: raw, flow: [] });
	} else if (state.pending){
		state.pending.t.flow.push(raw);
		state.pending.$flow.append(() => message(raw));
		state.pending.$meta.empty(() => meta_row(state.pending.t));
	} else {
		state.pending = open_turn($list, { prompt: null, flow: [raw] });
	}
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
	let $meta, $flow;
	const $turn = div.c("ai-turn wash", () => {
		$meta = div.c("ai-meta muted", () => meta_row(t));
		if (t.prompt) prompt_body(t.prompt);
		$flow = div.c("ai-turn-flow", () => t.flow.forEach(message));
	});
	$list.el.insertBefore($turn.el, $list.el.firstChild);
	return { t, $turn, $meta, $flow };
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
