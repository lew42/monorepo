/* node Servex/whisper-detach.test.mjs — proves a Servex restart no longer kills whisper-server (2026-10-12).
 * Runner A starts a real whisper-server on a private port; A "dies" (release(), what shutdown() does for a
 * detached runner); runner B (the next Servex) must ADOPT the same pid with no second model load.
 * Needs the installed whisper-server + model, like Dictate. Doc: Server/doc/transcription-crash-2026-10-12.md
 *
 * No whisper-server outlives this test. TestRunner (merge.mjs's test gate) runs up to 4 files AT ONCE and
 * force-kills a file's node process at its own timeout (60 s by default, or `timeouts.json`'s entry for this
 * file) with Windows' TerminateProcess — no SIGTERM, so a `finally` block in THIS process never gets a chance
 * to run (2026-10-25's first version of this note assumed `finally` just didn't run in time; landing qf-9,
 * 2026-11-03, proved it's worse: under the other parallel tests' CPU/GPU/RAM contention, model load can take
 * long enough that TestRunner's own external timeout fires FIRST, so no in-process cleanup — `finally`,
 * `process.on('SIGTERM')`, none of it — ever executes at all). So the fix has two parts: `timeouts.json` gives
 * this file enough external headroom (150 s) that its OWN 45 s internal deadline always fires first even under
 * four-way contention, and the pid(s) this run actually started are tracked in a variable (not re-derived from
 * a command-line pattern, which goes blind the moment the launching cmd.exe exits) so cleanup — and the final
 * "outlived" check — only ever act on processes THIS run started, never another test's or the live whisper.
 * A sweep by command line still runs once at the top, for whatever a run before this fix left behind. */
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
	const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8", windowsHide: true });
	return (r.stdout || "").split(/\s+/).filter(Boolean).map(Number).filter(p => p !== process.pid);
};
const kill = pids => { for (const p of pids) spawnSync("taskkill", ["/pid", String(p), "/t", "/f"], { windowsHide: true }); };

// A whisper-server.exe's own command line never names the tmp dir (only its launching cmd.exe does, in
// spawn_detached()), so once that cmd.exe is gone — a run SIGKILLed mid-test, 2026-10-25's note above — the
// `strays(TAG)` sweep can never find the orphaned whisper-server.exe again by name: it's gone for good until
// someone kills it by hand. Caught twice landing qf-9 (2026-11-03): the orphan from one failed run ate enough
// RAM/VRAM to slow the next run's model load past the 40 s "came online" wait, which then failed and left ITS
// OWN orphan too. So also sweep any whisper-server.exe NOT listening on the live production port — anything
// else can only be a stray test instance, since the real one always claims WHISPER_PORT.
const live_port = Number(process.env.WHISPER_PORT) || 8178;
const port_strays = () => {
	const ps = `Get-CimInstance Win32_Process | ? { $_.Name -eq 'whisper-server.exe' -and $_.CommandLine -notlike '*--port ${live_port}*' } | % { $_.ProcessId }`;
	const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8", windowsHide: true });
	return (r.stdout || "").split(/\s+/).filter(Boolean).map(Number).filter(p => p !== process.pid);
};

const left = [...new Set([...strays(TAG), ...port_strays()])];
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

// Every pid THIS run actually started (cmd.exe's; /t takes whisper-server too), so cleanup and the final
// "outlived" check never touch another test's process or the live one — only ours.
const started = new Set();
const track = () => { try { started.add(pid_of()); } catch {} };

const cleanup = async () => {
	kill([...started]);
	kill(strays(path.basename(dir)));              // anything else this run started under its temp dir
	await until(() => [...started].every(p => !alive(p)), 5000);   // wait for the kill, bounded
	try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
};
const deadline = setTimeout(async () => { console.error("FAIL — gave up at 45 s (whisper-server did not come online); cleaned up"); await cleanup(); process.exit(1); }, 45000);

let code = 0;
const a = runner();
try {
	await a.start();
	assert.ok(await until(() => a.status === "online", 40000), "A: whisper-server came online");
	track();
	const pid = pid_of();
	const t0 = Date.now();
	a.release();                                   // Servex A goes away
	assert.ok(alive(pid), "the detached whisper-server outlives runner A");

	const b = runner();                            // Servex B starts
	await b.start();
	track();
	assert.equal(b.status, "online", "B adopts at once, no 14 s model reload");
	assert.equal(pid_of(), pid, "same pid: nothing was started");
	assert.ok(said.some(m => /^adopted: pid/.test(m)), "B said it adopted");
	console.log(`ok — adopted pid ${pid} ${Date.now() - t0} ms after the restart; whisper never went down`);
	b.release();
} catch (e) { console.error(e.message); code = 1; }
finally {
	clearTimeout(deadline);
	await cleanup();
	const still = [...started].filter(alive);
	if (still.length) { console.error(`FAIL — ${still.length} whisper process(es) outlived the test: ${still}`); code = 1; }
	else console.log("ok — no whisper-server outlived the test");
	process.exit(code);
}
