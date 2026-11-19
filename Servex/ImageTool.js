/* view_image: fetch an image by URL (or read a local image file) and return it INLINE as MCP image content, so a cloud
 * chat whose network cannot reach the image host (fal.media) still sees the pixels. No image library: sizes are read
 * from the file headers, and the rare downscale uses Windows' own System.Drawing through powershell (WebP cannot be
 * decoded there, so an oversized WebP is refused instead of resized). Detail: ext/remote/doc/remote-tools.md. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

const MB = 1024 * 1024;
const TYPES = { png: "image/png", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };

export default class ImageTool {
	static FETCH_MAX = 30 * MB;      // most bytes read from one URL or file
	static INLINE_MAX = 3.5 * MB;    // most bytes returned for one image (the whole call shares TOTAL_MAX)
	static TOTAL_MAX = 12 * MB;
	static EDGE_MAX = 4096;          // longest edge returned without resizing; larger is scaled down to it
	static BATCH_MAX = 8;
	static TIMEOUT_MS = 20_000;
	static SAVE_DIR = path.join(os.homedir(), "fal-images");
	static allow_http_local = false; // tests only: lets http:// and loopback hosts through

	// what the bytes really are (never the URL, header or extension): { kind, width, height } or null
	static sniff(b){
		if (b.length > 24 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
			return { kind: "png", width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
		if (b.length > 10 && b.toString("latin1", 0, 3) === "GIF")
			return { kind: "gif", width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
		if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8){
			for (let i = 2; i + 9 < b.length;){
				if (b[i] !== 0xff){ i++; continue; }
				const m = b[i + 1];
				if (m === 0xff){ i++; continue; }
				if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { kind: "jpeg", height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
				i += 2 + b.readUInt16BE(i + 2);
			}
			return { kind: "jpeg", width: 0, height: 0 };
		}
		if (b.length > 30 && b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP"){
			const f = b.toString("latin1", 12, 16);
			if (f === "VP8X") return { kind: "webp", width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
			if (f === "VP8L"){ const v = b.readUInt32LE(21); return { kind: "webp", width: 1 + (v & 0x3fff), height: 1 + ((v >> 14) & 0x3fff) }; }
			if (f === "VP8 ") return { kind: "webp", width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
			return { kind: "webp", width: 0, height: 0 };
		}
		return null;
	}

	static private_ip(ip){
		if (net.isIPv4(ip)){
			const [a, b] = ip.split(".").map(Number);
			return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
		}
		const v = ip.toLowerCase();
		return v === "::1" || v === "::" || /^f[cd]/.test(v) || /^fe[89ab]/.test(v) || (v.startsWith("::ffff:") && ImageTool.private_ip(v.slice(7)));
	}

	// https only, and never a host that resolves to this machine or its network: the tool may read images, not probe the LAN
	static async check_url(u){
		if (ImageTool.allow_http_local) return;
		if (u.protocol !== "https:") throw new Error("only https URLs are allowed");
		const addrs = net.isIP(u.hostname) ? [{ address: u.hostname }] : await dns.lookup(u.hostname, { all: true });
		if (addrs.some(a => ImageTool.private_ip(a.address))) throw new Error("that host resolves to a private address");
	}

	static async fetch_bytes(url){
		let u = new URL(url);
		for (let hop = 0; hop < 4; hop++){
			await ImageTool.check_url(u);
			const res = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(ImageTool.TIMEOUT_MS), headers: { accept: "image/*", "user-agent": "servex-view-image" } });
			if (res.status >= 300 && res.status < 400 && res.headers.get("location")){ u = new URL(res.headers.get("location"), u); continue; }
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
			if (type && !type.startsWith("image/") && type !== "application/octet-stream") throw new Error(`not an image (content-type ${type})`);
			const len = Number(res.headers.get("content-length"));
			if (len > ImageTool.FETCH_MAX) throw new Error(`too large (${len} bytes, limit ${ImageTool.FETCH_MAX})`);
			const chunks = []; let n = 0;
			for await (const c of res.body){
				n += c.length;
				if (n > ImageTool.FETCH_MAX) throw new Error(`too large (over ${ImageTool.FETCH_MAX} bytes)`);
				chunks.push(c);
			}
			return { bytes: Buffer.concat(chunks), content_type: type };
		}
		throw new Error("too many redirects");
	}

	static read_local(p){
		const file = path.resolve(String(p));
		const st = fs.statSync(file);
		if (!st.isFile()) throw new Error("not a file");
		if (st.size > ImageTool.FETCH_MAX) throw new Error(`too large (${st.size} bytes, limit ${ImageTool.FETCH_MAX})`);
		return { bytes: fs.readFileSync(file), content_type: "" };   // the bytes are sniffed afterwards: a non-image is refused without echoing it
	}

	// one System.Drawing pass: scale so the longest edge is `edge`, write png or jpeg; resolves { width, height }
	static resize(src, dst, edge, fmt){
		const script = `Add-Type -AssemblyName System.Drawing
$i=[System.Drawing.Image]::FromFile($env:IMG_IN); $e=[double]$env:IMG_EDGE
$s=[Math]::Min(1.0,$e/[Math]::Max($i.Width,$i.Height)); $w=[Math]::Max(1,[int][Math]::Round($i.Width*$s)); $h=[Math]::Max(1,[int][Math]::Round($i.Height*$s))
$b=New-Object System.Drawing.Bitmap($w,$h); $g=[System.Drawing.Graphics]::FromImage($b)
$g.InterpolationMode='HighQualityBicubic'; $g.SmoothingMode='HighQuality'; $g.PixelOffsetMode='HighQuality'
if($env:IMG_FMT -eq 'jpeg'){ $g.Clear([System.Drawing.Color]::White) }
$g.DrawImage($i,0,0,$w,$h); $g.Dispose(); $i.Dispose()
if($env:IMG_FMT -eq 'jpeg'){ $c=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}; $p=New-Object System.Drawing.Imaging.EncoderParameters(1); $p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[int64]88); $b.Save($env:IMG_OUT,$c,$p) } else { $b.Save($env:IMG_OUT,[System.Drawing.Imaging.ImageFormat]::Png) }
$b.Dispose(); Write-Output "$w $h"`;
		return new Promise((resolve, reject) => {
			const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { windowsHide: true, env: { ...process.env, IMG_IN: src, IMG_OUT: dst, IMG_EDGE: String(edge), IMG_FMT: fmt } });
			let out = "", err = "";
			const timer = setTimeout(() => child.kill(), 30_000);
			child.stdout.on("data", d => out += d); child.stderr.on("data", d => err += d);
			child.on("error", e => { clearTimeout(timer); reject(e); });
			child.on("close", code => {
				clearTimeout(timer);
				const m = /^(\d+) (\d+)/.exec(out.trim());
				code === 0 && m ? resolve({ width: Number(m[1]), height: Number(m[2]) }) : reject(new Error("resize failed: " + (err.trim().split("\n")[0] || `exit ${code}`).slice(0, 160)));
			});
		});
	}

	/* Returns { bytes, type, width, height, original, note } for the bytes to send: the original when it fits, else a smaller PNG or
	 * JPEG (only when the image is over EDGE_MAX, over `limit` bytes, or the caller asked for a smaller max_dim). */
	static async fit(bytes, info, max_dim, limit){
		const longest = Math.max(info.width, info.height);
		let edge = Math.min(max_dim || Infinity, ImageTool.EDGE_MAX);
		const needs = (max_dim && longest > max_dim) || longest > ImageTool.EDGE_MAX || bytes.length > limit;
		if (!needs) return { bytes, type: TYPES[info.kind], width: info.width, height: info.height, original: true };
		if (info.kind === "webp") throw new Error(`a WebP over the limits cannot be resized here (${bytes.length} bytes, ${info.width}x${info.height}); ask for another format`);
		if (process.platform !== "win32") throw new Error("resizing needs Windows (System.Drawing)");
		if (edge > longest) edge = longest;
		const tmp = path.join(os.tmpdir(), "view-image-" + crypto.randomBytes(6).toString("hex"));
		fs.writeFileSync(tmp + ".in", bytes);
		try {
			let fmt = info.kind === "png" ? "png" : "jpeg";
			for (let attempt = 0; attempt < 6; attempt++){
				const dims = await ImageTool.resize(tmp + ".in", tmp + ".out", edge, fmt);
				const out = fs.readFileSync(tmp + ".out");
				if (out.length <= limit)
					return { bytes: out, type: TYPES[fmt === "png" ? "png" : "jpeg"], ...dims, original: false, note: `resized from ${info.width}x${info.height} (${bytes.length} bytes), re-encoded as ${fmt}${fmt === "jpeg" ? " (alpha flattened to white)" : ""}` };
				if (fmt === "png") fmt = "jpeg"; else edge = Math.floor(edge * 0.75);
			}
			throw new Error("could not get it under the size limit");
		} finally { for (const e of [".in", ".out"]) fs.rmSync(tmp + e, { force: true }); }
	}

	static save(bytes, source, kind){
		fs.mkdirSync(ImageTool.SAVE_DIR, { recursive: true });
		const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
		let name = "image";
		try { name = path.basename(source.startsWith("http") ? new URL(source).pathname : source).replace(/\.[^.]*$/, ""); } catch {}
		name = name.replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 40) || "image";
		const ext = kind === "jpeg" ? "jpg" : kind;
		let file = path.join(ImageTool.SAVE_DIR, `${stamp}-${name}.${ext}`);
		for (let n = 2; fs.existsSync(file); n++) file = path.join(ImageTool.SAVE_DIR, `${stamp}-${name}-${n}.${ext}`);
		fs.writeFileSync(file, bytes);
		return file;
	}

	static async one(source, kind, { max_dim, save, limit }){
		const { bytes, content_type } = kind === "url" ? await ImageTool.fetch_bytes(source) : ImageTool.read_local(source);
		const info = ImageTool.sniff(bytes);
		if (!info) throw new Error("not a PNG, JPEG, GIF or WebP image");
		if (!info.width || !info.height) throw new Error("could not read the image size");
		const sent = await ImageTool.fit(bytes, info, max_dim, limit);
		const entry = { source, width: info.width, height: info.height, bytes: bytes.length, content_type: content_type || TYPES[info.kind] };
		if (!sent.original) entry.returned = { width: sent.width, height: sent.height, bytes: sent.bytes.length, content_type: sent.type, note: sent.note };
		if (save) entry.saved = ImageTool.save(bytes, source, info.kind);
		return { entry, image: { type: "image", data: sent.bytes.toString("base64"), mimeType: sent.type } };
	}

	static tools(){
		return [{
			name: "view_image",
			description: "Look at an image: fetches it on the owner's PC (which can reach hosts your own network blocks, like fal.media) and returns the pixels inline, plus one JSON line per image (source, width, height, bytes, content_type, saved). Give `url` (https) or `urls` (up to 8), or `path` (an image file on the PC). Images are returned at original size unless over 4096 px or about 3.5 MB; then they are scaled down or re-encoded and the entry's `returned` says so. `max_dim` forces a smaller longest edge. `save: true` also keeps the original in C:\\Users\\mike\\fal-images.",
			inputSchema: { type: "object", properties: {
				url: { type: "string", description: "An https image URL." },
				urls: { type: "array", items: { type: "string" }, description: "Up to 8 https image URLs." },
				path: { type: "string", description: "A PNG, JPEG, GIF or WebP file on the PC." },
				max_dim: { type: "number", description: "Longest edge in px. Default: original size (no resize)." },
				save: { type: "boolean", description: "Also keep the original in C:\\Users\\mike\\fal-images (default false: nothing is left on disk)." },
			} },
			handler: async (a = {}) => {
				const jobs = [...(a.url ? [["url", a.url]] : []), ...(Array.isArray(a.urls) ? a.urls.map(u => ["url", u]) : []), ...(a.path ? [["path", a.path]] : [])];
				if (!jobs.length) throw new Error("give url, urls or path");
				if (jobs.length > ImageTool.BATCH_MAX) throw new Error(`at most ${ImageTool.BATCH_MAX} images per call`);
				const opts = { max_dim: Number(a.max_dim) > 0 ? Number(a.max_dim) : 0, save: a.save === true, limit: Math.min(ImageTool.INLINE_MAX, ImageTool.TOTAL_MAX / jobs.length) };
				const content = []; let ok = 0;
				for (const [kind, source] of jobs){
					try {
						const r = await ImageTool.one(String(source), kind, opts);
						content.push({ type: "text", text: JSON.stringify(r.entry) }, r.image); ok++;
					} catch (e){ content.push({ type: "text", text: JSON.stringify({ source: String(source), ok: false, why: String(e.message || e) }) }); }
				}
				return { content, ...(ok ? {} : { isError: true }) };
			},
		}];
	}
}
