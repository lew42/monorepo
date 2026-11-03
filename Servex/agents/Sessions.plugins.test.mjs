/* node Servex/agents/Sessions.plugins.test.mjs — a voice session's Chat-settings plugin overrides (saved as session.settings
 * groups in its OWN session.jsonl, since chat-settings-session: core/Session/readme.md, "Session.settings"), and the shared
 * defaults ("Make default"): POST /api/session/settings {session, plugins}, POST /api/session/defaults {plugins}. Plain node,
 * a scratch repo. `settings()`'s own `plugins` param is the GROUPED shape the page sends ({dictate, recite}, step-4 review
 * fix 3: one splitter, in the browser — Servex never guesses a plugin's group); its RESPONSE and `plugins_of()` give back
 * the flat {Name: {enabled?, config?}} shape instead, the one the page reads. */
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

await check("a session's plugin overrides are saved in its OWN session.jsonl, read back, and survive a reload", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	assert.deepEqual(s.plugins_of(s.map[a.session]), {}, "a new session has none: it starts from the defaults");
	const grouped = { recite: { Interrupt: { enabled: false }, SendTiming: { config: { pause_send_ms: 1500 } } } };   // the page's own split (VoiceChat.overrides_by_group)
	const r = s.settings({ session: a.session, plugins: grouped });
	assert.deepEqual(r.plugins, grouped.recite, "the response is the FLAT shape, rebuilt from the replay, not what was posted");
	assert.deepEqual(s.plugins_of(s.map[a.session]), grouped.recite, "GET /api/session/<id> rebuilds the same flat shape, so a phone reads them too");
	assert.equal(s.map[a.session].plugins, undefined, "not kept on the sessions.json record any more");
	const t = make(s.file);   // a fresh Sessions instance, same sessions.json (simulates a Servex restart)
	assert.deepEqual(t.plugins_of(t.map[a.session]), grouped.recite, "still there after a Servex restart: the session's own session.jsonl, not sessions.json");
	assert.deepEqual(s.settings({ session: a.session, plugins: null }).plugins, {}, "null clears (Reset to default)");
	assert.deepEqual(s.plugins_of(s.map[a.session]), {});
});

await check("posting grouped plugins writes both groups exactly as given", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	const grouped = { dictate: { Whisper: { config: { lang: "en" } } }, recite: { Interrupt: { enabled: false } } };
	s.settings({ session: a.session, plugins: grouped });
	assert.deepEqual(s.plugins_of(s.map[a.session]), { ...grouped.dictate, ...grouped.recite }, "both groups landed, flat-merged on read");
});

await check("plugins are checked per group: a plain object of {enabled?: boolean, config?: object}, nothing else", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	for (const bad of ["x", [], { P: true }, { P: { enabled: "yes" } }, { P: { config: [] } }, { P: { config: { f: { deep: 1 } } } }, { "__proto__x": 1 }])
		assert.throws(() => s.settings({ session: a.session, plugins: { recite: bad } }), /plugins/, JSON.stringify(bad));
	assert.deepEqual(s.plugins_of(s.map[a.session]), {}, "a refused write leaves nothing behind");
});

await check("an unknown top-level group is refused: plugins must be {dictate, recite}, not a flat {Name: ...} or anything else", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	for (const bad of [{ Interrupt: { enabled: false } }, { sing: {} }, "x", []])
		assert.throws(() => s.settings({ session: a.session, plugins: bad }), /plugins/, JSON.stringify(bad));
	assert.deepEqual(s.plugins_of(s.map[a.session]), {}, "a refused write leaves nothing behind");
});

await check("other settings are not disturbed by plugins, and the other way round", () => {
	const s = make(), a = s.create({ path: "/a/", fresh: true });
	s.settings({ session: a.session, assistant: "single" });
	s.settings({ session: a.session, plugins: { recite: { P: { enabled: true } } } });
	assert.equal(s.map[a.session].assistant, "single");
	s.settings({ session: a.session, every: 2 });
	assert.deepEqual(s.plugins_of(s.map[a.session]), { P: { enabled: true } });
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
