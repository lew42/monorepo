// node Servex/ImageTool.test.mjs — header sniffing, the url gate, a local http image through the tool, and a real resize (Windows)
import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import http from "http";
import zlib from "zlib";
import ImageTool from "./ImageTool.js";

const crc = b => { let r = ~0; for (const x of b){ r ^= x; for (let k = 0; k < 8; k++) r = r & 1 ? 0xedb88320 ^ (r >>> 1) : r >>> 1; } return ~r >>> 0; };
const chunk = (type, data) => { const b = Buffer.concat([Buffer.from(type), data]); const o = Buffer.alloc(4); o.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(b)); return Buffer.concat([o, b, c]); };
const png = (w, h) => { const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2; return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(Buffer.alloc(h * (1 + w * 3)))), chunk("IEND", Buffer.alloc(0))]); };

const img = png(64, 48);
assert.deepEqual(ImageTool.sniff(img), { kind: "png", width: 64, height: 48 });
assert.deepEqual(ImageTool.sniff(Buffer.from("GIF89a\x10\x00\x20\x00" + "x".repeat(8), "latin1")), { kind: "gif", width: 16, height: 32 });
assert.deepEqual(ImageTool.sniff(Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, 0, 20, 0, 30, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1])), { kind: "jpeg", width: 30, height: 20 });
assert.equal(ImageTool.sniff(Buffer.from("just some text, not an image at all")), null);

for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.9", "172.20.0.1", "169.254.1.1", "::1", "fd00::1", "::ffff:10.0.0.1"]) assert.ok(ImageTool.private_ip(ip), ip);
assert.ok(!ImageTool.private_ip("8.8.8.8"));
await assert.rejects(() => ImageTool.fetch_bytes("http://example.com/a.png"), /only https/);
await assert.rejects(() => ImageTool.fetch_bytes("https://127.0.0.1/a.png"), /private/);

const tool = ImageTool.tools()[0], call = args => tool.handler(args);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "image-test-"));
const file = path.join(dir, "a.png"), txt = path.join(dir, "a.txt");
fs.writeFileSync(file, img); fs.writeFileSync(txt, "TOPSECRET");

const server = http.createServer((q, r) => q.url === "/a.png" ? (r.setHeader("content-type", "image/png"), r.end(img)) : q.url === "/page" ? (r.setHeader("content-type", "text/html"), r.end("<p>no</p>")) : (r.writeHead(302, { location: "/a.png" }), r.end())).listen(0, "127.0.0.1");
await new Promise(r => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
ImageTool.allow_http_local = true;
ImageTool.SAVE_DIR = path.join(dir, "saved");

let out = await call({ url: base + "/a.png" });
assert.equal(out.content[1].type, "image"); assert.equal(out.content[1].mimeType, "image/png");
assert.ok(Buffer.from(out.content[1].data, "base64").equals(img), "original bytes, untouched");
const e = JSON.parse(out.content[0].text);
assert.deepEqual([e.width, e.height, e.bytes, e.content_type, e.saved, e.returned], [64, 48, img.length, "image/png", undefined, undefined]);
assert.ok(!fs.existsSync(ImageTool.SAVE_DIR), "default: nothing left on disk");

out = await call({ urls: [base + "/go", base + "/page", base + "/a.png"], save: true });
assert.equal(out.content.length, 5, "a redirect works, the html page is a text-only error, the third is fine");
assert.match(out.content[2].text, /not an image/);
assert.ok(JSON.parse(out.content[0].text).saved.startsWith(ImageTool.SAVE_DIR) && fs.readdirSync(ImageTool.SAVE_DIR).length === 2, "save keeps the original under a sortable name");

out = await call({ path: txt });
assert.ok(out.isError && !JSON.stringify(out).includes("TOPSECRET"), "a non-image file is refused and not echoed");
await assert.rejects(() => call({}), /give url/);
await assert.rejects(() => call({ urls: Array(9).fill(base + "/a.png") }), /at most 8/);

if (process.platform === "win32"){
	out = await call({ path: file, max_dim: 32 });
	const r = JSON.parse(out.content[0].text).returned;
	assert.deepEqual([r.width, r.height], [32, 24], "max_dim downscales and says so");
	assert.deepEqual(ImageTool.sniff(Buffer.from(out.content[1].data, "base64")), { kind: "png", width: 32, height: 24 });
	assert.deepEqual(fs.readdirSync(os.tmpdir()).filter(f => f.startsWith("view-image-")), [], "temp files are removed");
}

server.close(); fs.rmSync(dir, { recursive: true, force: true });
console.log("ok");
