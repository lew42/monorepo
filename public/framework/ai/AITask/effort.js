import { state } from "./stats.js";

/* An effort is a thread of tasks across days, named by the `group` slug a task
   assigns itself in its own log. There is no registry and no effort directory:
   the association lives in the one file that already knows it, so nothing has
   to be kept in step with anything. A task naming no group is loose.

   Derivation only — the board lists by date, and an effort is what a card's tag
   filters to (`dashboard.js`'s `effort_board()`). */

// ⚠ Parsed, not string-compared — see board.js: a `…Z` stamp sorts hours off as text.
const when = t => Date.parse(t.m?.landed_at ?? t.m?.requested_at ?? "") || 0;
const live = t => state(t.m) === "running" ? 0 : 1;

// Running first, then most recently active — the order the tasks inside an
// effort want, and the order the efforts themselves want.
const by_activity = (x, y) => live(x) - live(y) || when(y) - when(x);

const KIND = { running: "live", landed: "landed", proposed: "idea" };

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

export default efforts;
