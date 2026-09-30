/* node Servex/proof/follow-proof.mjs — Follow.js proven end to end, with no
 * live Servex: a fake host records every message instead of sending one to a
 * real agent, and every file lives under `tmp-follow/` (deleted at the end),
 * which is itself a legal follow path (`Servex/proof/tmp-follow/...`).
 *
 * Eight checks, each printing PASS/FAIL and the number behind it:
 *   1. 20 lines appended within 1s arrive as ONE message holding all 20.
 *   2. A change to a file nobody follows reaches nobody.
 *   3. After unfollow, nothing more arrives.
 *   4. After a "restart" (the instance disposed, a new one made from the
 *      same state file), the follow still works.
 *   5. Reading a followed file (fs.readFileSync) sends nothing — the
 *      Windows trap: a read alone must never look like a write.
 *   6. Following an EXISTING 100-line jsonl and appending 1 more sends only
 *      that 1 new line — never a replay of the 100 that were already there.
 *   7. The same, across a restart: a file with 50 lines already in it when
 *      Servex comes back sends only the 1 line appended after.
 *   8. Reading an existing, already-followed file (not just a fresh empty
 *      one) sends nothing.
 * Checks 6-8 exist because checks 1-5 all wrote before they ever followed
 * a path with content already in it, so a bug that replays everything
 * already on disk the first time a change is seen slipped past them.
 *
 *   9. A graceful shutdown (`agents.closing`) must not erase a subscription
 *      on the way down — only a stop that ISN'T a shutdown should.
 *  10. An agent that stops WITHIN `gather_ms` of a change gets no message —
 *      its pending burst and flush timer are cleared, not left to fire and
 *      revive it.
 *  11. Following a directory AND a file inside it delivers each new line
 *      once, never twice.
 *  12. `public/framework/.` and `Servex/.` are refused, not resolved by
 *      `path.join` into the whole framework tree or the whole Servex folder.
 *  13. A change for an agent that isn't a live or registered session sends
 *      nothing and drops the dead subscription, instead of reviving it.
 *  14. Following a directory that doesn't exist yet, then creating a jsonl
 *      inside it, catches that file from its very first line. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Follow from "../Follow.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const TMP = path.join(HERE, "tmp-follow");
const rel = abs => path.relative(REPO, abs).split(path.sep).join("/");
const wait = ms => new Promise(r => setTimeout(r, ms));

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const results = [];
function report(name, measure, ok){
	results.push({ try: name, measure, result: ok ? "PASS" : "FAIL" });
	console.log(`${ok ? "PASS" : "FAIL"} — ${name}: ${measure}`);
}

/* Stands in for Servex's `agents` host: `send(id, text)` is all most checks
 * need. `live` and `external` are the two things `Follow.live()` reads to
 * decide whether an agent is real; `closing` is what `agent_ended()` reads
 * to skip itself during a graceful shutdown. `live_ids` defaults to
 * `["proof-agent"]` — every earlier check's agent — so none of them had to
 * change when this got added. */
const fake_host = (live_ids = ["proof-agent"]) => ({
	sent: [], closing: false,
	live: new Map(live_ids.map(id => [id, { state: "idle" }])),
	external: { has: () => false },
	send(id, text){ this.sent.push({ id, text }); }
});

async function check_burst(){
	const host = fake_host(), file = path.join(TMP, "a.jsonl");
	fs.writeFileSync(file, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-1.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 400 });
	await wait(300);
	for (let i = 0; i < 20; i++) fs.appendFileSync(file, JSON.stringify({ i }) + "\n");
	await wait(1200);
	const msg = host.sent.find(s => s.id === "proof-agent");
	const lines = msg ? msg.text.split("\n").filter(l => l.startsWith("{")) : [];
	report("20 lines within 1s arrive as one message", `${host.sent.length} message(s), ${lines.length} line(s)`,
		host.sent.length === 1 && lines.length === 20);
	f.stop();
}

async function check_unwatched(){
	const host = fake_host(), followed = path.join(TMP, "a2.jsonl"), other = path.join(TMP, "b.jsonl");
	fs.writeFileSync(followed, ""); fs.writeFileSync(other, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-2.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(followed), gather_ms: 300 });
	await wait(300);
	fs.appendFileSync(other, JSON.stringify({ x: 1 }) + "\n");
	await wait(800);
	report("a change nobody follows reaches nobody", `${host.sent.length} message(s)`, host.sent.length === 0);
	f.stop();
}

