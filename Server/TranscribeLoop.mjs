/* `node Server/TranscribeLoop.mjs [--minutes 10] [--out dir] [--reload-every 3] [--churn]`
 * Dictate a recorded clip and reload the page in a loop against a PRIVATE dev server + a
 * PRIVATE whisper-server (never the owner's), and record when and how anything fails.
 * What it does and what it found: Server/doc/transcription-crash-2026-10-12.md.
 *
 *   dictation  every ~1.5 s POST the clip so far (a growing prefix) to <origin>/whisper/inference,
 *              the way ux/Dictate does; 2 s of rest between takes.
 *   reload     every N s GET the page and ~25 of its modules, in parallel, like a browser reload.
 *   churn      (--churn) append a line to a scratch file under public/ every 700 ms, the way agents
 *              write logs all day: each write makes the dev server tell every open page to reload.
 *   watch      every 2 s the dev server's and whisper's CPU, RAM, handles (one PowerShell loop).
 * A "failure" is a non-200, a timeout, a reload slower than 2 s, or either child process exiting. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAIN = process.env.TRANSCRIBE_MAIN || "C:/Code/lew42/monorepo";
const WHISPER_HOME = process.env.WHISPER_HOME || path.join(process.env.LOCALAPPDATA || os.homedir(), "lew42", "whisper");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pct = (xs, p) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))] : null;

export default class TranscribeLoop {

	static async free_port() {   // below 50000: the dev server's https twin is PORT + 10000 (Server/plugins/HttpsLan.js)
		for (;;) {
			const p = await new Promise(res => { const s = net.createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
			if (p < 50000) return p;
		}
	}

	constructor(o = {}) {
		this.minutes = Number(o.minutes ?? 10);
		this.reload_every = Number(o.reload_every ?? 3) * 1000;
		this.churn = !!o.churn;
		this.out = o.out || path.join(REPO, "Server", "logs");
		this.wav = o.wav || path.join(MAIN, "public/framework/ai/recordings/jfk.wav");
		this.events = [];        // every request and every process event, in order
		this.samples = [];       // {t, name, cpu, mb, handles}
		this.children = {};      // name -> { child, pid }
		this.stop = false;
		this.t0 = Date.now();
	}

	log(kind, d = {}) { this.events.push({ t: +((Date.now() - this.t0) / 1000).toFixed(2), kind, ...d }); }

	// ---- the two private processes -------------------------------------------------------------

	spawn_child(name, cmd, args, env = {}) {
		const child = spawn(cmd, args, { env: { ...process.env, ...env }, cwd: REPO, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
		const tail = [];
		const keep = d => String(d).split("\n").forEach(l => { if (l.trim()) { tail.push(l.trim().slice(0, 200)); if (tail.length > 40) tail.shift(); } });
		child.stdout.on("data", keep); child.stderr.on("data", keep);
		child.on("exit", (code, signal) => { this.log("exit", { name, code, signal, pid: child.pid, last_lines: tail.slice(-8) }); if (!this.stop) this.failed(name + " exited " + code); });
		this.children[name] = { child, pid: child.pid, tail };
		return child;
	}

	async up() {
		this.whisper_port = await TranscribeLoop.free_port();
		this.port = await TranscribeLoop.free_port();
		const exe = path.join(WHISPER_HOME, "bin", "whisper-server.exe"), model = path.join(WHISPER_HOME, "models", "ggml-large-v3-turbo.bin"), vad = path.join(WHISPER_HOME, "models", "ggml-silero-v5.1.2.bin");
		// The same arguments Servex gives the owner's whisper-server (Servex.js whisper()), on a private port.
		this.spawn_child("whisper", exe, ["-m", model, "--host", "127.0.0.1", "--port", String(this.whisper_port), "--vad", "--vad-model", vad]);
		await this.until(`http://127.0.0.1:${this.whisper_port}/`, 90000, "whisper-server");
		// WHISPER_TEST makes the dev server's /whisper proxy point at PORT 8179; the harness instead edits nothing and
		// points the proxy by WHISPER_PORT (Whisper.js reads it) when set, else 8179 -- so run whisper on 8179 unless free.
		this.spawn_child("server", process.execPath, [path.join(REPO, "Server", "run.js")], { PORT: String(this.port), NO_WHISPER: "1", NO_PAGEFILES: "1", WHISPER_PORT: String(this.whisper_port) });
		await this.until(`http://127.0.0.1:${this.port}/`, 60000, "dev server");
		this.origin = `http://127.0.0.1:${this.port}`;
		this.log("up", { origin: this.origin, whisper_port: this.whisper_port, pids: { server: this.children.server.pid, whisper: this.children.whisper.pid } });
	}

	async until(url, ms, what) {
		const end = Date.now() + ms;
		while (Date.now() < end) { try { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (r.ok) return; } catch {} await sleep(400); }
		throw new Error(what + " did not answer " + url + " within " + ms + " ms");
	}

	failed(why) { this.log("FAIL", { why }); }

	// ---- the clip ------------------------------------------------------------------------------

	load_clip() {
		const b = fs.readFileSync(this.wav), at = b.indexOf("data") + 8;
		this.rate = b.readUInt32LE(24); this.pcm = b.subarray(at);
	}

	wav_of(seconds) {
		const n = Math.min(this.pcm.length, Math.floor(seconds * this.rate) * 2), pcm = this.pcm.subarray(0, n), h = Buffer.alloc(44);
		h.write("RIFF", 0); h.writeUInt32LE(36 + n, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
		h.writeUInt32LE(this.rate, 24); h.writeUInt32LE(this.rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(n, 40);
		return Buffer.concat([h, pcm]);
	}

	// ---- the three loops -----------------------------------------------------------------------

	async dictate() {
		const total = this.pcm.length / 2 / this.rate;
		while (!this.stop) {
			for (let s = 1.5; !this.stop; s += 1.5) {
				const secs = Math.min(s, total), form = new FormData();
				form.append("file", new Blob([this.wav_of(secs)], { type: "audio/wav" }), "segment.wav");
				form.append("response_format", "json");
				const t = performance.now();
				try {
					const r = await fetch(this.origin + "/whisper/inference", { method: "POST", body: form, signal: AbortSignal.timeout(20000) });
					const j = await r.json().catch(() => ({})), ms = Math.round(performance.now() - t);
					this.log("dictate", { secs: +secs.toFixed(1), status: r.status, ms, text: (j.text || "").trim().slice(0, 40) });
					if (!r.ok) this.failed("inference HTTP " + r.status);
				} catch (e) { this.log("dictate", { secs: +secs.toFixed(1), error: e.name + ": " + e.message, ms: Math.round(performance.now() - t) }); this.failed("inference " + e.name); }
				if (secs >= total) break;
				await sleep(1500);
			}
			await sleep(2000);
		}
	}

	// A reload: the page document, then its modules in parallel. The list is read off the page once.
	async reload_set() {
		const urls = new Set(["/framework/ux/Dictate/", "/app.js", "/framework/framework.css"]);
		for (const u of ["/framework/ux/Dictate/page.js", "/framework/ux/Dictate/Dictate.js", "/framework/ux/Dictate/VoiceStrip.js", "/framework/ux/Dictate/Connection.js", "/framework/ux/Dictate/capture.js", "/framework/core/Page/Page.js", "/framework/core/View/View.js", "/framework/core/App/App.js", "/framework/ai/readme.md", "/framework/ai/handover.md", "/framework/ux/Dictate/readme.md"]) urls.add(u);
		return [...urls];
	}

	async reload(urls) {
		const t = performance.now(), res = await Promise.all(urls.map(async u => {
			const t1 = performance.now();
			try { const r = await fetch(this.origin + u, { signal: AbortSignal.timeout(10000) }); await r.arrayBuffer(); return { u, s: r.status, ms: performance.now() - t1 }; }
			catch (e) { return { u, s: 0, error: e.name, ms: performance.now() - t1 }; }
		}));
		const ms = Math.round(performance.now() - t), bad = res.filter(r => r.s >= 500 || r.s === 0);
		this.log("reload", { ms, n: res.length, bad: bad.map(b => b.u + ":" + (b.s || b.error)), slowest: Math.round(Math.max(...res.map(r => r.ms))) });
		if (bad.length) this.failed("reload bad " + bad.length);
		else if (ms > 2000) this.failed("reload slow " + ms + " ms");
	}

	async reloads() {
		const urls = await this.reload_set();
		while (!this.stop) { await this.reload(urls); await sleep(this.reload_every); }
	}

	// Agents write logs under public/ all day; each write is told to every open page.
	async churn_files() {
		const f = path.join(REPO, "public", ".transcribe-loop-churn.jsonl");
		while (!this.stop) { fs.appendFileSync(f, JSON.stringify({ at: Date.now() }) + "\n"); await sleep(700); }
		fs.rmSync(f, { force: true });
	}

	// One PowerShell loop prints a JSON line per process every 2 s: CPU seconds, RAM, handles.
	watch() {
		const pids = Object.entries(this.children).map(([n, c]) => `${c.pid}`).join(",");
		const names = Object.fromEntries(Object.entries(this.children).map(([n, c]) => [c.pid, n]));
		const ps = spawn("powershell", ["-NoProfile", "-Command", `$prev=@{}; while($true){ foreach($p in Get-Process -Id ${pids} -ErrorAction SilentlyContinue){ [pscustomobject]@{id=$p.Id;cpu=$p.CPU;mb=[int]($p.WorkingSet64/1MB);h=$p.HandleCount;t=(Get-Date).Ticks} | ConvertTo-Json -Compress }; Start-Sleep 2 }`], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
		const last = {};
		ps.stdout.on("data", d => String(d).split("\n").forEach(l => {
			try { const o = JSON.parse(l), name = names[o.id], prev = last[o.id]; last[o.id] = o;
				const cpu = prev ? Math.round((o.cpu - prev.cpu) / ((o.t - prev.t) / 1e7) * 100) : 0;
				this.samples.push({ t: +((Date.now() - this.t0) / 1000).toFixed(1), name, cpu, mb: o.mb, handles: o.h }); } catch {}
		}));
		this.ps = ps;
	}

	// ---- run + report --------------------------------------------------------------------------

	async run() {
		this.load_clip();
		await this.up();
		this.watch();
		const loops = [this.dictate(), this.reloads()];
		if (this.churn) loops.push(this.churn_files());
		await sleep(this.minutes * 60000);
		this.stop = true;
		await Promise.allSettled(loops);
		const report = this.report();
		this.down();
		return report;
	}

	down() {
		this.ps?.kill();
		for (const c of Object.values(this.children)) { try { spawn("taskkill", ["/PID", String(c.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {} }
	}

	report() {
		const ev = k => this.events.filter(e => e.kind === k);
		const dic = ev("dictate"), rel = ev("reload"), fails = ev("FAIL");
		const max = n => Math.max(0, ...this.samples.filter(s => s.name === n).map(s => s.cpu)), mx = (n, f) => Math.max(0, ...this.samples.filter(s => s.name === n).map(s => s[f]));
		const r = {
			minutes: this.minutes, churn: this.churn, at: new Date().toISOString(),
			dictation: { requests: dic.length, failed: dic.filter(d => d.error || d.status !== 200).length, p50_ms: pct(dic.map(d => d.ms), 0.5), p95_ms: pct(dic.map(d => d.ms), 0.95), max_ms: pct(dic.map(d => d.ms), 1) },
			reload: { loads: rel.length, failed: rel.filter(d => d.bad.length).length, slow: rel.filter(d => d.ms > 2000).length, p50_ms: pct(rel.map(d => d.ms), 0.5), p95_ms: pct(rel.map(d => d.ms), 0.95), max_ms: pct(rel.map(d => d.ms), 1) },
			processes: { exits: ev("exit").map(e => ({ at_s: e.t, name: e.name, code: e.code, signal: e.signal, last_lines: e.last_lines })), server_cpu_max: max("server"), server_mb_max: mx("server", "mb"), server_handles_max: mx("server", "handles"), whisper_cpu_max: max("whisper"), whisper_mb_max: mx("whisper", "mb") },
			failures: fails.length, first_failures: fails.slice(0, 8),
		};
		fs.mkdirSync(this.out, { recursive: true });
		const stamp = new Date().toISOString().replace(/[:.]/g, "-");
		fs.writeFileSync(path.join(this.out, `transcribe-loop-${stamp}.json`), JSON.stringify({ report: r, events: this.events, samples: this.samples }, null, 1));
		return r;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const a = process.argv.slice(2), arg = (n, d) => { const i = a.indexOf("--" + n); return i < 0 ? d : a[i + 1]; };
	const loop = new TranscribeLoop({ minutes: arg("minutes", 10), out: arg("out"), reload_every: arg("reload-every", 3), churn: a.includes("--churn") });
	process.on("SIGINT", () => { loop.stop = true; loop.down(); process.exit(1); });
	try { console.log(JSON.stringify(await loop.run(), null, 1)); process.exit(0); }
	catch (e) { console.error("transcribe-loop:", e.message); loop.down(); process.exit(1); }
}
