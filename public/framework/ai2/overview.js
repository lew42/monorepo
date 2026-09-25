import { div, span, small, a, button, p } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { servex_base, say, author_word } from "./inbox.js";
import { clock } from "./faces.js";
import { task_words } from "./groups.js";

/**
 * THE OVERVIEW — four columns by importance, not one feed by time (the owner,
 * 2026-09-23 00:25: *"where would you put a report? We have so many dashboards
 * that no matter where you put it, it gets buried: new items push old ones
 * down."*). This is the front door at `/framework/ai2/`; the rail + a card's
 * own page (`page.js`'s `board()`) is the SECOND view, shown the moment any
 * card becomes active — `ai2.css`'s own `:has()` decides which one is on
 * screen, so this file never has to know or ask.
 *
 * Four lists, narrowest concern first: **needs-you** (flagged or blocked —
 * collapses to nothing when empty), **reports** (the mastermind's `Note:`
 * cards and landed write-ups, newest first), **landed** (every other landing,
 * one line each), **live** (Servex's own agent registry, the three usage
 * windows, the last few stream events). `column()` below is the one piece of
 * behaviour all four share: a new arrival never reorders what is already on
 * screen — it waits behind a small pill, the same rule the rail itself uses,
 * because a report you are mid-reading must not slide out from under you
 * either.
 */

const DISMISSED_KEY = "ai2-ov-dismissed";
const dismissed = () => new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
const dismiss = id => {
	const set = dismissed();
	set.add(id);
	localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
};

/** One column: a title, a count, a pill for what is waiting, and a stable
 *  list of rows. `render(it)` draws one row's own content; the row itself —
 *  the clear control, the waiting/quiet mechanism — is this function's job,
 *  the same split `page.js`'s rail keeps between `row()` and `board()`. */
function column(cls, title){
	let $col, $count, $pill, $rows, $empty;
	let hovering = false;
	const rows = new Map();     // id -> { $row, sig, render }
	const waiting = new Map();  // id -> item, held back until the column is quiet
	let shown = [];

	$col = div.c("ai2-ov-col " + cls, () => {
		div.c("ai2-ov-head flex v-center gap-25", () => {
			span.c("ai2-ov-title").text(title);
			$count = span.c("ai2-ov-count muted");
		});
		div.c("ai2-ov-body", () => {
			$pill = button.c("ai2-ov-pill").attr("type", "button").click(() => flush(true));
			$rows = div.c("ai2-ov-rows");
			$empty = small.c("ai2-ov-empty muted").text("nothing here");
		});
	});
	$rows.on("pointerenter", () => { hovering = true; });
	$rows.on("pointerleave", () => { hovering = false; });

	const quiet = () => $rows.el.scrollTop <= 2 && !hovering;

	function pill(){
		$pill.el.classList.toggle("on", waiting.size > 0);
		if (waiting.size) $pill.text(waiting.size + " more ↑");
	}

	function flush(to_top){
		waiting.forEach((it, id) => rows.set(id, { sig: null, render: it }));
		waiting.clear();
		shown = [...rows.keys()];
		pill();
		if (to_top) $rows.el.scrollTo({ top: 0 });
		draw();
	}

	function draw(){
		shown.forEach(id => {
			const rec = rows.get(id);
			const sig = JSON.stringify(rec.render);
			if (rec.sig === sig) return;
			rec.sig = sig;
			/* ⚠ Built INSIDE `$rows`, never bare: a bare `div.c(...)` goes to whatever is
			   being built right now — during the first paint that is this column, but a
			   stream event later lands in no builder at all, and the framework's
			   fallback is the site-wide `.pages`. Live, 2026-09-23 12:40: dozens of
			   `.ai2-ov-row`s beside the framework page in that row-flex box, the
			   framework page squeezed to 0px wide, the whole AI 2 screen gone. The
			   `isConnected` check then saw a connected row and never moved it. */
			if (!rec.$row) $rows.append(() => { rec.$row = div.c("ai2-ov-row"); });
			rec.$row.empty(() => renderers.get(cls)(rec.render));
		});
	}

	/** `list` is the WHOLE current set for this column, in the order it should
	 *  read once shown — newest first for reports/landed, whatever `set()`'s
	 *  caller decided otherwise. Anything not already on screen waits. */
	function set(list){
		const ids = new Set(list.map(it => it.id));
		rows.forEach((rec, id) => { if (!ids.has(id) && !waiting.has(id)){ rec.$row?.el.remove(); rows.delete(id); } });
		list.forEach(it => { if (!rows.has(it.id)) waiting.set(it.id, it); else rows.get(it.id).render = it; });

		if (quiet()) flush();
		else { draw(); pill(); }

		const n = rows.size + waiting.size;
		$count.text(String(n));
		$col.el.classList.toggle("ai2-ov-collapsed", n === 0);
		$empty.el.hidden = n > 0;
	}

	return { $col, set };
}

