/* node Servex/whisper-detach.test.mjs — proves a Servex restart no longer kills whisper-server (2026-10-12).
 * Runner A starts a real whisper-server on a private port; A "dies" (release(), what shutdown() does for a
 * detached runner); runner B (the next Servex) must ADOPT the same pid with no second model load.
 * Needs the installed whisper-server + model, like Dictate. Doc: Server/doc/transcription-crash-2026-10-12.md
 *
 * No whisper-server outlives this test (2026-10-25: TestRunner killed it at 60 s three times while RAM was
 * low, its `finally` never ran, and three 1.6 GB servers were left on random ports). So: it sweeps any left
 * by an earlier killed run before it starts, it gives up by itself at 45 s (under the runner's 60 s) so its
 * cleanup always runs, the cleanup finds them by their temp dir in the command line, not only the pid file,
 * and the last check is that none is left. Under 3 GB free it skips: a model load then outlasts any limit. */
import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const TAG = "whisper-detach-test-";
/** The pids of every whisper-server (and its cmd.exe) whose command line names `needle`. */
const strays = needle => {
	const ps = `Get-CimInstance Win32_Process | ? { $_.CommandLine -like '*${needle}*' -and ($_.Name -eq 'whisper-server.exe' -or $_.Name -eq 'cmd.exe') } | % { $_.ProcessId }`;
	const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" });
	return (r.stdout || "").split(/\s+/).filter(Boolean).map(Number).filter(p => p !== process.pid);
};
const kill = pids => { for (const p of pids) spawnSync("taskkill", ["/pid", String(p), "/t", "/f"]); };

const left = strays(TAG);
if (left.length) { kill(left); console.log(`swept ${left.length} process(es) left by an earlier killed run`); }
if (os.freemem() < 3 * 2 ** 30) { console.log(`skip — ${(os.freemem() / 2 ** 30).toFixed(1)} GB free, under the 3 GB a model load needs to finish in time`); process.exit(0); }

const dir = fs.mkdtempSync(path.join(os.tmpdir(), TAG));
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

const cleanup = async () => {
	try { kill([pid_of()]); } catch {}           // the pid is cmd.exe's; /t takes whisper-server too
	kill(strays(path.basename(dir)));             // and anything else this run started, found by its temp dir
	await new Promise(r => setTimeout(r, 1500));
	try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
};
const deadline = setTimeout(async () => { console.error("FAIL — gave up at 45 s (whisper-server did not come online); cleaned up"); await cleanup(); process.exit(1); }, 45000);

let code = 0;
const a = runner();
try {
	await a.start();
	assert.ok(await until(() => a.status === "online", 40000), "A: whisper-server came online");
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
} catch (e) { console.error(e.message); code = 1; }
finally {
	clearTimeout(deadline);
	await cleanup();
	const still = strays(path.basename(dir));
	if (still.length) { console.error(`FAIL — ${still.length} whisper process(es) outlived the test: ${still}`); code = 1; }
	else console.log("ok — no whisper-server outlived the test");
	process.exit(code);
}
