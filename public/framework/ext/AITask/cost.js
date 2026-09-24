import { div, span, a } from "../../core/View/View.js";

/* What a task cost, in dollars — the `cost_usd` a task's log carries once
   `Server/task-cost.mjs` has summed its Servex agent and every agent under it.

   ⚠ No `cost_usd` means NOT TRACKED, never $0: a task run from a tab or a plain
   CLI session has no Servex agent, so nothing measured it. Showing $0 there would
   read as "free" and pull every total down with a number nobody measured.

   `cost.open > 0` means some agent under the task is still running, so the
   figure can still grow — it wears a "+" and the words "so far". */

export const money = usd => "$" + usd.toFixed(2);

/** A task's own cost as `{ usd, open, cost }`, or null when it isn't tracked. */
export const cost_of = m => typeof m?.cost_usd === "number"
	? { usd: m.cost_usd, open: m.cost?.open ?? 0, cost: m.cost ?? {} } : null;

/** The card's figure: `[value, label]`, the same pair shape the card's other figures use. */
export const cost_figure = m => {
	const c = cost_of(m);
	if (!c) return ["not tracked", ""];
	return c.open ? [money(c.usd) + "+", "so far"] : [money(c.usd), "cost"];
};

/* `<date>/<slug>` — the key a task's `cost.parent_task` names another task by. */
const key_of = t => String(t.url ?? "").split("/").filter(Boolean).slice(-2).join("/");

/**
 * The sum of a set of task rows (`{ url, m }`, the board's own row shape).
 *
 * ⚠ A task whose `cost.parent_task` is ALSO in this set is skipped: its parent's
 *   figure already includes it, so counting both would count it twice. A child
 *   whose parent is NOT in the set (another day, another effort) is counted —
 *   otherwise its money would vanish from every total that doesn't hold its parent.
 */
export function total(rows){
	const keys = new Set(rows.map(key_of));
	const sum = { usd: 0, tracked: 0, untracked: 0, nested: 0, open: 0 };
	rows.forEach(t => {
		const c = cost_of(t.m);
		if (!c) return sum.untracked++;
		if (c.cost.parent_task && keys.has(c.cost.parent_task)) return sum.nested++;
		sum.usd += c.usd;
		sum.tracked++;
		if (c.open) sum.open++;
	});
	return sum;
}

const untracked = n => n ? ` · ${n} task${n === 1 ? "" : "s"} not tracked` : "";

/** One line: `$41.20 today · 3 tasks not tracked`. Silent when there are no tasks. */
export const total_line = (rows, label) => {
	const s = total(rows);
	if (!rows.length) return;
	return div(() => {
		span(s.tracked ? money(s.usd) + (s.open ? "+" : "") : "no cost tracked");
		span.c("muted", " " + label + untracked(s.untracked));
	});
};

/** The day's total, then what each effort (`group`) spent — every effort a link to its own board. */
export const day_costs = rows => div.c("flex v", () => {
	total_line(rows, "today");

	const by = new Map();
	rows.forEach(t => {
		const g = t.m?.group;
		if (g) by.set(g, [...(by.get(g) ?? []), t]);
	});
	const parts = [...by].map(([g, list]) => [g, total(list)]).filter(([, s]) => s.tracked)
		.sort((x, y) => y[1].usd - x[1].usd);
	if (parts.length) div.c("flex gap wrap", () => {
		span.c("muted", "by effort:");
		parts.forEach(([g, s]) => {
			a.c("ai-link", g.replaceAll("-", " ") + " " + money(s.usd) + (s.open ? "+" : ""))
				.href("/framework/ai/effort/" + g + "/");
		});
	}).style("--gap", ".5em");
});

/** The task page's breakdown: the root agent, its own cost, its minions', how many agents. */
export function breakdown(m){
	const c = cost_of(m);
	if (!c) return div.c("muted", "Cost: not tracked — this task's log has no cost line. A task Servex ran gets one from Server/task-cost.mjs; a tab or a CLI session never does.");
	const { root, agents, own_usd, minions_usd, parent_task, at } = c.cost;
	return div(() => {
		span(money(c.usd) + (c.open ? "+ so far" : ""));
		span.c("muted", " — " + [
			root && "root " + root,
			own_usd != null && "own " + money(own_usd),
			minions_usd != null && "minions " + money(minions_usd),
			agents != null && agents + " agent" + (agents === 1 ? "" : "s"),
			c.open && c.open + " still open",
			parent_task && "counted in " + parent_task,
			at && "as of " + new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
		].filter(Boolean).join(" · "));
	});
}
