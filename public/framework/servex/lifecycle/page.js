import { Doc, md, h2, div, span, ui } from "/app.js";

/* Read only. The four numbers and the raw evidence come from
   public/framework/ai/2026-09-29/lifecycle/study/count.mjs, which walks the live
   process list, the worktree registry and the Servex agent registry — nothing here
   re-counts anything. `data.json` is a copy of that script's `counts.json`, taken at
   the moment this page's data was last refreshed; how each number is counted is in
   the Docs tab (doc/counting.md). */
async function load(){
	const res = await fetch(new URL("data.json", import.meta.url).href);
	return res.ok ? res.json() : null;
}

// One big number: a stat tile, the same shape ui/stats documents (a card with a
// muted label over a big h2 value) — no new component, just that template inline.
function stat(label, value){
	return div.c("surface pad flex v gap", () => {
		div.c("h4 muted", label);
		div.c("h2", String(value));
	}).style("--gap", "calc(var(--gap) * 0.1)");
}

// A CSS bar chart: one row per kind, a filled bar sized by its share of the widest
// one. No chart library — just a div whose width is a percentage.
function bar_chart(rows){
	const max = Math.max(1, ...rows.map(r => r.mb));
	return div.c("flow", () => rows.forEach(r => {
		div.c("flex gap v-center", () => {
			span.c("muted", r.label).style({ minWidth: "9em", display: "inline-block" });
			div.c("surface", () => {
				div().style({
					width: `${Math.max(2, Math.round((r.mb / max) * 100))}%`,
					background: "var(--prim)",
					height: "1.4em",
					borderRadius: "var(--radius, 4px)",
				});
			}).style({ flex: "1", padding: "2px" });
			span.c("muted", `${r.mb.toLocaleString()} MB`).style({ minWidth: "6em", textAlign: "right", display: "inline-block" });
		});
	}));
}

function worst_table(rows){
	const head = ["kind", "name", "MB", "age (days)", "owner task", "why orphaned"];
	const body = rows.map(r => [r.kind, r.name, r.mb ? String(Math.round(r.mb)) : "—", r.age_days ?? "—", r.owner_task || "—", r.why]);
	return ui.table(head, body);
}

export default new Doc({
	meta: import.meta,
	title: "Lifecycle",
	description: "How much of what the system starts — tasks, servers, worktrees, agents — is left running instead of shut down.",
	icon: "hourglass_bottom",

	notes: "counting",

	content(){
		// The container is what `append_promise` needs "placed synchronously" — everything
		// below runs inside ITS OWN callback, so every factory call has a real captor even
		// though the whole thing only starts once `load()` resolves
		// (core/View/doc/capturing.md: "returning a promise is the other blessed shape").
		// `.wide`: this tab lives inside Servex's Doc shell, whose default reading
		// column caps at --measure (40em) — too narrow for the numbers+chart row to
		// sit side by side at 1920/3440 (core/Page/doc/css.md: say `.c("wide")` on
		// that one call and the cap stands down).
		return load().then(data => div.c("flow wide", () => {
			if (!data) { md("*data.json did not load — run `node public/framework/ai/2026-09-29/lifecycle/study/count.mjs` from the repo root and copy counts.json here as data.json.*"); return; }

			const c = data.counts;

			md(`As of **${new Date(data.generated_at).toLocaleString()}**, read once and not live — a real snapshot of a system that keeps changing under it.`);

			// Numbers + chart side by side above the fold at 1920 and 3440; each
			// column stacks under the other once the screen is too narrow for both.
			div.c("grid auto gap", () => {
				div.c("flow gap", () => {
					h2("Before → after");
					div.c("grid gap auto", () => {
						stat("dev-server wrappers running", "20 → 9");
						stat("idle agents holding claude", "14 → 4");
						stat("tasks never landed", c.tasks_unlanded + " of " + c.tasks_total);
						stat("worktrees orphaned", c.worktrees_orphaned + " of " + c.worktrees_total);
					}).style("--column", "13em");
					md("The reaper closed them — the first real sweep, at 18:03 (`run.js` children 13 → 8, node processes overall 45 → 29). Tasks never landed and worktrees orphaned keep only the study count: the reaper doesn't touch either kind.");
				});
				div.c("flow gap", () => {
					h2("What's left running, by kind");
					md("Live memory (Working Set) right now — servers and idle agents, the two kinds the reaper actually stops.");
					bar_chart([
						{ label: "servers (RAM)", mb: data.by_kind_mb.servers },
						{ label: "idle agents (RAM, est.)", mb: data.by_kind_mb.agents },
					]);
					md(`Worktrees held ~${(data.by_kind_mb.worktrees_disk / 1024).toFixed(1)} GB of disk, not memory, so it's left off this chart — the orphaned count above is the worktree number.`);
				});
			}).style("--column", "26em");

			h2("The 10 worst cases");
			worst_table(data.worst_ten);

			if (data.salvage) {
				h2("The stuck quick-fix pool");
				md(`The salvage branches exist — \`Pool.salvage()\` stops the slot's server before it commits, so a fresh reset actually stays clean (\`Servex/doc/pool.md\`).`);
				md(`The \`page.jsonl\` dirt-check fix (excluding it from \`Pool.js\`'s \`dirt()\` walk) is the owner's decision to make (\`Servex/doc/lifecycle.md\`).`);
			}

			md("Raw data and the counting script: [`ai/2026-09-29/lifecycle/study/`](/framework/ai/2026-09-29/lifecycle/study/).");
		}));
	},
});
