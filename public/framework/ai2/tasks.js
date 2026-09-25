import { div, section, span, small, a } from "/framework/core/View/View.js";
import { icon } from "/framework/core/View/View.js";
import { when } from "./faces.js";

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
			aitask().then(AITask => $body.append(() => { AITask.into(m.base, m.files ? { listing: m.files } : {}); }))
				.catch(() => $body.append(() => { small.c("muted").text("The task page could not be drawn here — open it instead."); }));
		});
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
