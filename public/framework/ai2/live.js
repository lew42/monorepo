import { div, span, small, button, h3, p, a, form, input } from "/app.js";
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
 * TALKING TO AN AGENT: click a row in "Running now" and its conversation opens
 * in the agent column beside the list (a wide card), or takes over the card's
 * body with "← Live" to go back (a narrow one) — its own log, live, and a box
 * that sends it a message (`AgentTalk`, below; `POST /api/agents/<id>/message`
 * in Servex.js). The composer at the bottom of the page still talks to the
 * assistant, as before.
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
		// `talkable`: a real Claude session has a model; the Dispatcher (a fake
		// agent in the same map) has none, and Servex refuses a message to it.
		return agents.filter(a => a.state !== "stopped").map(a => ({ id: a.id, title: a.id, talkable: !!a.model,
			state: a.state, line: [a.model, a.turns ? a.turns + " turns" : ""].filter(Boolean).join(" · "),
			at: a.started_at }));
	}

	const hide = list => { const c = cleared(); return list.filter(it => !c.has(it.id) || newer(it.at, c.get(it.id)) !== c.get(it.id)); };

	return {
		log,
		/** The selected agent, `{id, clicked}` — see live_full, below. */
		sel: null,
		/** Its conversation, built once and kept across redraws (draft and all). */
		current: null,
		talk(id, $col){
			if (this.current?.id !== id){
				this.current?.close();
				$col.append(() => { this.current = new AgentTalk({ id }); });
			}
			return this.current;
		},
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

/** THE PAGE — scrolls as one; ai2.css splits it into columns when it is wide:
 *  usage (three pace meters), who is running, the tasks, then the chat. A task
 *  has a ✕ that clears it; the chat says who cleared what.
 *
 *  ONE AGENT IS SELECTED at a time (`model.sel`), and its conversation
 *  (`AgentTalk`) lives in the agent column:
 *  - WIDE (the column exists): the column is never empty. With nothing
 *    clicked it shows `assistant-fast` — or the first working agent, or the
 *    first row — picked once at load and never changed by agents coming and
 *    going. A click selects another. The panel sits level with its row.
 *  - NARROW (no room for the column): nothing opens until you click. A click
 *    makes the conversation TAKE OVER the card's body, scrolled to the top,
 *    with "← Live" to go back to where you were. Nothing is pushed down.
 *  Doc: doc/columns.md. */
export function live_full(it, model){
	div.c("ai2-full-head flex v-center gap-25", () => {
		icon(it.icon);
		span.c("ai2-full-title").text("Live");
	});

	div.c("ai2-live-section ai2-live-usage", () => {
		h3("Usage");
		usage_rail(it.usage, LABELS);
	});

	const talkable = it.agents.filter(x => x.talkable);
	if (!model.sel && talkable.length){
		const first = talkable.find(x => x.id === "assistant-fast") ?? talkable.find(x => x.state === "working") ?? talkable[0];
		model.sel = { id: first.id, clicked: false };
	}

	const $col = div.c("ai2-live-talk-col", () => {
		a.c("ai2-live-back").attr("tabindex", "0").text("← Live").click(() => {
			if (model.sel) model.sel.clicked = false;
			place(model, $col, rows);
		});
	});

	const rows = new Map();
	const list = (title, items, empty, { clearable, talkable, cls = "" } = {}) => div.c("ai2-live-section " + cls, $sec => {
		h3(title);
		if (!items.length) small.c("muted").text(empty);
		items.forEach(x => {
			const talks = talkable && x.talkable;
			const $row = div.c("ai2-live-item" + (talks ? " ai2-live-talkable" : ""), () => {
				span.c("ai2-live-state ai2-live-" + x.state).text(x.state.replace("-", " "));
				span.c("ai2-live-name").text(x.title);
				if (x.line) small.c("ai2-live-line muted").text(x.line);
				if (clearable) button.c("ai2-clear").attr("type", "button").attr("title", "clear — it comes back if it changes again")
					.text("✕").click(() => model.clear(x.id));
			});
			if (!talks) return;
			rows.set(x.id, $row);
			$row.attr("title", "click to talk to " + x.id);
			$row.click(() => {
				model.sel = { id: x.id, clicked: true };
				place(model, $col, rows);
			});
		});
	});

	list("Running now", it.agents, "nothing is running", { talkable: true, cls: "ai2-live-running" });
	list("Tasks", it.tasks, "no task in progress", { clearable: true, cls: "ai2-live-tasks" });
	place(model, $col, rows);
}

/** Is the card wide enough for the agent column? ai2.css says so with a
 *  custom property on the column, set by the same container query that
 *  shows it — one source of truth for the width. */
const wide = $col => Number(getComputedStyle($col.el).getPropertyValue("--ai2-live-cols")) >= 3;

/** Put the selected conversation where it belongs — beside the list, over
 *  the card's body, or nowhere — and mark its row. Called on every draw, on
 *  a click, on "← Live", and whenever the card changes size. */
function place(model, $col, rows){
	const card = $col.el.closest(".ai2-card-live");
	if (!card) return;
	model.placing = () => place(model, $col, rows);
	if (!model.ro){
		model.ro = new ResizeObserver(() => model.placing?.());
		model.ro.observe(card);
	}

	const sel = model.sel, is_wide = wide($col);
	const take = !is_wide && !!sel?.clicked;
	if (take !== card.classList.contains("ai2-live-takeover")){
		if (take){ model.scroll = card.scrollTop; card.classList.add("ai2-live-takeover"); card.scrollTop = 0; }
		else { card.classList.remove("ai2-live-takeover"); card.scrollTop = model.scroll ?? 0; }
	}

	rows.forEach(($row, id) => $row.el.classList.toggle("ai2-live-open", id === sel?.id && (is_wide || take)));
	const talk = sel && (is_wide || take) ? model.talk(sel.id, $col) : null;
	if (!talk){ model.current?.view.el.remove(); return; }
	if (talk.view.el.parentNode !== $col.el) $col.el.append(talk.view.el);
	if (talk.focused && document.activeElement !== talk.$input.el) talk.$input.el.focus();

	// Level with its row when beside the list — measured after the draw has
	// finished, so no layout is forced half-way through building the page.
	const $row = rows.get(sel.id);
	requestAnimationFrame(() => {
		const el = talk.view.el;
		if (!is_wide || !$row?.el.isConnected || !el.isConnected){ el.style.marginBlockStart = ""; return; }
		const now = parseFloat(el.style.marginBlockStart) || 0;
		const dy = $row.el.getBoundingClientRect().top - (el.getBoundingClientRect().top - now);
		el.style.marginBlockStart = Math.max(0, Math.round(dy)) + "px";
	});
}

/**
 * TALK TO ONE RUNNING AGENT (agent-chat, 2026-09-24; the owner: "click into
 * [an agent] and then send it messages just from my browser").
 *
 * What it shows: the agent's own log, `agent-<id>` — the last lines from
 * `GET /log/agent-<id>`, then every new one as Servex pushes it over the page's
 * one `EventSource` (`agent_frames`). Your messages and the agent's replies are
 * full lines; a tool call, an error or a stop is one quiet line; token deltas
 * and the session banner are skipped. Newest at the bottom, and the panel grows
 * with the page — no scroll box of its own (the Live card scrolls as one).
 *
 * What it sends: `POST /api/agents/<id>/message {text}` (Servex.js). Servex
 * queues it behind the agent's current turn, so a busy agent answers when it
 * is free. A refusal (unknown id, stopped agent, Servex down) shows under the
 * box in plain words.
 *
 * ⚠ The Live page redraws with `$box.empty()` whenever anything changes. This
 * panel is built ONCE and put back by `place()`, so the typed text
 * survives; if the box had focus, it gets it back.
 */
export class AgentTalk {
	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.seen = new Set();
		this.focused = false;
		this.pending = [];
		this.view = div.c("ai2-talk", () => {
			span.c("ai2-talk-title").text(this.id);   // whose conversation this is
			this.$lines = div.c("ai2-talk-lines");
			form.c("ai2-talk-form", () => {
				this.$input = input.c("ai2-talk-input").attr("type", "text").attr("placeholder", "say something to " + this.id);
				button.c("ai2-talk-send prim").attr("type", "submit").text("Send");
			}).on("submit", e => { e.preventDefault(); this.send(); });
			this.$status = small.c("ai2-talk-status");
		});
		this.$input.on("focus", () => { this.focused = true; });
		// A redraw detaches the box, which can fire `blur` — ask again once it is back.
		this.$input.on("blur", () => setTimeout(() => { this.focused = document.activeElement === this.$input.el; }, 0));
		this.off = agent_frames(e => { if (e.agent === this.id) this.ready ? this.line(e) : this.pending.push(e); });
		this.backlog();
	}

	backlog(){
		fetch(servex_base() + "/log/agent-" + encodeURIComponent(this.id) + "?n=" + this.constructor.BACKLOG)
			.then(r => (r.ok ? r.json() : [])).catch(() => [])
			.then(list => {
				(Array.isArray(list) ? list : []).forEach(e => this.line(e));
				this.ready = true;
				this.pending.splice(0).forEach(e => this.line(e));
			});
	}

	/** Who said it and what, or nothing for a line that is not conversation. */
	said(e){
		const clip = t => (t.length > 400 ? t.slice(0, 400) + "…" : t);
		if (e.type === "agent_msg" && e.from === "owner") return { cls: "ai2-chat-you", who: "you", text: e.text };
		if (e.type === "agent_msg") return { cls: "ai2-chat-update", who: e.first ? "brief" : (e.from ?? "message"), text: clip(e.text ?? "") };
		if (e.type === "transcript" && !e.meta) return { cls: "ai2-chat-reply", who: this.id, text: e.text };
		if (e.type === "tool" && !e.nested) return { cls: "ai2-chat-update", who: "", text: "used " + e.name };
		if (e.type === "error") return { cls: "ai2-chat-update", who: "error", text: e.text };
		if (e.type === "result" && e.stopped) return { cls: "ai2-chat-update", who: "", text: "stopped" };
	}

	line(e){
		const s = this.said(e);
		if (!s?.text) return;
		const key = [e.at, e.type, e.text ?? e.name].join("|");
		if (this.seen.has(key)) return;
		this.seen.add(key);
		this.$lines.append(() => {
			p.c("ai2-chat " + s.cls, () => {
				if (s.who) span.c("ai2-chat-who").text(s.who);
				span.c("ai2-chat-text").text(s.text);
			});
		});
		const el = this.$lines.el;
		while (el.children.length > this.constructor.KEEP) el.firstElementChild.remove();
	}

	send(){
		const text = this.$input.el.value.trim();
		if (!text) return;
		this.$status.text("sending…");
		fetch(servex_base() + "/api/agents/" + encodeURIComponent(this.id) + "/message", {
			method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }),
		})
			.then(r => r.json().catch(() => ({})).then(body => {
				if (!r.ok) throw new Error(body.error || "Servex answered " + r.status);
			}))
			.then(() => { this.$input.el.value = ""; this.$status.text(""); },
				e => this.$status.text("Not sent — " + (e.message === "Failed to fetch" ? "Servex is not answering." : e.message)));
	}

	close(){
		this.off?.();
		this.view.el.remove();
	}
}
AgentTalk.BACKLOG = 300;   // log lines read (most are token deltas, skipped)
AgentTalk.KEEP = 60;       // conversation lines kept on screen
