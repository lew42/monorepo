// A headless "tab" for transport.test.mjs: one node process = one browser tab, with its own Socket and its own Item.Store.
// It is a helper, not a test (the name has no ".test."). Why a process and not an object: ext/JSONL/live.js and FsFile
// both use the ONE Socket.singleton() of their module, so two tabs in one process would share a socket.
//
//   node transport.tab.mjs <port>      then one JSON command per stdin line, one "@@ " + JSON event per stdout line
//
//   {"cmd":"open","url":"/framework/…/x.jsonl"}   open a Store on it (subscribe, replay) -> {"ev":"opened"}
//   {"cmd":"append","line":{…}}                   store.append(line), as an Item's change would
//   {"cmd":"offline"} / {"cmd":"online"}          cut the socket and keep it cut / let it reconnect
//   {"cmd":"channel","value":"socket"}            switch Store.channel (default "item_api": a record file's lines try Servex first)
//   {"cmd":"servex","up":true}                    make the pretend Servex ANSWER {ok:true} (it writes nothing); default: it is down
//   {"cmd":"heartbeat","every":ms,"wait":ms}      shorten the outbox ping timing
//   {"cmd":"state"}                               -> {"ev":"state","pending":…,"connected":…,"offset":…}
//   {"cmd":"exit"}
//   events: {"ev":"entry_post"}  the tab tried to post to Servex /api/item (it is "down" here)
//           {"ev":"line","line":{…}}  every line the store replayed from the wire (not its own echo)
import { register } from "node:module";
register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
// FsFile.js imports the file-row view (ui/item) only for render(); a node process draws no rows, so that one import is a stub.
register("data:text/javascript," + encodeURIComponent(`export function resolve(spec, ctx, next){
	return /ui\\/item\\/item\\.js$/.test(spec) ? { url: "data:text/javascript,export default () => ({})", shortCircuit: true } : next(spec, ctx);
}`));

const port = process.argv[2];
globalThis.window = { location: new URL(`http://127.0.0.1:${port}/`) };
globalThis.location = window.location;
// sessionStorage and localStorage are Maps. With env TAB_STORAGE=<file> they are kept in that file, so a second process started with
// the same file is "the same tab after a reload" (same tab id, same unsent lines).
import fs from "node:fs";
const saved = process.env.TAB_STORAGE && fs.existsSync(process.env.TAB_STORAGE) ? JSON.parse(fs.readFileSync(process.env.TAB_STORAGE, "utf8")) : {};
const memory = new Map(Object.entries(saved.session ?? {})), local = new Map(Object.entries(saved.local ?? {}));
const persist = () => { if (process.env.TAB_STORAGE) fs.writeFileSync(process.env.TAB_STORAGE, JSON.stringify({ session: Object.fromEntries(memory), local: Object.fromEntries(local) })); };
const storage = map => ({ getItem: k => map.get(k) ?? null, setItem: (k, v) => { map.set(k, String(v)); persist(); }, removeItem: k => { map.delete(k); persist(); },
	get length(){ return map.size; }, key: i => [...map.keys()][i] ?? null });
globalThis.sessionStorage = storage(memory);
globalThis.localStorage = storage(local);

// FsFile.js (what Store.flush sends through) imports Item and, through it, a good part of the page UI, whose modules touch
// `document` as they load. This tab draws nothing, so `document` is an object that answers every call with itself.
const blank = new Proxy(function(){}, { get: (_, key) => key === Symbol.toPrimitive ? () => "" : blank, apply: () => blank, construct: () => blank });
globalThis.document = blank;

// The Socket logs to stdout too, so an event is a line that starts with "@@ ".
const out = event => process.stdout.write("@@ " + JSON.stringify(event) + "\n");
// Servex is not running here: a post to its /api/item door is counted and fails, as when Servex is down.
const real_fetch = globalThis.fetch;
let servex_up = false;   // "up": the pretend Servex takes every line (and writes none, so a test can see the socket was not used)
globalThis.fetch = (resource, ...rest) => /\/api\/item/.test(String(resource?.url ?? resource))
	? (out({ ev: "entry_post" }), servex_up ? Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } })) : Promise.reject(new Error("Servex is not running")))
	: real_fetch(resource, ...rest);


const { default: Socket } = await import("../../dev/Socket/Socket.js");
const { default: Store } = await import("./Store.js");
// Outbox.js is NOT imported here: a real page does not import it either, so the tab shows whether the Store brings it in (review finding 4).
await import("../../ext/JSONL/live.js");   // installs Socket.prototype.jsonl: how a streamed frame reaches Store.read

const socket = Socket.singleton();
let held = false;
const connect = socket.connect.bind(socket);
socket.connect = () => {   // "offline": every reconnect attempt waits until the test lets the tab back online
	if (!held) return connect();
	clearTimeout(socket.retry);
	socket.retry = setTimeout(() => socket.connect(), 50);
};

let store = null;
const host = { on(){}, emit(){}, replay_line: line => out({ ev: "line", line }) };

const commands = {
	async open({ url }){ store = new Store({ url }); store.attach(host); await store.open(); out({ ev: "opened" }); },
	append({ line }){ store.append(line); },
	async heartbeat({ every, wait }){ (await import("./Outbox.js")).default.heartbeat = { every, wait }; },
	channel({ value }){ Store.channel = value; },
	servex({ up }){ servex_up = !!up; },
	offline(){ held = true; socket.ws.close(); },
	online(){ held = false; },
	state(){ out({ ev: "state", pending: store?.pending, connected: socket.connected && socket.ws?.readyState === 1, offset: store?.offset }); },
	exit(){ process.exit(0); },
};

let buffer = "";
process.stdin.on("data", chunk => {
	buffer += chunk;
	for (let nl; (nl = buffer.indexOf("\n")) !== -1;){
		const text = buffer.slice(0, nl); buffer = buffer.slice(nl + 1);
		if (!text.trim()) continue;
		const command = JSON.parse(text);
		Promise.resolve(commands[command.cmd]?.(command)).catch(e => out({ ev: "error", cmd: command.cmd, message: String(e?.message ?? e) }));
	}
});
out({ ev: "ready" });
