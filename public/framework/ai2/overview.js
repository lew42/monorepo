import { div, span, small, a, h3, label, input, details, summary } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { when } from "./faces.js";
import { money } from "/framework/ext/AITask/cost.js";

/**
 * THE OVERVIEW — what you asked for, and what was done, one big card per concept
 * (the owner, 2026-09-28, 11 PM: "big simple interfaces with big simple icons and
 * like the important things are big and then the sub things go inside the big
 * ones"; "if you have 100% on 20 items it just gets kind of like visually
 * exhausting, you probably just have a completed section").
 *
 * The data is `overview/overview.json`, built from the task logs by
 * `Server/ai2-overview.mjs`. Concepts arrive in importance order: the first card
 * is drawn bigger, the rest fill a grid. Inside each card: its open asks, one
 * row each, then ONE line, "Completed (n)", that opens to the done ones.
 *
 * Every ask carries a one-line timeline (asked → delivered, how long, cost,
 * outcome): shown on hover, or for every ask at once with the "timeline" box.
 *
 * The four-column overview this replaces is retired (2026-09-28, decided).
 */

const DATA = new URL("./overview/overview.json", import.meta.url).href;
const TIMELINE_KEY = "ai2-ov-timeline";
const store = {
	get: k => { try { return localStorage.getItem(k); } catch { return null; } },
	set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

const hours = h => typeof h !== "number" ? "" : h < 1 ? Math.max(1, Math.round(h * 60)) + " min" : (Math.round(h * 10) / 10) + " h";
// $0 means "not tracked" in the task logs more often than "free", so it is left out.
const usd = n => typeof n === "number" && n > 0 ? money(n) : "";

/** One ask: the owner's own words (to where they were said), a state word, the result. */
function ask(it){
	div.c("ai2-ov-ask", () => {
		div.c("ai2-ov-ask-main", () => {
			const $q = it.words_url ? a.c("ai2-ov-quote").href(it.words_url) : span.c("ai2-ov-quote");
			$q.text("“" + (it.quote || it.task || "…") + "”");
			span.c("ai2-ov-state ai2-ov-state-" + String(it.state || "open").replace(/\W+/g, "-")).text(it.state || "open");
			if (it.result_url) a.c("ai2-ov-result").href(it.result_url).attr("title", "what was made").text("result →");
		});
		// THE TIMELINE STRIP — one small line; ai2.css shows it on hover or when the toggle is on.
		const parts = [
			"asked " + when(it.asked_at) + (it.landed_at ? " → delivered " + when(it.landed_at) : " → not delivered yet"),
			hours(it.hours), usd(it.cost_usd), it.outcome,
		].filter(Boolean);
		const $line = it.result_url ? a.c("ai2-ov-line").href(it.result_url) : small.c("ai2-ov-line");
		// One line, cut with an ellipsis; the whole of it is the tooltip.
		$line.text(parts.join(" · ")).attr("title", parts.join(" · "));
	});
}

const MAX_OPEN = 3;

/** WHAT WAS DONE RECENTLY, readable in ten seconds: "5 in 24 h", asks whose `landed_at` is
 *  within the last 24 hours. Not a calendar "today": the owner looks in the morning, when a
 *  calendar day would read 0 everywhere. Nothing when it is none. (The json keeps the newest
 *  30 done asks, which always holds the last day's.) */
function today_word(c){
	const since = Date.now() - 24 * 60 * 60 * 1000;
	const n = (c.done ?? []).filter(it => it.landed_at && Date.parse(it.landed_at) >= since).length;
	return n ? n + " in 24 h" : "";
}

/** One concept: a big icon, its name, the count and the cost, then its asks. */
function concept(c, first){
	div.c("ai2-ov-card card" + (first ? " ai2-ov-first" : ""), () => {
		a.c("ai2-ov-head").href(c.url || "#").append(() => {
			span.c("ai2-ov-icon", () => icon(c.icon || "category"));
			div.c("ai2-ov-name", () => {
				h3(c.name);
				const done = c.done_count ?? c.done?.length ?? 0;
				small.c("muted").text([`${c.open?.length ?? 0} open · ${done} done`, today_word(c), usd(c.cost_usd)].filter(Boolean).join(" · "));
			});
		});
		// AT MOST THREE OPEN ROWS, so no card grows tall enough to leave a hole in the grid;
		// the rest fold into "More open (n)", just above Completed.
		const open = c.open ?? [];
		if (open.length) div.c("ai2-ov-asks", () => open.slice(0, MAX_OPEN).forEach(ask));
		if (open.length > MAX_OPEN) details.c("ai2-ov-done", () => {
			summary(`More open (${open.length - MAX_OPEN})`);
			div.c("ai2-ov-asks", () => open.slice(MAX_OPEN).forEach(ask));
		});
		const done = c.done ?? [];
		if (done.length) details.c("ai2-ov-done", () => {
			summary([`Completed (${c.done_count ?? done.length})`, today_word(c)].filter(Boolean).join(" · "));
			div.c("ai2-ov-asks", () => done.forEach(ask));
			// the json keeps only the newest done asks; say so rather than let the count disagree
			const more = (c.done_count ?? done.length) - done.length;
			if (more > 0) small.c("muted").text(`the newest ${done.length} shown; ${more} older ones are in the task logs`);
		});
	});
}

export function overview(){
	let $root, $built, $grid;
	$root = div.c("ai2-overview", () => {
		div.c("ai2-ov-top flex v-center gap-50", () => {
			$built = small.c("muted").text("Reading the task logs…");
			label.c("ai2-ov-toggle flex v-center gap-25 muted", () => {
				const $box = input().attr("type", "checkbox");
				$box.el.checked = store.get(TIMELINE_KEY) === "on";
				$root_timeline($box.el.checked);
				$box.on("change", e => { store.set(TIMELINE_KEY, e.target.checked ? "on" : "off"); $root_timeline(e.target.checked); });
				span("timeline");
			});
		});
		$grid = div.c("ai2-ov-grid");
	});
	function $root_timeline(on){ queueMicrotask(() => $root?.el.classList.toggle("ai2-ov-timeline", on)); }

	// ⚠ No DOM after an await: every box is captured above, and filled in the callback.
	fetch(DATA, { cache: "no-store" })
		.then(r => r.ok ? r.json() : Promise.reject(new Error(r.status + "")))
		.then(data => {
			$built.text("Built " + when(data.built_at) + " from the task logs" + (data.unfiled ? " · " + data.unfiled + " not filed" : ""));
			$grid.empty(() => (data.concepts ?? []).forEach((c, i) => concept(c, i === 0)));
		})
		.catch(() => $built.text("The overview has not been built yet (Server/ai2-overview.mjs)."));
	return $root;
}

export default overview;