/* ── one row per kind ───────────────────────────────────────────────────── */

const clear_btn = (label, fn) => button.c("ai2-ov-clear").attr("type", "button").attr("title", label).text("✕").click(fn);

function needs_you_row(it){
	a.c("ai2-ov-link page-link").href(it.url).append(() => {
		if (it.icon) icon(it.icon);
		span.c("ai2-ov-row-title").text(it.title);
	});
	small.c("ai2-ov-row-line muted").text(it.line);
	clear_btn(it.flagged ? "withdraw the flag" : "dismiss", () => {
		if (it.flagged) say(it.id, "reopen");
		else dismiss(it.id);
		it.on_clear?.();
	});
}

function report_row(it){
	a.c("ai2-ov-link page-link").href(it.url).append(() => {
		if (it.icon) icon(it.icon);
		span.c("ai2-ov-row-title").text(it.title);
		small.c("ai2-ov-row-when muted").text(clock(it.at));
	});
	if (it.line) small.c("ai2-ov-row-line muted").text(it.line);
}

function landed_row(it){
	a.c("ai2-ov-link page-link").href(it.url).append(() => {
		icon("task_alt");
		span.c("ai2-ov-row-title").text(it.title);
		small.c("ai2-ov-row-when muted").text(clock(it.at));
	});
	if (it.line) small.c("ai2-ov-row-line muted").text(it.line);
}

function live_row(it){
	span.c("ai2-ov-row-title").text(it.title);
	small.c("ai2-ov-row-line muted").text(it.line);
}

const renderers = new Map([
	["ai2-ov-needs", needs_you_row],
	["ai2-ov-reports", report_row],
	["ai2-ov-landed", landed_row],
	["ai2-ov-live", live_row],
]);

/* ── the live column's own sources: agents, usage, the stream ───────────── */

/** The registry (`GET /agents`, cors-enabled for the site's own origin —
 *  `/api/agents` is not, and a cross-origin fetch to it is silently refused
 *  by the browser before Servex ever answers). Polled — there is no per-agent
 *  push on this wire the way a log append has one. */
async function agents_now(base){
	try {
		const list = await (await fetch(`${base}/agents`)).json();
		return Array.isArray(list) ? list : [];
	} catch { return []; }
}

/** `/framework/ai/usage.json` — the mastermind's own snapshot, refreshed on
 *  its own cadence (`check-claude-usage`); this page only ever reads it. */
export async function usage_bars(){
	try {
		const data = await (await fetch("/framework/ai/usage.json")).json();
		return (data?.utilization?.limits ?? []).filter(l => l.kind !== "weekly_scoped" || l.percent > 0)
			.slice(0, 3).map(l => ({ kind: l.kind, percent: l.percent, severity: l.severity }));
	} catch { return []; }
}

/** The last few `agent` events, straight off the same `EventSource` `inbox.js`
 *  already opens for `prompts`/`cards/<slug>` — a second listener on the SAME
 *  connection (SSE fans a frame out to every listener; `inbox.js`'s own
 *  `demux()` only ever subscribes to `"log"` frames, so `"agent"` frames pass
 *  through untouched until something else listens for them, here). */