async function check_unfollow(){
	const host = fake_host(), file = path.join(TMP, "c.jsonl");
	fs.writeFileSync(file, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-3.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ before: true }) + "\n");
	await wait(800);
	f.unfollow({ agent: "proof-agent", path: rel(file) });
	host.sent.length = 0;
	await wait(200);
	fs.appendFileSync(file, JSON.stringify({ after: true }) + "\n");
	await wait(800);
	report("after unfollow, nothing more arrives", `${host.sent.length} message(s)`, host.sent.length === 0);
	f.stop();
}

async function check_restart(){
	const host = fake_host(), file = path.join(TMP, "d.jsonl"), state = path.join(TMP, "state-4.json");
	fs.writeFileSync(file, "");
	const f1 = new Follow({ agents: host, file: state }).start();
	f1.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	f1.stop();                                                        // "Servex restarts"
	const f2 = new Follow({ agents: host, file: state }).start();     // reloads the same state file
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ after_restart: true }) + "\n");
	await wait(800);
	report("a follow survives a restart", `${host.sent.length} message(s)`, host.sent.length === 1);
	f2.stop();
}

async function check_read(){
	const host = fake_host(), file = path.join(TMP, "e.jsonl");
	fs.writeFileSync(file, JSON.stringify({ seed: true }) + "\n");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-5.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	fs.readFileSync(file);                                            // a plain read — must send nothing
	await wait(800);
	report("reading a followed file sends nothing", `${host.sent.length} message(s)`, host.sent.length === 0);
	f.stop();
}

async function check_existing_burst(){
	const host = fake_host(), file = path.join(TMP, "f.jsonl");
	fs.writeFileSync(file, Array.from({ length: 100 }, (_, i) => JSON.stringify({ seed: i })).join("\n") + "\n");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-6.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ new: true }) + "\n");
	await wait(800);
	const msg = host.sent.find(s => s.id === "proof-agent");
	const lines = msg ? msg.text.split("\n").filter(l => l.startsWith("{")) : [];
	report("following an existing 100-line jsonl and appending 1 sends only that 1 line",
		`${host.sent.length} message(s), ${lines.length} line(s)`, host.sent.length === 1 && lines.length === 1);
	f.stop();
}

async function check_existing_restart(){
	const host = fake_host(), file = path.join(TMP, "g.jsonl"), state = path.join(TMP, "state-7.json");
	fs.writeFileSync(file, Array.from({ length: 50 }, (_, i) => JSON.stringify({ seed: i })).join("\n") + "\n");
	const f1 = new Follow({ agents: host, file: state }).start();
	f1.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	f1.stop();                                                        // "Servex restarts" — the file already has 50 lines
	const f2 = new Follow({ agents: host, file: state }).start();     // reloads the subscription and re-primes against the file as it now stands
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ after_restart: true }) + "\n");
	await wait(800);
	const msg = host.sent.find(s => s.id === "proof-agent");
	const lines = msg ? msg.text.split("\n").filter(l => l.startsWith("{")) : [];
	report("a restart with 50 lines already on disk replays none of them — only the 1 appended after",
		`${host.sent.length} message(s), ${lines.length} line(s)`, host.sent.length === 1 && lines.length === 1);
	f2.stop();
}

async function check_existing_read(){
	const host = fake_host(), file = path.join(TMP, "h.jsonl");
	fs.writeFileSync(file, Array.from({ length: 30 }, (_, i) => JSON.stringify({ seed: i })).join("\n") + "\n");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-8.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	fs.readFileSync(file);                                            // a plain read of an existing, already-followed file
	await wait(800);
	report("reading an existing, already-followed file sends nothing", `${host.sent.length} message(s)`, host.sent.length === 0);
	f.stop();
}

async function check_closing(){
	const host = fake_host(), file = path.join(TMP, "i.jsonl");
	fs.writeFileSync(file, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-9.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });
	await wait(100);
	host.closing = true;                                              // "Servex is shutting down"
	f.agent_ended("proof-agent");                                     // the same call register() makes for every live agent
	host.closing = false;
	const kept = JSON.parse(fs.readFileSync(path.join(TMP, "state-9.json"), "utf8"));
	report("a graceful shutdown does not erase a subscription", `${kept.length} subscription(s) kept in follow.json`, kept.length === 1);
	f.stop();
}

