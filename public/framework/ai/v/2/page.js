import { Page, View, div, span, a, p, button, details, summary } from "/app.js";
import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { decisions } from "/framework/ext/AITask/decisions.js";

View.stylesheet(import.meta, "v2.css");

/* AI dashboard, version 2 — one dense, full-width screen the mastermind writes to
   in real time. Everything on it is read from ONE file, the run's `task.jsonl`,
   streamed live: append a line and it is on the screen, no reload.

   The old dashboard (/framework/ai/) is untouched. This page is the experiment.
   How the board decides WHICH run to show, the density switch and the decisions
   panel are explained as they come up below; the day-to-day story is readme.md. */

// The last-resort fallback, if nothing newer can be found (no directory.json,
// a fetch failure, or the site has no "mastermind-" task at all yet).
const RUN = "/framework/ai/2026-09-17/mastermind-layout-browser/";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Which run this board shows. `?run=/framework/ai/…/` always wins — a link
 * the mastermind or the owner can hand around for a specific run. Failing
 * that: the newest task dir whose slug starts "mastermind-" (today's board
 * IS one, no extra fetch needed — directory.json's names are enough). If
 * nothing matches that naming habit, the newest day's tasks are checked for
 * `{"assign":{"group":"ai-ops"}}` — a second, data-carried way to say "this
 * is the run" — but ONLY today's tasks, a handful of small fetches, not the
 * whole archive: a task from last month claiming the group costs nothing to
 * check today and everything to check by scanning every day there has ever
 * been. RUN is the floor under all of it.
 */
async function newest_run(){
	const override = new URLSearchParams(location.search).get("run");
	if (override) return override.endsWith("/") ? override : override + "/";

	const dir = await fetch("/framework/directory.json").then(r => r.json()).catch(() => null);
	const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
	const days = ai.filter(d => d.type === "dir" && DATE.test(d.name)).sort((a, b) => b.name.localeCompare(a.name));

	for (const day of days){
		const slug = (day.children ?? []).filter(k => k.type === "dir" && k.name.startsWith("mastermind-")).at(-1);
		if (slug) return `/framework/ai/${day.name}/${slug.name}/`;
	}

	const today = days[0];
	if (today){
		const kids = (today.children ?? []).filter(k => k.type === "dir");
		const hits = await Promise.all(kids.map(k =>
			fetch(`/framework/ai/${today.name}/${k.name}/task.jsonl`).then(r => r.ok ? r.text() : "").catch(() => "")
				.then(text => /"group"\s*:\s*"ai-ops"/.test(text) ? k.name : null)));
		const found = hits.find(Boolean);
		if (found) return `/framework/ai/${today.name}/${found}/`;
	}

	return RUN;
}

const clock = at => at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const today = at => at && new Date(at).toDateString() === new Date().toDateString();
const minutes_since = at => Math.max(0, Math.round((Date.now() - new Date(at)) / 60000));
const run_label = base => base.split("/").filter(Boolean).slice(-2).join(" · ");

/* The first sentence of a longer text, for a row that shows one line and
   opens to the rest. Falls back to the whole (trimmed) text when there is no
   sentence-ending punctuation to split on. */
function first_sentence(text){
	if (!text) return "";
	// A landing outcome often opens with a throwaway "Landed." — already said
	// by this row's own dot and "landed HH:MM" — so skip that lead-in and
	// take the sentence that actually says what shipped.
	const trimmed = text.trim().replace(/^landed\.?\s+/i, "");
	const m = /^.*?[.!?](?=\s|$)/.exec(trimmed);
	return m ? m[0] : trimmed;
}

/* Density — the design system's own knob, not a new one: `--size`, set by the
   three classes framework.css already ships (`.size-small` 0.75 / `.size-
   regular` 1 / `.size-large` 1.5, framework.css ~line 577). "Compact / cozy /
   roomy" are this board's own words for that same ladder, remembered in
   Page.Store so the choice survives a reload. Default compact. */
const DENSITY = { compact: "size-small", cozy: "size-regular", roomy: "size-large" };
const store = new Page.Store({ id: "ai-v2" });

function density_get(){ return store.get({ density: "compact" }).density; }
function density_set($board, name){
	$board.el.classList.remove(...Object.values(DENSITY));
	$board.el.classList.add(DENSITY[name] ?? DENSITY.compact);
	store.patch({ density: name });
}

export default new Page({
	meta: import.meta,
	title: "AI v2",
	icon: "dashboard",
	description: "The run on one dense screen, written live.",

	content(){
		// ⚠ No DOM after an await: the box is captured now, and filled in callbacks.
		const $board = div.c("v2 bleed");
		density_set($board, density_get());

		let draw = () => {};
		const decision_state = { open: null, improving: null, redraw: () => draw() };

		(async () => {
			const base = await newest_run();
			const run = new TaskJSONL({ url: base + "task.jsonl" });
			const ctx = { $board, base, decision_state, redraw: () => draw() };
			draw = () => $board.empty(() => board(run, ctx));
			run.live(draw).then(draw);
		})();

		usage($board);
	},
});

function board(run, ctx){
	if (!run.loaded) return p("The run's task.jsonl did not load (" + ctx.base + "task.jsonl).");

	div.c("v2-top", () => {
		span.c("v2-title", "Mastermind");
		a.c("v2-run muted", run_label(ctx.base)).href(ctx.base).attr("title", "the run this board is showing");
		span.c("v2-now", run.now ?? "");
		density_switch(ctx);
		span.c("v2-usage");    // filled by usage()
	});

	div.c("v2-row", () => {
		panel("From the mastermind", () => notes(run, ctx));
		panel("In flight", () => flight(run));
		panel("Needs you", () => needs(run));
	});

	decisions_panel(run, ctx);
	asks(run);
}

function panel(title, fill){
	div.c("v2-panel", () => { div.c("v2-head", title); fill(); });
}

/* Decisions get a topic of their own, full width — not a fourth narrow
   column in the top row. Each decision can open its own reply box
   (ext/Ask/reply.js), and 14 of those squeezed into a 20em column pushed
   every ask below the fold: measured, firstAskY went from 602px to 2338px
   at 1920. Closed by default, one line of counts — "detail nests one click
   down," CLAUDE.md's own presentation rule, and it keeps the asks (the
   board's main job) the first thing a glance actually sees. `ctx.
   decisions_open` lives on the same long-lived object `decision_state`'s
   open/improving live on, so an append from the mastermind mid-read does
   not snap it shut (the whole board redraws on every live line). */
function decisions_panel(run, ctx){
	const rows = run.decisions ?? [];
	const waiting = rows.filter(d => (d.status ?? "open") === "open").length;
	div.c("v2-panel", () => {
		div.c("v2-head v2-fold-head", () => {
			span("Decisions");
			span.c("v2-time", `${rows.length} · ${waiting} waiting on you · click to ${ctx.decisions_open ? "close" : "open"}`);
		}).on("click", () => { ctx.decisions_open = !ctx.decisions_open; ctx.redraw(); });
		if (ctx.decisions_open) decisions(run, ctx.decision_state);
		else div.c("v2-quiet", waiting ? `${waiting} waiting on your call.` : "Nothing waiting on you.");
	});
}

function density_switch(ctx){
	const current = density_get();
	div.c("v2-density", () => {
		Object.keys(DENSITY).forEach(name => {
			button.c("v2-density-btn", name).ac(name === current && "active")
				.attr("title", name === "compact" ? "the default — smallest text is still 12px" : "")
				.on("click", () => { density_set(ctx.$board, name); ctx.redraw(); });
		});
	});
}

function links_of(item){
	(item.links ?? []).forEach(l => a.c("v2-link", l.label ?? l.url).href(l.url));
}

/* Newest first; five showing, the rest behind "earlier". A × on each row
   dismisses it — remembered by id in Page.Store — but the line itself stays
   in the run's own log; dismissing hides it from THIS board, nothing more. */
function notes(run, ctx){
	const dismissed = new Set(store.get({ dismissed: [] }).dismissed);
	const list = [...run.notes].reverse().filter(n => !dismissed.has(n.id));
	if (!list.length) return div.c("v2-quiet", "Nothing yet.");

	const head = list.slice(0, 5), rest = list.slice(5);
	head.forEach(n => note_row(n, ctx));
	if (rest.length) details.c("v2-earlier", () => {
		summary(`${rest.length} earlier`);
		rest.forEach(n => note_row(n, ctx));
	});
}

function note_row(n, ctx){
	div.c("v2-note", () => {
		span.c("v2-time", clock(n.at));
		span.c("v2-msg", n.msg);
		links_of(n);
		button.c("v2-dismiss", "×")
			.attr("title", "dismiss — the line stays in the run's log")
			.attr("aria-label", "dismiss this note")
			.on("click", () => dismiss_note(n.id, ctx));
	});
}

function dismiss_note(id, ctx){
	if (!id) return;
	const saved = store.get({ dismissed: [] });
	if (!saved.dismissed.includes(id)) store.patch({ dismissed: [...saved.dismissed, id] });
	ctx.redraw();
}

function flight(run){
	const running = run.agents.filter(g => !g.outcome);
	const landed = run.agents.filter(g => g.outcome && today(g.landed_at ?? g.at)).reverse();
	if (!running.length) div.c("v2-quiet", "Nothing in flight.");
	running.forEach(g => div.c("v2-agent", () => {
		span.c("v2-dot v2-building");
		span.c("v2-msg", () => { span.c("v2-strong", g.task); if (g.does) span(" — " + g.does); });
		span.c("v2-time", `${g.model ?? ""} · ${minutes_since(g.at)} min`);
	}));
	landed.forEach(g => details.c("v2-agent v2-done", () => {
		const lead = first_sentence(g.outcome);
		const rest = g.outcome.slice(lead.length).trim();
		summary(() => {
			span.c("v2-dot v2-landed");
			span.c("v2-strong", g.task);
			span.c("v2-msg", lead);
			span.c("v2-time", "landed " + clock(g.landed_at ?? g.at));
		});
		if (rest) div.c("v2-more", rest);
	}));
}

function needs(run){
	const open = [...run.asks, ...run.decisions].filter(x => x.needs?.owner && !x.needs.done)
		.sort((x, y) => (x.needs.minutes ?? 99) - (y.needs.minutes ?? 99));
	if (!open.length) return div.c("v2-quiet", "Nothing is waiting on you.");
	open.forEach(x => div.c("v2-need", () => {
		span.c("v2-min", x.needs.minutes ? x.needs.minutes + " min" : "read");
		span.c("v2-msg", x.needs.owner);
	}));
}

/* Every ask, as one line: a status dot and the conclusion. Open it for what was
   asked, in the owner's words, and the links. Grouped by topic, unfinished
   first — each topic is its own CARD in a wall (not a CSS multi-column flow),
   so a long topic never loses its heading: a grid item cannot split across a
   column the way flowed text could. */
function asks(run){
	const order = { building: 0, open: 1, landed: 2 };
	const topics = new Map();
	for (const ask of run.asks){
		const topic = ask.topic ?? "Other";
		if (!topics.has(topic)) topics.set(topic, []);
		topics.get(topic).push(ask);
	}

	div.c("v2-asks", () => {
		for (const [topic, list] of topics){
			list.sort((x, y) => (order[x.status] ?? 1) - (order[y.status] ?? 1) || String(y.at).localeCompare(String(x.at)));
			const left = list.filter(x => x.status !== "landed").length;
			div.c("v2-topic", () => {
				div.c("v2-head", () => { span(topic); span.c("v2-time", left ? `${left} of ${list.length} unfinished` : `${list.length} landed`); });
				list.forEach(ask => details.c("v2-ask", () => {
					summary(() => { span.c("v2-dot v2-" + (ask.status ?? "open")); span.c("v2-msg", ask.conclusion ?? ask.summary); });
					div.c("v2-more", () => {
						if (ask.conclusion) div(ask.summary);
						if (ask.quote) div.c("v2-quote", "“" + ask.quote + "”");
						div.c("v2-links", () => links_of(ask));
					});
				}));
			});
		}
	});
}

/* The usage line: used% beside elapsed% for the session and the week. */
async function usage($board){
	let data;
	try { data = await (await fetch("/framework/ai/usage.json", { cache: "no-store" })).json(); } catch { return; }
	const u = data?.utilization; if (!u) return;
	const part = (label, w, hours) => {
		if (!w?.resets_at) return "";
		const elapsed = Math.round(100 * (1 - (new Date(w.resets_at) - Date.now()) / (hours * 3600000)));
		return `${label} ${Math.round(w.utilization)}% used · ${Math.min(100, Math.max(0, elapsed))}% of the time gone`;
	};
	const text = [part("session", u.five_hour, 5), part("week", u.seven_day, 168)].filter(Boolean).join("   |   ");
	const fill = () => { const $u = $board.el.querySelector(".v2-usage"); if ($u) $u.textContent = text; };
	fill(); new MutationObserver(fill).observe($board.el, { childList: true });
}
