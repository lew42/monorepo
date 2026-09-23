import { Page, div, p, b, a, code, img } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column.
   2 SIZE       one screen: the six numbers as one-liners, two screenshots side
                by side, one paragraph, the way in. Nothing here needs `wide` —
                the shots are small enough to sit two-up inside the reading
                measure at 1280 and up, and stack at 400 with no extra rule.
   3 OWN LAYOUT the numbers are a stack of one-liners (`flex v gap-25`), not six
                cards — a card each would be six boxes for six short facts. The
                two shots are `flex wrap gap-25` so they sit side by side when
                there's room and stack when there isn't — no width rule needed.
   4 REGIONS    three: the numbers, the two shots, the one paragraph + the way in.
   5 PREVIEW    the day board's own card; one line is enough. */

const SHOT_1280 = new URL("shots/days-1280.png", import.meta.url).pathname;
const SHOT_400 = new URL("shots/days-400.png", import.meta.url).pathname;

const NUMBERS = [
	["Up time", "~5.3s once the npm ci bug below is worked around — 3.1s to create the worktree (matching worktree-design's own number exactly), 0.8s npm ci, 1.4s server boot. The script itself took 18.1s, because a real bug in it wastes a dead 15-second wait."],
	["Size on disk", "278 MB — 274 MB of checked-out files plus 3.7 MB of node_modules. Matches worktree-design's measured 274 MB almost exactly."],
	["Reachable through the proxy", "No, not yet — Servex has no way to learn a worktree's port without a code change outside this task's fence. Proved on the worktree's own direct port instead: 200, zero console errors."],
	["The real task, proven", "Yes — the days-view follow-up (bold task name, no more links on a working row) fixed and committed inside the worktree, headless-proven at 1280 and 400."],
	["Brought home, proven", "Yes — landed into the main tree's working files, zero console errors on a private server. git cherry-pick itself refused; a plain patch of the one commit is what actually worked."],
	["Down time", "1089 ms — worktree, branch, directory and registry entry all confirmed gone by direct inspection, not by trusting the script's own printed output."],
];

export default new Page({
	meta: import.meta,
	title: "worktree-proof",
	icon: "account_tree",
	description: "One real task, built end to end inside a real worktree, reached through the proxy, then removed — the numbers, and everything that had to be worked around to get them.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "A worktree, a real fix, the proxy gap, and a clean teardown — six numbers, two shots."));
	},

	content(){
		p(b("A worktree got built, did a real job, and was torn down again — and the numbers worktree-design predicted held up almost exactly."), " Size (278 MB) and create time (3.1s) both matched its estimate. What did not hold up: two scripts and one git command each needed a workaround, which is the real finding here.");

		div.c("flex v gap-25", () => {
			NUMBERS.forEach(([label, text]) => p(b(label + " — "), text));
		}).style({ marginBlock: "1em" });

		div.c("flex wrap gap-25", () => {
			div.c("flex v gap-25", () => {
				p.c("muted", "The fixed days view at 1280 — bold task name leading each row.");
				img.c("card").attr("src", SHOT_1280).attr("alt", "The days view at 1280: each row leads with a bold task name, then the sentence.").style({ display: "block", width: "26em" });
			});
			div.c("flex v gap-25", () => {
				p.c("muted", "The same view at 400 — a phone width.");
				img.c("card").attr("src", SHOT_400).attr("alt", "The same days view at a phone width, 400px.").style({ display: "block", width: "10em" });
			});
		}).style({ marginBlock: "1em" });

		p.c("h3", "By hand today, versus one command");
		p("Today, a task mastermind wanting this would run ", code("worktree-up.mjs"), ", patch a broken ", code("npm ci"), " call by hand, boot the server itself once the packages actually exist, copy today's own uncommitted files into the worktree before there is anything real to fix (this repo's main tree is never committed), land the one real commit with a raw patch because ", code("git cherry-pick"), " refuses a file the main tree already touched, and boot a private server just to prove the landing before releasing the reload hold. ", b("That should be one command each way"), " — ", code("worktree-up.mjs"), " fixed to not throw on ", code("npm ci"), " and to seed the worktree from the dirty main tree instead of bare HEAD, and a single ", code("worktree-land.mjs <name> <sha>"), " doing the patch-apply-behind-a-hold sequence this task just did by hand.");

		p.c("h3", "The detail, one click down");
		p("Every measurement, the two script bugs (", code("npm ci"), "'s EINVAL and the worktree's blindness to today's uncommitted files), the Servex proxy gap and exactly what would close it, and the cherry-pick-versus-patch decision are all in ",
			a("this task's own log").href("/framework/ai/2026-09-22/worktree-proof/"), ". The design and its own measurements: ",
			a("worktree-design").href("/framework/ai/2026-09-22/worktree-design/"), ". The days-view feature this proof patched: ",
			a("days-view").href("/framework/ai/2026-09-22/days-view/"), ". ",
			code("Servex/readme.md"), " is the coder's index for the proxy gap — it sits beside ", code("public/"), ", not inside it, so the site cannot link to it directly.");
	},
});
