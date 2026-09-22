import { Page, p, b, div, md } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid, prose track (main).
   2 SIZE       one screen: an opening line, a boxed ranked list, two short
                grouped lists, a closing pointer.  No wide content needed.
   3 OWN LAYOUT the ranked list first and boxed (the one thing worth a second
                look), then "since yesterday" and "still broken" as plain
                grouped prose.  4 REGIONS none.  5 PREVIEW default card.

   Item 2 of the ranked list reads the supervisor's own heartbeat file live,
   in the browser, every time this page loads — the whole reason this page
   needed fixing once was a hardcoded pid that had already gone stale. */

const HEARTBEAT_URL = "/framework/ai/health/heartbeat.json";

export default new Page({
	meta: import.meta,
	title: "Start here",
	description: "Four things that need a decision from you, what actually got done since yesterday, and what's still broken — the short version of the handover.",
	icon: "checklist",

	content(){

		p(b("A lot happened while you were away, and almost none of it needs you to read code."), " Four things need a decision from you, in the order that unblocks the most. Everything below that is already done, or honestly marked as not.");
		p.c("muted", "Updated 2026-09-21, evening — corrected after item 2 turned out to name the wrong process, and item 3 pointed at two places instead of one.");

		const $first = div.c("surface pad flex v gap-25");
		render_first_steps($first);

		md("## What got done today\n\n" +
			"**V3 is now where the front door actually points, and it looks it.** It opens on V3 by " +
			"default (V1 still lives at `?v1`), grew [four quiet links out](/framework/ai/2026-09-21/v3-ways-out/) " +
			"to today's board, everything, process and this page, folds its less-used controls behind one " +
			"`More` button on a [phone-width screen](/framework/ai/2026-09-21/head-mobile/), and now " +
			"[says so](/framework/ai/2026-09-21/front-door-today/) when the conversation it's showing is " +
			"from Friday, not today.\n\n" +
			"**The live timeline reads as one list now, not a list with a box sitting on top of it.** The " +
			"pinned strip, and an empty box under it nobody had explained, are both gone; ordinary updates " +
			"are one compact line, a card that needs you is bigger, not pinned, and \"Live\" now means " +
			"exactly one thing — nothing is selected. [What changed](/framework/ai/2026-09-21/live-select/).\n\n" +
			"**Fixed.** The page-health watcher's real blind spot — it stopped checking anything for as " +
			"long as a batch of edits was being held — is found and fixed, along with the broken file-watch " +
			"that is why it kept running yesterday's rules all day (item 2, right above). " +
			"[What was wrong](/framework/ai/2026-09-21/safe-rollout/). A one-command private worktree and " +
			"server, for trying a change without touching the live site, is built — not yet run start to " +
			"finish.\n\n" +
			"**Written, not yet switched on.** 21 hard-learned traps (a backtick in a comment breaking a " +
			"whole page, that kind of thing) are consolidated into one patch for the coding rulebook, ready " +
			"to paste in. [The patch](/framework/ai/2026-09-21/traps-consolidate/skill-patch.md).");

		md("## Still broken or unfinished\n\n" +
			"- **The patch above isn't pasted in yet.** Nobody is blocked on it.\n" +
			"- **Today's minions could write but still couldn't run anything** — no `node`, no `git`, not " +
			"even `node --check` — so several of today's fixes are hand-checked, not proven; whoever acts " +
			"on this page is the one who actually proves them. [More on this](/framework/ai/handover.md).\n" +
			"- **Nobody has confirmed what causes the accidental stash** that caused Friday night's scare — " +
			"still just a leading guess. [The full handover](/framework/ai/handover.md) has what's known.");

		md("*This is the short version. The [full handover](/framework/ai/handover.md) has the detail this page leaves out on purpose.*").ac("muted");
	},
});

/* ── item 2's pid, read live from the supervisor's own heartbeat file ── */

async function render_first_steps($box){
	let hb = null;
	try {
		const res = await fetch(HEARTBEAT_URL + "?_=" + Date.now());
		if (res.ok) hb = await res.json();
	} catch {}

	const pid = hb?.supervisor_pid;
	const pid_text = pid ? "`" + pid + "`" : "not reporting right now — open [the file itself](" + HEARTBEAT_URL + ")";
	const stop_cmd = pid ? "`Stop-Process -Id " + pid + " -Force`" : "stop it using the pid the file gives you";

	$box.empty(() => {
		md("## Do this first\n\n" +
			"1. **Decide how this repo gets committed.** An accidental `git stash` has wiped a day of " +
			"uncommitted work twice in two days — the second time cost a whole night of recovery. Nothing " +
			"built today gets safer until you either commit this branch yourself now and then, or hand " +
			"over a branch an agent is allowed to commit to. It now also blocks something you asked for: a " +
			"git worktree only holds committed files, and with hundreds of files not yet committed, a fresh " +
			"worktree has no V3 in it at all — proven today by trying it. This is a decision, not a task, " +
			"and it outranks everything else here. [The full story](/framework/ai/handover.md).\n\n" +
			"2. **Restart one program — about 30 seconds, but the right one this time.** Yesterday's note " +
			"named the wrong process. Stop the *supervisor*, not the child it watches — its process id is " +
			"always in [`heartbeat.json`](" + HEARTBEAT_URL + ") as `supervisor_pid`, which right now is " +
			pid_text + " (this number is read live and changes every restart — never trust an old copy of " +
			"it). " + stop_cmd + ", then start it again: `node Server/health-supervisor.mjs`. The " +
			"supervisor's own way of noticing its rules had changed was broken, which is why it has been " +
			"running yesterday's rules all day — this restart is the only thing that turns the fix on. " +
			"[What today found](/framework/ai/2026-09-21/safe-rollout/).\n\n" +
			"3. **Paste one block into `.claude/settings.json` — about 2 minutes.** Two separate pastes " +
			"from yesterday are now one verified block covering both: one arms a safety net that already " +
			"exists but is switched off, and would have caught the exact kind of mistake that took the site " +
			"down once already; the other tells the assistant the moment you speak, instead of it finding " +
			"out up to 34 minutes later. Both were driven with real test payloads today, not just written. " +
			"[The one block to paste](/framework/ai/2026-09-21/arm-the-hooks/settings-block.md).\n\n" +
			"4. **Decide what happens to 22 files — about 5 minutes.** Unchanged since yesterday: the " +
			"honest intent was to delete them, but an accidental revert quietly brought the old versions " +
			"back, and no agent will delete a file on its own say-so. They're named plainly, with the " +
			"reasoning for each, on [the restore report](/framework/ai/2026-09-20/stash-restore/).");
	});
}
