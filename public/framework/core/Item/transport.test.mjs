// How a line travels: tab -> dev server socket -> file -> every tab. Run: `node public/framework/core/Item/transport.test.mjs`
// Real parts: the dev server's own SocketServer with its Tail and Append plugins on a real http port, real files, and two
// real "tabs" (transport.tab.mjs: a child process each, with the browser's Socket, FsFile and Item.Store), talking over a real
// websocket. Faked: nothing but two injected faults (a line lost on the wire, an ack lost on the wire), each a few lines below.
//   1. a line from tab A is appended once and reaches tab B (and does not come back to A)
//   2. the socket dies with the line on the wire -> after the reconnect the line is in the file exactly once
//   3. the line is appended but its ack is lost -> the tab sends it again -> still exactly once
//   4. tab B is offline while A writes 3 lines -> B reconnects and gets exactly those 3
//   5. a task.jsonl line goes through the socket, not the Servex /api/item door, and is stamped by/ts
//   6. (optional) Store.channel = "item_api" still posts to Servex first, and falls back to the socket when Servex is down
//   8. a line queued while the socket is down survives a reload of the tab (same tab id and storage, new process) and is written once
//   9. a socket that stays open but stops answering is noticed by the outbox's ping, and the batch is sent again on a new socket
//   7. while the socket is down the line stays queued and the tab can see it (store.pending)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const HERE = path.dirname(fileURLToPath(import.meta.url));
process.chdir(ROOT);   // Tail.js and Append.js resolve "public" from the cwd

const { default: Test } = await import("../Test/Test.js");
const { default: SocketServer } = await import("../../../../Server/plugins/SocketServer/SocketServer.js");
const { default: Tail } = await import("../../../../Server/plugins/SocketServer/Tail.js");
const { default: Append } = await import("../../../../Server/plugins/SocketServer/Append.js");

const t = new Test("core/Item transport: lines through the socket");
const REL = "framework/core/Item/.transport-test-" + process.pid;
const DIR = path.join(ROOT, "public", REL);
fs.mkdirSync(path.join(DIR, "rec"), { recursive: true });
fs.mkdirSync(path.join(DIR, "rec2"), { recursive: true });
const url = name => "/" + REL + "/" + name;
const read = file => fs.existsSync(path.join(DIR, file)) ? fs.readFileSync(path.join(DIR, file), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, what, ms = 8000){
	const end = Date.now() + ms;
	while (Date.now() < end){ if (await fn()) return true; await sleep(25); }
	console.log("  (timed out waiting for: " + what + ")");
	return false;
}

// The dev server's socket, as server.js builds it: the same SocketServer, the same two plugins, a watcher that tells Tail a file changed.
const faults = { lose_line: 0, lose_ack: 0, deaf: new Set() };   // deaf: sockets that stay open but never answer (a half-open connection)
const append_real = Append.prototype.append, answer_real = Append.prototype.answer;
Append.prototype.ping = function(args, index){   // the heartbeat's pong (a deaf socket stays silent)
	if (!faults.deaf.has(this.socket.ws)) this.socket.send({ index, response: "pong" });
};
Append.prototype.append = function(...args){
	if (faults.deaf.has(this.socket.ws)) return;   // fault 1: the socket dies while the line is still on the wire (it never reaches the file)
	if (faults.lose_line > 0){ faults.lose_line--; return this.socket.ws.terminate(); }
	return append_real.apply(this, args);
};
Append.prototype.answer = function(...args){   // fault 2: the line is in the file, but the socket dies before the ack goes out
	if (faults.lose_ack > 0){ faults.lose_ack--; return this.socket.ws.terminate(); }
	return answer_real.apply(this, args);
};
SocketServer.Socket.use(Tail);
SocketServer.Socket.use(Append);
const server = http.createServer();
await new Promise(r => server.listen(0, "127.0.0.1", r));
const socket_server = new SocketServer({ server: { http: server } });
// The server.js watcher, as a poll: fs.watch(recursive) needs an inotify watch per file, and a machine that is out of them (many dev
// servers on one box: ENOSPC) never tells Tail anything. Every 20 ms: any .jsonl whose size changed is announced, as the watcher would.
const sizes = new Map();
const poll = setInterval(() => {
	for (const name of fs.readdirSync(DIR, { recursive: true })){
		if (!String(name).endsWith(".jsonl")) continue;
		const file = path.join(DIR, String(name));
		let size; try { size = fs.statSync(file).size; } catch { continue; }
		if (sizes.get(file) !== size){ sizes.set(file, size); Tail.changed(file); }
	}
}, 20);
const watcher = { close(){ clearInterval(poll); } };


