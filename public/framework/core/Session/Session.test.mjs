// Node test for Session as an Item with tasks. Run: `node Session.test.mjs`.
import Session from "./Session.js";
const EV = { outcome: "ok", evidence: ["test"] };
import Task from "../Task/Task.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};

check("a Session keeps its id and is an Item", () => new Session("abc").id === "abc" && typeof new Session("abc").set === "function");

check("three tasks, one complete: completion is 1/3 and progress {1,3}", () => {
	const s = new Session("s");
	for (const id of ["a", "b", "c"]) s.tasks.add(new Task({ id }));
	s.tasks.find("a").complete(EV);
	const p = s.progress();
	return p.done === 1 && p.total === 3 && Math.abs(s.completion - 1 / 3) < 1e-9;
});

check("no tasks: completion 0, progress {0,0}", () => { const s = new Session("s"); return s.completion === 0 && s.progress().total === 0; });

check("replay: a tasks.add line adds a Task", () => {
	const s = Session.replay([{ session: "r1" }, { tasks: { add: { type: "Task", id: "t1", data: { title: "one" } } } }, { tasks: { add: { type: "Task", id: "t2", data: { state: "complete" } } } }]);
	return s.id === "r1" && s.tasks.length === 2 && s.tasks.find("t1") instanceof Task && s.progress().done === 1;
});

check("settings lines merge in order, a later line wins, and never reach put()", () => {
	const s = Session.replay([{ session: "m1" }, { settings: { model: "a", notify: true } }, { settings: { model: "b" } }]);
	return s.settings.model === "b" && s.settings.notify === true && s.get_one?.("settings") === undefined;
});

check("the menu is a template: settings first, page entries get a url under the session's own", () => {
	const m = new Session("m2").menu("/framework/ai/sessions/m2/");
	return m[0].name === "settings" && m[0].url === "/framework/ai/sessions/m2/settings/" && m.some(e => e.action) && !m.find(e => e.action).url;
});

check("Session.describe() lists tasks and progress", () => {
	const d = Session.describe(), names = [...d.fields, ...d.methods.map(m => m.name)];
	return names.includes("tasks") && names.includes("progress");
});

console.log(`${results.filter(Boolean).length}/${results.length}`);
check("the session snapshot (2026-10-23): line times, a reopened session, stopped tasks folded", () => {
	const s = Session.replay([
		{ session: { id: "x", at: "2026-10-20T00:00:00.000Z" } },
		{ stop: { why: "abandoned", by: "StaleClose" }, ts: "2026-10-21T00:00:00.000Z" },
		{ start: {}, ts: "2026-10-22T00:00:00.000Z" },
		{ tasks: { add: { type: "Task", id: "a", title: "A" } }, ts: "2026-10-22T01:00:00.000Z" },
		{ tasks: { add: { type: "Task", id: "b", title: "B" } }, ts: "2026-10-22T01:00:00.000Z" },
		{ tasks: { a: { start: {} } }, ts: "2026-10-22T02:00:00.000Z" },
		{ tasks: { a: { complete: EV } }, ts: "2026-10-22T03:00:00.000Z" },
		{ tasks: { b: { stop: { why: "noise" } } }, ts: "2026-10-22T04:00:00.000Z" },
	]);
	const a = s.tasks.find("a"), p = s.progress();
	return s.data.state === "running" && s.data.why === null
		&& a.data.completed_at === "2026-10-22T03:00:00.000Z" && a.duration() === 3600e3
		&& p.done === 1 && p.total === 1 && p.stopped === 1 && s.completion === 1
		&& s.first_at === "2026-10-20T00:00:00.000Z" && s.span_ms === 2 * 86400e3 + 4 * 3600e3 && Task.clock === null;
});

check("replay: a bare child id walks to a nested task, two levels down (process-system lines 120-129)", () => {
	const lines = [{ session: "r2" }, { tasks: { add: { type: "Task", id: "top", title: "top" } } },
		{ tasks: { top: { tasks: { add: { id: "kid", title: "kid" } } } } },   // an untyped add under a task is a Task
		{ top: { start: {} } },
		{ top: { kid: { complete: EV } } },   // the id nested inside the first
		{ top: { tasks: { add: { id: "kid2", title: "kid2" } } } },
		{ kid2: { complete: EV } }];   // a nested id at the TOP level of the line
	const s = Session.replay(lines), top = s.tasks.find("top"), kid = top.tasks.find("kid"), kid2 = top.tasks.find("kid2");
	return top instanceof Task && kid instanceof Task && kid.state === "complete" && kid2.state === "complete" && top.progress().done === 2 && top.progress().total === 2 && !("kid2" in s.data);
});

process.exit(results.every(Boolean) ? 0 : 1);

import Day from "./Day.js";
check("Day.of keeps a bare YYYY-MM-DD as that local day; other forms keep the local rule", () =>
	Day.of("2026-10-19") === "2026-10-19" && Day.path("2026-10-19") === "2026/10/19" && Day.of("") === "" && Day.of(new Date(2026, 9, 19, 23, 30)) === "2026-10-19" && Day.of("2026-10-19T08:00:00-05:00") !== "");
