/* node Servex/ext/recite/recite.test.mjs — Process.Recite starts a real recite-server on a private
 * port (8176, not the owner's 8177), it answers /health, /voices and /speak with a real WAV, and stop()
 * leaves nothing behind. Not detached, so nothing is written to Servex's procs/ folder.
 * Needs the install in %LOCALAPPDATA%/lew42/recite (readme.md); without it the test checks the
 * "not-installed" line instead. About 3 s: python starts and Kokoro loads (~1 s). */
import assert from "node:assert/strict";
import fs from "node:fs";
import Process from "../../Process.js";
import { recite_runner } from "./recite.js";

const PORT = 8176;
const lines = [];
const log = { append: async (name, entry) => { lines.push(entry.msg); } };

const runner = recite_runner(log);
Object.assign(runner, { port: PORT, detach: false, autorestart: false });
runner.args = runner.args.map(a => a === "8177" ? String(PORT) : a);
assert.ok(runner instanceof Process.Recite, "recite_runner makes a Process.Recite");

const give_up = setTimeout(() => { console.log("FAIL: gave up at 30 s"); runner.stop().finally(() => process.exit(1)); }, 30000);

try {
	const status = await runner.start();
	if (status === "not-installed"){ console.log("skip —", runner.said); process.exit(0); }
	assert.ok(["launching", "online"].includes(status), `start() launches it (got ${status}: ${runner.said})`);

	let health = null;
	for (let i = 0; i < 60 && !health; i++){
		await new Promise(r => setTimeout(r, 250));
		health = await fetch(`http://127.0.0.1:${PORT}/health`).then(r => r.json()).catch(() => null);
	}
	assert.ok(health?.ok, "GET /health answers once the model is loaded");
	assert.ok(health.voices > 10, `it has its voices (${health.voices})`);

	const { voices } = await fetch(`http://127.0.0.1:${PORT}/voices`).then(r => r.json());
	assert.ok(voices.includes("af_heart"), "the default voice af_heart is there");

	const r = await fetch(`http://127.0.0.1:${PORT}/speak`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "Testing one two.", voice: "bm_george" }) });
	assert.equal(r.status, 200, "POST /speak answers 200");
	assert.equal(r.headers.get("content-type"), "audio/wav", "it is a WAV");
	const wav = Buffer.from(await r.arrayBuffer());
	assert.equal(wav.subarray(0, 4).toString(), "RIFF", "the body is a RIFF file");
	assert.ok(Number(r.headers.get("x-recite-seconds")) > 0.5, "X-Recite-Seconds says how long the audio is");

	const bad = await fetch(`http://127.0.0.1:${PORT}/speak`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "x", voice: "nobody" }) });
	assert.equal(bad.status, 400, "an unknown voice is a 400 with a plain line");
	assert.match((await bad.json()).error, /no voice called/);

	await runner.stop();
	await new Promise(r => setTimeout(r, 500));
	const after = await fetch(`http://127.0.0.1:${PORT}/health`).then(() => true).catch(() => false);
	assert.equal(after, false, "stop() leaves nothing answering");
	console.log("PASS recite-server: starts, speaks a WAV, refuses an unknown voice, stops");
} finally {
	clearTimeout(give_up);
	if (runner.child) await runner.stop();
}
