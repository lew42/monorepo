// The outbox's own rules, with a fake socket (no server). Plain node: `node public/framework/core/Item/Outbox.test.mjs`
// Faked: only the socket (a fake that answers each frame from a script); the Outbox itself and its localStorage are real code,
// with a Map standing in for the browser's storage. The wire half with a real server is transport.test.mjs.
//   1. a write the disk refused for now ("append failed") is kept and sent again, not dropped (review finding 3)
//   2. a write the server REFUSED (bad line) is still dropped, and told false
import Test from "../Test/Test.js";

globalThis.WebSocket = { OPEN: 1 };
const memory = new Map();
globalThis.localStorage = { get length(){ return memory.size; }, key: i => [...memory.keys()][i], getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
const { Outbox } = await import("./Outbox.js");

const t = new Test("core/Item/Outbox");
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 3000){ const end = Date.now() + ms; while (Date.now() < end){ if (fn()) return true; await sleep(10); } return false; }

// An outbox on a fake, connected socket. `replies` are the answers to the next appends, in order; a ping is always answered.
function outbox_with(replies){
	const sent = [], box = new Outbox();
	const fake = { connected: true, ws: { readyState: 1 }, on(){}, request: frame => { if (frame.method === "ping") return Promise.resolve({ response: "pong" }); sent.push(frame); return Promise.resolve({ response: replies.shift() }); } };
	Object.assign(box, { _socket: fake, client: "tab.abcd", tab_id: "tab" });
	return { box, sent };
}

Outbox.heartbeat = { every: 20, wait: 100 };
Outbox.retry_after = 30;

{   // 1
	const warn = console.warn; console.warn = () => {};   // the outbox says "trying again"; that is not news here
	const { box, sent } = outbox_with(["append failed", "append successful"]);
	let result = "pending";
	box.send("/x/a.jsonl", [{ a: 1 }]).then(ok => result = ok);
	await sleep(20);
	t.eq(sent.length, 1, "the batch went out once");
	t.eq([box.waiting.length, memory.size, result], [1, 1, "pending"], "the disk said 'append failed': the batch is still waiting (and still in storage), not answered yet");
	t.ok(await until(() => sent.length === 2), "and it is sent again by itself");
	t.ok(await until(() => result === true), "the second answer is 'append successful': send() answers true");
	t.eq([sent[1]?.args[2], box.waiting.length, memory.size], [sent[0]?.args[2], 0, 0], "the same client and n both times (so the server's dedupe holds), then nothing waits and storage is empty");
	console.warn = warn;
}

{   // 2
	const { box, sent } = outbox_with(["append refused: lines must be an array of objects"]);
	const warn = console.warn; console.warn = () => {};
	let ok; try { ok = await box.send("/x/b.jsonl", [{ b: 1 }]); } finally { console.warn = warn; }
	await sleep(100);
	t.eq([ok, sent.length, box.waiting.length], [false, 1, 0], "a refusal is final: send() answers false, the batch is dropped and not sent again");
}

t.done();
process.exit(process.exitCode ?? 0);
