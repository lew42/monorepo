import { div, p, pre, a, button, small, span } from "../../core/View/View.js";
import md from "../markdown/md.js";
import { parse, command, harness, trivial } from "./prompt.js";
import { message, fold } from "./message.js";
import { ref, clock } from "./stats.js";

/**
 * conversation(session_id) — a Claude session read as a chat.
 *
 * The owner's messages and Claude's replies alternate down one column, oldest
 * first, the way a chat app shows them. Everything that is not talk — tool
 * calls, tool results, thinking, an agent's own sidechain — is a **run**: one
 * grey line saying what happened ("edited 3 files"), which opens on click.
 * That is the whole idea. A long session is 2,000 lines of tool noise around a
 * few dozen sentences, and the sentences are what a reader came for.
 *
 * Beside the stream is the **prompts rail**: the first line of every message
 * the owner typed, in order. Clicking one scrolls the stream to it. Every
 * owner message carries `id="m-<uuid>"`, so anything anywhere can link to a
 * single sentence of the conversation — that is what the Asks tab's "the
 * prompt" link uses.
 *
 * It replaced `feed.js` (newest-first stream) and `replay.js` (a rail of
 * threads with a detail column). Both rendered the same transcript twice on
 * one tab, neither read as a conversation, and the rail/detail pair meant you
 * could only ever see one turn at a time.
 */

const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");
const POLL_MS = 30000;

export function conversation(session_id){
	if (!session_id) return;
	const state = { bytes: 0, tail: "", lines: [], seen: 0, turn: null, minute: null, prompts: 0 };
	let $stream, $rail, $rail_head, $rail_list, $stamp, $view;

	$view = div.c("ai-chat", () => {
		div.c("ai-chat-bar flex split v-center", () => {
			$stamp = small.c("muted", "loading…");
			ref(session_id);
		});
		// ⚠ DOM order IS the order here, with no `order: -1` trick: this is a
		// WRAPPING flex row, and flexbox packs lines AFTER applying `order`, so a
		// rail ordered before a full-width bar takes a line of its own and the
		// stream drops to a third line. Measured 2026-09-17: stream 890px, rail
		// 240px, neither beside the other.
		$rail = div.c("ai-chat-rail", () => {
			// A column of grey one-liners beside a conversation does not announce
			// itself. It is the index of what was said, and it says so.
			$rail_head = div.c("ai-rail-head muted", "Prompts");
			$rail_list = div.c("ai-rail-list");
		});
		$rail.el.hidden = true;                  // shown once there are two to choose between
		$stream = div.c("ai-chat-stream");
	});

	sync();
	if (LOCAL) poll();
	return $view;

	async function poll(){
		while (document.contains($view.el)){
			await new Promise(res => setTimeout(res, POLL_MS));
			if (document.visibilityState === "visible") await sync();
		}
	}

	async function sync(){
		const lines = await load(session_id, state);
		if (!lines){
			$stamp.text("unavailable");
			if (!state.seen) $stream.empty(() => p.c("muted",
				"This transcript is served by the dev server only — on the public site the manifest stands alone."));
			return;
		}
		lines.slice(state.seen).forEach(l => ingest(state, $stream, $rail_list, l));
		state.seen = lines.length;
		$stamp.text(state.seen + " lines · read " + clock(Date.now()));

		/* An index of one entry is not an index: it is a clipped second copy of the
		   message beside it, and clicking it moves nothing. Measured on this run's
		   own session — 447 lines, exactly one message the owner typed — the rail
		   was a lone 26px row in a 240px column next to a 960px stream (2026-09-17). */
		$rail.el.hidden = state.prompts < 2;
		$rail_head.text("Prompts · " + state.prompts);
		flush_pending();
	}
}

/* Incremental: `Range: bytes=<seen>-` asks for the tail only. A 206 appends the
   new bytes (a half-written last line waits in `state.tail`); a 200 means the
   file was rewritten, so start over. Measured 2026-08-17: without this, a poll
   re-downloaded a 3 MB transcript every time.
   ⚠ The SPA fallback answers an unknown path with index.html and a 200 — the
   content-type IS the 404. */
async function load(id, state){
	const res = await fetch("/ai-logs/" + id, { headers: { Range: "bytes=" + state.bytes + "-" } }).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
	const text = await res.text();
	if (res.status !== 206){ state.bytes = 0; state.tail = ""; state.lines = []; }
	state.bytes += new TextEncoder().encode(text).length;
	const parts = (state.tail + text).split("\n");
	state.tail = parts.pop() ?? "";
	parts.filter(Boolean).forEach(line => { try { state.lines.push(JSON.parse(line)) } catch {} });
	return state.lines;
}

