// What replay really does today, as tests that pass: the facts the replay lab page (core/Item/replay/) shows live.
//   node public/framework/core/Item/replay.test.mjs
// Real components only: Item, Task, Store.attach / Store.read / Item.act and Item.open, through subclasses in replay/ (LabTask,
// LabLayer, LabCounter, LabDoc). The only fakes are the outside world (LabWorld: spawning an agent, asking an AI) and the disk
// (LabTape.Store: the real Store, opened from and flushed into memory). Nothing here is a mock of Item, Task or Store.
import Test from "../Test/Test.js";
import LabTape from "./replay/LabTape.js";
import LabWorld from "./replay/LabWorld.js";
import LabTask from "./replay/LabTask.js";
import LabLayer from "./replay/LabLayer.js";
import LabCounter from "./replay/LabCounter.js";
import LabDoc from "./replay/LabDoc.js";

const t = new Test("core/Item: what replay does today (the replay lab's facts)");
const world = LabTask.world = LabDoc.world = new LabWorld();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// A button press, saved one of the two ways: "changes" calls the method itself, "calls" goes through item.act().
const press = (kind, item, verb, args) => kind === "calls" ? item.act(verb, args) : item[verb](args);
// A live tab that has loaded an empty file, plus its tape.
const tab = async (Class, first, opts = {}) => { const tape = new LabTape({ first, ...opts }); return { tape, you: await tape.open(Class, { tab: "you", write: true }) }; };
const task_first = { id: "weekly", title: "Write the weekly report" };
// Reload: a fresh object built from the tape through the real Class.open, and what the outside world saw while it was built.
const reload = async (tape, Class) => { const mark = world.mark(); const item = await tape.open(Class); return { item, fx: world.since(mark) }; };

// ---- Start a task that spawns an agent ----
{
	const saved = {};
	for (const kind of ["changes", "calls"]){
		const { tape, you } = await tab(LabTask, task_first);
		press(kind, you, "start");
		await LabTape.tick();
		await sleep(40);
		const again = await reload(tape, LabTask);
		saved[kind] = { tape, you, ...again };
	}
	const { changes, calls } = saved;

	t.eq(changes.tape.lines.length - 1, 4, "start() through the method saves 4 change lines (state, ran_since, started_at, agent_id)");
	t.eq(Object.keys(calls.tape.lines.at(-1)).filter(k => k !== "by" && k !== "ts"), ["start"], "start() through act() saves one line, the verb");
	t.eq(calls.tape.lines.at(-1).start, {}, "the act() line is {start:{}} (plus the writer's by and ts)");

	t.eq(changes.fx.agents, 0, "replaying change lines never calls the method: no agent spawned on reload");
	t.ok(changes.item.state === "running" && changes.item.data.agent_id === changes.you.data.agent_id, "replaying change lines puts the values back: running, same agent_id");
	t.eq(calls.fx.agents, 1, "today: replaying an act() line runs the method again, so it spawns again");
	t.ok(calls.item.data.agent_id !== calls.you.data.agent_id, "the reloaded task has a different agent than the one before the reload");

	const twice = await reload(calls.tape, LabTask);
	t.eq(twice.fx.agents, 1, "every reload of an act() log spawns once more (replay is not idempotent for outside effects)");

	// The clock. A running Task reads its time from two saved values, `ran_since` (when the open span began) and `ran_ms` (banked time).
	t.ok(changes.you.duration() >= 30, "before the reload the running task has run for a while");
	t.ok(changes.item.duration() >= 30, "the open span is saved data (ran_since), so change lines keep the time: the reloaded task has run as long (core/Item/item-core.test.mjs, 1f)");
	t.ok(calls.item.duration() >= 30, "act() lines keep the time: Task.replay_line pins its clock to the line's ts, so the replayed task has run as long");
	t.eq(calls.item.data.started_at, calls.tape.lines.at(-1).ts, "the replayed started_at is the saved line's ts, not the time of the reload");
}

// Without a ts on the line the replayed Task has nothing to pin to, so it reads the wall clock.
{
	const { tape, you } = await tab(LabTask, task_first, { stamp: false });
	you.act("start");
	await LabTape.tick();
	await sleep(40);
	const again = await reload(tape, LabTask);
	t.ok(!("ts" in tape.lines.at(-1)), "this tape does not stamp its lines");
	t.ok(again.item.data.started_at > you.data.started_at, "an act() line with no ts restarts the clock: started_at is the reload time");
	t.ok(again.item.duration() < you.duration(), "and the time since start is smaller than before the reload");
}

// Stopping banks the time in data (ran_ms), and duration() reads it from there.
{
	const { tape, you } = await tab(LabTask, task_first);
	you.start();
	await sleep(40);
	you.stop();
	await LabTape.tick();
	const again = await reload(tape, LabTask);
	t.ok(again.item.data.ran_ms >= 30, "a stopped task's ran_ms is saved as data and replays");
	t.eq(again.item.duration(), again.item.data.ran_ms, "and duration() of the reloaded task is that banked time");
}

