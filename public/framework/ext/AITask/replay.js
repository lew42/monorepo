import { div, p, pre } from "../../core/View/View.js";
import md from "../markdown/md.js";
import { parse, command, harness, trivial } from "./prompt.js";
import { message, chars_of } from "./message.js";
import { ref, clock, dur, count, elapsed } from "./stats.js";

/**
 * replay(session_id, label) — a closed bar that fetches `/ai-logs/<id>` on
 * first open and renders the transcript as threads: the rail holds every
 * prompt in full, and clicking one opens its flow — thinking bars, tool calls,
 * md-rendered responses — in the detail column beside it.
 */
export function replay(session_id, label = "session"){
	if (!session_id) return;
	let loaded = false, $body;
	return div.c("ai-replay ai-fold", () => {
		div.c("ai-fold-bar wash", "replay — " + label).on("click", async e => {
			e.currentTarget.parentElement.classList.toggle("open");
			if (loaded) return;
			loaded = true;
			const lines = await load(session_id);
			$body.append(() => lines?.length
				? render(lines, session_id)
				: p("Transcript unavailable — replays are served by the dev server only."));
		});
		$body = div.c("ai-fold-body");
	});
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

function render(lines, id){
	// ⚠ `!l.isMeta` — skill-load injections are tagless "user" text lines (readme §3).
	const talk = lines.filter(l => (l.type === "user" || l.type === "assistant") && !l.isMeta && l.message?.content);
	const list = turns(talk).filter(t => !t.prompt || t.flow.length || !trivial(t.prompt));

	div.c("ai-log", () => {
		header(id, talk, list);
		let $detail;
		div.c("ai-columns cols main-aside", () => {
			// DOM order is main-then-aside (`.cols.main-aside`'s own rule) —
			// `.ai-rail`'s `order: -1` (ai.css) puts it back on the left.
			$detail = div.c("ai-detail", () => hint());
			div.c("ai-rail", () => list.forEach(t => card(t, () => $detail)));
		});
	});
}

/* One thread per real prompt. Tool results arrive typed "user", and sidechain
 * lines belong to a subagent — neither starts a thread. */
function turns(lines){
	const out = [];
	lines.forEach(l => {
		if (is_prompt(l)) out.push({ prompt: l, flow: [] });
		else if (out.length) out.at(-1).flow.push(l);
		else out.push({ prompt: null, flow: [l] });
	});
	return out;
}

function is_prompt(l){
	if (l.type !== "user" || l.isSidechain) return false;
	const c = l.message.content;
	return typeof c === "string" || c.some?.(b => b.type === "text");
}

function header(id, talk, list){
	const first = talk[0]?.timestamp, last = talk.at(-1)?.timestamp;
	const total = talk.reduce((n, l) => n + chars_of(l), 0);
	div.c("ai-header", () => {
		p.c("ai-meta muted", `${first ? new Date(first).toLocaleDateString() : ""} ${clock(first)} · ${dur(elapsed(first, last))} · ${list.length} threads · ${count(total)} chars · session`);
		ref(id);
	});
}

function card(t, detail_of){
	const { prose, parts } = t.prompt ? parse(t.prompt) : { prose: "", parts: [] };
	const cmd = command(parts);
	const start = t.prompt?.timestamp ?? t.flow[0]?.timestamp;
	const end = t.flow.at(-1)?.timestamp ?? start;
	const size = (t.prompt ? chars_of(t.prompt) : 0) + t.flow.reduce((n, l) => n + chars_of(l), 0);

	div.c("ai-thread wash", $card => {
		div.c("ai-meta muted", () => {
			p(`${clock(start)} · ${dur(elapsed(start, end))} · ${count(size)} chars`);
			t.prompt?.uuid && ref(t.prompt.sessionId + "#" + t.prompt.uuid, "ref");
		});
		if (cmd) pre.c("ai-cmd", cmd);
		if (prose) md(prose);
		if (!cmd && !prose) p("· " + (parts[0]?.[0] ?? "flow"));
		$card.on("click", e => select(e.currentTarget, t, detail_of()));
	});
}

function select(el, t, $detail){
	const was = el.classList.contains("active");
	el.parentElement.querySelectorAll(".ai-thread.active").forEach(c => {
		c.classList.remove("active", "surface");
		c.classList.add("wash");
	});
	if (was) return $detail.empty(() => hint());
	el.classList.remove("wash");
	el.classList.add("active", "surface");
	$detail.empty(() => detail(t));
}

function detail(t){
	if (t.prompt) harness(parse(t.prompt).parts);
	t.flow.forEach(message);
}

function hint(){
	p.c("muted", "Select a message to read its thread.");
}
