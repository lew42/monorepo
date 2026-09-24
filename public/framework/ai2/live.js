import { div, span, small, button, h3 } from "/app.js";
import { View, icon } from "/framework/core/View/View.js";
import { usage_rail } from "/framework/ext/AITask/usage.js";
import { servex_base, card_stream, agent_frames } from "./inbox.js";
import { clock } from "./card.js";

/**
 * THE LIVE CARD — `/framework/ai2/live/`, the first card that does not come
 * from `ai/board.jsonl` (the owner, 2026-09-23). It shows what is going on
 * right now: the usage limits, every agent Servex is running, and today's
 * tasks. It rises to the top of the rail whenever any of that changes, and
 * its page ends in a chat — every update, one line, and anything you say.
 *
 * Where each part comes from:
 *   usage   — `/framework/ai/usage.json`, the same snapshot the overview reads;
 *             the page draws it with the first dashboard's pace meters
 *             (`ext/AITask/usage.js`), all three limits, always
 *   agents  — Servex's live map (`GET /api/agents`), then every agent moment
 *             it pushes over the page's one `EventSource`
 *   tasks   — today's `day.jsonl` (opened, not yet landed) and the `task`
 *             lines on Servex's `prompts` log (the Dispatcher's own)
 *   chat    — Servex's `cards/live` log: the updates Servex writes there,
 *             your words, the assistant's replies, and every `clear`
 *
 * CLEARING is one line on that same log, `{type: "clear", ref: <id>}`, which you
 * or any agent can write (`POST /log/cards/live`). It hides the item until
 * something new happens to it — a cleared task that moves again comes back.
 * Only TASKS carry a ✕: hiding an agent that is still running would make
 * "Running now" lie.
 *
 * A NOT STARTED task was spoken while `dispatch.off` existed. The Dispatcher
 * answers it with "dispatch is paused…" and never replays it (Servex/agents/
 * Dispatcher.js), so it is not queued — it will never run unless said again.
 */
export const LIVE = "live";

// The pace meters' own stylesheet — `usage_rail` alone does not load it.
View.stylesheet("/framework/ext/AITask/ai.css");

// The three limits, in the words the owner reads them by.
const LABELS = { session: "5-hour", weekly_scoped: "weekly Fable", weekly_all: "weekly all" };
const ORDER = ["session", "weekly_scoped", "weekly_all"];
const PAUSED = "dispatch is paused";

// The always-on sessions: running, but their every sentence is not news.
const QUIET = new Set(["assistant-fast", "master-assistant-master", "dispatcher"]);
const newer = (a, b) => (Date.parse(a ?? 0) > Date.parse(b ?? 0) ? a : b);

