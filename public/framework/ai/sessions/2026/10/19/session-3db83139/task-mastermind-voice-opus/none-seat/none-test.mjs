// The none seat: a real Sessions, a fake agent host that records every spawn and send. Run: node --import ./hook.mjs none-test.mjs
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert/strict";
const { default: Sessions } = await import("file:///C:/Code/lew42/worktrees/qf-6/Servex/agents/Sessions.js");
const spawned = [], sent = [];
const agents = { live: new Map(), spawn(o){ const id = `${o.role}-${o.name}`; spawned.push(o.role); this.live.set(id, { id, state: "idle" }); return { id, session_id: "00000000-0000-0000-0000-000000000000" }; },
	send(id, text){ sent.push(id); }, get(id){ return this.live.get(id); } };
for (const seat of ["none", "voice"]){
	spawned.length = 0; sent.length = 0;
	const repo = fs.mkdtempSync(path.join(os.tmpdir(), "seat-"));
	fs.mkdirSync(path.join(repo, "public"), { recursive: true });
	const S = new Sessions({ repo, file: path.join(repo, "sessions.json"), prewarm: 1, assistant: seat, servex: { agents } });
	const r = S.create({ path: "/" });
	await new Promise(res => setTimeout(res, 50));
	try { S.say({ session: r.session, path: "/", text: "Testing the empty seat, one sentence.", via: "text" }); } catch (e){ console.log(seat, "say threw:", e.message); }
	await new Promise(res => setTimeout(res, 50));
	const disk = path.join(repo, "public", ...r.file.split("/").filter(Boolean));
	const kinds = fs.readFileSync(disk, "utf8").trim().split("\n").map(l => Object.keys(JSON.parse(l))[0]);
	console.log(seat.padEnd(5), "spawned:", JSON.stringify(spawned), "sent to:", JSON.stringify(sent), "lines:", kinds.join(","));
	if (seat === "none") assert.ok(!spawned.some(r => r !== "session-smart"), "none: nothing but the smart one spawns");
	else assert.ok(spawned.includes("voice-assistant"), "voice: the placer still spawns (fallback intact)");
	fs.rmSync(repo, { recursive: true, force: true });
}
console.log("PASS"); process.exit(0);
