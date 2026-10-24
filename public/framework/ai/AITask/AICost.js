import { div, span, a, small, table, thead, tbody, tr, th, td } from "../../core/View/View.js";

export default class AICost {
	/* What a task cost, in dollars — the `cost_usd` a task's log carries once
	   `Server/task-cost.mjs` has summed its Servex agent and every agent under it.

	   ⚠ No `cost_usd` means NOT TRACKED, never $0: a task run from a tab or a plain
	   CLI session has no Servex agent, so nothing measured it. Showing $0 there would
	   read as "free" and pull every total down with a number nobody measured.

	   `cost.open > 0` means some agent under the task is still running, so the
	   figure can still grow — it wears a "+" and the words "so far". */

	static money = usd => "$" + usd.toFixed(2);

	/** A task's own cost as `{ usd, open, cost }`, or null when it isn't tracked. */
	static cost_of = m => typeof m?.cost_usd === "number"
		? { usd: m.cost_usd, open: m.cost?.open ?? 0, cost: m.cost ?? {} } : null;

	/** The card's figure: `[value, label]`, the same pair shape the card's other figures use. */
	static cost_figure = m => {
		const c = AICost.cost_of(m);
		if (!c) return ["not tracked", ""];
		return c.open ? [AICost.money(c.usd) + "+", "so far"] : [AICost.money(c.usd), "cost"];
	};

	/* `<date>/<slug>` — the key a task's `cost.parent_task` names another task by. */
	static key_of = t => String(t.url ?? "").split("/").filter(Boolean).slice(-2).join("/");

	/**
	 * The sum of a set of task rows (`{ url, m }`, the board's own row shape).
	 *
	 * ⚠ A task whose `cost.parent_task` is ALSO in this set is skipped: its parent's
	 *   figure already includes it, so counting both would count it twice. A child
	 *   whose parent is NOT in the set (another day, another effort) is counted —
	 *   otherwise its money would vanish from every total that doesn't hold its parent.
	 */
	static total(rows){
		const keys = new Set(rows.map(AICost.key_of));
		const sum = { usd: 0, tracked: 0, untracked: 0, nested: 0, open: 0 };
		rows.forEach(t => {
			const c = AICost.cost_of(t.m);
			if (!c) return sum.untracked++;
			if (c.cost.parent_task && keys.has(c.cost.parent_task)) return sum.nested++;
			sum.usd += c.usd;
			sum.tracked++;
			if (c.open) sum.open++;
		});
		return sum;
	}

	static untracked = n => n ? ` · ${n} task${n === 1 ? "" : "s"} not tracked` : "";

	/** One line: `$41.20 today · 3 tasks not tracked`. Silent when there are no tasks. */
	static total_line = (rows, label) => {
		const s = AICost.total(rows);
		if (!rows.length) return;
		return div(() => {
			span(s.tracked ? AICost.money(s.usd) + (s.open ? "+" : "") : "no cost tracked");
			span.c("muted", " " + label + AICost.untracked(s.untracked));
		});
	};

	/** The day's total, then what each effort (`group`) spent — every effort a link to its own board. */
	static day_costs = rows => div.c("flex v", () => {
		AICost.total_line(rows, "today");

		const by = new Map();
		rows.forEach(t => {
			const g = t.m?.group;
			if (g) by.set(g, [...(by.get(g) ?? []), t]);
		});
		const parts = [...by].map(([g, list]) => [g, AICost.total(list)]).filter(([, s]) => s.tracked)
			.sort((x, y) => y[1].usd - x[1].usd);
		if (parts.length) div.c("flex gap wrap", () => {
			span.c("muted", "by effort:");
			parts.forEach(([g, s]) => {
				a.c("ai-link", g.replaceAll("-", " ") + " " + AICost.money(s.usd) + (s.open ? "+" : ""))
					.href("/framework/ai/effort/" + g + "/");
			});
		}).style("--gap", ".5em");
	});

	/** A model id as a person says it: `claude-opus-5-5` → `Opus 5.5`. Anything else as it is. */
	static model_name = id => {
		const m = /(opus|sonnet|haiku|fable)(?:-(\d+)-(\d+))?/i.exec(String(id ?? ""));
		if (!m) return id || "model unknown";
		return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() + (m[2] ? " " + m[2] + "." + m[3] : "");
	};

