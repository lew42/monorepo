// A standing agent gets a fresh session once a day, never mid-task. `node Servex/agents/respawn.test.mjs`. Doc: agents/doc/lifecycle.md.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Respawn from "./Respawn.js";

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const DAY = 24 * 3600e3, NOW = Date.parse("2026-10-23T12:00:00Z");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "respawn-"));
fs.writeFileSync(path.join(dir, "session.jsonl"), "{}\n");

// A fake host: one live architect, a registry, spawn/stop recorded.
function host(agent, extra = []){
	const live = new Map([[agent.id, agent], ...extra.map(a => [a.id, a])]), rows = { [agent.id]: { ...agent } }, spawned = [], stopped = [], lines = [];
	return {
		spawned, stopped, lines,
		servex: {
			agents: { live, reg: () => ({ read: () => rows }), stop(id, { by }){ stopped.push({ id, by }); live.get(id).state = "stopped"; }, spawn(spec){ spawned.push(spec); return { id: spec.id, session_id: "new-session" }; } },
			task_loop: { write_line: (file, line) => lines.push({ file, line }) },
			say(){},
		},
	};
}
Respawn.AGENTS = [{ id: "arch", role: "mastermind", model: "claude-opus-5-5", effort: "high", task: dir, title: "Standing architect" }];
const arch = (o = {}) => ({ id: "arch", state: "idle", session_id: "old-session", started_at: new Date(NOW - 2 * DAY).toISOString(), queue: { items: [] }, ...o });

try {
	let h = host(arch({ started_at: new Date(NOW - 3600e3).toISOString() }));
	ok(!(await new Respawn({ servex: h.servex }).tick(NOW)).length && !h.spawned.length, "an hour-old session is left alone");

	h = host(arch({ state: "working" }));
	ok(!(await new Respawn({ servex: h.servex }).tick(NOW)).length, "a working one is never replaced (never mid-task)");

	h = host(arch(), [{ id: "kid", parent: "arch", state: "working" }]);
	ok(!(await new Respawn({ servex: h.servex }).tick(NOW)).length, "nor while something it spawned is working");

	h = host(arch({ queue: { items: [1] } }));
	ok(!(await new Respawn({ servex: h.servex }).tick(NOW)).length, "nor while a message waits in its queue");

	h = host(arch());
	const out = await new Respawn({ servex: h.servex }).tick(NOW);
	ok(out.length === 1 && h.stopped[0]?.id === "arch" && h.spawned[0]?.id === "arch" && h.spawned[0].model === "claude-opus-5-5", "a day-old idle one is stopped and spawned fresh under the same id");
	ok(h.spawned[0].prompt.includes("old-session") && h.spawned[0].task.dir === dir, "the fresh session is told the session it replaces and opens the same task folder");
	ok(h.lines[0]?.file === path.join(dir, "session.jsonl") && h.lines[0].line.log.respawn.replaces === "old-session" && h.lines[0].line.log.respawn.session === "new-session", "one respawn line in the task log links the two sessions");

	h = host(arch({ state: "stopped" }));
	ok(!(await new Respawn({ servex: h.servex }).tick(NOW)).length, "one stopped on purpose stays stopped");
} finally {
	fs.rmSync(dir, { recursive: true, force: true });
}
console.log(`${n} passing`);
