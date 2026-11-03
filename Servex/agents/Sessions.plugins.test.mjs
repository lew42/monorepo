/* node Servex/agents/Sessions.plugins.test.mjs — a voice session's Chat-settings plugin overrides, and the shared defaults
 * ("Make default"): POST /api/session/settings {session, plugins}, POST /api/session/defaults {plugins}. Plain node, a scratch repo. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Sessions from "./Sessions.js";

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log("PASS —", name); };

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sessions-plugins-test-"));
for (const d of ["public/a"]) fs.mkdirSync(path.join(repo, d), { recursive: true });
const agents = { live: new Map(), spawn(){ return { id: "x", state: "working" }; }, send(){}, stop(){} };
let n = 0;
const make = file => {
	const s = new Sessions({ repo, file: file ?? path.join(repo, `sessions-${++n}.json`), assistant: "off" });
	s.load(); s.servex = { agents };
	return s;
};

await check("a session's plugin overrides are saved, read back, and survive a reload", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	assert.equal(s.map[a.session].plugins, undefined, "a new session has none: it starts from the defaults");
	const over = { Interrupt: { enabled: false }, SendTiming: { config: { pause_send_ms: 1500 } } };
	const r = s.settings({ session: a.session, plugins: over });
	assert.deepEqual(r.plugins, over, "the response carries them");
	assert.deepEqual(s.map[a.session].plugins, over, "GET /api/session/<id> returns the session record, so a phone reads them too");
	const t = make(s.file);
	assert.deepEqual(t.map[a.session].plugins, over, "after a Servex restart");
	assert.equal(s.settings({ session: a.session, plugins: null }).plugins, undefined, "null clears (Reset to default)");
	assert.equal("plugins" in s.map[a.session], false);
});

await check("plugins are checked: a plain object of {enabled?: boolean, config?: object}, nothing else", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	for (const bad of ["x", [], { P: true }, { P: { enabled: "yes" } }, { P: { config: [] } }, { P: { config: { f: { deep: 1 } } } }, { "__proto__x": 1 }])
		assert.throws(() => s.settings({ session: a.session, plugins: bad }), /plugins/, JSON.stringify(bad));
	assert.equal(s.map[a.session].plugins, undefined, "a refused write leaves nothing behind");
});

await check("other settings are not disturbed by plugins, and the other way round", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	s.settings({ session: a.session, assistant: "single" });
	s.settings({ session: a.session, plugins: { P: { enabled: true } } });
	assert.equal(s.map[a.session].assistant, "single");
	s.settings({ session: a.session, every: 2 });
	assert.deepEqual(s.map[a.session].plugins, { P: { enabled: true } });
});

await check("Make default is shared: stored once on Servex, read back, survives a reload, null clears", () => {
	const s = make(), file = path.join(repo, "defaults-test.json");
	s.defaults_file = file;
	assert.deepEqual(s.plugin_defaults({}).plugins, {}, "none yet");
	const d = { Interrupt: { enabled: false, config: { threshold: 0.2 } } };
	assert.deepEqual(s.plugin_defaults({ plugins: d }).plugins, d);
	const t = make(); t.defaults_file = file;
	assert.deepEqual(t.plugin_defaults({}).plugins, d, "a second Servex start (or the phone's GET) reads the same");
	assert.deepEqual(t.plugin_defaults({ plugins: null }).plugins, {});
	assert.throws(() => t.plugin_defaults({ plugins: "x" }), /plugins/);
});

fs.rmSync(repo, { recursive: true, force: true });
console.log(`Sessions.plugins.test.mjs: ${checks} checks passed`);
