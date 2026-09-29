/* node Servex/agents/revive-proof.mjs — an agent survives its host dying.
 *
 * Host 1 (a child node process, standing in for Servex) spawns a Haiku agent
 * and sets it running a slow Bash command. Mid-command, host 1 is KILLED —
 * no stop(), no cleanup, exactly what `sustain.mjs --restart` does to Servex.
 * Host 2 boots on the same registry, calls `revive()` (the one line Servex.js
 * runs at boot), and the agent comes back under the SAME id and session, is
 * told "Servex restarted mid-turn", and finishes the job.
 *
 * Its own registry dir in the OS temp dir: the real registry is never touched.
 * Saves its output to public/framework/ai/2026-09-24/concurrency/revive-proof.txt. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn as run, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Agents } from "./Agents.js";

const HERE = fileURLToPath(import.meta.url);
const REPO = path.resolve(path.dirname(HERE), "..", "..");
const OUT = process.env.PROOF_OUT ?? path.join(REPO, "public/framework/ai/2026-09-24/concurrency/revive-proof.txt");
const DIR = path.join(os.tmpdir(), "servex-revive-proof");
const HAIKU = "claude-haiku-4-5-20251001";
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── host 1: spawn, report the moment the slow tool starts, then just live ── */
if (process.argv[2] === "host1"){
	const host = new Agents({ registry_dir: DIR });
	host.revive();                               // what Servex does at boot — marks this boot as the one to come back from
	host.watch = (e, agent) => {
		if (e.type === "tool") console.log("TOOL " + JSON.stringify({ id: agent.id, session_id: agent.session_id, name: e.name, input: e.input }));
	};
	host.spawn({
		role: "proof", name: "sleeper", model: HAIKU, effort: "low", setting_sources: [],
		permission_mode: "bypassPermissions", allowed_tools: ["Bash"],
		prompt: "Run this exact Bash command: sleep 20 && echo SLEPT-OK\n"
			+ "When it has finished, reply with the word FINISHED followed by the command's output."
	});
	setInterval(() => {}, 1000);
}

/* ── the proof ── */
else {
	const lines = [];
	const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };
	const t0 = Date.now(), T = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
	const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
	const children = pid => {
		try {
			return JSON.parse(execFileSync("powershell", ["-NoProfile", "-Command",
				`ConvertTo-Json -Compress -InputObject @(Get-CimInstance Win32_Process -Filter "ParentProcessId=${pid}" | Select-Object ProcessId,Name)`],
				{ encoding: "utf8", windowsHide: true }) || "[]");
		} catch { return []; }
	};

	fs.rmSync(DIR, { recursive: true, force: true });
	say(`revive-proof — ${new Date().toISOString()} — ${HAIKU}, registry in ${DIR}\n`);

	const h1 = run(process.execPath, [HERE, "host1"], { stdio: ["ignore", "pipe", "inherit"] });
	process.on("exit", () => { try { h1.kill("SIGKILL"); } catch {} });   // never leave host 1 behind
	let tool = null;
	h1.stdout.on("data", d => { for (const l of String(d).split("\n")) if (l.startsWith("TOOL ")) tool ??= JSON.parse(l.slice(5)); });
	for (const end = Date.now() + 120000; !tool && Date.now() < end;) await wait(100);
	if (!tool){ say("host 1's agent never started its Bash call."); h1.kill(); process.exit(1); }
	say(`[${T()}] host 1 (pid ${h1.pid}): ${tool.id} started ${tool.name}: ${tool.input}`);

	await wait(3000);
	const kids = children(h1.pid).filter(p => /claude/i.test(p.Name));
	const before = JSON.parse(fs.readFileSync(path.join(DIR, "registry.json"), "utf8"))[tool.id];
	say(`[${T()}] registry says ${tool.id} is "${before.state}" (boot ${before.boot}); its claude process: ${kids.map(k => `${k.Name} ${k.ProcessId}`).join(", ") || "none found"}`);

	h1.kill("SIGKILL");                          // TerminateProcess on Windows: no stop(), no cleanup
	await wait(1500);
	say(`[${T()}] host 1 KILLED mid-command. host 1 alive: ${alive(h1.pid)}; its claude child alive: ${kids.map(k => alive(k.ProcessId)).join(", ") || "—"}`);

	/* host 2 — a fresh process's worth of host, on the same registry */
	const said = [];
	const host = new Agents({ registry_dir: DIR });
	host.watch = (e, agent) => {
		if (e.type === "agent_msg" && !e.first) say(`[${T()}] → ${agent.id} got a message from ${e.from}: ${e.text}`);
		if (e.type === "tool") say(`[${T()}] ${agent.id} called ${e.name}: ${e.input}`);
		if (e.type === "transcript" && !e.meta){ said.push(e.text); say(`[${T()}] ${agent.id} said: ${e.text.replace(/\n/g, " ").slice(0, 200)}`); }
		if (e.type === "error") say(`[${T()}] ! ${agent.id} ${e.where}: ${e.text}`);
	};
	const out = host.revive();
	say(`[${T()}] host 2 booted and called revive(): ${JSON.stringify(out)}`);

	const agent = host.live.get(tool.id);
	if (!agent){ say("the agent did not come back."); process.exit(1); }
	say(`[${T()}] back under the same id: ${agent.id}; same session: ${agent.session_id === tool.session_id} (${agent.session_id}); parent ${agent.parent ?? "none"}`);

	const r = await host.wait(agent.id, 240);
	say(`\n=== result ===`);
	say(`state ${r.state} after ${(r.waited_ms / 1000).toFixed(1)}s; said FINISHED: ${/FINISHED/.test(said.join(" "))}; saw SLEPT-OK: ${/SLEPT-OK/.test(said.join(" "))}`);
	say(`its claude child from host 1, still alive at the end: ${kids.map(k => `${k.ProcessId}=${alive(k.ProcessId)}`).join(", ") || "—"}`);
	const row = JSON.parse(fs.readFileSync(path.join(DIR, "registry.json"), "utf8"))[tool.id];
	say(`registry row now: state ${row.state}, boot ${row.boot} (host 2's), resumed_from ${row.resumed_from}, session after the resumed turn ${row.session_id === tool.session_id ? "UNCHANGED" : "CHANGED to " + row.session_id}, context ${row.context} tokens`);
	say(`total run: ${T()}`);

	agent.stop();
	for (const k of kids) if (alive(k.ProcessId)) try { process.kill(k.ProcessId); } catch {}
	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	fs.writeFileSync(OUT, lines.join("\n") + "\n");
	console.log(`\nsaved → ${OUT}`);
	setTimeout(() => process.exit(0), 1500);
}
