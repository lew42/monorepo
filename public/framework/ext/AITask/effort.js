import { div, span, p } from "../../core/View/View.js";
import { card } from "./card.js";
import { state } from "./stats.js";

/* An effort is a thread of tasks across days, named by the `group` slug a task
   assigns itself in its own log. There is no registry and no effort directory:
   the association lives in the one file that already knows it, so nothing has
   to be kept in step with anything. A task naming no group is loose. */

const when = t => t.m?.landed_at ?? t.m?.requested_at ?? "";
const live = t => state(t.m) === "running" ? 0 : 1;

// Running first, then most recently active — the order the tasks inside an
// effort want, and the order the efforts themselves want.
const by_activity = (x, y) => live(x) - live(y) || when(y).localeCompare(when(x));

const KIND = { running: "live", landed: "landed", proposed: "idea" };
const KINDS = ["live", "landed", "idea"];

/** How a set of tasks is doing, as `{live, landed, idea}`. */
export function tally(tasks){
	const n = { live: 0, landed: 0, idea: 0 };
	tasks.forEach(t => n[KIND[state(t.m)]]++);
	return n;
}

/** The same tasks, regrouped as efforts — liveliest first, loose last. */
export function efforts(list){
	const by = new Map();
	list.forEach(t => {
		const slug = t.m?.group ?? null;
		if (!by.has(slug)) by.set(slug, []);
		by.get(slug).push(t);
	});

	return [...by]
		.map(([slug, tasks]) => ({ slug, tasks: tasks.sort(by_activity),
			title: slug ? slug.replaceAll("-", " ") : "loose", counts: tally(tasks) }))
		.sort((a, b) => (a.slug ? 0 : 1) - (b.slug ? 0 : 1) || by_activity(a.tasks[0], b.tasks[0]));
}

/** A state roll-up — one dot and one count per kind, the glance vocabulary. */
export const dots = counts => div.c("flex gap v-center", () => KINDS.forEach(kind =>
	counts[kind] && div.c("flex gap v-center", () => {
		span.c("ai-dot").ac(kind !== "landed" && kind);
		span.c("muted", counts[kind]);
	}).style("--gap", ".3em"))).style("--gap", ".8em");

/** Every effort as a heading with its roll-up, and its tasks beneath. */
export function effort_groups(found){
	if (!found.length) return p.c("muted",
		"Nothing yet — a task appears when its directory holds a requirements.md or a task.jsonl.");

	found.forEach(e => div.c("ai-group", () => {
		div.c("flex gap v-center split", () => {
			div.c("flex gap v-center", () => {
				span.c("ai-group-title muted", e.title);
				span.c("ai-count muted", e.tasks.length);
			}).style("--gap", ".5em");
			dots(e.counts);
		});
		div.c("ai-cards", () => e.tasks.forEach(t => card(t, true)));
	}));
}

export default effort_groups;
