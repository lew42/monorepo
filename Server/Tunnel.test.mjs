// node Server/Tunnel.test.mjs: state()/alive/adopt/host logic against a fake state dir (no network, no cloudflared)
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Tunnel from "./Tunnel.mjs";

Tunnel.DIR = fs.mkdtempSync(path.join(os.tmpdir(), "tunnel-test-"));
const t = new Tunnel();

assert.strictEqual(t.state(), null, "no file: state is null");
assert.strictEqual(t.alive_now(), false);
assert.strictEqual(t.host(), null);

fs.writeFileSync(t.state_file, JSON.stringify({ pid: process.pid, child: 1, port: 1 }));
fs.writeFileSync(t.url_file, "https://abc-def.trycloudflare.com/mcp/remote/SECRET");
assert.strictEqual(t.alive_now(), true, "a live pid is alive");
assert.strictEqual(t.host(), "abc-def.trycloudflare.com", "host only, no token");
assert.deepStrictEqual(t.ensure(), { act: "up", host: "abc-def.trycloudflare.com" }, "a live tunnel is adopted, not restarted");
assert.ok(fs.existsSync(t.state_file), "adopting leaves the state file alone");

fs.writeFileSync(t.state_file, JSON.stringify({ pid: 2 ** 22 + 12345, child: 1, port: 1 }));
assert.strictEqual(t.alive_now(), false, "a dead pid is not alive");

fs.rmSync(Tunnel.DIR, { recursive: true, force: true });
console.log("Tunnel.test ok");