async function check_stop_within_gather(){
	/* A SECOND, unrelated subscription (a different agent, a different file)
	 * stays alive throughout, so removing "proof-agent"'s only sub does not
	 * empty `subs` entirely — otherwise `rescope()` calls the ALL-STOP path,
	 * which clears every timer as a side effect and would hide the real bug
	 * (a leftover timer for one agent among several) behind a false pass. */
	const host = fake_host(["proof-agent", "other-agent"]);
	const file = path.join(TMP, "j.jsonl"), other = path.join(TMP, "j2.jsonl");
	fs.writeFileSync(file, ""); fs.writeFileSync(other, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-10.json") }).start();
	f.follow({ agent: "other-agent", path: rel(other), gather_ms: 1000 });
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 1000 });
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ x: 1 }) + "\n");
	await wait(300);                                                  // well inside the 1000ms window — a burst is now pending
	f.agent_ended("proof-agent");                                     // the agent stops before it ever flushes
	await wait(900);                                                  // past the original gather_ms — a leftover timer would have fired by now
	report("an agent that stops within gather_ms gets no message", `${host.sent.length} message(s)`, host.sent.length === 0);
	f.stop();
}

async function check_dir_and_file_dedupe(){
	const host = fake_host(), dir = path.join(TMP, "dirdedupe");
	fs.mkdirSync(dir, { recursive: true });
	const file = path.join(dir, "x.jsonl");
	fs.writeFileSync(file, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-11.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(dir), gather_ms: 300 });
	f.follow({ agent: "proof-agent", path: rel(file), gather_ms: 300 });   // same agent, dir AND a file inside it
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ once: true }) + "\n");
	await wait(800);
	const msg = host.sent.find(s => s.id === "proof-agent");
	const lines = msg ? msg.text.split("\n").filter(l => l.startsWith("{")) : [];
	report("a directory and a file inside it deliver each line once, not twice",
		`${host.sent.length} message(s), ${lines.length} line(s)`, host.sent.length === 1 && lines.length === 1);
	f.stop();
}

async function check_dot_paths(){
	const host = fake_host();
	const f = new Follow({ agents: host, file: path.join(TMP, "state-12.json") }).start();
	let ok = true;
	const notes = [];
	for (const bad of ["public/framework/.", "Servex/."]){
		try { f.follow({ agent: "proof-agent", path: bad }); ok = false; notes.push(`NOT refused: ${bad}`); }
		catch (e){ notes.push(`refused ${bad}`); }
	}
	report("public/framework/. and Servex/. are refused, not resolved into the whole tree", notes.join("; "), ok);
	f.stop();
}

async function check_unknown_agent(){
	const host = fake_host([]);                                       // nobody at all is "live"
	const file = path.join(TMP, "k.jsonl");
	fs.writeFileSync(file, "");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-13.json") }).start();
	f.follow({ agent: "ghost-agent", path: rel(file), gather_ms: 300 });
	await wait(300);
	fs.appendFileSync(file, JSON.stringify({ x: 1 }) + "\n");
	await wait(800);
	const kept = f.list("ghost-agent");
	report("a change for an agent that isn't live sends nothing and drops the subscription",
		`${host.sent.length} message(s), ${kept.length} subscription(s) left`, host.sent.length === 0 && kept.length === 0);
	f.stop();
}

async function check_missing_dir(){
	const host = fake_host(), dir = path.join(TMP, "newdir");
	const f = new Follow({ agents: host, file: path.join(TMP, "state-14.json") }).start();
	f.follow({ agent: "proof-agent", path: rel(dir), gather_ms: 300 });   // the directory does not exist yet
	await wait(300);
	fs.mkdirSync(dir, { recursive: true });
	await wait(300);
	fs.writeFileSync(path.join(dir, "new.jsonl"), JSON.stringify({ born: true }) + "\n");
	await wait(1200);
	const msg = host.sent.find(s => s.id === "proof-agent");
	const lines = msg ? msg.text.split("\n").filter(l => l.startsWith("{")) : [];
	report("following a directory that doesn't exist yet catches a jsonl born inside it, from its first line",
		`${host.sent.length} message(s), ${lines.length} line(s)`, host.sent.length === 1 && lines.length === 1);
	f.stop();
}

await check_burst();
await check_unwatched();
await check_unfollow();
await check_restart();
await check_read();
await check_existing_burst();
await check_existing_restart();
await check_existing_read();
await check_closing();
await check_stop_within_gather();
await check_dir_and_file_dedupe();
await check_dot_paths();
await check_unknown_agent();
await check_missing_dir();

const failed = results.filter(r => r.result === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
console.log(JSON.stringify(results));   // one line, easy to paste into task.jsonl as {"experiment": ...} lines
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