// ---- Is any replaying flag set? ----
{
	const seen = [];
	class SpyTask extends LabTask {
		start(){ seen.push({ store_replaying: this.store?.replaying, has_store: !!this.store, applying: this._applying }); return super.start(); }
	}
	SpyTask.Store = LabTape.Store;
	const { tape, you } = await tab(SpyTask, task_first);
	you.act("start");
	await LabTape.tick();
	t.eq(seen[0], { store_replaying: false, has_store: true, applying: undefined }, "live: no replaying flag is set while act() runs the method");

	await reload(tape, SpyTask);
	t.eq(seen[1], { store_replaying: true, has_store: true, applying: true }, "Item.open (a page load): Store.replaying is true while the method runs, and Task sets its private _applying");

	const mark = world.mark();
	SpyTask.replay(tape.json());
	t.eq(seen[2], { store_replaying: undefined, has_store: false, applying: true }, "Item.replay (the node twin): no store, so no Store.replaying; only the private _applying");
	t.eq(world.since(mark).agents, 1, "Item.replay of an act() line also runs the method and spawns");

	// A method that checks the one real flag skips the spawn, but then the agent is never saved anywhere.
	LabTask.skip_when_replaying = true;
	const flagged = await reload(tape, LabTask);
	LabTask.skip_when_replaying = false;
	t.eq(flagged.fx.agents, 0, "a method that skips outside effects while Store.replaying is set does not spawn on reload");
	t.ok(flagged.item.state === "running" && flagged.item.data.agent_id === undefined, "but the reloaded task is running with no agent: the result was never saved");
}

// ---- Two tabs press the same button at the same moment ----
// The second tab has loaded the file as it is now. Both press, then each tab hears the other's saved line (Store.read, the live tail).
async function both(kind, Class, first, verb){
	const { tape, you } = await tab(Class, first);
	const other = await tape.open(Class, { tab: "tab B", write: true });
	const before = tape.entries.length;
	press(kind, you, verb);
	press(kind, other, verb);
	await LabTape.tick();
	you.store.read(JSON.parse(JSON.stringify(tape.entries.slice(before).filter(e => e.tab === "tab B").map(e => e.line))));
	return { tape, you, other, after: (await tape.open(Class)) };
}
{
	const first = { id: "layer", visible: true, x: 24, y: 40 };
	const changes = await both("changes", LabLayer, first, "toggle");
	const calls = await both("calls", LabLayer, first, "toggle");
	t.ok(changes.tape.lines.slice(1).every(l => l.set?.visible === false), "two tabs toggling through set: both lines say visible:false");
	t.ok(changes.you.visible === false && changes.after.visible === false, "two tabs toggling through set agree: hidden, live and after a reload");
	t.ok(calls.tape.lines.slice(1).every(l => l.toggle), "two tabs toggling through act(): both lines say toggle()");
	t.ok(calls.you.visible === true && calls.after.visible === true, "two tabs toggling through act() cancel out: visible again, live (after hearing the other tab) and after a reload");

	const counter = { id: "likes", count: 0 };
	const c_changes = await both("changes", LabCounter, counter, "increment");
	const c_calls = await both("calls", LabCounter, counter, "increment");
	t.eq([c_changes.tape.lines[1].set, c_changes.tape.lines[2].set], [{ count: 1 }, { count: 1 }], "two tabs incrementing through set: both save count:1");
	t.eq([c_changes.you.count, c_changes.after.count], [1, 1], "change lines lose a click: 1 live, 1 after a reload, though two people pressed");
	t.eq([c_calls.you.count, c_calls.after.count], [2, 2], "act() lines keep both clicks: 2 live, 2 after a reload");
}

// ---- Ask an AI ----
{
	const doc = { id: "notes", title: "Q3 planning notes", summary: "" };
	const results = {};
	for (const kind of ["changes", "calls"]){
		const { tape, you } = await tab(LabDoc, doc);
		press(kind, you, "summarize");
		await LabTape.tick();
		results[kind] = { tape, you, ...(await reload(tape, LabDoc)) };
	}
	t.eq(results.changes.tape.lines[1].set.summary, results.changes.you.summary, "summarize() through the method saves the AI's text as a value");
	t.eq([results.changes.fx.ai, results.changes.item.summary], [0, results.changes.you.summary], "replaying it shows the same text and asks nothing again");
	t.eq(results.calls.tape.lines[1].summarize, {}, "summarize() through act() saves only the verb: the text is not in the log");
	t.eq([results.calls.fx.ai, results.calls.fx.cost], [1, LabWorld.PRICE], "replaying the verb asks the AI again and pays again");
	t.ok(results.calls.item.summary !== results.calls.you.summary, "and the new text differs from the one the person saw");
	t.ok(LabDoc.prototype.summarize.toString().includes("if (this.summary) return"), "the method has a guard (already summarized?), which does not help: a rebuilt document starts empty");
}

// ---- Drag a layer ----
{
	const first = { id: "layer", visible: true, x: 24, y: 40 };
	const moves = [{ dx: 3, dy: 1 }, { dx: 4, dy: 0 }, { dx: 2, dy: 2 }];
	const drag = {};
	for (const kind of ["changes", "calls"]){
		const { tape, you } = await tab(LabLayer, first);
		for (const move of moves) press(kind, you, "move", move);
		await LabTape.tick();
		drag[kind] = { tape, you, after: await tape.open(LabLayer) };
	}
	t.eq(drag.changes.tape.lines.length - 1, 5, "a drag of 3 moves saves 5 change lines (one per field that changed)");
	t.eq(drag.calls.tape.lines.length - 1, 3, "a drag of 3 moves saves 3 act() lines (one per move)");
	for (const kind of ["changes", "calls"]) t.eq([drag[kind].after.x, drag[kind].after.y], [33, 43], `a dragged layer rebuilds to the same place from the ${kind} log`);
}

// ---- What a replayed line is, by class ----
{
	const { tape, you } = await tab(LabLayer, { id: "layer", visible: true, x: 24, y: 40 });
	you.act("hide");
	await LabTape.tick();
	const line = tape.lines.at(-1);
	t.ok(line.hide && !("set" in line), "a plain Item's act() line is {hide:{}}: replay reaches the method through set()'s rule that a key naming a method calls it");
	t.eq((await tape.open(LabLayer)).visible, false, "and the reloaded layer is hidden");
}

t.done();
