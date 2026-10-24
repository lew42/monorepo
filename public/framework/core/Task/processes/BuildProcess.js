// The "build" process template: one idea built and merged: investigate, plan, improve, approve, execute, index, review, merge.
// A step: id, title, `do` (the job), `session` ({run: fresh | same | owner | wait, role, model, effort}). A step id never names a Task verb or field (`improve` would call improve()).
import Process from "../Process.js";

const SONNET = "claude-sonnet-5-5";

export class BuildProcess extends Process {
	static template = "build";
	static steps = [
	{ id: "investigate", title: "Investigate", session: { run: "fresh", role: "helper", model: SONNET, effort: "low" },
		do: "Read the brief and the readmes on the way to the code it names. Write investigation.md beside the brief: the questions that matter, ranked; what is known, as class sketches (class X extends Y, its core API) and named parts; what already exists to reuse (node Server/PastWork.mjs \"<topic>\"); risks. Mark each fact you checked in the code as checked; the rest are guesses." },
	{ id: "plan", title: "Plan", session: { run: "same" },
		do: "Write plan.md beside the brief: the class sketch, the files to change, small steps you can check, and how you will prove it works. Then re-read the owner's words in the brief and say, one line each, whether the plan covers them. If it changes what the owner sees, the plan shows the look first: a Figma frame or a screenshot of a small slice, linked in plan.md, so approve-plan approves the look before anything more is built." },
	{ id: "improve-plan", title: "Improve the plan", session: { run: "fresh", role: "reviewer", model: SONNET, effort: "medium" },
		do: "Read the brief, investigation.md and plan.md with fresh eyes. Fix plan.md where it misses the brief, rebuilds something that exists, or is bigger than needed. List what you changed at the end of plan.md under 'Improved'." },
	{ id: "approve-plan", title: "Approve the plan", session: { run: "owner" }, home_after: true,
		do: "Read plan.md. Complete this step with outcome 'approved' (plus any caveat), or 'changes: …' naming what the builder must change first." },
	{ id: "execute", title: "Execute", session: { run: "fresh", role: "helper", model: SONNET, effort: "medium" },
		do: "Build the plan on its own branch in a worktree Servex serves: take one with the take_worktree tool (it has its packages and a site at http://<name>.localhost/). Only if that tool is missing, use git worktree add -b task/<slug> ../worktrees/<slug> michael/dev, and say in the outcome that it is not served. Apply any 'changes:' from the approve-plan step first. Load every page you changed with check_page at its worktree url and fix each console error. Commit each working step. Never merge. Outcome: the branch, the worktree url, the commits, and how you tested it." },
	{ id: "index", title: "Index it", session: { run: "same" },
		do: "Make what you built findable, on the same branch: a line in the readme of every folder it touched (the readme names every part; the documentation skill, section 4), and a real, visible link to every new page on its parent page (a name in a leaf page's children: draws no link, so it does not count). Prove it with node Server/NavCheck.mjs <worktree dir> --base <worktree url>: it loads each new page's parent headless and fails for any page no a[href] points at; merge.mjs runs the same check and refuses an unlinked page (override: --no-nav 'why'). Outcome: the readme lines, the links you added, and the NavCheck result." },
	{ id: "review", title: "Review", session: { run: "fresh", role: "reviewer", model: SONNET, effort: "medium" },
		do: "Review the branch named in the execute outcome (git diff michael/dev...<branch>) against plan.md and the brief. Fix small problems on the branch and commit; run the test the plan names. Load every changed page with check_page at the worktree url from the execute outcome (and the shot tool at 400 and 1200 px when the brief names widths). Outcome: 'ready to merge: <branch>' only when those pages loaded with no console errors; if you could not load them, 'not checked: <why>', never ready." },
	{ id: "merge", title: "Merge", session: { run: "wait" },
		do: "The owner merges the reviewed branch, or says no." },
	];
}

export default BuildProcess;
