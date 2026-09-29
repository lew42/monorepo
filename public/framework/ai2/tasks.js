import { div, p, pre, button, details, summary, section, span, small, a } from "/framework/core/View/View.js";
import { icon } from "/framework/core/View/View.js";
import { when } from "./faces.js";
import { plain, headline } from "./inbox.js";
import { money, cost_of } from "/framework/ext/AITask/cost.js";

/**
 * A CARD'S DETAIL IS THE REAL TASK PAGE (the owner, 2026-09-24: "When I click a
 * card to see the detail page, the information is about the same as the
 * preview, plus a link to the task page. I want these to be the actual task
 * page data. Let's just render the task page right here").
 *
 * The page is `ext/AITask`'s own, drawn by `AITask.into(base)` — the same class
 * `/framework/ai/<date>/<slug>/` draws, never a copy. A card that points at a
 * task shows one; a group card shows every member's, newest first.
 */

const TASK_URL = /^\/framework\/ai\/\d{4}-\d{2}-\d{2}\/[^/]+\/$/;

/** The task dir a card points at — its `task` field, or its first link to a task page — or null. */
export function task_of(card){
	const t = card?.task;
	if (typeof t === "string"){
		const url = t.startsWith("/") ? t.replace(/\/?$/, "/") : "/framework/ai/" + t.replace(/^\/|\/$/g, "") + "/";
		if (TASK_URL.test(url)) return url;
	}
	return (card?.links ?? []).map(l => String(l?.url ?? "")).find(u => TASK_URL.test(u)) ?? null;
}

/* ⚠ Imported LAZILY: AITask is another tree's module with a dozen imports of
   its own, and one of them failing must cost this section, not AI 2. */
let loading = null;
const aitask = () => (loading ??= import("/framework/ext/AITask/AITask.js").then(m => m.AITask));

/** One task's page as a section: a head that names it, then the task page itself. */
export function task_section(m, { head = true } = {}){
	section.c("ai2-task", () => {
		if (head) div.c("ai2-task-head flex v-center wrap gap-25", () => {
			icon("task_alt");
			span.c("ai2-task-title").text(m.title || "Task");
			if (m.at) small.c("muted").text(when(m.at));
			a.c("ai2-link page-link").href(m.base).text("open the task page");
		});
		else a.c("ai2-link page-link").href(m.base).text("open the task page");
		div.c("ai2-task-body", $body => {
			aitask().then(AITask => $body.append(() => { AITask.into(m.base, m.files ? { known_files: m.files } : {}); }))
				.catch(() => $body.append(() => { small.c("muted").text("The task page could not be drawn here — open it instead."); }));
		});
	});
}

/* ── THE GROUP'S ONE SCREEN (the owner, 2026-09-24: "what was asked, what
   happened, what it cost, in one screen") ─────────────────────────────────
   A group card is a sentence and one row per task. A row's face is three
   things — the owner's words (first line), the agents and the money, and one
   sentence of outcome. Steps, report and agents fold one click down. */

const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");

/** One member task as plain data — also what the card's redraw signature reads. */
export function face_row(groups, m){
	const t = groups.task_member(m.base);
	const c = cost_of(t);
	const ag = t?.cost?.agents;
	return {
		base: m.base, files: m.files, title: m.title,
		asked: String(t?.request ?? "").trim(),
		agents: Array.isArray(ag) ? ag.length : (ag ?? 0),
		usd: c?.usd ?? null, open: !!c?.open,
		own: c?.cost.own_usd ?? null, minions: c?.cost.minions_usd ?? null,
		landed: !!t?.landed_at,
		said: t?.landed_at && t?.outcome ? headline(t.outcome) : plain(t?.now ?? "") || "no update yet",
	};
}

