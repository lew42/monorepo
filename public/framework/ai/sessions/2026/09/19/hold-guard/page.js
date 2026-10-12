import { Page, md, p, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid, everything at --measure prose width.
   2 SIZE       one screen: what changed, then the three proof outcomes, then
                one line on what was left alone and why. Full command output
                lives in this task's own log, one click down.
   3 OWN LAYOUT no grid needed — a stack of paragraphs and one markdown list.
   4 REGIONS    none.   5 PREVIEW  core's default card on the day board.
   ⚠ No template literals anywhere in this file — plain "…" strings, so a
     stray backtick can never end one. */

export default new Page({
	meta: import.meta,
	title: "Hold guard",
	description: "The reload hold used to expire silently after five minutes with nothing telling the agent — a real write once went out unheld because of it. A new check now notices and renews it.",
	icon: "lock_clock",

	content(){
		p(b("Server/hold.mjs pauses live reload for a batch of writes, and on purpose it can never stick forever — it lets itself go after five minutes."), " That part was always correct. What was missing: nothing told an agent when its OWN hold had already lapsed. Tonight one agent took a hold, stepped away to investigate something, came back and kept writing — the hold had quietly expired while it was gone, and its next write went out unheld. The owner's live site 404'd for about fourteen seconds before another watcher caught it. A new hook, .claude/hooks/hold-guard.mjs, closes exactly that gap: on an agent's next write, it checks whether a hold that agent took has since lapsed, and if so, silently re-takes it and says so in one line — instead of the agent finding out from a 404.");

		md("## The three outcomes, proven with the real lock file\n\n" +
			"1. **The hold had lapsed** — took a real hold with a 5-second test TTL, let it expire, then wrote a file. The check printed: `RELOAD HOLD RENEWED: your hold \"hg-test-1\" had lapsed ... it has been silently re-taken for another 300s ...` — and the lock file showed a fresh hold immediately after.\n" +
			"2. **No hold was ever taken** — same write, from an agent with no hold on record at all. The check printed nothing and touched nothing, exactly as a plain write outside any batch should behave.\n" +
			"3. **The hold is genuinely still live** — took a real hold, wrote a file well before its TTL was up. The check printed nothing; the lock file read the same time remaining before and after.\n\n" +
			"Renewing, not just warning, was the choice: an agent still writing plainly still wants the hold, and a warning alone would leave the very next write unheld again unless the agent stopped to fix it by hand. The named risk is the opposite case — an agent that truly finished and forgot to release could have some later, unrelated write quietly re-arm the old hold — but that risk is smaller and more local than the live 404 this closes: renewal only ever fires for a write carrying that *same* agent's own hold, and the five-minute self-expiry still applies afterward either way.");

		md("**Why the expiry itself was left alone:** a hold that could never lapse on its own would be worse than this — it could block every reload forever if an agent crashed mid-batch. Nothing about how or when the lock expires changed; the only new thing is that the agent doing the writing now hears about it.\n\n" +
			"Full transcript of all three proof runs, and the decision line, in this task's own log — reachable from [today's board](/framework/ai/2026-09-19/).");
	},
});
