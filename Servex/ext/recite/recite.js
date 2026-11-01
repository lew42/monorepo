/* recite.js — Servex supervises recite-server (text in, speech out) the same
 * way Process.Whisper (Servex/Process.js) supervises whisper-server. It is the
 * reverse of Whisper: the browser's `Recite` (public/framework/audio/Recite/)
 * sends one sentence and gets a WAV back.
 *
 * recite-server is a small Python file in this folder (recite_server.py)
 * around Kokoro-82M, run from its own venv. It runs on the CPU, so it takes
 * no VRAM from Whisper or llama-server (measured: plan.md in the voice-recite
 * task). Its install lives beside Whisper's, outside the repo:
 *
 *   %LOCALAPPDATA%/lew42/recite/venv/      python + kokoro-onnx
 *   %LOCALAPPDATA%/lew42/recite/models/    kokoro-v1.0.onnx, voices-v1.0.bin
 *
 * The same four boot cases as Whisper, each one plain log line:
 *   1. not installed   — no venv python or no model file: nothing spawned;
 *                        the browser's Recite falls back to speechSynthesis.
 *   2. already running — something answers the port: left alone.
 *   3. starts          — an ordinary supervised, detached child.
 *   4. skipped         — NO_RECITE=1. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Process from "../../Process.js";

export const RECITE_HOME = process.env.RECITE_HOME || path.join(process.env.LOCALAPPDATA || "", "lew42", "recite");
export const RECITE_PORT = Number(process.env.RECITE_PORT) || 8177;
const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "recite_server.py");

Process.Recite = class Recite extends Process {

	async start(){
		if (process.env.NO_RECITE) return this.settle("skipped", "NO_RECITE=1 — Servex is not starting recite-server.");

		const model = path.join(this.models, "kokoro-v1.0.onnx");
		if (!fs.existsSync(this.command) || !fs.existsSync(model)) return this.settle("not-installed",
			`recite-server is not installed (looked for ${this.command} and ${model}) — Recite falls back to the browser's own voice.`);

		if (this.detach && await this.adopt()) return this.status;

		if (await this.stranger()) return this.settle("already-running",
			`recite-server is already answering on 127.0.0.1:${this.port} — leaving it alone. Servex only ever stops a process it started.`);

		return this.spawn();
	}
};

/** The runner Servex keeps in `processes` under "recite" — called once at boot from Servex.js. */
export function recite_runner(log){
	const models = path.join(RECITE_HOME, "models");
	return new Process.Recite({
		name: "recite", log, port: RECITE_PORT, models,
		command: path.join(RECITE_HOME, "venv", "Scripts", "python.exe"),
		args: [SCRIPT, "--host", "127.0.0.1", "--port", String(RECITE_PORT), "--models", models],
		env: { PYTHONUNBUFFERED: "1" },
		detach: true   // outlives a Servex restart like whisper-server, so a voice call never loses its voice
	});
}

export default Process.Recite;
