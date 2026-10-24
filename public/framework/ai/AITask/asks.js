import { div, span, p, a, img, button, blockquote } from "../../core/View/View.js";
import md from "../../ext/markdown/md.js";
import { TaskJSONL } from "../../ext/JSONL/JSONL.js";
import { warm } from "./dashboard.js";
import { fold } from "./message.js";
import { shot_thumb } from "./shots.js";
import { state } from "./stats.js";
import { links_row, web_url } from "./card.js";
import { needs_of, needs_strip } from "./needs.js";
import { Ranking } from "./rank.js";
import { reply, dictate } from "../../ext/Ask/reply.js";

// History and reasons: doc/asks-notes.md
// The data is ext/JSONL's `ask` verb, written into the run's own task.jsonl.

const ACRONYM = { ai: "AI", ui: "UI", ux: "UX", css: "CSS", js: "JS", cli: "CLI", api: "API" };

/** `ai-log-click-through` → `AI log click through`. A title, from the id the writer chose. */
export const ask_title = ask => ask.title ?? (ask.id ?? "")
	.split("-")
	.map((w, i) => ACRONYM[w] ?? (i === 0 ? w[0]?.toUpperCase() + w.slice(1) : w))
	.join(" ");

// Title from conclusion (if weighed) or ask_title(); see doc/asks-notes.md.
export const card_title = ask => ask.conclusion ?? ask_title(ask);

/** How many of the tasks serving this ask have landed, out of how many there are. */
const tally = (ask, found) => {
	const rows = (ask.tasks ?? []).map(slug => found.get(slug)).filter(Boolean);
	return { done: rows.filter(m => m.landed_at).length, total: ask.tasks?.length ?? 0 };
};

// Report: done/total tasks landed (see doc/asks-notes.md).
function report_line(ask, found){
	const { done, total } = tally(ask, found);
	if (!total) return "no task yet";
	return `${done} of ${total} task${total === 1 ? "" : "s"} landed`;
}

// Decision filter (keyword); misses go to fold at bottom (see doc/asks-notes.md).
const DECISION = /\b(decid|decision|chose|chosen|verdict|instead|rather than|rejected|dropped|trade-?off|because|why)\b/i;
const decisions = m => (m?.logs ?? []).filter(l => DECISION.test(l.msg ?? ""));

/* How many decision lines the sheet shows before the rest joins the fold. */
const SHOWN = 6;

// ⚠ Headline must go through md() (see doc/asks-notes.md).
const headline = s => (s ?? "").trim().split("\n")[0].replace(/^#+\s*/, "");

/** The first picture a task embedded in its own landing report, if it embedded one. */
const first_image = s => s?.match(/!\[[^\]]*\]\(\s*([^)\s]+)/)?.[1];

