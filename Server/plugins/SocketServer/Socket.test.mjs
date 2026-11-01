// Socket.test.mjs — which tier a peer gets and what each tier may send. Run from the repo root: node Server/plugins/SocketServer/Socket.test.mjs
import os from "node:os";
import assert from "node:assert";
import Socket from "./Socket.js";

const lan_ip = Object.values(os.networkInterfaces()).flat().find(i => i.family === "IPv4" && !i.internal)?.address ?? "127.0.0.1";

// One fake socket; returns the methods that got through and the ones refused.
function peer(address, headers = {}, methods = ["append", "write", "cmd", "rm", "move", "ask", "hello", "query"]){
    const handlers = {}, ws = { OPEN: 1, readyState: 1, on: (e, f) => { handlers[e] = f; }, send: () => {}, ping: () => {} };
    const s = new Socket({ ws, req: { socket: { remoteAddress: address }, headers }, socket_server: { sockets: [] } });
    const got = [];
    for (const m of methods) s.on("rpc:" + m, () => got.push(m));
    for (const m of methods) handlers.message(JSON.stringify({ method: m, args: [{ source: "other" }] }));
    s.close();
    return got;
}

assert.deepStrictEqual(peer("127.0.0.1").sort(), ["append", "ask", "cmd", "hello", "move", "query", "rm", "write"].sort(), "loopback keeps everything");
assert.deepStrictEqual(peer("10.9.9.9"), ["hello"], "a LAN phone: hello only (a query of an unlisted source is refused)");
assert.deepStrictEqual(peer("10.9.9.9", { "x-lew42-remote": "1" }), ["hello"], "a phone forging the header gains nothing");
assert.deepStrictEqual(peer(lan_ip), ["hello"], "this PC's own address without the header is a plain LAN peer");
assert.deepStrictEqual(peer(lan_ip, { "x-lew42-remote": "1" }), ["append", "hello"], "the gateway (own address + header): append and hello, never write/cmd/rm/move/ask");
assert.deepStrictEqual(peer("::ffff:" + lan_ip, { "x-lew42-remote": "1" }), ["append", "hello"], "the ::ffff: form of the gateway address counts too");
assert.deepStrictEqual(peer("127.0.0.1", { "x-lew42-remote": "1" }), ["append", "hello"], "a loopback relay with the header: same site tier");
console.log("Socket tiers: all pass");
process.exit(0);