class Tab {
	events = [];
	constructor(name, storage_file){
		this.name = name;
		this.child = spawn(process.execPath, [path.join(HERE, "transport.tab.mjs"), String(server.address().port)], {
			cwd: ROOT, env: storage_file ? { ...process.env, TAB_STORAGE: storage_file } : process.env,
		});
		let buffer = "";
		this.child.stdout.on("data", chunk => {
			buffer += chunk;
			for (let nl; (nl = buffer.indexOf("\n")) !== -1;){
				const text = buffer.slice(0, nl); buffer = buffer.slice(nl + 1); if (text.startsWith("@@ ")) this.events.push(JSON.parse(text.slice(3))); }
		});
		this.child.stderr.on("data", d => { if (process.env.TAB_LOG) process.stderr.write(`[${name}] ${d}`); });
	}
	ready(){ return until(() => this.events.some(e => e.ev === "ready"), `${this.name} ready`); }
	send(cmd){ this.child.stdin.write(JSON.stringify(cmd) + "\n"); }
	async open(file){ this.send({ cmd: "open", url: url(file) }); return until(() => this.events.some(e => e.ev === "opened"), `${this.name} opened ${file}`); }
	get lines(){ return this.events.filter(e => e.ev === "line").map(e => e.line); }
	async state(){
		const before = this.events.filter(e => e.ev === "state").length;
		this.send({ cmd: "state" });
		await until(() => this.events.filter(e => e.ev === "state").length > before, `${this.name} state`);
		return this.events.filter(e => e.ev === "state").at(-1);
	}
	exit(){ this.send({ cmd: "exit" }); }
}

