import LabExample from "./LabExample.js";
import LabTask from "./LabTask.js";
import { div, span, b } from "../../View/View.js";

const { clock, dur, near } = LabExample;

// Example 1: start a task that spawns an agent, wait, reload.
export default class TaskExample extends LabExample {

	static id = "task";
	static tab = "Start a task";
	static title = "Start a task that spawns an agent";
	static look = "Press **Start**, wait a few seconds, then **Reload the page**. After a reload it should look running, keep its time, and not spawn a second agent.";
	static hint = "The real Task already refuses to start a task that is running. A reload begins with an idle task, so that guard cannot help.";
	static Class = LabTask;
	static counts = ["agents"];
	static first(){ return { id: "weekly", title: "Write the weekly report" }; }
	static buttons = [{ label: "Start", verb: "start" }, { label: "Stop", verb: "stop" }];
	static options = [
		{ key: "skip", label: "A replaying flag: skip the outside effect while the page loads (checks Store.replaying)" },
		{ key: "stamp", label: "Stamp every saved line with its time (ts), as the real writer does. Changing this starts over.", start_over: true },
	];
	static keys = [
		{ key: "state", label: "state", read: t => t.state },
		{ key: "started", label: "started", read: t => t.data.started_at ? Date.parse(t.data.started_at) : null, show: clock, same: near },
		{ key: "agent", label: "agent", read: t => t.data.agent_id ?? null, show: v => v ?? "none" },
		{ key: "time", label: "time", read: t => t.duration(), show: dur, same: near },
	];

	apply_options(){ LabTask.skip_when_replaying = this.options.skip; }

	draw(item, tickers){
		div.c("core-item-replay-card", () => {
			div.c("core-item-replay-row", () => { b(item.data.title); span.c("core-item-replay-pill is-" + item.state, item.state); });
			div.c("core-item-replay-row", () => {
				const $time = span.c("core-item-replay-big", dur(item.duration()));
				tickers.push(() => $time.text(dur(item.duration())));
				span.c("muted", "started ", () => b(clock(item.data.started_at ? Date.parse(item.data.started_at) : null)));
				span.c("muted", "agent ", () => b(item.data.agent_id ?? "none"));
			});
		});
	}

	why(kind){
		const { fx } = this.columns[kind].after, wrong_time = this.diffs(kind).some(d => d.startsWith("time"));
		if (kind === "changes") return "The saved values were put back and no method ran, so no agent was spawned." + (wrong_time
			? " But the time is wrong: `Task.duration()` adds up two plain fields, `_ran_since` and `_ran_ms`, and a field line never sets them. Only state, started_at and agent_id came back, so a running task reads 0:00 and does not tick."
			: "");
		if (fx.agents) return "`start()` ran again and spawned another agent. " + (this.options.stamp
			? "The time is right: every saved line carries its time (`ts`), and a replayed Task reads its clock from the line, not from the wall clock."
			: "The start time is the reload time: these lines carry no `ts`, so the replay falls back to the wall clock.");
		return this.options.skip ? "The flag stopped the second agent, but the agent's id was never saved, so the task looks running with no agent." : "";
	}
}
