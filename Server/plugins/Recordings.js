import fs from "fs";
import path from "path";
import { loopback } from "./MCP.js";

const DIR = path.resolve("public/framework/ai/recordings");
const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.(wav|json)$/;
const MAX = "25mb";

/* The owner's voice, saved to a file whisper-test.mjs can run while they are away —
 * see public/framework/ai/2026-09-22/record/requirements.md. Loopback only, same
 * guard as Screenshots.js. One route does two jobs, by extension:
 *   .wav  — raw bytes, trusted no further than its own RIFF header (the exact
 *           44-byte shape `ux/Dictate/capture.js`'s `wav()` writes).
 *   .json — a small object MERGED onto whatever is already at that name (read,
 *           Object.assign, write back) — one shape for a per-recording sidecar
 *           (`recording-3.json`: `{device, text, ms}`, written once at save and
 *           again once transcribed) and for `expected.json` (`{"<name>": "<said>"}`,
 *           one key at a time from the page's "this is what I said" box). */
export default class Recordings {

	static setup(server){ new Recordings(server); }

	constructor(server){
		this.server = server;
		server.on("express", () => this.route());
	}

	route(){
		this.server.router.post("/recordings/:file", this.server.express.raw({ type: "*/*", limit: MAX }), (req, res) => {
			if (!loopback(req.socket.remoteAddress)){
				console.warn(`Recordings: REFUSED POST from ${req.socket.remoteAddress} — loopback only.`);
				return res.status(403).end();
			}
			const file = String(req.params.file ?? "");
			if (!NAME.test(file)) return res.status(400).json({ error: "bad name — letters, digits, . _ - only, must end .wav or .json" });

			const bytes = req.body;
			if (!Buffer.isBuffer(bytes) || !bytes.length) return res.status(400).json({ error: "empty body" });

			fs.mkdirSync(DIR, { recursive: true });
			const full = path.join(DIR, file);

			if (file.endsWith(".json")){
				let patch;
				try { patch = JSON.parse(bytes.toString("utf8")); } catch { return res.status(400).json({ error: "bad JSON" }); }
				let merged = {};
				try { merged = JSON.parse(fs.readFileSync(full, "utf8")); } catch {}
				Object.assign(merged, patch);
				fs.writeFileSync(full, JSON.stringify(merged, null, "\t"));
				return res.json(merged);
			}

			const info = wav_info(bytes);
			if (!info) return res.status(400).json({ error: "not a 16-bit PCM WAV" });
			fs.writeFileSync(full, bytes);
			res.json({ path: `/framework/ai/recordings/${file}`, bytes: bytes.length, ...info });
		});

		this.server.router.get("/recordings/", (req, res) => {
			if (!loopback(req.socket.remoteAddress)) return res.status(403).end();
			res.json(this.list());
		});
	}

	/* Oldest first — a new save's own mtime is newest, so the list grows at the
	 * bottom without anyone sorting by name (recording-9 must not sort before
	 * recording-10). Each row carries its sidecar's fields (`device`, `text`,
	 * `ms`) merged in, so the page never needs a second fetch just to know
	 * whether a recording is already transcribed. */
	list(){
		if (!fs.existsSync(DIR)) return [];
		const rows = fs.readdirSync(DIR).filter(f => f.endsWith(".wav")).map(f => {
			const name = f.slice(0, -4);
			const full = path.join(DIR, f);
			const bytes = fs.readFileSync(full);
			let sidecar = {};
			try { sidecar = JSON.parse(fs.readFileSync(path.join(DIR, name + ".json"), "utf8")); } catch {}
			return { name, path: `/framework/ai/recordings/${f}`, bytes: bytes.length, mtime: fs.statSync(full).mtimeMs, ...wav_info(bytes), ...sidecar };
		});
		rows.sort((a, b) => a.mtime - b.mtime);
		rows.forEach(r => delete r.mtime);
		return rows;
	}
}

/* A real RIFF chunk walk, not a fixed 44-byte offset. `capture.js`'s own `wav()`
 * writes a 16-byte `fmt ` chunk and the header lands at exactly 44 bytes, but a
 * WAV from anywhere else — the owner's own fixture recordings, whisper.cpp's
 * sample clips — commonly carries an 18-byte `fmt ` (an extra `cbSize` field),
 * which shifts `data` two bytes later than a fixed offset assumes: the first
 * version of this read the tail of "fmt " as if it were "data" and its garbage
 * "size" as a sample count 3.5 billion long, crashing GET /recordings/ solid on
 * the owner's own jfk.wav. This walks every chunk instead, so any valid
 * RIFF/WAVE PCM file's real `fmt ` and `data` are found wherever they actually
 * are, and `data`'s claimed size is clamped to what the buffer really holds in
 * case that field itself is wrong (word-aligned: an odd chunk size pads one byte). */
function wav_info(buf){
	if (buf.length < 12 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") return null;

	let at = 12, rate = 0, data_at = 0, data_size = 0;
	while (at + 8 <= buf.length){
		const id = buf.toString("ascii", at, at + 4);
		const size = buf.readUInt32LE(at + 4);
		const body = at + 8;
		if (id === "fmt " && body + 8 <= buf.length) rate = buf.readUInt32LE(body + 4);
		if (id === "data"){ data_at = body; data_size = Math.min(size, Math.max(0, buf.length - body)); }
		at = body + size + (size % 2);
	}
	if (!data_at) return null;

	const n = Math.floor(data_size / 2);
	let peak = 0, sum = 0;
	for (let i = 0; i < n; i++){
		const s = buf.readInt16LE(data_at + i * 2) / 32768;
		if (Math.abs(s) > peak) peak = Math.abs(s);
		sum += s * s;
	}
	return { rate, seconds: rate ? n / rate : 0, rms: n ? Math.sqrt(sum / n) : 0, peak };
}
