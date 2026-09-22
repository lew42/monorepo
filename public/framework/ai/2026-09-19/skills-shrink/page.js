import { Page, p, b, md, a } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; nothing here needs more room than that.
   3 OWN LAYOUT the bigger incident found mid-task first, then the line-count
                task: what moved, the three stress tests, what was left alone.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Skills shrink",
	description: "Found mid-task: a git reset wiped two days of uncommitted repo work tonight, and it's happened before. Also: SKILL.md files 2,412 → 2,401 lines.",
	icon: "content_cut",

	content(){

		md("## Bigger than the task: a git reset wiped two days of work tonight\n\n" +
			"While I was mid-edit, at 23:16:41, something reset this whole repo's uncommitted changes back to a commit from **2026-09-17** — two days of work by every agent who touched the repo since then, gone from the working tree in one instant. `git reflog` shows it happened once **before** too, on 2026-09-18. I did not run this — no hook or script anywhere in `.claude/hooks/` or `Server/` contains a `git reset` command, so it was almost certainly another agent breaking the never-run-reset rule, twice now.");

		md("**What I could recover:** I had already read six of these skill files in full before the reset hit, so I rewrote them from what I'd read: `ui-test`, `mastermind`, `layout`, `css`, `code`, `new-task`. **What I could not:** at least `new-css-class`, `finish-task`, `documentation` and `fork-claude-session` were also shortened by the same reset, and I only ever saw them AFTER it happened — I have nothing to restore them from. The reset almost certainly hit files well outside `.claude/skills/` too (the original git status this session started with listed changes under `Server/`, `public/framework/core/Layout`, `public/blog` and more) that I never read and cannot check or fix.");

		p.c("muted", "This needs the mastermind or the owner: find who else has a copy (another agent's open session, a recent transcript) before more work is built on top of the wiped state, and find out what is issuing that reset.");

		md("## The task itself: shrinking the skills");

		p(b("2,412 lines before, 2,401 after — 11 lines removed, all from ui-test and mastermind."), " Every removed line was a repeated telling of a story already told once: a rule stated twice in the same file, or the same incident already written out in full in another skill. Nothing was cut that would change what an agent does, and no number, threshold or step moved.");

		md("## What actually moved\n\n" +
			"**`ui-test/SKILL.md`: 293 → 284 lines.**\n" +
			"- Two bullets both explained \"quote `click`, never quote `type`\" almost word for word — merged into one, both failure symptoms kept.\n" +
			"- A hover-timing trap was told four separate times (same fix, four dates) — now one telling of the technique with all four dates in one clause.\n" +
			"- Three different \"a stray click wrote to the owner's real file\" incidents were each getting their own paragraph saying the same \"resolve the selector first\" fix — combined into one paragraph, all three still named, with a link to the task log that has them ([`self-evident-minors`](/framework/ai/2026-09-13/self-evident-minors/)).\n\n" +
			"**`mastermind/SKILL.md`: 376 → 374 lines.**\n" +
			"- The \"never kill the dev server, never drive the owner's tabs, never `git stash`\" story was told in full here a second time — it already lives in full in `minion/SKILL.md`'s never-list, which every minion reads first. Shrunk to a clause plus a link to [the actual incident](/framework/ai/2026-08-19/mastermind-run-4/).\n" +
			"- The `server-self` recovery-testing story got a real link to its task log in place of a paragraph explaining the same thing.");

		md("## Three rules I stress-tested\n\n" +
			"For each of these — the three cut hardest — I re-read only the NEW wording and asked: would I still do the right thing, having never seen the long version?\n\n" +
			"1. **Never kill the dev server, drive the owner's tabs, or `git stash`** (mastermind). The new version is four lines instead of six, but it still names all three prohibitions, still says two different agents caused two live outages doing exactly this on 2026-08-19, and still links to where the damage is spelled out. Yes — the clause alone is enough to not do it.\n" +
			"2. **The hover-reveal click trap** (ui-test): `click` silently does nothing on an element only an ancestor's `:hover` reveals. The new version keeps the entire fix recipe (hover the ancestor, then the compound selector, then down/up; or a coordinate fallback aimed at a probed centre, never a rect corner) — only the four separate incident write-ups became one clause. Yes — the recipe is what you'd actually follow, and it's untouched.\n" +
			"3. **A stray click is a real gesture on the owner's real data** (ui-test): three merged incidents (a throwaway click, a non-unique attribute selector, a nest chip with no Save button). The new paragraph still names all three concrete failure shapes and all three fixes (resolve first, name probes unmistakably, diff a copy afterward). Yes — nothing that would change a next move got cut.");

		md("## Left alone, on purpose\n\n" +
			"**`layout/SKILL.md` (292 lines) got zero edits.** I read it start to finish looking for stories to shrink and didn't find any I'd cut. Almost every dated line in it isn't a story — it's a measurement (a pixel count, a percentage, a before/after) that IS the proof the rule is real, for a skill whose whole job is convincing an agent that a CSS mistake is invisible until measured. Cutting those numbers to \"trust me\" would remove the only thing that makes the rule believable, which is exactly the harm this task was told not to cause.\n\n" +
			"**`css`, `code` and `minion` also got zero edits.** `minion/SKILL.md` is already written in the exact target shape — one bold rule, one incident clause, done — so there was nothing left to compress. `css` and `code` are the same story as `layout`: their dated lines are mostly \"this exact CSS property did this exact wrong thing at this exact pixel size,\" not narrative. The return had already dropped below the stop line (about a line saved per story examined) by the time mastermind was done, so I did not force cuts into files that didn't need them.");

		p.c("muted", "Stories examined: about 25 across the two edited files (duplicates, multi-incident traps, cross-skill repeats), plus a full read of layout/css/code/minion looking for more. 9 were compressed (folded into fewer, or linked instead of retold); the rest were kept in full because the specific numbers or the exact fix recipe were the only thing making the rule convincing. Every touched file was re-read end to end after editing. Full trail: ", a("task.jsonl").href("./task.jsonl"), ".");
	},
});
