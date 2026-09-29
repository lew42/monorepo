/* node public/framework/ext/AITask/tree.test.mjs [day-dir]
   1. The made-up plan: phase 1 is three tasks in parallel, phase 2 is two in
      parallel after all of them — asserted twice, from `after` edges and from times alone.
   2. A real day, read-only from disk (default: the main tree's 2026-09-29), printed as an outline. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { build, fold, outline } from "./tree.js";

const T = h => `2026-09-29T${String(h).padStart(2, "0")}:00:00-05:00`;
const plan = edges => [
	{ dir: "ai/2026-09-29/plan", agent: "mm", requested_at: T(9), steps: ["split", "build", "ship"], step: 2 },
	...["a", "b", "c"].map((x, i) => ({ dir: `ai/2026-09-29/plan/${x}`, agent: x, requested_at: T(10),
		landed_at: T(11 + i), steps: ["one", "two"] })),
	{ dir: "ai/2026-09-29/plan/d", agent: "d", requested_at: T(14), steps: ["1", "2", "3", "4"], step: 3,
		after: edges ? ["a", "b", "c"] : undefined },
	{ dir: "ai/2026-09-29/plan/e", agent: "e", requested_at: edges ? undefined : T(14), steps: ["1", "2"], step: 1,
		after: edges ? ["plan/a", "b", "x-not-landed"] : undefined },
];

for (const edges of [true, false]){
	const [root] = build(plan(edges));
	assert.equal(root.dir, "2026-09-29/plan");
	assert.deepEqual(root.phases.map(p => p.map(n => n.title)), [["a", "b", "c"], ["d", "e"]]);
	// d is 2/4 = 50, e is 0 (edges: waiting on a sibling that does not exist → not landed)
	assert.equal(root.children.find(n => n.title === "d").pct, 50);
	assert.equal(root.children.find(n => n.title === "e").state, edges ? "waiting" : "running");
	// weighted mean: a,b,c 100 × 2 steps each, d 50 × 4, e 0 × 2 → (600 + 200) / 12 = 67
	assert.equal(root.pct, 67);
	assert.equal(root.state, "running");
}

// inbox senders: one with its own dir becomes a child, one without becomes a leaf
{
	const roots = build([
		{ dir: "ai/2026-09-29/p", agent: "boss", requested_at: T(9),
			inbox: [{ at: T(10), from: "m1", kind: "done" }, { at: T(11), from: "ghost", kind: "stopped" }] },
		{ dir: "ai/2026-09-29/m1-work", agent: "m1", requested_at: T(9) },
	]);
	assert.equal(roots.length, 1);
	const kids = Object.fromEntries(roots[0].children.map(n => [n.title, n]));
	assert.equal(kids["m1-work"].state, "landed");
	assert.equal(kids.ghost.state, "running");
}
console.log("tree.test: all assertions pass (plan by edges, plan by time, inbox children and leaves)");

// the real day
const day = process.argv[2] ?? "C:/Code/lew42/monorepo/public/framework/ai/2026-09-29";
const read = f => fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(s => s.trim())
	.flatMap(s => { try { return [JSON.parse(s)]; } catch { return []; } }) : [];
const manifests = [];
const walk = dir => {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()){
		const here = path.join(dir, e.name);
		if (fs.existsSync(path.join(here, "task.jsonl")))
			manifests.push(fold(here, read(path.join(here, "task.jsonl")), read(path.join(here, "inbox.jsonl"))));
		walk(here);
	}
};
walk(day);
console.log(`\n${path.basename(day)} — ${manifests.length} task logs\n`);
console.log(outline(build(manifests)).join("\n"));
