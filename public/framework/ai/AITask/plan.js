/* The made-up two-phase plan every design is drawn on — the shape tree.js hands
   back ({dir, title, agent, children, after, state, pct, phases}), written out by
   hand so the three designs can be compared on exactly the same tasks.

   A root task. Phase 1: three tasks side by side — one landed, one at 60%, one at
   20%, and the 60% one has two minions of its own. Phase 2: two tasks side by side,
   both waiting for all of phase 1. */

const d = "2026-09-29/demo-plan";
const node = (slug, title, state, pct, extra = {}) =>
	({ dir: `${d}/${slug}`, url: false, title, agent: `minion-${slug}`, children: [], after: [], state, pct, phases: [], ...extra });

const research = node("research", "Read today's logs", "landed", 100);
const build = node("build", "Build the tree", "running", 60, {
	children: [
		node("build/data", "Write tree.js", "landed", 100),
		node("build/tests", "Write the tests", "running", 20),
	],
});
build.phases = [build.children];
const design = node("design", "Try three designs", "running", 20);

const phase1 = [research, build, design];
const after1 = phase1.map(n => n.dir);
const page = node("page", "Route the pages", "waiting", 0, { after: after1 });
const docs = node("docs", "Write the doc page", "waiting", 0, { after: after1 });

const children = [...phase1, page, docs];

export const plan = {
	dir: d, url: false, title: "Nested tasks", agent: "task-mastermind-nested", state: "running",
	children, after: [], phases: [phase1, [page, docs]],
};

/* The parent's % is the mean of its children weighted by their step counts (1 each
   here), so (100 + 60 + 20 + 0 + 0) / 5. */
plan.pct = Math.round(children.reduce((s, n) => s + n.pct, 0) / children.length);

export default [plan];
