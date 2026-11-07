// live.js's one rule that broke a page (2026-11-06): a subscribe answered AFTER the fallback fetch keeps streaming. Plain node:
// `node public/framework/ext/JSONL/live.test.mjs`. Faked: the socket (a fake singleton that records each frame) and fetch (a
// file's text); live.js and JSONL are the real code. The wire half with a real server is core/Item/transport.test.mjs.
//   1. no answer within stream.WAIT: the file shows by one fetch and the promise resolves
//   2. the late answer replaces the fetched copy (no line read twice), and `changed` is called
//   3. a line appended after that still arrives: the reader is still subscribed
import { register } from "node:module";
register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
import assert from "node:assert";

globalThis.location = new URL("http://127.0.0.1/");
globalThis.document = new Proxy(function(){}, { get: (_, k) => k === Symbol.toPrimitive ? () => "" : globalThis.document, apply: () => globalThis.document });
const memory = new Map(), storage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k), get length(){ return memory.size; }, key: i => [...memory.keys()][i] ?? null };
globalThis.sessionStorage = globalThis.localStorage = storage;

const { default: Socket } = await import("../../dev/Socket/Socket.js");
const sent = [], socket = { disabled: false, send: frame => sent.push(frame) };
Socket.singleton = () => socket;
const { stream } = await import("./live.js");
const { JSONL } = await import("./JSONL.js");
const text = '{"n":1}\n{"n":2}\n';
globalThis.fetch = async () => new Response(text, { status: 200, headers: { "content-type": "application/x-ndjson" } });

class Reader extends JSONL {
	got = [];
	read(entries){ this.got.push(...entries.map(e => e.n)); return this; }
	reset(){ this.got = []; return super.reset(); }
}
const t0 = Date.now(), url = "/x/log.jsonl";
stream.WAIT = 5;
let n = 0, changed = 0;
const ok = (cond, what) => { assert.ok(cond, what); n++; };

const r = new Reader({ url });
await stream(r, () => changed++, { owner: null });
ok(sent[0]?.method === "subscribe" && r.got.join() === "1,2", "1. no answer in time: one fetch shows the file");
Socket.prototype.jsonl.call(socket, url, ['{"n":1}', '{"n":2}'], 16, 0, [8, 16]);
ok(r.got.join() === "1,2" && r.offset === 16 && changed === 1, "2. the late answer replaces the fetched copy, nothing twice, changed called");
Socket.prototype.jsonl.call(socket, url, ['{"n":3}'], 24, 16, [24]);
ok(r.got.join() === "1,2,3" && changed === 2, "3. a later line still arrives: still subscribed");
ok(Date.now() - t0 < 1000, "under 1 s");
console.log(`live.test: ${n} passed`);