export function live_model({ prompts, day }){
	const log = card_stream(LIVE);
	const readers = new Set();
	let agents = [], usage = null, moment = null;

	const changed = () => readers.forEach(fn => fn());

	async function poll_agents(){
		try { const list = await (await fetch(servex_base() + "/api/agents")).json(); agents = Array.isArray(list) ? list : []; }
		catch { agents = []; }
		changed();
	}
	/* The raw snapshot: the meters need each limit's `group` and `resets_at`. */
	async function poll_usage(){
		try { usage = await (await fetch("/framework/ai/usage.json", { cache: "no-store" })).json(); }
		catch { usage = null; }
		changed();
	}

	/** All three limits, in the owner's order — weekly Fable too, even at 0%. */
	function limits(){
		const all = usage?.utilization?.limits ?? [];
		return [...all].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
	}

	/* A token is not a moment; a start, a finished turn, a stop or an error is. */
	agent_frames(event => {
		if (!["agent_msg", "result", "error"].includes(event.type) || !event.card) return;
		const i = agents.findIndex(a => a.id === event.card.id);
		if (i === -1) agents.push(event.card); else agents[i] = event.card;
		if (!QUIET.has(event.card.id)) moment = newer(event.at, moment);
		changed();
	});

	poll_agents(); poll_usage();
	setInterval(poll_agents, 30000);
	setInterval(poll_usage, 60000);
	log.on(changed);
	log.ready.then(changed);
	prompts.on(changed);

	/** What was cleared, and when — an item newer than its clear shows again. */
	function cleared(){
		const out = new Map();
		log.entries.forEach(e => { if (e.type === "clear" && e.ref) out.set(e.ref, e.at); });
		return out;
	}

	function tasks(){
		const by_id = new Map();
		// Today's repo tasks: open until their landing line arrives.
		const landed = new Set(day.landings.map(l => l.task));
		day.opened.forEach(o => by_id.set(o.task, { id: o.task, title: o.task, line: o.sentence,
			state: landed.has(o.task) ? "landed" : "working", at: o.at, url: `/framework/ai/${day.date}/${o.task}/` }));
		// Spoken tasks the Dispatcher took on — newest line per id wins.
		prompts.entries.forEach(e => {
			if (e.type !== "task" || !e.id) return;
			const was = by_id.get(e.id) ?? {};
			by_id.set(e.id, { ...was, id: e.id, title: e.title ?? was.title ?? e.id, state: e.state ?? was.state,
				line: e.now ?? was.line ?? e.brief ?? "", at: e.at, paused: String(e.now ?? "").startsWith(PAUSED) });
		});
		by_id.forEach(t => { if (t.paused && t.state !== "landed") Object.assign(t, { state: "not-started",
			line: "never started — spoken while dispatch was paused; say it again to start it" }); });
		return [...by_id.values()].filter(t => t.state !== "landed");
	}

	function running(){
		return agents.filter(a => a.state !== "stopped").map(a => ({ id: a.id, title: a.id,
			state: a.state, line: [a.model, a.turns ? a.turns + " turns" : ""].filter(Boolean).join(" · "),
			at: a.started_at }));
	}

	const hide = list => { const c = cleared(); return list.filter(it => !c.has(it.id) || newer(it.at, c.get(it.id)) !== c.get(it.id)); };

	return {
		log,
		on(fn){ readers.add(fn); return () => readers.delete(fn); },

		/** The card, as the rail and the page draw it. `at` is the newest moment
		 *  of anything in it — which is what lifts it to the top of the rail. */
		item(){
			const t = hide(tasks()), a = hide(running());
			let at = moment;
			log.entries.forEach(e => { at = newer(e.at, at); });
			t.forEach(x => { at = newer(x.at, at); });
			const last = [...log.entries].reverse().find(e => e.type === "update" || e.type === "reply");
			const lim = limits();
			const bars = lim.map(l => ({ kind: l.kind, label: LABELS[l.kind] ?? l.kind, percent: l.percent, severity: l.severity }));
			return { id: LIVE, kind: "live", icon: "speed", title: "Live", author: "servex", at,
				usage: lim.length ? { utilization: { limits: lim } } : null, bars, agents: a, tasks: t, last: last?.text ?? "", links: [], transcript: [] };
		},

		/** Everything the Live card's chat shows: its own log, plus today's task
		 *  openings and landings as update lines. */
		entries(){
			const day_lines = [
				...day.opened.map(o => ({ type: "update", at: o.at, ref: o.task, text: `${o.task} opened — ${o.sentence}` })),
				...day.landings.map(l => ({ type: "update", at: l.at, ref: l.task, text: `${l.task} landed — ${l.sentence}` })),
			];
			return [...log.entries, ...day_lines];
		},

		clear(id){
			return fetch(servex_base() + "/log/cards/" + LIVE, { method: "POST", headers: { "content-type": "application/json" },
				body: JSON.stringify({ type: "clear", ref: id, by: "owner" }) }).catch(() => null);
		},
	};
}

/** THE RAIL'S PREVIEW — the usage bars in one line, then one line saying how
 *  much is running. A FIXED height like every other row, so it can rise to the
 *  top without anything below it changing size. */
export function live_row(it){
	div.c("ai2-row-head flex v-center gap-25", () => {
		span.c("ai2-dot");
		icon(it.icon);
		span.c("ai2-row-title").text(it.title);
		small.c("ai2-row-when muted").text(clock(it.at));
	});
	div.c("ai2-live-bars", () => {
		it.bars.forEach(b => {
			span.c("ai2-live-bar" + (b.severity === "critical" ? " crit" : "")).attr("title", b.label + " " + b.percent + "%")
				.append(() => { span().style({ width: Math.min(100, b.percent) + "%" }); });
		});
	});
	div.c("ai2-row-foot flex v-center gap-25", () => {
		const n = it.agents.length, t = it.tasks.length;
		small.c("ai2-row-line muted").text(`${n} running · ${t} ${t === 1 ? "task" : "tasks"}` + (it.last ? " · " + it.last : ""));
	});
}

/** THE PAGE — one column that scrolls as one: usage (three pace meters),
 *  who is running, the tasks, then the chat. A task has a ✕ that clears it;
 *  the chat says who cleared what. */
export function live_full(it, model){
	div.c("ai2-full-head flex v-center gap-25", () => {
		icon(it.icon);
		span.c("ai2-full-title").text("Live");
	});

	div.c("ai2-live-section", () => {
		h3("Usage");
		usage_rail(it.usage, LABELS);
	});

	const list = (title, items, empty, clearable) => div.c("ai2-live-section", () => {
		h3(title);
		if (!items.length) small.c("muted").text(empty);
		items.forEach(x => {
			div.c("ai2-live-item", () => {
				span.c("ai2-live-state ai2-live-" + x.state).text(x.state.replace("-", " "));
				span.c("ai2-live-name").text(x.title);
				if (x.line) small.c("ai2-live-line muted").text(x.line);
				if (clearable) button.c("ai2-clear").attr("type", "button").attr("title", "clear — it comes back if it changes again")
					.text("✕").click(() => model.clear(x.id));
			});
		});
	});

	list("Running now", it.agents, "nothing is running", false);
	list("Tasks", it.tasks, "no task in progress", true);
}
