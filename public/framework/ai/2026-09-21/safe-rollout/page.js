import { Page, p, md, div, span, View } from "/app.js";
import { HealthLog, today_url } from "/framework/ai/health/log.js";

View.stylesheet(import.meta, "/framework/ai/health/health.css");   // reused, not duplicated

/* One screen: the outage, the real reason the watcher missed it, and what it
   catches now — led by a live before/after so this page keeps telling the
   truth after it lands, not just a snapshot. Full story: requirements.md. */
export default new Page({
	meta: import.meta,
	title: "safe-rollout",
	icon: "health_and_safety",
	description: "Why the page-health watcher missed this morning's outage, and what stops it happening again.",
	children: "scratch-break",

	content(){
		md("**At 11:14 this morning an agent hand-edited a live page and broke it** — " +
			"`/framework/ai/` threw and showed nothing but a Page Load Error for about three " +
			"minutes. `Server/health.mjs`, the watcher whose whole job is to catch exactly that, " +
			"never logged a thing. Full brief: [requirements.md](requirements.md).");

		div.c("health-section", () => {
			div.c("health-head", "The real cause — not the one I guessed going in");
			p("The watcher already checks for a thrown error, a blank page, and a bad HTTP status — " +
				"that machinery was built and working before today. The actual bug: while a reload " +
				"hold is active, the watcher defers every check, with no limit — so a page that breaks " +
				"and gets fixed entirely inside one hold window is never checked in either state. " +
				"The hold only pauses this repo's own live-reload broadcast, not what the server " +
				"actually serves — so real visitors were never protected by it at all. Fix: past 60 " +
				"seconds of being held, the watcher checks anyway. Detail: Server/health.mjs, the " +
				"comment on is_held().");
		});

		const $proof = div.c("health-section");
		load_proof($proof);

		div.c("health-section", () => {
			div.c("health-head", "Out of band, and the worktree habit");
			p("A page that goes dead now also posts straight to the owner's own dev-bar log, not just " +
				"a line in a file nobody's reading yet — `Server/health.mjs`, `notify_out_of_band()`. " +
				"And two new scripts, `Server/worktree-up.mjs` / `worktree-down.mjs`, give an agent a " +
				"private worktree with its own server on a free port in one command, so a change to a " +
				"page the owner is looking at can be built and smoke-tested there first, never on the " +
				"live tree. Both skills (`minion`, `mastermind`) now say so.");
		});

		div.c("health-section", () => {
			div.c("health-head", "Still needs a human — this session couldn't run any of it");
			p("This session's shell tools refused to run `node` at all (even a syntax check) and " +
				"refused `git worktree add`, with no way for a headless session to grant the approval " +
				"they asked for — so the hold-cap and out-of-band pieces above, and both worktree " +
				"scripts, are written and hand-checked but never actually executed. Two things to do: " +
				"restart `Server/health-supervisor.mjs` (read `supervisor_pid` from " +
				"`/framework/ai/health/heartbeat.json`, stop it, start it again) so it picks up today's " +
				"fixes — its own watch on health.mjs turned out to be broken too (below) — and run " +
				"`node Server/worktree-up.mjs proof` once to confirm the worktree script end to end. " +
				"`.claude/` edits were refused the same way; the two skill sections are sitting ready " +
				"to paste in [`skill-patch.md`](skill-patch.md).");
		});
	},
});

/* ── the proof: a scratch page under this same task, broken and fixed on purpose ── */

function load_proof($box){
	let draw = () => {};
	const log = new HealthLog({ url: today_url() });
	draw = () => $box.empty(() => board(log));
	log.live(draw).then(draw);
}

const PROOF_URL = "/framework/ai/2026-09-21/safe-rollout/scratch-break/";

function board(log){
	div.c("health-head", "The proof: a scratch page, broken on purpose, caught, then fixed");
	p("[This disposable page](" + PROOF_URL + ") lives only under this task's own folder — the " +
		"safe way to prove the fix without ever touching a page the owner uses.");

	if (!log.loaded){ p("Today's health log hasn't loaded yet."); return; }

	const mine = [
		...log.errors.filter(e => e.url === PROOF_URL).map(e => ({ ...e, verb: "error" })),
		...log.oks.filter(e => e.url === PROOF_URL).map(e => ({ ...e, verb: "ok" })),
	].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));

	if (!mine.length){
		p("No log lines for the scratch page yet.");
	} else {
		mine.forEach(row => {
			div.c("health-row " + (row.verb === "error" ? "health-error" : "health-clear"), () => {
				span.c("muted", new Date(row.at).toLocaleTimeString() + " — ");
				span(row.verb === "error" ? `caught it: ${row.text}` : "clean again — the fix was seen.");
			});
		});
	}
}
