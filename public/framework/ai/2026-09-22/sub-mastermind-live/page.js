import { Page, div, p, span, b, a, code, pre } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column.
   2 SIZE       one screen: what the wake does, the two runs side by side, the
                way in. No picture — this is backend behaviour, not a UI.
   3 OWN LAYOUT `.flow` for the prose; the two runs are a `.grid.auto` pair of
                cards, because that is the one thing worth comparing at a glance.
   4 REGIONS    three: what the wake does, the two runs, the detail one click down.
   5 PREVIEW    the day board's own card; one line is enough. */

const RUNS = [
	{
		name: "Run 1 — wake OFF (the old bug, reproduced)",
		ok: false,
		lines: [
			["both.txt", "never written"],
			["task mastermind", "idle after its one turn — parked, for good"],
			["agent_msg lines received", "0"],
			["cost", "$1.07 (mastermind $0.70 + outer spawn $0.28 + 2 minions $0.09)"],
			["wall time", "27s to the last minion activity, then parked forever"],
		],
	},
	{
		name: "Run 2 — wake ON (the fix)",
		ok: true,
		lines: [
			["both.txt", "“alpha beta”, correct"],
			["task mastermind", "3 turns — spawn, hear from alpha, hear from beta → write → DONE"],
			["agent_msg lines received", "2, both logged before the turn that wrote both.txt"],
			["cost", "$0.69 (mastermind $0.46 + outer spawn $0.13 + 2 minions $0.09)"],
			["wall time", "46s, command start to DONE"],
		],
	},
];

export default new Page({
	meta: import.meta,
	title: "sub-mastermind-live",
	icon: "notifications_active",
	description: "A child agent's landing now wakes its parent — the parking bug reproduced, then fixed, with a real task mastermind and two minions.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "A child's landing wakes its parent now — the parking bug that killed every sub-mastermind, reproduced then fixed."));
	},

	content(){
		p(b("Every task mastermind that ever ran here died the same way."), " It spawned two minions in the background, went idle waiting for them, and nothing ever told it they were done — the notification went to a different session entirely. It sat there forever, and a human had to relay the answer by hand.");

		p("Servex fixes this because it holds every agent open as a real, long-lived process. ", b("A child with a `parent` now sends it ONE message the moment it finishes, is stopped, or errors"), " — and because the parent's own session never actually closes, that message starts it thinking again on its own, with no outside nudge.");

		p.c("h3", "The wake, in one call");
		pre.c("card", "Agents.wake_parent(child, kind)\n  // kind: \"done\" | \"blocked\" | \"error\"\n  // called from Agent.emit() on every result and error event\n  // sends: {from: child.id, reply_to: \"log agent-<parent>\"}\n  //   body: \"done: <child's last words, first 300 chars>\"").style({ marginBottom: "1em" });

		p.c("h3", "The proof: same brief, run twice");
		p("A task mastermind was told, verbatim: “spawn two minions (Haiku, effort low) — one writes ", code("a.txt"), " containing the word alpha, the other ", code("b.txt"), " with beta — then, when both are done, write ", code("both.txt"), " containing their two words and reply DONE.” Same brief, same two minions, both runs through a real ", code("claude -p"), " turn calling ", code("spawn_agent"), " over Servex's own MCP door. The only thing that changed between them is one environment variable.");

		div.c("grid auto gap-25", () => {
			RUNS.forEach(run => {
				div.c("card", () => {
					p(b(run.name));
					div.c("flow", () => {
						run.lines.forEach(([k, v]) => p(span.c("muted", k + ": "), v));
					});
				}).style({ borderColor: run.ok ? "var(--ok)" : "var(--warn)" });
			});
		}).style({ marginBlock: "1em" });

		p("The parked run's task mastermind sat idle with nothing queued behind it — it is not stuck, it is simply never going to hear from anyone again, which is the bug in one sentence. The fixed run's own log shows the difference plainly: two ", code("agent_msg"), " lines — one from each minion, ", code("done: Done."), " — landed before the turn that wrote ", code("both.txt"), " ran.");

		p.c("h3", "One bug found along the way");
		p("The first attempt at run 1 failed before it proved anything: a task mastermind's whole job is calling ", code("spawn_agent"), "/", code("send_to_agent"), "/", code("list_agents"), ", and its role defaulted to ", code("acceptEdits"), " — which pre-approves file edits, not tool calls, and nobody was there to click “allow” on a non-interactive session. Fixed in ", code("roles.js"), ": the ", code("task-mastermind"), " role now defaults to ", code("bypassPermissions"), ".");

		p.c("h3", "The detail, one click down");
		p(code("Servex/agents/Agents.js"), " has ", code("wake_parent()"), " and the call site in ", code("Agent.emit()"), ". ", code("Servex/agents/readme.md"), " has the five-line version. ", code("Servex/agents/roles.js"), " has the permission fix. The full run, second by second, with every cost and every log line: ", a("this task's log").href("/framework/ai/2026-09-22/sub-mastermind-live/"), ".");
	},
});
