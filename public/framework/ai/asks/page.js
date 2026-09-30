import { Page, View, div, p, span, small, a, details, summary } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { page_work_strip } from "/framework/core/Page/ai/work.js";
import { fold_asks } from "./fold.js";

View.stylesheet(import.meta, "asks.css");

/**
 * THE ASKS LEDGER'S OWN PAGE — every ask the owner made, who owns it, and whether it landed
 * (the owner, 2026-09-30: "a lot of tasks are getting kind of left in limbo"). The ledger
 * itself, `public/framework/ai/asks.jsonl`, is written by the owner's own VS Code tab the
 * moment an ask is routed, and by Servex's `Asks` (`Servex/asks/Asks.js`) every time an ask's
 * status changes — this page only ever READS it, through `fold_asks` (`./fold.js`), the one
 * vocabulary every reader of the ledger already agrees on.
 *
 * One group per status, stalled first (the ones that need a look), newest first inside each. A click
 * on a count filters to that one status — the url (`?status=`) is the whole state, so a
 * reload or a pasted link lands on the same filtered view.
 */

const ASKS_URL = "/framework/ai/asks.jsonl";
const GROUP_ORDER = ["stalled", "building", "routed", "queued", "parked", "landed", "dropped"];
const GROUP_LABEL = { stalled: "Stalled", building: "Building", routed: "Routed", queued: "Queued", parked: "Parked", landed: "Landed", dropped: "Dropped" };
const GROUP_ICON = { stalled: "hourglass_disabled", building: "construction", routed: "call_split", queued: "schedule", parked: "local_parking", landed: "task_alt", dropped: "cancel" };

const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "");
const parse_lines = text => String(text ?? "").split(/\r?\n/).filter(l => l.trim())
	.map(l => { try { return JSON.parse(l); } catch { return null; } });

function hours_since(at){
	const t = at ? Date.parse(at) : NaN;
	return Number.isFinite(t) ? Math.max(0, (Date.now() - t) / 3600000) : NaN;
}

/** A plain "3.2 h ago" / "2 d ago" — the same words `needs.js`'s own stalled rows use. */
function age_words(at){
	const h = hours_since(at);
	if (!Number.isFinite(h)) return "";
	if (h < 1) return Math.round(h * 60) + " min ago";
	if (h < 48) return h.toFixed(1) + " h ago";
	return Math.round(h / 24) + " d ago";
}

/** A ledger path ("ai/2026-09-30/x/owner-words.md") as a served url — or `null` when it
 *  isn't served at all (`.claude/prompts/...`), shown as plain text next to the row instead. */
function words_url(words){
	if (!words || words.startsWith(".claude/")) return null;
	return "/framework/" + String(words).replace(/^\/+/, "");
}

function count_strip($box, asks, status){
	$box.empty(() => {
		GROUP_ORDER.forEach(g => {
			const n = asks.filter(x => x.status === g).length;
			const on = g === status;
			a.c("asks-count-chip" + (on ? " on" : "")).href(on ? location.pathname : "?status=" + g)
				.text(GROUP_LABEL[g] + " " + n)
				.click(e => { e.preventDefault(); set_status(on ? null : g); });
		});
	});
}

function groups_box($box, asks, status){
	$box.empty(() => {
		GROUP_ORDER.filter(g => !status || g === status).forEach(g => {
			const rows = asks.filter(x => x.status === g)
				.sort((x, y) => Date.parse(y.status_at ?? y.at ?? 0) - Date.parse(x.status_at ?? x.at ?? 0));
			if (!rows.length) return;
			div.c("asks-group", () => {
				div.c("asks-group-head flex v-center gap-25", () => {
					icon(GROUP_ICON[g]);
					span.c("asks-group-title").text(GROUP_LABEL[g] + " (" + rows.length + ")");
				});
				rows.forEach(ask => ask_row(ask));
			});
		});
		if (!asks.length) small.c("muted").text("No asks in the ledger yet.");
	});
}

function ask_row(ask){
	const words = words_url(ask.words);
	div.c("asks-row card pad", () => {
		div.c("asks-row-head flex v-center gap-25", () => {
			span.c("asks-row-title").text(ask.title || "Untitled ask");
			small.c("asks-row-age muted").text(age_words(ask.status_at ?? ask.at));
		});
		div.c("asks-row-meta flex wrap gap-25 muted", () => {
			small.c("asks-row-owner").text("owner " + (ask.owner || "—"));
			if (ask.card) a.c("page-link").href("/framework/ai2/" + ask.card + "/").text("card");
			if (words) a.c("page-link").href(words).text("words");
			else if (ask.words) small.c("asks-row-owner").text(ask.words);
		});
		if (ask.status === "stalled" && ask.why) small.c("asks-row-why muted").text(ask.why);
		if (ask.history?.length > 1) details.c("asks-row-history", () => {
			summary.c("muted").text(ask.history.length + " updates");
			ask.history.forEach(h => {
				div.c("asks-row-hist-line muted").text([h.status, h.by, h.at, h.why].filter(Boolean).join(" · "));
			});
		});
	});
}

let set_status = () => {};

export default new Page({
	meta: import.meta,
	title: "Asks",
	icon: "inbox",
	description: "Every ask you made, who owns it, and whether it landed.",
	leaf: true,

	async content(){
		p("Every ask you made, who owns it, and whether it landed.");

		const $count = div.c("asks-count flex wrap gap-25");
		const $groups = div.c("asks-groups wide wall");
		$groups.style("--column", "22em");
		div.c("card pad", $box => page_work_strip($box, { match: ["ask", "stalled", "ledger"], page: this }));

		const text = await read_text(ASKS_URL);
		const asks = Object.values(fold_asks(parse_lines(text)));

		set_status = status => {
			const url = new URL(location.href);
			status ? url.searchParams.set("status", status) : url.searchParams.delete("status");
			history.pushState({}, "", url);
			count_strip($count, asks, status);
			groups_box($groups, asks, status);
		};

		const status = new URLSearchParams(location.search).get("status");
		count_strip($count, asks, status);
		groups_box($groups, asks, status);
		addEventListener("popstate", () => {
			const s = new URLSearchParams(location.search).get("status");
			count_strip($count, asks, s);
			groups_box($groups, asks, s);
		});
	},
});