const A = new Tab("A"), B = new Tab("B");
try {
	t.ok(await A.ready() && await B.ready(), "both tabs started");
	await A.open("x.jsonl"); await B.open("x.jsonl");

	// 1. A line from A is appended once and reaches B.
	A.send({ cmd: "append", line: { n: 1 } });
	t.ok(await until(() => B.lines.some(l => l.n === 1), "B hears n:1"), "tab B receives the line tab A sent");
	t.eq(read("x.jsonl").filter(l => l.n === 1).length, 1, "the line is in the file once");
	t.eq(A.lines.filter(l => l.n === 1).length, 0, "tab A does not replay its own line when it comes back");

	// 2. The socket dies with the line on the wire.
	faults.lose_line = 1;
	A.send({ cmd: "append", line: { n: 2 } });
	t.ok(await until(() => read("x.jsonl").some(l => l.n === 2), "n:2 reaches the file after the reconnect"), "a line lost on the wire is sent again after the reconnect");
	await sleep(500);
	t.eq(read("x.jsonl").filter(l => l.n === 2).length, 1, "the line is in the file exactly once");
	t.eq(B.lines.filter(l => l.n === 2).length, 1, "tab B hears it exactly once");

	// 3. The line is written but its ack is lost: the tab cannot know, so it sends again, and the server must not write twice.
	faults.lose_ack = 1;
	A.send({ cmd: "append", line: { n: 3 } });
	t.ok(await until(() => B.lines.some(l => l.n === 3), "B hears n:3"), "a line whose ack was lost still reaches B");
	await sleep(1500);   // long enough for the reconnect and the second send
	t.eq(read("x.jsonl").filter(l => l.n === 3).length, 1, "a line sent twice (the ack was lost) is in the file exactly once");
	t.eq(B.lines.filter(l => l.n === 3).length, 1, "tab B hears it exactly once");
	t.eq((await A.state()).pending, 0, "once acked, tab A has nothing pending");

	// 4. B is offline while A writes three lines.
	B.send({ cmd: "offline" });
	t.ok(await until(async () => (await B.state()).connected === false, "B is offline"), "tab B is offline");
	const heard = B.lines.length;
	for (const n of [10, 11, 12]) A.send({ cmd: "append", line: { n } });
	t.ok(await until(() => [10, 11, 12].every(n => read("x.jsonl").some(l => l.n === n)), "the 3 lines are in the file"), "tab A wrote 3 lines while B was away");
	await sleep(300);
	t.eq(B.lines.length, heard, "tab B heard nothing while offline");
	B.send({ cmd: "online" });
	t.ok(await until(() => B.lines.length >= heard + 3, "B catches up"), "tab B catches up after it reconnects");
	await sleep(500);
	t.eq(B.lines.slice(heard).map(l => l.n), [10, 11, 12], "tab B gets exactly the 3 lines it missed, in order, once each");

	// 5. A task.jsonl line goes through the socket, not through Servex's door.
	const C = new Tab("C"); await C.ready(); await C.open("rec/task.jsonl");
	C.send({ cmd: "append", line: { start: {} } });
	t.ok(await until(() => read("rec/task.jsonl").length > 0, "the task line is in the file"), "a task line reaches its file through the socket");
	t.eq(C.events.filter(e => e.ev === "entry_post").length, 0, "nothing was posted to Servex /api/item");
	const task_line = read("rec/task.jsonl")[0] ?? {};
	t.ok(task_line.by === "owner" && /\.\d{3}Z$/.test(task_line.ts ?? ""), "the line is stamped by: owner and a millisecond ts, as the item tool stamps it");
	C.exit();

	// 6. The old channel, switched on: Servex is "down" here, so its POST fails and the line goes through the socket as before.
	{
		const D = new Tab("D"); await D.ready(); await D.open("rec2/task.jsonl");
		D.send({ cmd: "channel", value: "item_api" });
		D.send({ cmd: "append", line: { start: {} } });
		t.ok(await until(() => read("rec2/task.jsonl").length > 0, "the line reaches the file"), "channel item_api: the line still reaches the file when Servex is down");
		t.eq(D.events.filter(e => e.ev === "entry_post").length, 1, "channel item_api: it tried Servex /api/item first");
		D.exit();
	}

	// 7. While the socket is down the line waits in the queue, in plain sight.
	A.send({ cmd: "offline" });
	t.ok(await until(async () => (await A.state()).connected === false, "A is offline"), "tab A is offline");
	A.send({ cmd: "append", line: { n: 20 } });
	await sleep(200);
	t.eq((await A.state()).pending, 1, "an unsent line shows as pending");
	t.eq(read("x.jsonl").filter(l => l.n === 20).length, 0, "and it is not in the file yet");
	A.send({ cmd: "online" });
	t.ok(await until(() => read("x.jsonl").some(l => l.n === 20), "n:20 reaches the file"), "the queued line is sent once the socket is back");
	await sleep(300);
	t.eq(read("x.jsonl").filter(l => l.n === 20).length, 1, "exactly once");
	t.eq((await A.state()).pending, 0, "and nothing is pending any more");

	// 8. Reload: the tab dies with a line still unsent; the next page load (same tab storage) sends it, once.
	{
		const storage_file = path.join(DIR, "tab-storage.json");
		const E = new Tab("E", storage_file); await E.ready(); await E.open("reload.jsonl");
		E.send({ cmd: "offline" });
		await until(async () => (await E.state()).connected === false, "E is offline");
		E.send({ cmd: "append", line: { n: 30 } });
		await until(async () => (await E.state()).pending === 1, "E has the line pending");
		E.child.kill("SIGKILL");   // the tab is gone, not asked to leave
		await sleep(200);
		t.eq(read("reload.jsonl").length, 0, "the unsent line is not in the file when the tab dies");
		const E2 = new Tab("E2", storage_file); await E2.ready();   // the reloaded page: it opens nothing and appends nothing
		t.ok(await until(() => read("reload.jsonl").some(l => l.n === 30), "n:30 reaches the file"), "a line queued before a reload is sent by the reloaded page");
		await sleep(500);
		t.eq(read("reload.jsonl").filter(l => l.n === 30).length, 1, "and it is in the file exactly once");
		t.ok(!/outbox:/.test(fs.readFileSync(storage_file, "utf8")), "once acked, nothing is kept in storage");
		E2.exit();
	}

	// 9. Heartbeat: the socket stays open but the server stops answering (a half-open connection). Without a ping the batch
	// would wait for a close the browser may never report; with it, the outbox drops the dead socket and sends on a new one.
	{
		A.send({ cmd: "heartbeat", every: 200, wait: 300 });
		await A.state();
		for (const s of socket_server.sockets) faults.deaf.add(s.ws);   // every socket open now goes deaf; a reconnect is a new one
		A.send({ cmd: "append", line: { n: 40 } });
		t.ok(await until(() => read("x.jsonl").some(l => l.n === 40), "n:40 reaches the file", 6000), "a deaf socket is noticed by the ping, and the line is sent again on a new one");
		await sleep(500);
		t.eq(read("x.jsonl").filter(l => l.n === 40).length, 1, "exactly once");
		t.eq((await A.state()).pending, 0, "and nothing is pending");
	}
} finally {
	A.exit(); B.exit();
	watcher.close(); server.close();
	fs.rmSync(DIR, { recursive: true, force: true });
}

t.done();
process.exit(process.exitCode ?? 0);