/* ⚠ `!l.isMeta` — a Skill load is injected as a tagless "user" text line; without
   this it renders as a genuine 49k-character message from the owner. */
const is_talk = l => (l.type === "user" || l.type === "assistant") && !l.isMeta && l.message?.content;

/** A message the OWNER typed: a top-level user line carrying text. */
function is_prompt(l){
	if (l.type !== "user" || l.isSidechain) return false;
	const c = l.message.content;
	return typeof c === "string" || c.some?.(b => b.type === "text");
}

/** Claude's own prose in a line, if it said any. Tool calls and thinking are not prose. */
function said(l){
	if (l.type !== "assistant" || l.isSidechain) return null;
	const c = l.message.content;
	if (typeof c === "string") return c.trim() || null;
	const text = c.filter(b => b.type === "text").map(b => b.text).join("\n\n").trim();
	return text || null;
}

/* ── One line in, one thing appended ──────────────────────────────────────── */

function ingest(state, $stream, $rail, raw){
	if (!is_talk(raw)) return;

	if (is_prompt(raw)){
		if (trivial(raw)) return;              // a caveat or stdout echo standing alone
		state.turn = open_turn(state, $stream, raw);
		rail_item(state, $rail, raw);
		return;
	}
	if (!state.turn) state.turn = open_turn(state, $stream, null);

	/* ⚠ One assistant line usually holds BOTH — a sentence and the tool call it
	   introduces. Saying the sentence and returning silently dropped every tool
	   call Claude narrated, which is most of them; the rest of the line goes into
	   the run below it, with the text taken out so it is not printed twice. */
	const prose = said(raw);
	if (!prose) return step(state.turn, raw);

	say(state.turn, prose);
	const rest = without_text(raw);
	if (rest.message.content.length) step(state.turn, rest);
}

const without_text = l => ({ ...l,
	message: { ...l.message, content: l.message.content.filter(b => b.type !== "text") } });

/* A timestamp is a divider between turns, not a stamp on every row — at one row
   per line a long session reads as a spreadsheet. It prints only when the minute
   changes, which on a real transcript is every few turns. */
function stamp(state, at){
	const key = at && new Date(at).toISOString().slice(0, 16);
	if (!key || key === state.minute) return;
	state.minute = key;
	div.c("ai-chat-time muted", clock(at));
}

function open_turn(state, $stream, prompt){
	const turn = { say: null, steps: null };
	$stream.append(() => {
		stamp(state, prompt?.timestamp);
		turn.$turn = div.c("ai-turn", () => { if (prompt) you(prompt); });
	});
	return turn;
}

/** The owner's own message — the one surface in the stream that paints a box. */
function you(l){
	const { prose, parts } = parse(l);
	const cmd = command(parts);
	// ⚠ `surface`, not `wash`: the page ground here is already light grey and
	// `wash` is #f2f2f2 on top of it — measured invisible. A white card on grey
	// is the same cue every other box on this page uses.
	div.c("ai-you surface", () => {
		if (cmd) pre.c("ai-cmd", cmd);
		if (prose) md(prose);
		harness(parts);
	}).attr("id", "m-" + l.uuid);
}

/** Claude's prose. No box: it is the ground of the page, and a box it does not need is noise. */
function say(turn, text){
	turn.steps = null;                 // prose ends the run of tool steps
	turn.$turn.append(() => { turn.say = div.c("ai-say", () => md(text)); });
}

/**
 * One tool call, thinking block, tool result or sidechain line — folded into the
 * run that is open, which grows a label as it goes ("edited 3 files, ran a
 * command"). Clicking the label shows the raw blocks, unchanged.
 */
function step(turn, raw){
	if (!turn.steps){
		const run = { lines: [], built: false };
		turn.steps = run;
		turn.$turn.append(() => {
			// ⚠ The body is built on its FIRST open, never before: a long session
			// holds thousands of these lines, and rendering them all into hidden
			// DOM is the 3 MB the fold exists to avoid.
			div.c("ai-fold ai-steps-fold", $fold => {
				run.$bar = div.c("ai-fold-bar ai-step-bar muted", "…").on("click", () => {
					$fold.el.classList.toggle("open");
					if (run.built) return;
					run.built = true;
					run.$body.append(() => run.lines.forEach(l => message(l)));
				});
				run.$body = div.c("ai-fold-body ai-step-body");
			});
		});
	}
	const run = turn.steps;
	run.lines.push(raw);
	if (run.built) run.$body.append(() => message(raw));
	run.$bar.text(run_label(run.lines));
}

