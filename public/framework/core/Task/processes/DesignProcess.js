// The "design" process template: design to code: variants in Figma, reviewed by screenshot, the picked ones coded as pages.
// A step: id, title, `do` (the job), `session` ({run: fresh | same | owner | wait, role, model, effort}). A step id never names a Task verb or field (`improve` would call improve()).
// Design to code (the owner, 2026-10-22): more than one design per view, reviewed by screenshot, the picked variants coded as real pages
// the owner clicks through on the phone. A variant is a set of changes on its parent: a subclass of its view, at <page>/v/<name>/.
import Process from "../Process.js";

const SONNET = "claude-sonnet-5-5";

export class DesignProcess extends Process {
	static template = "design";
	static steps = [
	{ id: "design", title: "Design the variants", session: { run: "fresh", role: "helper", model: SONNET, effort: "medium" },
		do: "Read the brief. In Figma, draw the default for each view the brief names and two to four variants of it, each named for its one change (header-scrolls-away, bar-segmented…); a variant of a variant is a sub-version. Write variants.md beside the brief: the tree (default → versions → sub-versions), each line the change and why. Outcome: the Figma page url and the tree." },
	{ id: "review-shots", title: "Review by screenshot", session: { run: "fresh", role: "reviewer", model: SONNET, effort: "medium" },
		do: "Screenshot every frame in variants.md (Figma get_screenshot). Judge each against the brief and the page, layout and color skills; mark keep or cut with one reason in variants.md. Outcome: the kept variants." },
	{ id: "pick", title: "Pick the variants to code", session: { run: "owner" },
		do: "Read variants.md and the shots. Complete with outcome 'code: <names>' (in autonomous mode the creator picks), or 'redesign: <what>'." },
	{ id: "code", title: "Code the picked variants", session: { run: "fresh", role: "helper", model: SONNET, effort: "medium" },
		do: "In a served worktree (take_worktree), code the default as a real page and each picked variant as a subpage <page>/v/<name>/ whose view extends its parent's view and changes only its difference; sub-versions nest (v/<name>/v/<sub>/). The default page lists the tree as links, so the owner can click through on the phone. Load each with check_page; commit each step; never merge. Outcome: branch, worktree url, the variant urls." },
	{ id: "review", title: "Review the pages", session: { run: "fresh", role: "reviewer", model: SONNET, effort: "medium" },
		do: "Shoot every variant page at 400 and 1200 px (the shot tool) at the worktree url, check the console, compare each with its Figma frame. Outcome: 'ready to merge: <branch>' with the shot paths, only when every page loads clean; else 'not checked: <why>'." },
	{ id: "merge", title: "Merge", session: { run: "wait" },
		do: "The owner merges the reviewed branch, or says no." },
	];
}

export default DesignProcess;
