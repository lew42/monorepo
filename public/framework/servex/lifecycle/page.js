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
		return load().then(data => div.c("flow", () => {
			if (!data) { md("*data.json did not load — run `node public/framework/ai/2026-09-29/lifecycle/study/count.mjs` from the repo root and copy counts.json here as data.json.*"); return; }

			const c = data.counts;

			md(`As of **${new Date(data.generated_at).toLocaleString()}**, read once and not live — a real snapshot of a system that keeps changing under it.`);

			h2("Four numbers");
			div.c("grid gap auto", () => {
				stat("tasks never landed", c.tasks_unlanded + " of " + c.tasks_total);
				stat("servers never stopped", c.servers_running + " (~" + c.servers_total_mb.toLocaleString() + " MB)");
				stat("worktrees orphaned", c.worktrees_orphaned + " of " + c.worktrees_total);
				stat("agents left idle", c.agents_idle + " of " + c.agents_total);
			}).style("--column", "14em");

			md(`Only **${c.servers_matched_to_worktree}** of the ${c.servers_running} running \`server.js\`/\`run.js\` processes could be matched to a live worktree port — the rest (${c.servers_not_listening} not even listening on any port right now) are the main site's server, hand-started ones, or ones whose worktree already vanished.`);

			h2("What's left running, by kind");
			md("Servers and agents are live memory (their Working Set right now); worktrees is disk space held by orphaned copies of the repo — different units, same chart, so the worst offender is obvious at a glance.");
			bar_chart([
				{ label: "servers (RAM)", mb: data.by_kind_mb.servers },
				{ label: "worktrees (disk)", mb: data.by_kind_mb.worktrees_disk },
				{ label: "idle agents (RAM, est.)", mb: data.by_kind_mb.agents },
			]);

			h2("The 10 worst cases");
			worst_table(data.worst_ten);

			md("**One line on the fix:** a task that lands now closes its own servers, watchers, browsers and idle helpers — that reaper is a separate, later piece of this same brief; this page is only the count of what it will find, before and after.");

			if (data.salvage) {
				h2("The stuck quick-fix pool");
				md(`Three quick-fix worktree slots (\`qf-2\`, \`qf-3\`, \`qf-4\`) have been stuck since 2026-09-28: each was held by an agent that stopped, and Servex's Pool refused to reclaim the slot because it still had uncommitted changes. The owner rescued each slot's uncommitted work by hand into a throwaway branch (\`salvage/qf-N-2026-09-29\`) — but the slot is still stuck.`);

				md(`**What each salvage branch holds** (\`git show --stat\`):`);
				data.salvage.slots.forEach(slot => {
					md(`- **${slot.slot}** (\`${slot.branch}\`): ${slot.files.length} file(s) changed — ${slot.only_page_jsonl ? "all of them are `page.jsonl` append lines" : "mostly `page.jsonl`, plus a few lines in `ai/board.jsonl`"}.`);
				});

				md(`**Why it stays stuck:** ${data.salvage.cause}`);

				md(`Written by \`${data.salvage.writer.file}\` (\`${data.salvage.writer.class_method}\`), ${data.salvage.writer.when}.`);

				md(`**The fix** (not applied — read only): **(${data.salvage.fix_options.picked}) ${data.salvage.fix_options.a}**\n\nThe alternative: **(b) ${data.salvage.fix_options.b}**`);
			}

			md("Raw data and the counting script: [`ai/2026-09-29/lifecycle/study/`](/framework/ai/2026-09-29/lifecycle/study/).");
		}));
	},
});
