// core/Settings: get/set/own/load/reset/save/make_default, the three save policies, groups.
// Run: node public/framework/core/Settings/Settings.test.mjs
import { test } from "../Test/Test.js";
import { Settings } from "./Settings.js";

test("get falls back to the default until set", t => {
	const s = new Settings({ defaults: { volume: 5 } });
	t.eq(s.get("volume"), 5, "no override: reads the default");
	s.set("volume", 8);
	t.eq(s.get("volume"), 8, "own override wins");
});

test("set removes an override that is set back to the default", t => {
	const s = new Settings({ defaults: { volume: 5 } });
	s.set("volume", 8);
	t.eq(s.own, { volume: 8 }, "override recorded");
	s.set("volume", 5);
	t.eq(s.own, {}, "equal to the default: no longer an override");
});

test("set emits change with key and value", t => {
	const s = new Settings({ defaults: { a: 1 } });
	const seen = [];
	s.on("change", (key, value, group) => seen.push([key, value, group ?? null]));
	s.set("a", 2);
	t.eq(seen, [["a", 2, null]], "one change event, no group on a top-level field");
});

test("own: groups appear only while they have overrides of their own", t => {
	const s = new Settings({ defaults: { rate: 1 }, groups: { dictate: { defaults: { lang: "en" } } } });
	t.eq(s.own, {}, "nothing overridden anywhere");
	s.dictate.set("lang", "fr");
	t.eq(s.own, { dictate: { lang: "fr" } }, "the group shows up once it has its own override");
	t.eq(JSON.parse(JSON.stringify(s.own)), s.own, "own survives a JSON round trip");
});

test("a group's change bubbles to the parent with the group name, and schedules the parent's persist", t => {
	const calls = [];
	const s = new Settings({ defaults: {}, save: "manual", persist: own => calls.push(own), groups: { recite: { defaults: { speed: 1 } } } });
	const seen = [];
	s.on("change", (key, value, group) => seen.push([key, value, group]));
	s.recite.set("speed", 2);
	t.eq(seen, [["speed", 2, "recite"]], "the parent hears the group's change tagged with its name");
	t.eq(calls.length, 0, "manual policy: nothing persisted yet");
	s.save();
	t.eq(calls, [{ recite: { speed: 2 } }], "save() flushes the whole own shape");
});

test("load replaces every override and emits change per key that actually moved, but never persists", t => {
	const calls = [];
	const s = new Settings({ defaults: { a: 1, b: 2 }, save: "each", persist: own => calls.push(own) });
	s.set("a", 9);
	calls.length = 0;
	const seen = [];
	s.on("change", (...args) => seen.push(args));
	s.load({ b: 7 });
	t.eq(s.own, { b: 7 }, "a went back to the default, b is the new override");
	t.eq(seen.sort(), [["a", 1], ["b", 7]].sort(), "one change per key that moved");
	t.eq(calls.length, 0, "load never persists");
	seen.length = 0;
	s.load({ b: 7 });
	t.eq(seen.length, 0, "loading the same overrides again changes nothing");
});

test("reset drops every override and does persist", t => {
	const calls = [];
	const s = new Settings({ defaults: { a: 1 }, save: "manual", persist: own => calls.push(own) });
	s.set("a", 5);
	s.reset();
	t.eq(s.own, {}, "back to defaults");
	t.eq(calls, [{}], "reset persisted the empty overrides");
});

test("save policy 'each': every set persists immediately", t => {
	const calls = [];
	const s = new Settings({ defaults: { a: 1 }, save: "each", persist: own => calls.push({ ...own }) });
	s.set("a", 2);
	s.set("a", 3);
	t.eq(calls, [{ a: 2 }, { a: 3 }], "persisted on every set");
});

test("save policy {debounce_ms}: persists once, after the clock fires, using the injected clock", t => {
	const calls = [];
	const timers = [];
	const clock = {
		setTimeout: (fn, ms) => { const id = timers.length; timers.push({ fn, ms, id }); return id; },
		clearTimeout: id => { const t = timers.find(x => x.id === id); if (t) t.fn = null; },
	};
	const s = new Settings({ defaults: { a: 1 }, save: { debounce_ms: 400 }, persist: own => calls.push({ ...own }), clock });
	s.set("a", 2);
	s.set("a", 3);
	t.eq(calls.length, 0, "nothing persisted yet: the timer has not fired");
	const live = timers.filter(t => t.fn);
	t.eq(live.length, 1, "the first timer was cleared when the second set rescheduled it");
	live[0].fn();
	t.eq(calls, [{ a: 3 }], "persisted once, with the latest value");
});

test("save policy 'manual': only save() persists", t => {
	const calls = [];
	const s = new Settings({ defaults: { a: 1 }, save: "manual", persist: own => calls.push({ ...own }) });
	s.set("a", 2);
	t.eq(calls.length, 0, "set alone does not persist");
	s.save();
	t.eq(calls, [{ a: 2 }], "save() flushes it");
});

test("make_default merges defaults + own into the new defaults, clears own, persists, and the caller gets what to store", t => {
	const calls = [];
	const s = new Settings({ defaults: { a: 1, b: 2 }, save: "manual", persist: own => calls.push({ ...own }) });
	s.set("a", 9);
	const merged = s.make_default();
	t.eq(merged, { a: 9, b: 2 }, "the returned defaults are defaults + own");
	t.eq(s.own, {}, "own is cleared");
	t.eq(s.get("a"), 9, "reading now comes from the new default");
	t.eq(calls, [{}], "persisted the (now empty) overrides");
});

test("make_default recurses into groups, each returned under its own name", t => {
	const s = new Settings({ defaults: {}, groups: { dictate: { defaults: { lang: "en" } } } });
	s.dictate.set("lang", "fr");
	const merged = s.make_default();
	t.eq(merged.dictate, { lang: "fr" }, "the group's own merge is nested under its name");
	t.eq(s.dictate.get("lang"), "fr", "the group now reads it as its own default");
	t.eq(s.own, {}, "nothing left to override anywhere");
});