/** `3 tasks · 27 agents · $58.40 · 2 done` — the one sentence at the top. */
export function face_sentence(rows, sum){
	const bits = [plural(rows.length, "task")];
	const agents = rows.reduce((n, r) => n + r.agents, 0);
	if (agents) bits.push(plural(agents, "agent"));
	bits.push(sum?.tracked ? money(sum.usd) + (sum.open ? "+" : "") : "cost not tracked");
	bits.push(rows.filter(r => r.landed).length + " done");
	return bits.join(" · ");
}

/** The whole group face. `state` (the card's) remembers what the reader opened across redraws. */
export function group_faces(rows, sum, state){
	state.open ??= new Set(); state.said ??= new Set();
	div.c("ai2-cost ai2-faces", () => {
		p.c("ai2-faces-sum").text(face_sentence(rows, sum));
		rows.forEach(r => face(r, state));
	});
}

function face(r, state){
	details.c("ai2-face", $d => {
		if (state.open.has(r.base)) $d.attr("open", "");
		let filled = false;
		const fill = () => {
			if (filled || !$d.el.open) return;
			filled = true;
			$d.append(() => { div.c("ai2-face-body", () => { task_section({ base: r.base, files: r.files }, { head: false }); }); });
		};
		summary.c("ai2-face-head", () => {
			const first = r.asked.split("\n")[0] || r.title || "A task";
			const more = r.asked.length > first.length;
			div.c("ai2-face-asked flex gap-25", () => {
				span.c("ai2-face-q").text("asked");
				button.c("ai2-face-said").attr("type", "button")
					.attr("title", more ? "open the whole request" : "the request")
					.text(first).click(e => {
						e.preventDefault(); e.stopPropagation();
						const $full = $d.el.querySelector(".ai2-face-full");
						state.said.has(r.base) ? state.said.delete(r.base) : state.said.add(r.base);
						if ($full) $full.hidden = !state.said.has(r.base);
					});
			});
			div.c("ai2-face-cost", () => {
				const bits = [];
				if (r.agents) bits.push(plural(r.agents, "agent"));
				bits.push(r.usd == null ? "not tracked" : money(r.usd) + (r.open ? "+" : ""));
				span.c("ai2-face-money").text(bits.join(" · "));
				if (r.own != null) small.c("muted").text(" mastermind " + money(r.own) + " · minions " + money(r.minions ?? 0));
			});
			div.c("ai2-face-out" + (r.landed ? " done" : "")).text(r.said);
			const full = div.c("ai2-face-full", () => { pre.c("ai2-face-text").text(r.asked); });
			full.el.hidden = !state.said.has(r.base);
		});
		$d.on("toggle", () => {
			const now = $d.el.open;
			if (now === state.open.has(r.base)) return fill();
			now ? state.open.add(r.base) : state.open.delete(r.base);
			fill();
		});
		fill();
	});
}

/** A member that is a card, not a task: its own row, linking to it. */
function card_member(m){
	a.c("ai2-toc-row page-link").href("/framework/ai2/" + m.id + "/").append(() => {
		icon("forum");
		div.c("ai2-toc-body", () => {
			span.c("ai2-toc-title").text(m.title || "A card");
			if (m.words) small.c("ai2-toc-line muted").text(m.words);
		});
	});
}

/**
 * Fill `$box` with these members — ONLY when the list itself changed. A task
 * page fetches and streams its own log, so rebuilding it on every card redraw
 * would refetch it and close whatever tab the reader had open. `state` is the
 * caller's own object, holding the last list drawn.
 */
/* ⚠ The signature is the SET of members, sorted — not their order. A member's
   `now` moving changes which one is newest, and rebuilding every task page of a
   group for that would refetch them all under the reader; the order is fixed
   at the moment the set last changed. */
export function task_region($box, list, state, opts){
	const sig = JSON.stringify(list.map(m => m.base ?? m.id).sort());
	if (state.sig === sig) return;
	state.sig = sig;
	$box.empty(() => {
		list.forEach(m => { m.base ? task_section(m, opts) : card_member(m); });
	});
}
