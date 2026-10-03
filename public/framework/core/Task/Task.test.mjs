// Node test for Task — no DOM, no server. Run: `node Task.test.mjs`.
import Task from "./Task.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};

check("starts idle", () => new Task({ id: "t" }).state === "idle");

check("start() moves idle -> running and stamps started_at", () => {
	const t = new Task({ id: "t" });
	t.start();
	return t.state === "running" && typeof t.data.started_at === "string";
});

check("pause()/resume() round-trip", () => {
	const t = new Task({ id: "t" });
	t.start(); t.pause();
	if (t.state !== "paused") return false;
	t.resume();
	return t.state === "running";
});

check("an illegal transition warns and is a no-op, never a throw", () => {
	const t = new Task({ id: "t" });
	t.pause();   // idle -> pause is illegal
	return t.state === "idle";
});

check("finish() refuses while a subtask is open, naming it", () => {
	const t = new Task({ id: "t", data: { title: "Parent" } });
	const a = new Task({ id: "a", data: { title: "Sub A" } });
	t.tasks.add(a);
	t.start();
	t.finish();
	return t.state === "running";   // refused — a is still idle, not finished
});

check("finish() succeeds once every subtask is finished", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	t.tasks.add(a); t.tasks.add(b);
	t.start();
	a.start(); a.finish();
	b.start(); b.finish();
	t.finish();
	return t.state === "finished" && typeof t.data.finished_at === "string";
});

check("progress() reflects finished subtasks, computed not stored", () => {
	const t = new Task({ id: "t" });
	const a = new Task({ id: "a" }), b = new Task({ id: "b" });
	t.tasks.add(a); t.tasks.add(b);
	if (JSON.stringify(t.progress()) !== JSON.stringify({ done: 0, total: 2 })) return false;
	a.start(); a.finish();
	return JSON.stringify(t.progress()) === JSON.stringify({ done: 1, total: 2 });
});

check("progress() with no subtasks is 0/1, then 1/1 once finished", () => {
	const t = new Task({ id: "t" });
	if (JSON.stringify(t.progress()) !== JSON.stringify({ done: 0, total: 1 })) return false;
	t.start(); t.finish();
	return JSON.stringify(t.progress()) === JSON.stringify({ done: 1, total: 1 });
});

check("duration() counts running time, not paused time", () => {
	const t = new Task({ id: "t" });
	t.start();
	const d1 = t.duration();
	t.pause();
	const banked = t.duration();
	// time passing while paused must not grow duration()
	return d1 >= 0 && banked >= d1 && t.duration() === banked;
});

check("stop() records why and stamps stopped_at", () => {
	const t = new Task({ id: "t" });
	t.start();
	t.stop("owner cancelled");
	return t.state === "stopped" && t.data.why === "owner cancelled" && typeof t.data.stopped_at === "string";
});

const { default: Item } = await import("../Item/Item.js");

check("Task.register()'d — hydrates from a type:\"Task\" line", () => {
	const t = new Task({ id: "t" });
	t.tasks.add(new Task({ id: "a" }));
	const json = JSON.parse(JSON.stringify(t));
	const back = Item.hydrate(json);
	return back instanceof Task && back.tasks.length === 1 && back.tasks.find("a") instanceof Task;
});

const passed = results.filter(Boolean).length;
console.log(`\n${passed} / ${results.length} passing`);
if (passed !== results.length) process.exit(1);
