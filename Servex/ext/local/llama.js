/* llama.js — Servex supervises llama-server.exe the same way Process.Whisper
 * (Servex/Process.js) supervises whisper-server: one ordinary Process, with
 * the four failure modes Process.js already handles for free (dead on
 * restart, crash-looping, port already taken, a long-healthy process crashing
 * once). The one thing llama-server needs that whisper-server doesn't:
 * SWAPPING MODELS. This GPU (RTX 4070 SUPER, 12 GB VRAM) can hold exactly one
 * of the three gguf files at a time, so `ensure(slug)` stops whichever model
 * is running (if it's not already the one asked for) and starts the new one. */
import fs from "node:fs";
import http from "node:http";
import Process from "../../Process.js";
import { LLAMA_EXE, LLAMA_PORT, LOCAL_PROXY_PORT, LLAMA_IDLE_MINUTES, MODELS } from "./provider.js";

Process.Llama = class Llama extends Process {

	initialize(){
		super.initialize();
		this.loaded = null;              // the slug currently loaded, or null
		this.last_request_at = 0;        // bumped by LocalProxy on every real request
	}

	args_for(file){ return ["-m", file, "--port", String(this.port)]; }

	/* Make sure `slug`'s model is the one actually running, and wait for it to
	 * answer before returning — a caller forwarding a real chat turn needs the
	 * model LOADED, not just "told to start". Throws one plain line for: the
	 * exe missing, an unknown slug, or that slug's file missing (the owner,
	 * requirements.md "What not to do": never touch another app's models, so a
	 * model this finder didn't locate just isn't offered, never "fixed" here). */
	async ensure(slug){
		if (!fs.existsSync(this.command)) throw new Error(`llama-server.exe not found at ${this.command} — local models are not installed`);
		const file = MODELS[slug];
		if (!file) throw new Error(`no local model called "${slug}" — known: ${Object.keys(MODELS).filter(k => MODELS[k]).join(", ") || "(none found on disk)"}`);
		if (!fs.existsSync(file)) throw new Error(`model file missing for "${slug}": ${file}`);

		if (this.loaded === slug && this.child) return this.wait_ready();

		if (this.child){
			this.say(`swapping ${this.loaded ?? "(nothing)"} -> ${slug} — only one model fits this GPU at a time`);
			await this.stop();
		}
		this.args = this.args_for(file);
		this.loaded = slug;
		await this.start();
		return this.wait_ready();
	}

	/* ⚠ THE PORT ANSWERS LONG BEFORE THE MODEL IS LOADED (measured, 2026-10-01):
	 * llama-server's HTTP listener comes up in well under a second, but a 4-7 GB
	 * model takes tens of seconds to actually load onto the GPU — every request
	 * in between gets a plain 503 `{"error":{"message":"Loading model"}}`.
	 * `Process.ready()`'s own plain TCP connect (`stranger()`) is exactly what
	 * caught that race the first time this was tried: the port answered, the
	 * model wasn't loaded yet, and the very next real chat request 503'd. So
	 * this polls llama-server's own `/health` endpoint instead — the thing it
	 * flips to 200 once a model is actually ready to answer — not just the
	 * port. Up to 2 minutes: the biggest of the three models (gemma-4-e4b,
	 * 5.5 GB) is the slow case this has to cover. */
	async wait_ready(){
		const deadline = Date.now() + 120000;
		while (Date.now() < deadline){
			if (await this.health()) return true;
			await new Promise(r => setTimeout(r, 500));
		}
		throw new Error(`llama-server did not finish loading within 2 minutes (port ${this.port})`);
	}

	health(){
		return new Promise(resolve => {
			const req = http.get({ host: "127.0.0.1", port: this.port, path: "/health", timeout: 1500 }, res => {
				res.resume();
				resolve(res.statusCode === 200);
			});
			req.on("error", () => resolve(false));
			req.on("timeout", () => { req.destroy(); resolve(false); });
		});
	}

	/* UNLOAD WHEN IDLE (requirements.md: free the GPU after N idle minutes — the
	 * knob is LLAMA_IDLE_MINUTES in provider.js, one constant, one place).
	 * Checked once a minute; never fights a model that's mid-swap (`this.child`
	 * only gates the check, `ensure()` is what actually changes `this.loaded`). */
	start_idle_watch(){
		this.idle_timer = setInterval(() => {
			if (!this.child || !this.loaded || !this.last_request_at) return;
			const idle_min = (Date.now() - this.last_request_at) / 60000;
			if (idle_min < LLAMA_IDLE_MINUTES) return;
			this.say(`idle ${idle_min.toFixed(1)} min >= ${LLAMA_IDLE_MINUTES} — unloading ${this.loaded} to free the GPU`);
			this.loaded = null;
			this.stop();
		}, 60000);
		this.idle_timer.unref();
		return this;
	}

	release(){
		clearInterval(this.idle_timer);
		super.release();
	}
};

/* THE PROXY IN FRONT OF IT (requirements.md: "the Servex proxy route that
 * forwards to it is the one place that sees every request" — this IS that
 * route, just its own tiny HTTP server on its own port instead of a path on
 * the dashboard's express router, so `ANTHROPIC_BASE_URL` can be a plain
 * `http://127.0.0.1:<port>` the way openrouter/provider.js's is).
 *
 * Every request's JSON body already carries a `model` field (the Anthropic
 * Messages API shape) — `"local/qwen2.5-coder"` — so THAT tells this proxy
 * which model to make sure is loaded before forwarding; nothing in the path or
 * headers needs to repeat it. The body has to be read in full before it can be
 * parsed for that field, but it is then forwarded byte-for-byte unchanged, so
 * nothing about the request itself is altered — only the timing (wait for
 * `ensure()`, then send). The reply is piped straight through, unread, so
 * streaming (SSE) answers still stream. */
export class LocalProxy {

	constructor({ llama, port = LOCAL_PROXY_PORT }){
		this.llama = llama;
		this.port = port;
	}

	start(){
		this.server = http.createServer((req, res) => this.handle(req, res).catch(e => {
			if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" }).end(String(e?.message || e));
		}));
		this.server.on("error", e => this.llama?.say?.(`local proxy error: ${e.message}`));
		this.server.listen(this.port, "127.0.0.1");
		return this;
	}

	stop(){ this.server?.close(); }

	async handle(req, res){
		const chunks = [];
		for await (const chunk of req) chunks.push(chunk);
		const body = Buffer.concat(chunks);

		let model = null;
		try { model = JSON.parse(body.toString("utf8") || "{}").model; } catch { /* a non-JSON or bodyless request: no model to load for it */ }
		const slug = String(model ?? "").replace(/^local\//, "");
		await this.llama.ensure(slug);
		this.llama.last_request_at = Date.now();

		await new Promise((resolve, reject) => {
			const upstream = http.request({
				host: "127.0.0.1", port: this.llama.port, path: req.url, method: req.method,
				headers: { ...req.headers, host: `127.0.0.1:${this.llama.port}`, "content-length": String(Buffer.byteLength(body)) }
			}, up => {
				res.writeHead(up.statusCode, up.headers);
				up.pipe(res);
				up.on("end", resolve);
				up.on("error", reject);
			});
			upstream.on("error", reject);
			upstream.end(body);
		});
	}
}