// Rewrite task-relative image/link paths to run-relative (see doc/asks-notes.md).
function relative_to($view, dir){
	$view?.el?.querySelectorAll("img[src], a[href]").forEach(el => {
		const attr = el.tagName === "IMG" ? "src" : "href";
		const raw = el.getAttribute(attr);
		if (raw && !/^([a-z]+:|[/#])/i.test(raw)) el.setAttribute(attr, dir + raw);
	});
	return $view;
}

/* ── the tab ───────────────────────────────────────────────────────────────── */

/**
 * @param m         the run's own manifest (a TaskJSONL carrying `asks`)
 * @param base      this task's dir url, e.g. `/framework/ai/2026-09-17/run/`
 * @param to_prompt (uuid) => void — opens the Session tab at that message
 */
export function asks(m, base, to_prompt, redraw){
	const day = base.replace(/[^/]+\/$/, "");
	const date = day.split("/").filter(Boolean).at(-1);

	const rank = new Ranking({ m, list: "asks", redraw });
	const topic_rank = new Ranking({ m, list: "topics", redraw, id: t => t });
	const fold_at = m.fold("asks");

	return div.c("ai-asks-tab flow", async $tab => {
		const found = await serving(m.asks, day, date);
		// ⚠ No DOM after the await (see doc/asks-notes.md).
		$tab.append(() => {
			// Dictation box — talk and the wall fills in (ext/Ask/reply.js).
			dictate({ m, about: { kind: "dictation", id: "asks" } });

			// Needs (things blocking this run).
			needs_strip(needs_of(m, base));

			const sheets = [];
			summary(m.asks, found);

			// Drop zone for band headers; cards have their own drop zones.
			const topic_band = topic_rank.band($tab);

			groups(m.asks, topic_rank).forEach(([topic, group]) => {
				if (topic) heading(topic, group, topic_band);
				let $detail;
				// Detail sheet slots under clicked card (see doc/asks-notes.md).
				div.c("ai-asks", $wall => {
					// Each topic band is its own drop zone (rank within, not across).
					const band = rank.band($wall);
					const sorted = rank.sort(group);
					const cut = fold_at && sorted.length > fold_at ? fold_at : sorted.length;
					sorted.forEach((ask, i) =>
						card(ask, m, found, base, to_prompt, () => $detail, sheets, band, i >= cut));
					if (cut < sorted.length) fold_toggle($wall, sorted.length - cut);
					$detail = div.c("ai-ask-detail");
				});
				sheets.push(() => $detail);
			});
		});
	});
}

// Group asks by topic; "Other" is last catch-all; see doc/asks-notes.md.
function groups(asks, topic_rank){
	const order = [];
	const by = new Map();

	asks.forEach(ask => {
		const topic = ask.topic || "Other";
		if (!by.has(topic)){ by.set(topic, []); order.push(topic); }
		by.get(topic).push(ask);
	});

	const named = order.filter(t => t !== "Other");
	const sorted = topic_rank ? topic_rank.sort(named) : named;
	const all = by.has("Other") ? [...sorted, "Other"] : sorted;
	return all.map(topic => [named.length ? topic : null, by.get(topic)]);
}

// Count landed/building/open for band heading (see doc/asks-notes.md).
function band_counts(list){
	const landed = list.filter(a => a.status === "landed").length;
	const building = list.filter(a => a.status === "building").length;
	return `${landed} landed · ${building} building · ${list.length - landed - building} open`;
}

// Band heading: name, counts, grip for reordering (see doc/asks-notes.md).
function heading(topic, list, band){
	div.c("ai-asks-topic flex split v-baseline wrap", $h => {
		band?.grip($h, topic);
		span.c("ai-group-title", topic);
		span.c("muted", band_counts(list));
	});
}

// "N more" toggle (CSS hides folded cards; grips keep working) (see doc/asks-notes.md).
function fold_toggle($wall, n){
	const $bar = div.c("ai-asks-fold-toggle", `${n} more`);
	$bar.on("click", () => {
		const open = $wall.el.classList.toggle("show-folded");
		$bar.text(open ? "show fewer" : `${n} more`);
	});
}

// Serving tasks' manifests by slug (see doc/asks-notes.md).
async function serving(asks, day, date){
	const slugs = [...new Set(asks.flatMap(a => a.tasks ?? []))];
	const known = warm(date).value;          // the day's directory listing, if it has landed
	const found = new Map();
	await Promise.all(slugs.map(async slug => {
		if (known && !known[slug]?.includes("task.jsonl")) return;
		const t = new TaskJSONL({ url: day + slug + "/task.jsonl" });
		await t.load();
		if (t.loaded) found.set(slug, t);
	}));
	return found;
}

// Summary line: what the wall is (see doc/asks-notes.md).
function summary(asks, found){
	div.c("ai-asks-head flex split v-baseline wrap", () => {
		span.c("ai-group-title muted", `${asks.length} things you asked for`);
		span.c("muted", `conclusions first · ${band_counts(asks)}`);
	});
}

/* ── one card ──────────────────────────────────────────────────────────────── */

function card(ask, m, found, base, to_prompt, detail_of, sheets, band, folded){
	div.c("ai-ask surface" + (folded ? " ai-ask-folded" : ""), $card => {
		// Grip (with dev server); summary shows only if no conclusion (see doc/asks-notes.md).
		band?.grip($card, ask.id);
		if (ask.needs?.owner) span.c("ai-ask-needs", `needs you · ${ask.needs.minutes ?? "?"} min`);
		div.c("ai-ask-title", card_title(ask));
		if (!ask.conclusion) p.c("ai-ask-line", ask.summary ?? "");
		picture(ask, found, base);

		div.c("ai-ask-foot flex wrap v-center", () => {
			span.c("ai-ask-status").ac(ask.status ?? "open").text(ask.status ?? "open");
			// Minutes only shown when > glance (estimate, not state) (see doc/asks-notes.md).
			if (ask.minutes) span.c("muted", `~${ask.minutes} min`);
			span.c("muted", report_line(ask, found));
		});

		// Two links max (owner's budget); rest in sheet below (see doc/asks-notes.md).
		div.c("ai-ask-links flex wrap v-center", () => {
			const seen = new Set();
			const add = (label, href, on_click) => {
				if (!href || seen.has(href)) return;
				seen.add(href);
				link(label, href, on_click);
			};
			if (ask.prompt) add("the prompt", base + "?m=" + ask.prompt, e => {
				e.preventDefault();
				to_prompt(ask.prompt);
			});
			(ask.tasks ?? []).slice(0, 2).forEach(slug => add(slug, task_url(base, slug)));
			deliverable(ask, found, add, seen);
		});

		// Reply to ask directly; stops clicks to avoid opening sheet (see doc/asks-notes.md).
		reply({ m, about: { kind: "ask", id: ask.id, summary: ask.summary,
			quote: ask.quote, status: ask.status, topic: ask.topic, tasks: ask.tasks } });

		$card.on("click", () => open(ask, found, base, $card, detail_of(), sheets));
	});
}

const task_url = (base, slug) => base.replace(/[^/]+\/$/, "") + slug + "/";

// Pill label: cut at clause break, keep identifier part (see doc/asks-notes.md).
const short = (s, n = 22) => { s = String(s ?? ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const pill_label = s => {
	s = String(s ?? "").trim();
	const head = s.split(/\s+[·•—–:,;(-]\s*/)[0].trim() || s;
	if (head.length <= 22) return head;
	// Clip path from end (last 2 segments) (see doc/asks-notes.md).
	const tail = head.split("/").filter(Boolean).slice(-2).join("/");
	return short(tail.length < head.length && tail.length <= 22 ? tail : head);
};

// Sheet link: whole label, clipped by CSS at 24em (see doc/asks-notes.md).
const sheet_link = (label, href) =>
	a.c("ai-link", String(label ?? href)).href(href).attr("title", label);

// Card link: stopPropagation (card body is click target) (see doc/asks-notes.md).
function link(label, href, on_click){
	return a.c("ai-link", pill_label(label)).href(href).attr("title", label).on("click", e => {
		e.stopPropagation();
		on_click?.(e);
	});
}

// One deliverable (not all): card height; first unseen URL (see doc/asks-notes.md).
function deliverable(ask, found, add, seen){
	const all = [...(ask.links ?? []), ...(ask.tasks ?? []).flatMap(slug => found.get(slug)?.links ?? [])];
	// ⚠ URL must be reachable (web_url check); sheet shows all (see doc/asks-notes.md).
	const first = all.find(l => l?.url && web_url(l.url) && !seen.has(l.url));
	if (first) add(first.label ?? first.url, first.url);
}

// Card preview: logged shot first, else first task screenshot (see doc/asks-notes.md).
function picture(ask, found, base){
	const rows = (ask.tasks ?? []).map(slug => [slug, found.get(slug)]).filter(([, m]) => m);
	const holder = rows.filter(([, m]) => m.landed_at && m.shots?.length).at(-1), shot = holder?.[1].shots.at(-1);
	// the task's own folder, so a shot path relative to it resolves (serving() loads each task at day + slug)
	if (shot) return div.c("ai-ask-shot", () => { shot_thumb(shot, base.replace(/[^/]+\/$/, "") + holder[0] + "/"); });

	for (const [slug, m] of rows){
		const src = first_image(m.outcome);
		if (!src) continue;
		const url = /^([a-z]+:|[/#])/i.test(src) ? src : task_url(base, slug) + src;
		return div.c("ai-ask-pic", () => {
			img.c("ai-ask-img").attr("src", url).attr("loading", "lazy")
				.attr("alt", "what " + slug + " shipped");
		});
	}
}

// Sheet opens under card; toggle to close (see doc/asks-notes.md).
function open(ask, found, base, $card, $detail, sheets){
	const was = $card.el.classList.contains("active");
	close_all(sheets);
	if (was) return;

	$card.el.classList.add("active");
	row_end($card.el).after($detail.el);
	$detail.empty(() => detail(ask, found, base, sheets));

	// Scroll only if card off-screen or on fold (see doc/asks-notes.md).
	const r = $card.el.getBoundingClientRect();
	if (r.top < 0 || r.bottom > innerHeight - 120)
		$card.el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Last card in row (sheet goes after it, full-width) (see doc/asks-notes.md).
function row_end(el){
	const row = Math.round(el.offsetTop);
	const peers = [...el.parentElement.children]
		.filter(c => c.classList.contains("ai-ask") && Math.round(c.offsetTop) === row);
	return peers.at(-1) ?? el;
}

// Every group has own sheet; sweep to close all (see doc/asks-notes.md).
function close_all(sheets){
	const root = sheets[0]?.().el.closest(".ai-asks-tab");
	root?.querySelectorAll(".ai-ask.active").forEach(el => el.classList.remove("active"));
	sheets.forEach(get => get().empty());
}

function detail(ask, found, base, sheets){
	div.c("ai-ask-sheet surface flow", () => {
		div.c("flex split v-baseline gap wrap", () => {
			div.c("ai-ask-title", card_title(ask));
			button.c("ai-ask-close", "close").on("click", () => close_all(sheets));
		});

		// Summary (moved from title when conclusion taken); owner's drill-down order (see doc/asks-notes.md).
		if (ask.conclusion && ask.summary) div.c("ai-ask-asked", () => {
			span.c("ai-group-title", "you asked");
			p(ask.summary);
		});

		if (ask.quote) blockquote.c("ai-ask-quote", () => { md(ask.quote); });
		if (ask.links?.length) div.c("ai-ask-links flex wrap v-center", () =>
			ask.links.forEach(l => sheet_link(l.label ?? l.url, l.url)));

		(ask.tasks ?? []).forEach(slug => task_section(slug, found.get(slug), base));
		if (!ask.tasks?.length) p.c("muted", "Nothing has been dispatched for this one yet.");
	});
}

// ⚠ Level 2: decision lines only (fold shows report); avoids 8000px sheets (see doc/asks-notes.md).
function task_section(slug, m, base){
	const dir = task_url(base, slug);
	div.c("ai-ask-task flow", () => {
		div.c("flex gap wrap v-baseline", () => {
			a.c("ai-ask-task-name", slug).href(dir);
			span.c("muted", m ? state(m) : "no log yet");
		});

		if (!m) return;
		const head = headline(m.outcome) || m.now;
		if (head) relative_to(p.c("ai-ask-head").md(head), dir);
		links_row(m);

		const logs = m.logs ?? [];
		const shown = decisions(m).slice(0, SHOWN);
		if (shown.length) div.c("ai-ask-weighed", () => shown.forEach(l => p.c("ai-ask-decision", l.msg)));
		else if (logs.length) p.c("muted", "No line in this task's log reads as a decision.");

		const rest = logs.filter(l => !shown.includes(l));
		if (m.outcome || rest.length) fold(more_label(m, rest), () => {
			if (m.outcome) relative_to(md(m.outcome), dir);
			rest.forEach(l => p.c("muted", l.msg));
		});
	});
}

/* A fold says what it hides, in the reader's words, not "more". */
const more_label = (m, rest) => [
	m.outcome && "the full report",
	rest.length && `${rest.length} more log line${rest.length === 1 ? "" : "s"}`,
].filter(Boolean).join(" · ");

export default asks;
