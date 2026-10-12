import { Page, p, div } from "/app.js";

/* One screen: the two numbers, the families the traps actually fell into,
   and what I kept that the brief itself suggested might be cut. Full text
   of what should land: skill-patch.md (this session couldn't write to
   .claude/ directly, so the patch is unapplied). */
export default new Page({
	meta: import.meta,
	title: "traps-consolidate",
	icon: "warning",
	description: "Twenty hard-won traps, folded from a backlog nobody reads into one section of the code skill.",

	content(){
		p("`.claude/skills/code/improvements.md` held 20 dated entries (21 distinct traps — one " +
			"entry named two) going back to 2026-09-04, each a real bug that really bit an agent, " +
			"and none of them had ever reached `code/SKILL.md`, the file every agent actually loads. " +
			"The job: read all 21, group them by what actually goes wrong, and fold them into " +
			"SKILL.md's \"Failures that never throw\" section — shorter than the backlog they " +
			"replace, not longer.");

		div.c("health-section", () => {
			div.c("health-head", "The two numbers");
			p("31 lines removed from `improvements.md` (everything but its 4-line header). About " +
				"20 lines added to `SKILL.md`'s trap section — 4 existing bullets grew one sentence " +
				"each, 16 are new. Shorter, as required, and all 21 source traps are accounted for.");
		});

		div.c("health-section", () => {
			div.c("health-head", "The families the evidence actually fell into");
			p("Some matched the brief's own guess — the ambient captor (a factory called bare, a " +
				"callback's return value appended twice, the captor passed as an argument) and " +
				"comments/templates that close early (a backtick, a literal `*/`) both held together " +
				"as one family each. Others split or stood alone: config fields that mean something " +
				"narrower than they look (`icon:`, `index: true`, `a({href})`) turned out to be a " +
				"different shape than a shadowed METHOD, so it became its own family instead of " +
				"joining the View-member-shadowing list. Seven traps — the export pass-through, a " +
				"link's hash/query state read before `pushState()`, `View.html()`'s SVG sanitizer, a " +
				"`<details>` toggle loop, a Server/ plugin's init-order trap, `flex-shrink`, and a " +
				"shared import's sitewide blast radius through DevBar — didn't fit any family and " +
				"got their own line.");
		});

		div.c("health-section", () => {
			div.c("health-head", "What I kept that the brief suggested might go");
			p("The counter-lesson inside the async-before-attach family — the `isConnected` guard " +
				"belongs only on a LATER callback, never on a page's first draw — stayed in full. " +
				"Trimming it to match its neighbor's length is exactly the mistake it exists to " +
				"prevent: a shortened version reads like \"always guard with isConnected,\" which is " +
				"the wrong lesson. I also kept the one entry that added no new fact (a 2026-09-18 " +
				"reinforcement of a rule already on SKILL.md) — folded its evidence in rather than " +
				"silently dropping it, since \"still bites after being read once\" is itself worth " +
				"knowing. Full reasoning: this task's `task.jsonl`.");
		});

		div.c("health-section", () => {
			div.c("health-head", "What's not actually done yet");
			p("This session's `.claude/` writes were refused, the same way `safe-rollout` and " +
				"`v3-ways-out` earlier today had their own tools refused. The finished text sits in " +
				"[`skill-patch.md`](skill-patch.md), written as the exact replacement for SKILL.md's " +
				"trap section plus the emptied `improvements.md` — someone with write access to " +
				"`.claude/` needs to paste both in.");
		});
	},
});