	/* ⚠ `cost.agents` WAS A COUNT and is now the list itself — `[{ id, model, role, usd }]`,
	   the root first (Server/task-cost.mjs, 2026-09-24). A line written before then still
	   carries the number, so both shapes are read here and nowhere else. */
	/** The agents a task paid for, root first — `[]` on an older line that only counted them. */
	static agents_of = m => Array.isArray(m?.cost?.agents) ? m.cost.agents : [];
	static agent_count = c => Array.isArray(c.agents) ? c.agents.length : c.agents;

	static at_time = at => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

	/** One line: `$3.92+ so far · mastermind $1.38 · minions $2.54`. What a card's preview and head show. */
	static summary_line = m => {
		const c = AICost.cost_of(m);
		if (!c) return null;
		const { own_usd, minions_usd } = c.cost;
		return [AICost.money(c.usd) + (c.open ? "+ so far" : ""),
			own_usd != null && "mastermind " + AICost.money(own_usd),
			minions_usd != null && "minions " + AICost.money(minions_usd)].filter(Boolean).join(" · ");
	};

	/** The task page's breakdown: the total, then who spent it — the mastermind and each
	    minion, with its model — and the time the root's share was counted over. */
	static breakdown(m){
		const c = AICost.cost_of(m);
		if (!c) return div.c("muted", "No cost line in this task's log. A task Servex ran gets one from Server/task-cost.mjs.");
		const { root, own_usd, minions_usd, parent_task, at, window: win } = c.cost;
		const agents = AICost.agent_count(c.cost);
		const list = AICost.agents_of(m);
		return div.c("ai-cost", () => {
			div(() => {
				span(AICost.money(c.usd) + (c.open ? "+ so far" : ""));
				span.c("muted", " — " + [
					!list.length && root && "root " + root,
					own_usd != null && "mastermind " + AICost.money(own_usd),
					minions_usd != null && "minions " + AICost.money(minions_usd),
					agents != null && agents + " agent" + (agents === 1 ? "" : "s"),
					c.open && c.open + " still open",
					parent_task && "counted in " + parent_task,
					at && "as of " + AICost.at_time(at),
				].filter(Boolean).join(" · "));
			});
			if (!list.length) return;
			// `cache_read_pct` (token-accounting, 2026-10-04): `task-cost.mjs` attaches it, and
			// `usd_breakdown`, to every agent that has a real transcript to read — blank for one
			// that doesn't (an OpenRouter agent, or a transcript aged off disk), never a guess.
			const has_cache_col = list.some(x => x.cache_read_pct != null);
			table(() => {
				thead(() => tr(() => { th("who"); th("agent"); th("model"); th("cost"); if (has_cache_col) th("cache reads"); }));
				tbody(() => list.forEach((x, i) => tr(() => {
					td(i === 0 ? "mastermind" : "minion");
					td(x.id);
					td(AICost.model_name(x.model));
					td(x.usd == null ? "not measured" : AICost.money(x.usd));
					if (has_cache_col) td(x.cache_read_pct != null ? x.cache_read_pct + "% of $" : "—");
				})));
			});
			// The root is shared by every task it ran; this one's share is its time.
			if (win?.from) small.c("muted", "The mastermind's share is what it spent from " + AICost.at_time(win.from)
				+ (win.to ? " to " + AICost.at_time(win.to) : " until now")
				+ "; a minion counts whole, toward the task open when it was spawned.");
		});
	}

	/* THE ITEM TOOL'S ANSWER (session-report, 2026-10-23). A session folder has no cost line; Servex computes its whole picture
	   (own spend, child sessions, task counts) and answers the item tool's `summary` query. The tab draws that answer and
	   computes nothing: core/Session/readme.md, "What item() answers for a session". */
	static known = new Map();   // folder url -> { at, answer }; one ask per folder per STALE_MS, however often the tab redraws
	static STALE_MS = 30000;

