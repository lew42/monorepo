// node Server/SiteGateway.test.mjs: the gateway's four checks and its WebSocket relay, against a fake dev server (no network, no cloudflared)
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import net from "node:net";
import SiteGateway from "./SiteGateway.mjs";

SiteGateway.DIR = fs.mkdtempSync(path.join(os.tmpdir(), "site-gw-test-"));
const seen = [], NL = "\r\n";
const dev = http.createServer((req, res) => { seen.push({ url: req.url, headers: req.headers }); res.writeHead(req.url === "/go" ? 302 : 200, req.url === "/go" ? { location: "http://10.0.0.1:3104/there" } : {}).end("ok " + req.url); });
// a byte-level upgrade: answer 101, report the headers it saw, then echo every byte (no ws dependency)
const socks = [];
dev.on("upgrade", (req, sock) => {
    socks.push(sock);
    sock.write(["HTTP/1.1 101 Switching Protocols", "Upgrade: websocket", "Connection: Upgrade", "", ""].join(NL)
        + JSON.stringify({ origin: req.headers.origin, remote: req.headers["x-lew42-remote"], cookie: req.headers.cookie ?? null }) + "\n");
    sock.on("data", b => sock.write("echo " + b));
});
dev.on("clientError", e => process.env.GW_DEBUG && console.error("dev clientError", e.code, e.rawPacket?.toString()));
await new Promise(r => dev.listen(0, "127.0.0.1", r));

const KEY = "k".repeat(64);
const gw = new SiteGateway({ port: 0, key: KEY, target: { host: "127.0.0.1", port: dev.address().port, name: "10.0.0.1:3104" } });
const s = gw.server(); await new Promise(r => s.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${s.address().port}`;
const ORIGIN = SiteGateway.PUBLIC;
const go = (p, o = {}) => fetch(base + p, { redirect: "manual", ...o });

// 1. the key
assert.strictEqual((await go("/")).status, 401, "no cookie: locked");
assert.strictEqual((await go("/?key=wrong")).status, 401, "a wrong key: locked");
const r = await go("/framework/?key=" + KEY + "&x=1");
assert.strictEqual(r.status, 302, "the key sets the cookie and redirects");
assert.strictEqual(r.headers.get("location"), "/framework/?x=1", "the key leaves the url");
const set = r.headers.get("set-cookie");
assert.match(set, /HttpOnly; Secure; SameSite=Lax/);
assert.ok(!set.includes(KEY), "the cookie is not the key");
const cookie = set.split(";")[0];
const ok = (p, o = {}) => go(p, { ...o, headers: { cookie: cookie + "; other=1", ...(o.headers ?? {}) } });

const page = await ok("/framework/");
assert.strictEqual(page.status, 200, "a page passes");
const h = seen.at(-1).headers;
assert.strictEqual(h.host, "10.0.0.1:3104", "the dev server sees its LAN host");
assert.strictEqual(h["x-lew42-remote"], "1", "marked remote");
assert.strictEqual(h.cookie, "other=1", "the gateway cookie never reaches the dev server");
assert.strictEqual((await ok("/go")).headers.get("location"), ORIGIN + "/there", "redirects point back at the public host");

// 2. origin
assert.strictEqual((await ok("/servex/api/item", { method: "POST", body: "{}" })).status, 403, "a write without our Origin is refused");
assert.strictEqual((await ok("/servex/api/item", { method: "POST", body: "{}", headers: { origin: "https://evil.example" } })).status, 403);
assert.strictEqual((await ok("/servex/api/item", { method: "POST", body: "{}", headers: { origin: ORIGIN } })).status, 200, "a page edit passes");
assert.strictEqual(seen.at(-1).headers.origin, "http://10.0.0.1:3104", "Origin is rewritten to the LAN one");

// 3 + 4. routes
for (const p of ["/mcp", "/MCP", "/mcp/remote/x", "/screenshot?path=/", "/devsource.json", "/Servex/agents/x.js", "/Server/Tunnel.mjs", "/ai-logs/x", "/recordings/", "/ask/turn",
    "/servex/mcp", "/servex/api/projects", "/servex/api/merge", "/servex/api/agents/x/message", "/Servex/api/item", "/a%2fb", "/servex%2fmcp"])
    assert.ok([400, 403].includes((await ok(p, { method: "POST", headers: { origin: ORIGIN } })).status), "refused: " + p);
assert.strictEqual(gw.clean("/%2e%2e/x"), null, "an encoded climb is refused (fetch itself normalizes it away)");
assert.strictEqual(gw.clean("/a/%5c/b"), null);
assert.strictEqual((await ok("/servex/api/agents")).status, 200, "a read-only Servex route passes on GET");
assert.strictEqual((await ok("/servex/api/agents", { method: "POST", headers: { origin: ORIGIN } })).status, 403, "...but not as a write");
for (const p of ["/servex/api/session/say", "/servex/api/session/abc-1/stream", "/servex/api/voice/stream", "/servex/log/prompts", "/whisper/inference"])
    assert.strictEqual((await ok(p, { method: "POST", headers: { origin: ORIGIN } })).status, 200, "passes: " + p);

// the socket
const open = headers => new Promise(res => {
    const c = net.connect(s.address().port, "127.0.0.1", () => c.write(["GET / HTTP/1.1", "Host: x", "Upgrade: websocket", "Connection: Upgrade",
        ...Object.entries(headers).map(([k, v]) => k + ": " + v), "", ""].join(NL)));
    let buf = "";
    c.on("data", b => {
        buf += b;
        const st = Number(/^HTTP\/1\.1 (\d+)/.exec(buf)?.[1]);
        if (st !== 101){ c.destroy(); return res({ status: st }); }
        const m = /\r\n\r\n(.*)\n/.exec(buf);
        if (m){ c.removeAllListeners("data"); res({ status: st, c, m: m[1] }); }
    });
});
assert.strictEqual((await open({ origin: ORIGIN })).status, 401, "socket: no cookie, no socket");
assert.strictEqual((await open({ cookie })).status, 403, "socket: no Origin, no socket");
assert.strictEqual((await open({ cookie, origin: "https://evil.example" })).status, 403, "socket: a foreign Origin, no socket");
const { c, m } = await open({ cookie, origin: ORIGIN });
assert.deepStrictEqual(JSON.parse(m), { origin: "http://10.0.0.1:3104", remote: "1", cookie: null }, "socket: relayed, LAN origin, marked, no cookie");
c.write("hi"); assert.strictEqual(await new Promise(r => c.once("data", x => r(String(x)))), "echo hi", "socket: both directions");
c.destroy();

socks.forEach(x => x.destroy()); s.closeAllConnections(); dev.closeAllConnections(); s.close(); dev.close();
fs.rmSync(SiteGateway.DIR, { recursive: true, force: true });
console.log("SiteGateway.test ok");