/* What a run of steps DID, in the words the owner used for it: "edited 3 files",
   "ran a script", "spawned an agent". Grouped by verb in the order they happened,
   so one line stands in for a hundred. */
const VERB = {
	Edit: "edited", Write: "edited", MultiEdit: "edited", NotebookEdit: "edited",
	Read: "read", Bash: "ran", PowerShell: "ran",
	Grep: "searched", Glob: "searched", WebSearch: "searched",
	Agent: "spawned", Task: "spawned", SendMessage: "messaged",
	Skill: "loaded", WebFetch: "fetched", TodoWrite: "updated", ToolSearch: "searched",
};
const NOUN = { edited: "files", read: "files", ran: "commands", searched: "searches",
	spawned: "agents", messaged: "agents", loaded: "skills", fetched: "pages", updated: "plans" };
const ONE = { files: "a file", commands: "a command", searches: "a search", agents: "an agent",
	skills: "a skill", pages: "a page", plans: "the plan" };

const some = (n, noun) => n === 1 ? ONE[noun] ?? ("a " + noun) : n + " " + noun;

function run_label(lines){
	const counts = new Map();
	let thought = 0;
	lines.forEach(l => {
		if (l.isSidechain) return bump(counts, "agent work");
		const c = l.message?.content;
		if (!Array.isArray(c)) return;
		c.forEach(b => {
			if (b.type === "thinking") thought++;
			else if (b.type === "tool_use") bump(counts, VERB[b.name] ?? b.name);
		});
	});
	const said = [...counts].map(([verb, n]) => phrase(verb, n));
	if (thought) said.unshift("thought");
	return said.length ? said.join(", ") : `${lines.length} step${lines.length === 1 ? "" : "s"}`;
}

/* ⚠ A tool this map has no word for used to print its own camelCase name bare —
   "…, spawned 6 agents, ScheduleWakeup" — which reads as a glitch, not a report.
   It is still named (the reader may know it), but as something that was done. */
const phrase = (verb, n) =>
	NOUN[verb] ? `${verb} ${some(n, NOUN[verb])}`
	: verb.includes(" ") ? (n === 1 ? verb : `${verb} ×${n}`)
	: `used ${verb}${n === 1 ? "" : " ×" + n}`;

const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);

/* ── The prompts rail ─────────────────────────────────────────────────────── */

const one_line = (s, n = 90) => {
	const line = (s ?? "").trim().split("\n").find(x => x.trim()) ?? "";
	return line.length > n ? line.slice(0, n - 1) + "…" : line;
};

/* Every message the owner typed, in order, first line each — the table of
   contents for a conversation that has none. It is a link, not a button: a
   reader can copy it, open it in a second tab, and share it.
   ⚠ Every row carries its TIME. Without it a mastermind session's rail was 16
     rows reading "/mastermind" out of the first 20 (2026-09-13's session,
     measured 2026-09-17): a table of contents whose rows cannot be told apart
     is not one, and the time is the one thing that always differs. */
function rail_item(state, $rail, l){
	const { prose, parts } = parse(l);
	const label = one_line(prose) || command(parts) || "(no text)";
	state.prompts++;
	$rail.append(() => {
		a.c("ai-prompt").href("#m-" + l.uuid).attr("title", label)
			.on("click", e => { e.preventDefault(); reveal(l.uuid); })
			.append(() => {
				span.c("ai-prompt-text", label);
				span.c("ai-prompt-at muted", clock(l.timestamp));
			});
	});
}

/* ── Linking into the conversation from outside ───────────────────────────── */

let pending = null;

/**
 * Scroll the stream to one message and light it up. The transcript may not be
 * fetched yet — the Session tab builds on its first click, and the fetch is a
 * few megabytes — so an id that is not in the DOM is remembered and honoured by
 * `flush_pending()` as soon as the line arrives.
 */
export function reveal(uuid){
	pending = uuid;
	flush_pending();
}

function flush_pending(){
	if (!pending) return;
	const el = document.getElementById("m-" + pending);
	if (!el) return;
	pending = null;
	document.querySelectorAll(".ai-you.lit").forEach(x => x.classList.remove("lit"));
	el.classList.add("lit");
	// ⚠ `start`, not `center`: a dictated message can be 2,000px tall and centring
	// one puts its FIRST line a screenful above the viewport (measured: top at -1029).
	el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** `?m=<uuid>` or `#m-<uuid>` in the url — the message a link from elsewhere means. */
export function wanted_message(){
	const q = new URLSearchParams(location.search).get("m");
	if (q) return q;
	const hash = location.hash.match(/^#m-([0-9a-f-]{36})$/i);
	return hash?.[1] ?? null;
}

export default conversation;
