import View, { div, h2, p, span, nav, a, ol, li, table, thead, tbody, tr, th, td } from "../../View/View.js";
import LabExampleView from "./LabExampleView.js";
import TaskExample from "./TaskExample.js";
import LayerExample from "./LayerExample.js";
import CounterExample from "./CounterExample.js";
import DocExample from "./DocExample.js";

View.stylesheet(import.meta, "replay.css");

/* class ReplayLab extends View: the whole page. A short answer, four examples (one at a time, chosen by the url's #hash), and
   what they add up to. Each example is a LabExample that keeps its state while you look at another one. Readme: readme.md. */
export default class ReplayLab extends View {

	static examples = [TaskExample, LayerExample, CounterExample, DocExample];

	// The rules the examples add up to, corrected by what the real classes do (the first sketch is replay-lab.html's text).
	static rules = [
		"**Save the changes by default.** Reload puts the values back, so no method runs twice and old history keeps its meaning. One catch the real `Task` shows: anything a class keeps in a plain field instead of a saved value, like its running clock, does not come back.",
		"**The screen should follow saved values.** A task that is running looks running after a click, after another tab's change and after a reload, as long as everything on screen is a saved value or computed from one. `Task.duration()` is not: it reads two plain fields.",
		"**Outside effects run once, where someone acted** (spawn an agent, ask an AI), and their result is saved as a value (`agent_id`, the summary text).",
		"**Save what the person meant.** A visibility button means “hide it”, so save `visible: false`, not `toggle()`. A +1 button means “add one”, so save the call, `increment()`.",
	];

	static table = [
		["Start a task that spawns an agent", "right, except the running time reads 0:00", "spawns again; the time is right", "a replay runs the method again; a Task reads its clock from the saved line's time"],
		["Toggle visibility in two tabs at once", "right", "flips back, live tabs too", "both people meant “hide”; two toggles cancel out"],
		["Drag a layer", "up to 2 lines per mouse move", "1 line per mouse move", "both rebuild the position; both are noisy, and one lost line drifts"],
		["+1 in two tabs at once", "loses a click", "right", "both tabs computed “old value + 1”; the calls keep both intents"],
		["Ask an AI for a summary", "right", "new text, paid again", "an outside answer must be saved, not asked again"],
	];

	// Where the real classes are not what the first sketch said. Tests: ../replay.test.mjs (they pass) and ../replay-vs-open.test.mjs (it fails).
	static differences = [
		"**Replaying a saved call does run the method.** A `Task` reads `{start:{}}` through its verb lines, a plain `Item` through the rule that a key naming a method calls it. So a reload of the calls log runs `start()` again, and the lab's `start()` spawns again.",
		"**There is no replaying flag on the item.** A page load sets `Store.replaying` on the store while it replays; `Item.replay`, the node twin, has no store and so no flag; a `Task` sets a private `_applying`. The “replaying flag” box uses `Store.replaying`.",
		"**A running Task keeps its clock in plain fields.** `_ran_since` and `_ran_ms` are never saved, and the saved fields `started_at` and `ran_ms` do not set them, so replaying change lines gives a running task the time 0:00. Replaying the call runs `start()`, which sets them.",
		"**The time survives a replayed call.** The real writer stamps every line with `ts`, and a replayed `Task` reads its clock from the line. The first sketch said the timer restarts; it does only when a line has no `ts` (untick the stamp box).",
		"**Task.start() already has a guard.** It refuses a task that is running. A rebuilt task begins idle, so the guard lets the replayed call through.",
		"**A drag is not one line.** The Store saves one line for every field that changes, so a change log gets up to two lines per mouse move, not one per drag.",
		"**Item.replay and Item.open disagree about a plain Item's first line.** The failing test `replay-vs-open.test.mjs` records it; nothing was fixed.",
	];

	render(){
		this.ac("core-item-replay");
		this.examples = ReplayLab.examples.map(X => new X());
		LabExampleView.say("core-item-replay-lede", "**Short answer: save the changes by default, and save the call only when the call is what the person meant.** Do something below, then press **Reload the page**. Every press is saved two ways at once, and Reload rebuilds the object from each saved log, so you see what each one brings back and what it runs a second time.");
		LabExampleView.say("muted core-item-replay-lede", "These are the real `Item`, `Task` and `Store` classes. Only the outside world, spawning an agent and asking an AI, is faked, and nothing is written to disk: the saved lines live in this page's memory.");
		this.$tabs = nav.c("core-item-replay-tabs");
		this.$example = div();
		this.draw_rules();
		this.ready = Promise.all(this.examples.map(example => example.start())).then(() => this.route());
		window.addEventListener("hashchange", () => this.route());
	}

	// The example the url names (#task, #layer, #counter, #ai), the first one if none.
	route(){
		const id = location.hash.slice(1), example = this.examples.find(e => e.constructor.id === id) ?? this.examples[0];
		this.$tabs.empty(() => this.examples.forEach(e => a.c("core-item-replay-tablink", e.constructor.tab).href("#" + e.constructor.id).attr("aria-current", e === example ? "page" : null)));
		this.$example.empty(() => new LabExampleView({ example }));
	}

	draw_rules(){
		div.c("card core-item-replay-rules", () => {
			h2("What the four examples add up to");
			ol(() => ReplayLab.rules.forEach(text => li(() => LabExampleView.say("", text, span))));
			div.c("core-item-replay-tablewrap", () => table(() => {
				thead(() => tr(() => ["Example", "Saved as changes", "Saved as calls", "Why"].forEach(name => th(name))));
				tbody(() => ReplayLab.table.forEach(row => tr(() => row.forEach((text, i) => td.c(i === 1 ? "is-changes" : i === 2 ? "is-calls" : "", text)))));
			}));
		});
		div.c("card core-item-replay-rules", () => {
			h2("Where the real classes differ from the first sketch");
			ol(() => ReplayLab.differences.forEach(text => li(() => LabExampleView.say("", text, span))));
			p.c("muted", () => {
				a("replay.test.mjs").href("../replay.test.mjs");
				span(" · ");
				a("replay-vs-open.test.mjs").href("../replay-vs-open.test.mjs");
			});
		});
	}
}
