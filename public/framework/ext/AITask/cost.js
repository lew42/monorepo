import { div, span, a, small, table, thead, tbody, tr, th, td } from "../../core/View/View.js";

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

/** A model id as a person says it: `claude-opus-5-5` → `Opus 5.5`. Anything else as it is. */
export const model_name = id => {
	const m = /(opus|sonnet|haiku|fable)(?:-(\d+)-(\d+))?/i.exec(String(id ?? ""));
	if (!m) return id || "model unknown";
	return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() + (m[2] ? " " + m[2] + "." + m[3] : "");
};

/* ⚠ `cost.agents` WAS A COUNT and is now the list itself — `[{ id, model, role, usd }]`,
   the root first (Server/task-cost.mjs, 2026-09-24). A line written before then still
   carries the number, so both shapes are read here and nowhere else. */
/** The agents a task paid for, root first — `[]` on an older line that only counted them. */
export const agents_of = m => Array.isArray(m?.cost?.agents) ? m.cost.agents : [];
const agent_count = c => Array.isArray(c.agents) ? c.agents.length : c.agents;

const at_time = at => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** One line: `$3.92+ so far · mastermind $1.38 · minions $2.54`. What a card's preview and head show. */
export const summary_line = m => {
	const c = cost_of(m);
	if (!c) return null;
	const { own_usd, minions_usd } = c.cost;
	return [money(c.usd) + (c.open ? "+ so far" : ""),
		own_usd != null && "mastermind " + money(own_usd),
		minions_usd != null && "minions " + money(minions_usd)].filter(Boolean).join(" · ");
};

/** The task page's breakdown: the total, then who spent it — the mastermind and each
    minion, with its model — and the time the root's share was counted over. */
export function breakdown(m){
	const c = cost_of(m);
	if (!c) return div.c("muted", "Cost: not tracked — this task's log has no cost line. A task Servex ran gets one from Server/task-cost.mjs; a tab or a CLI session never does.");
	const { root, own_usd, minions_usd, parent_task, at, window: win } = c.cost;
	const agents = agent_count(c.cost);
	const list = agents_of(m);
	return div.c("ai-cost", () => {
		div(() => {
			span(money(c.usd) + (c.open ? "+ so far" : ""));
			span.c("muted", " — " + [
				!list.length && root && "root " + root,
				own_usd != null && "mastermind " + money(own_usd),
				minions_usd != null && "minions " + money(minions_usd),
				agents != null && agents + " agent" + (agents === 1 ? "" : "s"),
				c.open && c.open + " still open",
				parent_task && "counted in " + parent_task,
				at && "as of " + at_time(at),
			].filter(Boolean).join(" · "));
		});
		if (!list.length) return;
		table(() => {
			thead(() => tr(() => { th("who"); th("agent"); th("model"); th("cost"); }));
			tbody(() => list.forEach((x, i) => tr(() => {
				td(i === 0 ? "mastermind" : "minion");
				td(x.id);
				td(model_name(x.model));
				td(x.usd == null ? "not measured" : money(x.usd));
			})));
		});
		// The root is shared by every task it ran; this one's share is its time.
		if (win?.from) small.c("muted", "The mastermind's share is what it spent from " + at_time(win.from)
			+ (win.to ? " to " + at_time(win.to) : " until now")
			+ "; a minion counts whole, toward the task open when it was spawned.");
	});
}
