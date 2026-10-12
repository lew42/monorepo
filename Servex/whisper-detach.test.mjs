/* node Servex/whisper-detach.test.mjs — proves a Servex restart no longer kills whisper-server (2026-10-12).
 * Runner A starts a real whisper-server on a private port; A "dies" (release(), what shutdown() does for a
 * detached runner); runner B (the next Servex) must ADOPT the same pid with no second model load.
 * Needs the installed whisper-server + model, like Dictate. Doc: Server/doc/transcription-crash-2026-10-12.md */
import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "whisper-detach-test-"));
process.env.SERVEX_HOME = dir;   // home.js freezes HOME at import time
const { default: Process } = await import("./Process.js");

const home = path.join(process.env.LOCALAPPDATA, "lew42", "whisper");
const model = path.join(home, "models", "ggml-large-v3-turbo.bin");
const port = await new Promise(res => { const s = net.createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const said = [];
const runner = () => new Process.Whisper({
	name: "whisper", port, model, detach: true, log: { append: async (_n, line) => said.push(line.msg) },
	command: path.join(home, "bin", "whisper-server.exe"),
	args: ["-m", model, "--host", "127.0.0.1", "--port", String(port), "--vad", "--vad-model", path.join(home, "models", "ggml-silero-v5.1.2.bin")]
});
const until = async (fn, ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await new Promise(r => setTimeout(r, 250)); } return false; };
const pid_of = () => JSON.parse(fs.readFileSync(path.join(dir, "procs", "whisper.json"), "utf8")).pid;
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };

const a = runner();
try {
	await a.start();
	assert.ok(await until(() => a.status === "online", 60000), "A: whisper-server came online");
	const pid = pid_of();
	const t0 = Date.now();
	a.release();                                   // Servex A goes away
	assert.ok(alive(pid), "the detached whisper-server outlives runner A");

	const b = runner();                            // Servex B starts
	await b.start();
	assert.equal(b.status, "online", "B adopts at once, no 14 s model reload");
	assert.equal(pid_of(), pid, "same pid: nothing was started");
	assert.ok(said.some(m => /^adopted: pid/.test(m)), "B said it adopted");
	console.log(`ok — adopted pid ${pid} ${Date.now() - t0} ms after the restart; whisper never went down`);
	b.release();
} finally {
	try { spawnSync("taskkill", ["/pid", String(pid_of()), "/t", "/f"]); } catch {}   // the pid is cmd.exe's; /t takes whisper-server too
	await new Promise(r => setTimeout(r, 1500));
	try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
	process.exit(0);
}
