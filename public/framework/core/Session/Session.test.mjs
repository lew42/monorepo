// Node test for Session as an Item with tasks. Run: `node Session.test.mjs`.
import Session from "./Session.js";
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
	s.tasks.find("a").complete();
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
process.exit(results.every(Boolean) ? 0 : 1);

import Day from "./Day.js";
check("Day.of keeps a bare YYYY-MM-DD as that local day; other forms keep the local rule", () =>
	Day.of("2026-10-19") === "2026-10-19" && Day.path("2026-10-19") === "2026/10/19" && Day.of("") === "" && Day.of(new Date(2026, 9, 19, 23, 30)) === "2026-10-19" && Day.of("2026-10-19T08:00:00-05:00") !== "");
