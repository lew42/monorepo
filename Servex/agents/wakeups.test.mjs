// Restarts lose nothing: wake-ups survive a restart, and a snapshot taken before it names who comes back. `node Servex/agents/wakeups.test.mjs`. Doc: Servex/doc/restart.md.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "wakeups-"));
process.env.SERVEX_HOME = home;   // before home.js is imported: every file goes to the scratch folder
const { default: Wakeups } = await import("./Wakeups.js");
const { default: Log } = await import("../Log.js");
const { default: Agents } = await import("./Agents.js");

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const log = new Log();
const sent = [];
const host = { store: () => log, send: (id, text, note) => { sent.push({ id, text, note }); return true; } };

try {
	// 1. A wake-up is logged, and fires as a message with revive: true.
	let w = new Wakeups({ agents: host });
	const due_now = await w.set({ agent: "a1", in_min: 0, why: "check the build" });
	await new Promise(r => setTimeout(r, 50));
	ok(sent.length === 1 && sent[0].id === "a1" && sent[0].text.includes("check the build") && sent[0].note.revive === true, "a due wake-up sends the agent its own words, reopening it if asleep");

	// 2. A later one survives a restart: a fresh instance reads the log and arms it again; a fired one is not re-fired.
	const later = await w.set({ agent: "a2", in_min: 60, why: "look at CI" });
	w.stop();
	w = new Wakeups({ agents: host });
	const armed = w.start();
	ok(armed.length === 1 && armed[0].id === later.id, "after a restart only the pending wake-up is armed again (the fired one stays fired)");
	ok(!armed.some(x => x.id === due_now.id), "a fired wake-up never fires twice");

	// 3. Cancel writes a line; the next boot does not arm it.
	ok(await w.cancel(later.id, "a2") === true && new Wakeups({ agents: host }).start().length === 0, "a cancelled wake-up is gone after a restart too");
	w.stop();

	// 4. One that came due while Servex was down fires at boot, saying it is late.
	sent.length = 0;
	const missed = { type: "set", id: "w-missed", agent: "a3", due: new Date(Date.now() - 3600e3).toISOString(), why: "the nightly check", by: "a3" };
	await log.append("wakeups", missed);
	w = new Wakeups({ agents: host }); w.start();
	await new Promise(r => setTimeout(r, 50));
	ok(sent.length === 1 && sent[0].id === "a3" && /Servex was down/.test(sent[0].text), "a wake-up that came due while Servex was down fires at boot and says so");
	w.stop();

	// 5. The snapshot: live agents plus a dormant one that only a wake-up remembers; revive reads it once.
	const agents = new Agents({ log });
	agents.live.set("busy", { id: "busy", state: "working", session_id: "s1" });
	agents.live.set("quiet", { id: "quiet", state: "idle", session_id: "s2" });
	agents.wakeups = { list: () => [{ id: "w-x", agent: "sleeper", due: "2026-10-23T09:00:00Z", why: "morning check" }] };
	const snap = agents.snapshot({ by: "test" });
	ok(snap.agents.map(a => a.id).join() === "busy,quiet,sleeper" && snap.agents[2].wakeups[0].why === "morning check", "the snapshot lists every live agent and the dormant one a wake-up waits on");
	const prev = { boot: snap.boot };
	ok(agents.restart_snapshot(prev)?.agents.length === 3, "the next boot reads the snapshot taken by the Servex it replaces");
	ok(agents.restart_snapshot(prev) === null && fs.existsSync(agents.reg().file("restart-snapshot.used.json")), "read once: it is moved aside, so a later crash never reuses it");
	agents.snapshot({ by: "test" });
	ok(agents.restart_snapshot({ boot: "another-boot" }) === null, "a snapshot from a different boot is ignored");
} finally {
	log.close();
	await new Promise(r => setTimeout(r, 100));
	fs.rmSync(home, { recursive: true, force: true });
}
console.log(`${n} passing`);
process.exit(0);