	/** `{ summary }` from the item tool, or `{ why }` in words when Servex cannot answer from here. */
	static async ask(base){
		try {
			const { servex_url } = await import("../../dev/servex_url.js");
			const res = await fetch(servex_url("/api/item"), { method: "POST", headers: { "content-type": "application/json" },
				body: JSON.stringify({ path: base, delta: { summary: {} } }), signal: AbortSignal.timeout(150000) });
			const body = await res.json();
			if (body?.stubbed) return { why: "This is a worktree preview, which is not allowed to ask Servex for numbers; open the same page on the main site." };
			if (!res.ok) return { why: "Servex refused the question (" + (body?.why ?? res.status) + "): this page is only answered on the machine that runs Servex." };
			const summary = body?.answer?.summary;
			return summary ? { summary } : { why: body?.why ?? "Servex has no record at this path to add up." };
		} catch (e) {
			if (e?.name === "TimeoutError") return { why: "Servex took more than two and a half minutes to add this session up, so no cost is shown yet; it is slow on a session with hundreds of tasks. Reload to ask again." };
			return { why: "Servex did not answer, so no cost can be shown. It adds up the agents' spend on the machine that runs them; a static copy of the site cannot ask it." };
		}
	}

	/** The Report tab's cost block: the last answer at once, a fresh one when it is stale. */
	static report(base){
		const hit = AICost.known.get(base);
		const $d = div.c("ai-cost flow", () => hit ? AICost.draw(hit.answer) : span.c("muted", "Asking Servex for this page's cost… (it can take a minute for a session with many tasks)"));
		if (!hit || Date.now() - hit.at > AICost.STALE_MS) AICost.ask(base).then(answer => {
			AICost.known.set(base, { at: Date.now(), answer });
			$d.empty(() => AICost.draw(answer));
		});
		return $d;
	}

	static draw({ summary: s, why }){
		if (!s) return span.c("muted", why);
		if (s.class === "Session") return AICost.draw_session(s);
		return AICost.draw_task(s);
	}

	static usd = n => n == null ? null : AICost.money(n);
	static minutes = ms => ms < 3600000 ? Math.round(ms / 60000) + " min" : (ms / 3600000).toFixed(1) + " h";

	static draw_session(s){
		const { total, own, children, tasks } = s.cost, { done, total: all, stopped } = s.progress, c = s.counts.all;
		div(() => {
			span(AICost.money(total) + " in all");
			span.c("muted", " — " + [
				own ? "this session " + AICost.money(own.usd) : "this session's own spend is unknown: no transcript has been read for it yet",
				"child sessions " + AICost.money(children),
				"the agents on its tasks cost " + AICost.money(tasks) + " (counted inside the child sessions)",
			].join(" · "));
		});
		div(() => {
			span(done + " of " + all + " tasks complete, " + (all - done) + " open");
			span.c("muted", " — " + [
				stopped && stopped + " stopped, left out of the count",
				c.created + " created in all, " + c.started + " started, " + c.complete + " complete (this session and everything under it)",
				s.span_ms && "over " + AICost.minutes(s.span_ms),
			].filter(Boolean).join(" · "));
		});
		if (s.biggest?.length){
			small.c("muted", "Costliest tasks");
			table(() => tbody(() => s.biggest.forEach(t => tr(() => {
				td(t.title ?? t.id); td(t.state); td(AICost.money(t.cost));
			}))));
		}
		if (!s.children?.length) return small.c("muted", "No child sessions are registered under this session.");
		small.c("muted", s.agents + " child session" + (s.agents === 1 ? "" : "s") + ", each with what it and its own children cost");
		table(() => {
			thead(() => tr(() => { th("session"); th("role"); th("state"); th("own"); th("with its children"); }));
			tbody(() => AICost.flatten(s.children).forEach(({ n, depth }) => tr(() => {
				td(n.id).style("padding-left", depth + "em");
				td(n.role); td(n.state); td(AICost.money(n.cost)); td(AICost.money(n.total));
			})));
		});
	}

	static flatten = (list, depth = 0) => list.flatMap(n => [{ n, depth }, ...AICost.flatten(n.children ?? [], depth + 1)]);

	static draw_task(s){
		const { done, total } = s.progress;
		div(() => {
			span(s.cost > 0 ? AICost.money(s.cost) + " in all" : "No agent cost is recorded for this task's folder");
			span.c("muted", " — " + [
				s.state,
				done + " of " + total + " tasks complete",
				s.duration && "ran " + AICost.minutes(s.duration),
			].filter(Boolean).join(" · "));
		});
		if (s.open?.length) {
			small.c("muted", "Open");
			table(() => tbody(() => s.open.forEach(t => tr(() => { td(t.title); td(t.state); }))));
		}
		if (s.children?.length) {
			small.c("muted", "Child sessions");
			table(() => tbody(() => s.children.forEach(t => tr(() => { td(t.title); td(t.state); }))));
		}
	}

}