function agent_feed(base, on_event){
	let source;
	try { source = new EventSource(`${base}/api/stream`); }
	catch { return () => {}; }
	const handler = msg => { try { on_event(JSON.parse(msg.data)); } catch {} };
	source.addEventListener("agent", handler);
	source.onerror = () => {};
	return () => source.close();
}

export function usage_bar(l){
	div.c("ai2-ov-usage-row", () => {
		small.c("ai2-ov-usage-label muted").text(l.kind.replace("_", " "));
		div.c("ai2-ov-usage-track", () => {
			div.c("ai2-ov-usage-fill" + (l.severity === "critical" ? " ai2-ov-usage-critical" : "")).style({ width: Math.min(100, l.percent) + "%" });
		});
		small.c("ai2-ov-usage-pct muted").text(l.percent + "%");
	});
}

/* ── the whole overview ───────────────────────────────────────────────────── */

export function overview(page, ai2){
	let $ov, $groups, $live_agents, $live_usage, $live_stream;
	const stream_lines = [];   // last few agent events, newest last, capped
	let needs, reports, landed;

	/* ⚠ NO `bleed` (2026-09-24). `.page > .bleed` pays the page's gutter back
	   with a NEGATIVE margin (core/Page/Page.css), but this page has no gutter —
	   its padding is 0 — so the payback pulled the whole overview 42px (1280) to
	   67px (1920) under the site's nav sidebar and off the right edge. The page
	   is a flex column now (ai2.css), so no track word is needed at all. */
	$ov = div.c("ai2-overview", () => {
		// The one small head line: the way back. A real link to the inbox, which
		// is AI 2's own address — never a class flipped in place (the owner,
		// 2026-09-23). It replaces the page's own giant "Overview" h1.
		div.c("ai2-ov-top flex v-center wrap gap-50", () => {
			a.c("ai2-ov-open page-link").href(page.url).text("← Open the inbox");
			$groups = div.c("ai2-ov-groups flex v-center wrap gap-35");
		});
		div.c("ai2-ov-cols", () => {
			// ⚠ Built HERE, inside this callback, not before it — `column()`'s own
			// `div.c(...)` calls auto-append to whatever the CURRENT CAPTOR is at
			// the moment they run, so building the columns before this callback
			// starts would land them in the page's own content region instead of
			// inside `.ai2-ov-cols`.
			needs = column("ai2-ov-needs", "Needs you");
			reports = column("ai2-ov-reports", "Reports");
			landed = column("ai2-ov-landed", "Landed");
			div.c("ai2-ov-col ai2-ov-live", () => {
				div.c("ai2-ov-head flex v-center gap-25", () => {
					span.c("ai2-ov-title").text("Live");
				});
				div.c("ai2-ov-body", () => {
					$live_agents = div.c("ai2-ov-rows ai2-ov-agents");
					$live_usage = div.c("ai2-ov-usage");
					$live_stream = div.c("ai2-ov-stream-feed");
				});
			});
		});
	});

	/* The groups: one chip each, a link to the group's own card. */
	fetch(new URL("./groups.json", import.meta.url)).then(r => r.json()).then(gs => {
		$groups.empty(() => gs.forEach(g => a.c("ai2-ov-group page-link").href(page.url + g.card + "/").attr("title", g.about).append(() => {
			if (g.icon) icon(g.icon);
			span.c("ai2-ov-group-name").text(g.name);
		})));
	}).catch(() => {});

	/* ── needs-you + reports + landed, off the SAME list the rail already
	   computes — one data pipeline, two views (`page.js`'s `board()` calls
	   every registered watcher on each paint via `ai2.on_list()`). */
	let last_list = [], list_landed = [], task_landed = [];

	/* Landed = today's landing lines PLUS the task records that landed (today and
	   yesterday), newest first — the task records are what fills it on a quiet day. */
	function refresh_landed(){
		const seen = new Set(), all = [];
		[...list_landed, ...task_landed].forEach(it => { if (!seen.has(it.url)){ seen.add(it.url); all.push(it); } });
		landed.set(all.sort((a, b) => Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0)).slice(0, 40));
	}
	ai2.on_tasks?.(ts => {
		task_landed = ts.filter(m => m.landed_at && m.outcome).map(m => {
			const w = task_words(m), key = m.date + "/" + m.slug;
			return { id: "task-" + key, url: "/framework/ai/" + key + "/", title: w.title, line: m.member_of ?? "", at: m.landed_at };
		});
		refresh_landed();
	});

	function refresh_needs(){
		const dis = dismissed();
		const flagged = last_list.filter(it => it.flag && !dis.has(it.id));
		const blocked = last_list.filter(it => it.task?.state === "blocked" && !it.flag && !dis.has(it.id));

		needs.set([...flagged, ...blocked].map(it => ({
			id: it.id, url: page.url + it.id + "/", icon: it.icon,
			title: it.title, flagged: !!it.flag,
			line: it.flag ? "flagged" + (it.flag.note ? " — " + it.flag.note : "") : "blocked — " + (it.task?.now ?? it.task?.title ?? ""),
			at: it.at,
			// A plain dismiss (a blocked item with no flag) is local-only and
			// nothing repaints the list on its own — re-filter right here.
			on_clear: () => { if (!it.flag) refresh_needs(); },
		})));
	}

	ai2.on_list(list => {
		last_list = list;
		refresh_needs();

		reports.set(list.filter(it => it.kind === "note").map(it => ({
			id: it.id, url: page.url + it.id + "/", icon: it.icon ?? "sticky_note_2",
			title: it.title, line: it.text || it.landed || "", at: it.at,
		})).sort((a, b) => Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0)));

		list_landed = list.filter(it => it.landed).map(it => ({
			id: it.id, url: it.links?.[0]?.url ?? (page.url + it.id + "/"),
			title: it.title === it.id ? it.id : it.title, line: it.landed, at: it.at,
		}));
		refresh_landed();
	});

	/* ── live: agents (polled), usage (polled), the stream (pushed) ────── */
	async function refresh_live(){
		const base = servex_base();
		const list = await agents_now(base);
		/* Dead and test agents are noise: only the ones alive are rows, the rest are one folded count. */
		const dead = a2 => a2.state === "stopped" || a2.state === "gone";
		const alive = list.filter(a2 => !dead(a2)), gone = list.length - alive.length;
		$live_agents.empty(() => {
			if (!alive.length) small.c("muted").text("nothing running");
			alive.forEach(a2 => {
				div.c("ai2-ov-row", () => {
					span.c("ai2-ov-row-title").text(a2.name || a2.role || a2.id);
					small.c("ai2-ov-row-line muted").text([a2.state, a2.topics].filter(Boolean).join(" — "));
				});
			});
			if (gone) small.c("ai2-ov-folded muted").text(gone + " stopped or finished agents, not shown");
		});

		const bars = await usage_bars();
		$live_usage.empty(() => bars.forEach(usage_bar));
	}
	refresh_live();
	const usage_timer = setInterval(refresh_live, 20000);

	function draw_stream(){
		$live_stream.empty(() => {
			stream_lines.slice(-6).reverse().forEach(line => {
				small.c("ai2-ov-stream-line muted").text(line);
			});
		});
	}
	const stop_agent_feed = agent_feed(servex_base(), event => {
		const who = author_word(event.agent ?? "agent");
		const what = event.type === "result" ? "finished" : event.type === "error" ? "error" : event.type;
		stream_lines.push(`${who}: ${what}`);
		if (stream_lines.length > 20) stream_lines.splice(0, stream_lines.length - 20);
		draw_stream();
	});
	draw_stream();

	return {
		$ov,
		stop(){ clearInterval(usage_timer); stop_agent_feed(); },
	};
}

export default overview;
