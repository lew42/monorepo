/* node Servex/agents/Sessions.mastermind.test.mjs — ask8-session-mastermind: one standing `mastermind`
 * per voice session (Sessions.js `ensure_mastermind`), instead of the one shared `mastermind-voice-system`.
 * Its brief is generic and lives in its own system prompt (`public/framework/ux/Dictate/mastermind.md`,
 * loaded by `path`), never a per-session `prompt` — review finding 1, 2026-11-03: a `prompt` here ran a
 * real turn on the owner's first sentence. Plain node, a scratch repo and a fake agent host: no model runs. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sessions from "./Sessions.js";

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log("PASS —", name); };
const tick = () => new Promise(r => setImmediate(r));
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sessions-mastermind-test-"));
fs.mkdirSync(path.join(repo, "public/a"), { recursive: true });
let spawned = [], fail_mastermind = false;
const agents = {
	live: new Map(),
	spawn(spec){
		if (spec.role === "mastermind" && fail_mastermind) throw new Error("no mastermind for you");
		spawned.push(spec);
		const id = spec.id ?? `${spec.role}-${spec.name}`, a = { id, state: "working", session_id: null };
		this.live.set(id, a);
		return a;
	},
	send(){}, stop(id){ this.live.get(id).state = "stopped"; },
};
let n = 0;
const make = () => {
	const s = new Sessions({ repo, file: path.join(repo, `sessions-${++n}.json`), assistant: "single", single_pause_ms: 60 });
	s.load(); s.servex = { agents };
	return s;
};

await check("one create plus the first say spawns exactly one mastermind, role/path/parent right", async () => {
	spawned = []; fail_mastermind = false;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	s.say({ session: made.session, path: "/a/", text: "Hello.", via: "text" });
	await tick();
	const mm = spawned.filter(x => x.role === "mastermind");
	assert.equal(mm.length, 1, "exactly one mastermind spawned");
	assert.equal(mm[0].path, "public/framework/ux/Dictate/");
	assert.equal(mm[0].parent, "sessions");
	assert.equal(mm[0].parent_session, made.session);
	assert.equal(mm[0].dormant_after, 0);
	assert.ok(!("prompt" in mm[0]), "no prompt: held open, idle, costs nothing until used (review finding 1)");
	assert.equal(s.map[made.session].mastermind, mm[0].id ?? `mastermind-${made.session}`);
});

await check("a second say in the same session spawns no second mastermind", async () => {
	spawned = []; fail_mastermind = false;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	s.say({ session: made.session, path: "/a/", text: "First.", via: "text" });
	await tick();
	assert.equal(spawned.filter(x => x.role === "mastermind").length, 1);
	s.say({ session: made.session, path: "/a/", text: "Second.", via: "text" });
	await tick();
	assert.equal(spawned.filter(x => x.role === "mastermind").length, 1, "still just one — reused, not respawned");
});

await check("the seat's brief carries its own session's mastermind id and no leftover {{", async () => {
	spawned = []; fail_mastermind = false;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	s.say({ session: made.session, path: "/a/", text: "Hello.", via: "text" });
	await tick();
	const seat = spawned.find(x => x.role === "single-voice-assistant");
	const text = typeof seat.system === "string" ? seat.system : seat.system.append;
	const mm_id = s.map[made.session].mastermind;
	assert.ok(mm_id, "a mastermind id was recorded on the session");
	assert.ok(text.includes(mm_id), "the seat brief names this session's own mastermind");
	assert.ok(!text.includes("{{"), "no leftover placeholder");
});

await check("a mastermind spawn failure falls back to the old shared mastermind-voice-system, and does not throw", async () => {
	spawned = []; fail_mastermind = true;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	s.say({ session: made.session, path: "/a/", text: "Hello.", via: "text" });
	await tick();
	assert.ok(!s.map[made.session].mastermind, "no id recorded: the spawn failed");
	const seat = spawned.find(x => x.role === "single-voice-assistant");
	const text = typeof seat.system === "string" ? seat.system : seat.system.append;
	assert.ok(text.includes("mastermind-voice-system"), "falls back to the shared mastermind so the turn still works");
});

const BRIEF = path.join(ROOT, "Servex/agents/single-voice-assistant.md");
await check("the seat brief stays under 900 words", () => {
	const words = fs.readFileSync(BRIEF, "utf8").split(/\s+/).filter(Boolean).length;
	assert.ok(words < 900, `the brief has ${words} words`);
});

console.log(`Sessions.mastermind.test.mjs: ${checks} checks passed`);
fs.rmSync(repo, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
