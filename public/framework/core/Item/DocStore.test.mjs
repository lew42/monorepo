// DocStore: one document over one WebSocket. Plain node, a fake socket: `node public/framework/core/Item/DocStore.test.mjs`
//   1. open() resolves when the hello frame (history + lock) arrives, and replays the history onto the item
//   2. no lock, no write: a delivered line is held until the lock arrives, then goes out in one "lines" frame
//   3. a lock held by someone else keeps can_edit false; remote lines arrive as live reads
import Test from "../Test/Test.js";
import { DocStore } from "./DocStore.js";

const t = new Test("core/Item/DocStore");
globalThis.location = { protocol: "http:", host: "localhost:8787" };
const sockets = [];
globalThis.WebSocket = class { constructor(url){ this.url = url; this.readyState = 1; this.out = []; sockets.push(this); } send(s){ this.out.push(JSON.parse(s)); } close(){ this.readyState = 3; } };
const frames = ws => ws.out.map(m => m.t);

const store = new DocStore({ url: "doc:abcd1234" });
const opened = store.open();
const ws = sockets[0];
ws.onopen();
t.eq(ws.url, "ws://localhost:8787/api/doc/abcd1234/ws", "the socket goes to the document's Room");
t.eq(frames(ws).slice(0, 1), ["hello"], "the first frame is hello with since: 0");

ws.onmessage({ data: JSON.stringify({ t: "hello", seq: 1, lines: [{ seq: 1, line: { set: { title: "T" } } }], lock: null, now: Date.now() }) });
await opened;
t.eq(store.seq, 1, "the history's last seq is remembered");
t.eq(store.can_edit, false, "nobody holds the lock yet");

await store.deliver("doc:abcd1234", [{ set: { title: "T2" } }]);
t.eq(frames(ws).includes("lines"), false, "a line is held back while we lack the lock");

store.me = 7;
ws.onmessage({ data: JSON.stringify({ t: "lock", lock: { holder: 7, name: "me", expires: Date.now() + 10000 } }) });
t.eq(store.can_edit, true, "the lock frame makes us the editor");
store.flush_unsent();
const sent = ws.out.find(m => m.t === "lines");
t.eq(sent.lines, [{ set: { title: "T2" } }], "the held line goes out in one lines frame");

ws.onmessage({ data: JSON.stringify({ t: "lock", lock: { holder: 9, name: "other", expires: Date.now() + 10000 } }) });
t.eq(store.can_edit, false, "someone else holds the lock");
ws.onmessage({ data: JSON.stringify({ t: "lines", from: 2, lines: [{ set: { title: "T3" } }], sent: Date.now(), by: "other" }) });
t.eq([store.seq, store.last_by], [2, "other"], "a remote line advances seq and names its author");

store.closed = true; clearInterval(store.beater);
t.done();
