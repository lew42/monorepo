/* node Servex/agents/landed-reap-proof.mjs — an idle minion whose PARENT's task
 * has landed is flagged to close by `Lifecycle.why()`. No real Servex, no network,
 * no process scan: `why()`'s agent branch only reads `this.tasks` (a Map of task
 * key -> {agent, landed, ...}) and `this.all_agents` (the live/idle agent rows),
 * both of which `plan()` would normally fill from disk and from Servex's own
 * `agents.registry_list()` before calling `why()` for each row — this proof fills
 * them by hand with exactly the shape `why()` reads, and calls `why()` directly,
 * the same way `plan()`/`reap()` do internally.
 *
 * Why this matters (token-reduction brief, item 3): a MINION's own task.jsonl
 * often never gets its own `landed_at` line — it reports to its parent and the
 * PARENT's log is the one marked landed. So the only way Lifecycle can tell an
 * idle minion it should close is by walking from the minion's `parent` id to the
 * task whose own recorded `agent` is that parent, and checking THAT task's
 * `landed` flag. If that match ever misses (wrong field read, wrong key), the
 * minion is never flagged, and the heartbeat (a separate file, Heartbeat.js)
 * keeps sending it status checks forever, billing it — exactly the symptom in
 * the brief's evidence line for `minion-lib-h1-page`.
 *
 * Exit 0 = every case behaved. */
import Lifecycle from "../Lifecycle.js";

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); };

/* ── case 1: the minion's parent mastermind's task HAS landed ── */
{
	const lc = new Lifecycle({ servex: null });
	// what plan() would have put in `this.tasks` after reading a real task dir whose
	// task.jsonl has {"assign":{"agent":"mastermind-x"}} then later {"assign":{"landed_at":"...","outcome":"done"}}:
	lc.tasks = new Map([
		["2026-10-03/fake-task/mastermind-x", { key: "2026-10-03/fake-task/mastermind-x", agent: "mastermind-x", landed: true, landed_at: "2026-10-03T00:00:00-05:00", outcome: "done" }]
	]);
	lc.all_agents = [{ id: "mastermind-x", state: "stopped" }];

	const idle_minion = { kind: "agent", id: "minion-under-x", role: "minion", parent: "mastermind-x", state: "idle" };
	const reason = lc.why(idle_minion);
	check("idle minion of a landed task's mastermind is flagged to close", !!reason && /landed/.test(reason), reason);
}

/* ── case 2: a sibling minion whose parent's task is still OPEN must NOT be flagged ── */
{
	const lc = new Lifecycle({ servex: null });
	lc.tasks = new Map([
		["2026-10-03/fake-task/mastermind-y", { key: "2026-10-03/fake-task/mastermind-y", agent: "mastermind-y", landed: false }]
	]);
	lc.all_agents = [{ id: "mastermind-y", state: "working" }];

	const idle_minion = { kind: "agent", id: "minion-under-y", role: "minion", parent: "mastermind-y", state: "idle" };
	const reason = lc.why(idle_minion);
	check("idle minion of an OPEN task's mastermind is left alone", reason === null, JSON.stringify(reason));
}

/* ── case 3: the minion's OWN task.jsonl is the one in `this.tasks` (keyed by the
 *   minion's own task dir), but it never got its own landed_at — only its parent's
 *   task did. This is the exact shape named in the brief ("a minion's own task.jsonl
 *   often never gets its own landed_at"): `why()` must still find the PARENT's task
 *   by matching `task.agent === row.parent`, not the minion's own (non-landed) one. ── */
{
	const lc = new Lifecycle({ servex: null });
	lc.tasks = new Map([
		["2026-10-03/fake-task/mastermind-z/minion-sub", { key: "2026-10-03/fake-task/mastermind-z/minion-sub", agent: "minion-under-z", landed: false }],
		["2026-10-03/fake-task/mastermind-z", { key: "2026-10-03/fake-task/mastermind-z", agent: "mastermind-z", landed: true }]
	]);
	lc.all_agents = [{ id: "mastermind-z", state: "stopped" }];

	const idle_minion = { kind: "agent", id: "minion-under-z", role: "minion", parent: "mastermind-z", state: "idle" };
	const reason = lc.why(idle_minion);
	check("idle minion with its OWN (unlanded) task log is still flagged via its parent's landed task", !!reason && /landed/.test(reason), reason);
}

/* ── case 4: the `only` form (Lifecycle.reap(dir) narrows to one task key) ── */
{
	const lc = new Lifecycle({ servex: null });
	lc.tasks = new Map([
		["2026-10-03/fake-task/mastermind-x", { key: "2026-10-03/fake-task/mastermind-x", agent: "mastermind-x", landed: true }]
	]);
	lc.all_agents = [{ id: "mastermind-x", state: "stopped" }];
	const idle_minion = { kind: "agent", id: "minion-under-x", role: "minion", parent: "mastermind-x", state: "idle" };
	check("reap(dir)'s `only` form flags the matching task's idle minion",
		!!lc.why(idle_minion, "2026-10-03/fake-task/mastermind-x"));
	check("…but not an idle minion of a DIFFERENT task", lc.why(idle_minion, "2026-10-03/some-other-task") === null);
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
