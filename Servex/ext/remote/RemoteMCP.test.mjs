// node Servex/ext/remote/RemoteMCP.test.mjs — gateway on a private port, a fake agent host, plain HTTP calls
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import { fileURLToPath } from "url";
import express from "express";
import RemoteMCP from "./RemoteMCP.js";
import MCP from "../../MCP.js";
import { page_tools } from "../../agents/page_tools.js";
import FileTools from "../../files.js";
import External from "../../agents/External.js";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "remote-test-"));
fs.mkdirSync(path.join(root, "public/framework/ai"), { recursive: true });
const token_file = path.join(root, "state", "remote.token");
const spawned = [], sent = [], seen = [];
let slow_ms = 0;
const mcp = new MCP({ router: express.Router() });   // the REAL registry class; the real page tools and one marker tool go in through its own seam
for (const tool of page_tools()) mcp.tool(tool);
for (const tool of FileTools.tools()) mcp.tool(tool);
mcp.tool({ name: "spawn_agent", description: "t", handler: () => JSON.stringify({ id: "mastermind-x", state: "working" }) });
mcp.tool({ name: "whoami_test", description: "test", handler: (a, ctx) => (seen.push(a), `caller=${ctx.caller}`) });
const servex = {
    mcp,
    sessions: { map: {}, save(){} },
    cards: { tools: () => [{ name: "create_card", handler: async () => JSON.stringify({ ok: true, id: "2026/10/15/voice" }) }] },
    agents: {
        registry_list: () => spawned.map(a => ({ id: a.id, task_dir: a.dir })),
        task_dir_for: row => spawned.find(a => a.id === row.id)?.dir ?? null,
        spawn(spec){
            const id = `mastermind-${spec.name}-${spawned.length}`;
            fs.mkdirSync(path.join(root, spec.task.dir), { recursive: true });
            fs.writeFileSync(path.join(root, spec.task.dir, "task.jsonl"), "{}\n");
            assert.equal(spec.role, "mastermind"); assert.equal(spec.dormant_after, 600);
            spawned.push({ id, dir: spec.task.dir });
            return { id };
        },
        send(id, text){
            sent.push(id);
            const out = /to (\S+\.txt)/.exec(text)[1];
            if (slow_ms) setTimeout(() => fs.writeFileSync(out, `late answer from ${id}`), slow_ms);   // slow_ms: the answer misses the wait window
            else fs.writeFileSync(out, `answer from ${id}`);
        },
    },
};
const make = () => {
    const app = express(); const gw = new RemoteMCP({ servex, root, router: app, token_file, wait_ms: 3000 });
    return new Promise(r => { const srv = app.listen(0, "127.0.0.1", () => r({ gw, srv, url: `http://127.0.0.1:${srv.address().port}${RemoteMCP.PATH}/${gw.token}` })); });
};
const live_dir = "live-test-" + process.pid;   // page_add writes under the repo public/, so a throwaway page stands in for /live/
let { gw, srv, url } = await make();
const rpc = async (body, sid) => {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...(sid ? { "mcp-session-id": sid } : {}) }, body: JSON.stringify({ jsonrpc: "2.0", ...body }) });
    return { sid: r.headers.get("mcp-session-id"), json: await r.json() };
};
const ask = (q, sid) => rpc({ id: 2, method: "tools/call", params: { name: "ask_mastermind", arguments: { question: q } } }, sid).then(r => r.json.result.content[0].text);
const chats = agent => fs.readFileSync(path.join(root, spawned.find(a => a.id === agent).dir, "task.jsonl"), "utf8").split("\n").filter(l => l.includes('"chat"')).map(l => JSON.parse(l).chat);

const s1 = (await rpc({ id: 1, method: "initialize", params: {} })).sid;
const s2 = (await rpc({ id: 1, method: "initialize", params: {} })).sid;
assert.ok(s1 && s2 && s1 !== s2, "initialize returns a distinct session id");
{ const { default: R } = await import("./RemoteMCP.js"); assert.ok(R.INSTRUCTIONS.includes("ask_mastermind") && R.INSTRUCTIONS.includes("immediately"), "voice-agent directives are in INSTRUCTIONS"); }

const [a1, a2] = await Promise.all([ask("one", s1), ask("two", s1)]);   // simultaneous first asks: one agent
assert.equal(spawned.length, 1, "two simultaneous asks in one session spawn one agent");
assert.equal(chats(spawned[0].id).length, 4, "both chat pairs are in the agent's task.jsonl");
assert.match(a1 + a2, /answer from mastermind-voice-/);

await ask("three", s2);
assert.equal(spawned.length, 2, "a second session spawns a second agent");
await ask("day one");
await ask("day two");
assert.equal(spawned.length, 3, "no session id: one day agent");
assert.ok(spawned[2].dir.includes(`voice-${new Date().toISOString().slice(0, 10).replace(/-/g, "").slice(0, 8)}`) || spawned[2].dir.includes("voice-"), "day agent dir");

srv.close();
const before = spawned.length, first_agent = gw.sessions[s1].agent;
({ gw, srv, url } = await make());   // simulated restart: a new gateway reloads remote.sessions.json
assert.equal(gw.sessions[s1].agent, first_agent, "sessions reload from disk");
await ask("after restart", s1);
assert.equal(spawned.length, before, "same session routes to the same agent after a restart");
assert.equal(sent.at(-1), first_agent);

gw.target = "mastermind-fixed";   // override beats everything
await ask("override", s1);
assert.equal(sent.at(-1), "mastermind-fixed");

const log = fs.readFileSync(path.join(root, "public/framework/ai/log.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l).remote_mcp);
assert.ok(log.every(l => l.session && l.agent), "every log line names session and agent");
assert.ok(!JSON.stringify(log).includes(gw.token), "token never logged");
// the remote route serves the whole registry plus ask_mastermind; calls are attributed to voice-app
{
    const list = (await rpc({ id: 5, method: "tools/list" })).json.result.tools.map(t => t.name);
    assert.equal(list[0], "ask_mastermind");
    assert.ok(list.includes("page_add") && list.includes("whoami_test"), "page_add and the registry's own tools are listed");
    assert.equal(list.length, mcp.tools.length + 3, "tool count = registry + ask_mastermind + call + cloud_voice_log");
    assert.equal(new Set(list).size, list.length, "no duplicates");
    const call = (name, args) => rpc({ id: 6, method: "tools/call", params: { name, arguments: args } });
    assert.equal((await call("whoami_test", {})).json.result.content[0].text, "caller=voice-app");
    assert.equal((await call("nope_tool", {})).json.error.code, -32602, "unknown tool is an error");
    const text = r => r.json.result.content[0].text;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ft-"));
    const w = JSON.parse(text(await call("write_file", { root: dir, path: "a/b.txt", content: "one two" })));
    assert.ok(w.ok);
    assert.ok(JSON.parse(text(await call("edit_file", { root: dir, path: "a/b.txt", old_string: "two", new_string: "2" }))).ok);
    assert.equal(JSON.parse(text(await call("read_file", { root: dir, path: "a/b.txt" }))).text, "one 2");
    assert.ok(JSON.parse(text(await call("glob", { root: dir, pattern: "**/*.txt" }))).matches.includes("a/b.txt"));
    assert.deepEqual(JSON.parse(text(await call("list_dir", { root: dir }))).entries, ["a/"]);
    assert.equal(JSON.parse(text(await call("write_file", { root: dir, path: "x.jsonl", content: "{}" }))).ok, false, "jsonl write refused");
    const sh = JSON.parse(text(await call("shell", { root: dir, command: "echo hi" })));
    assert.ok(sh.ok && sh.stdout.trim() === "hi" && sh.exit_code === 0, "shell runs");
    assert.equal(JSON.parse(text(await call("shell", { command: "sleep 5", timeout_s: 0.3 }))).timed_out, true, "timeout kills");
    assert.equal(text(await call("call", { tool: "whoami_test", args: {} })), "caller=voice-app", "generic call dispatches");
    fs.rmSync(dir, { recursive: true, force: true });
    const file = path.join(fileURLToPath(new URL("../../../public/" + live_dir + "/page.jsonl", import.meta.url)));
    try {
        const out = JSON.parse((await call("page_add", { path: `/${live_dir}/`, item: { type: "part-card", title: "Hello", text: "from the voice app" } })).json.result.content[0].text);
        assert.ok(out.ok, "page_add through the remote route succeeds");
        const add = JSON.parse(fs.readFileSync(file, 'utf8').trim().split(/\r?\n/)[0]).content.add;
        assert.equal(add.title, "Hello"); assert.equal(add.by, "voice-app");
    } finally { fs.rmSync(path.dirname(file), { recursive: true, force: true }); }
}
// voice logging: owner_words is in every schema, stripped before dispatch, filed by code; every call leaves a line
{
    const tools = (await rpc({ id: 7, method: "tools/list" })).json.result.tools;
    assert.ok(tools.some(t => t.name === "cloud_voice_log") && tools.every(t => !t.inputSchema.properties?.owner_words), "one cloud_voice_log tool; no owner_words on any other schema");
    const first = RemoteMCP.INSTRUCTIONS.split(/\r?\n/)[0];
    assert.ok(first.includes("doc/cloud-voice-agent.md") && first.length < 220, "one short pointer line to the guide at the top");
    const sid = (await rpc({ id: 1, method: "initialize", params: {} })).sid;
    const call = (name, args) => rpc({ id: 8, method: "tools/call", params: { name, arguments: args } }, sid);
    const reg = JSON.parse((await call("register_session", { title: "Live Page!", cost: 1.5 })).json.result.content[0].text);
    assert.ok(reg.ok && reg.session === "cloud-voice-live-page", "named from the title");
    assert.equal(servex.sessions.map[reg.session].cost, 1.5, "cost on the store row");
    seen.length = 0;
    await call("whoami_test", { x: 1 });
    const logged = JSON.parse((await call("cloud_voice_log", { words: "make it blue, please" })).json.result.content[0].text);
    assert.ok(logged.ok && logged.session === "cloud-voice-live-page", "cloud_voice_log files the words");
    await call("cloud_voice_log", { words: "via the tool, twice" });
    await call("whoami_test", {});
    await call("call", { tool: "whoami_test", args: {} });
    assert.equal(seen.length, 3, "cloud_voice_log is answered here, never dispatched to the registry");
    await call("spawn_agent", { task: { dir: "public/framework/ai/x" } });
    const lines = fs.readFileSync(path.join(root, "public", reg.file), "utf8").trim().split(/\r?\n/).map(l => JSON.parse(l));
    assert.ok(reg.file.endsWith("/cloud-voice-live-page/session.jsonl"), "folder named cloud-voice-<name>"); assert.equal(lines[0].session.kind, "cloud-voice-agent");
    assert.ok(lines.some(l => l.spawned?.agent === "mastermind-x" && l.spawned.task_dir), "a spawn is logged with agent id and task dir"); assert.equal(lines[0].session.caller, "voice-app");
    const words = lines.filter(l => l.owner_words).map(l => l.owner_words.words);
    assert.deepEqual(words, ["make it blue, please", "via the tool, twice"], "words filed verbatim, one line per call");
    assert.equal(lines.find(l => l.cost).cost.usd, 1.5, "cost line");
    const other = (await rpc({ id: 1, method: "initialize", params: {} })).sid;
    const dflt = JSON.parse((await rpc({ id: 9, method: "tools/call", params: { name: "register_session", arguments: {} } }, other)).json.result.content[0].text);
    assert.match(dflt.session, /^cloud-voice-app-[0-9]{8}$/, "default name = caller + date");
    const calls = lines.filter(l => l.tool_call).map(l => l.tool_call);
    assert.ok(calls.length >= 6 && calls.every(c => c.args_hash.length === 12), "every call logged with a hash (a call with no words line before it is the gap)");
}
// `updates`: a cursor per caller over the caller's inbox (External.updates); a scratch folder stands in for Servex's home
{
    let rows = {};
    const ext = new External({ servex: { mcp, agents: { live: new Map() } } });
    ext.reg = () => ({ read: () => rows, save: r => { rows = r; } });
    ext.file = id => path.join(root, "inbox", `${id}.jsonl`); ext.cursor_file = id => path.join(root, "inbox", `${id}.cursor`);
    fs.mkdirSync(path.join(root, "inbox"), { recursive: true });
    ext.tool(); servex.external = ext;
    const call = (name, args) => rpc({ id: 7, method: "tools/call", params: { name, arguments: args } }).then(r => r.json.result.content);
    const add = n => fs.appendFileSync(ext.file("voice-app"), Array.from({ length: n }, (_, i) => JSON.stringify({ text: "m" + i })).join("\n") + "\n");
    const up = async args => JSON.parse((await call("updates", args))[0].text);
    assert.equal((await up({})).count, 0, "nothing new: empty");
    assert.ok(ext.has("voice-app"), "the caller is registered so follow can address it");
    add(3);
    assert.equal((await call("whoami_test", {})).at(-1).text, "3 new updates for you: call updates.", "hint when behind");
    assert.equal((await up({ peek: true })).count, 3, "peek reads");
    assert.equal((await up({ peek: true })).count, 3, "peek does not advance");
    const first = await up({});
    assert.deepEqual(first.updates.map(u => u.text), ["m0", "m1", "m2"]); assert.equal(first.more, false);
    assert.equal((await up({})).count, 0, "cursor advanced");
    assert.equal((await call("whoami_test", {})).length, 1, "no hint when caught up");
    add(60);
    const page1 = await up({}); assert.equal(page1.count, 50); assert.equal(page1.more, true, "capped at 50 with more");
    const page2 = await up({}); assert.equal(page2.count, 10); assert.equal(page2.more, false); assert.equal(page2.updates[0].text, "m50", "second page continues");
    fs.appendFileSync(ext.file("voice-app"), '{"text":"half'); assert.equal((await up({})).count, 0, "an unfinished line waits");
    fs.writeFileSync(ext.file("voice-app"), ""); fs.writeFileSync(ext.cursor_file("voice-app"), "0");   // fresh inbox for the async-ask cases
    gw.target = undefined; gw.wait_ms = 600; slow_ms = 1500;
    // 1) the answer lands after the wait window: the call says so, the answer reaches the inbox and the chat log
    const timed = await ask("slow one", s1);
    assert.match(timed, /arrive through updates/, "a timed-out ask says the answer will come through updates");
    assert.equal((await up({})).count, 0, "nothing yet");
    await new Promise(r => setTimeout(r, 1800));
    const late = (await up({})).updates;
    assert.equal(late.length, 1, "the late answer is in the inbox");
    assert.match(late[0].text, /^late answer from /); assert.equal(late[0].from, "voice-mastermind"); assert.ok(late[0].reply_to, "reply_to is the question id");
    assert.ok(chats(gw.sessions[s1].agent).some(c => c.from === "voice-mastermind" && c.id === late[0].reply_to), "the late answer has its chat line");
    // 2) wait:false returns a ticket at once; the answer arrives through updates
    const t0 = Date.now();
    const r = await rpc({ id: 9, method: "tools/call", params: { name: "ask_mastermind", arguments: { question: "no wait", wait: false } } }, s1);
    const ticket = JSON.parse(r.json.result.content[0].text);
    assert.ok(Date.now() - t0 < 400 && ticket.ticket && /updates/.test(ticket.note), "wait:false returns a ticket at once");
    await new Promise(r => setTimeout(r, 2200));
    const got = (await up({})).updates;
    assert.equal(got.length, 1); assert.equal(got[0].reply_to, ticket.ticket, "the ticket matches the delivered answer");
    // 3) a notifications/cancelled stops the wait at once; the answer still reaches updates
    gw.wait_ms = 3000; slow_ms = 1500;
    const t1 = Date.now();
    const pending = rpc({ id: 77, method: "tools/call", params: { name: "ask_mastermind", arguments: { question: "cancel me" } } }, s1);
    await new Promise(r => setTimeout(r, 300));
    const note = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "mcp-session-id": s1 }, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 77 } }) });
    assert.equal(note.status, 202);
    const cancelled = (await pending).json.result.content[0].text;
    assert.ok(Date.now() - t1 < 1400 && /arrive through updates/.test(cancelled), "a cancelled ask stops waiting before the answer exists");
    assert.equal(gw.open.size, 0, "the open-call map is cleaned up");
    await new Promise(r => setTimeout(r, 2000));
    const canc = (await up({})).updates;
    assert.equal(canc.length, 1, "the cancelled ask's answer is in the inbox"); assert.match(canc[0].text, /^late answer from /);
    // 4) a quick answer is returned in the call AND put in the inbox (a dropped call can swallow the returned one)
    slow_ms = 0;
    const quick = await ask("fast", s1);
    assert.match(quick, /^answer from /);
    const inbox = (await up({})).updates;
    assert.equal(inbox.length, 1, "an answer returned in time is also in the inbox");
    assert.equal(inbox[0].text, quick); assert.ok(inbox[0].reply_to && inbox[0].from === "voice-mastermind");
    // 5) the boot sweep: a reply file with no delivered marker goes to the inbox once; marked and stale files are skipped
    const rd = gw.replies;
    gw.sweep();   // first sweep marks what exists (and writes the sentinel) without delivering
    assert.equal((await up({})).count, 0, "the first sweep replays nothing old");
    fs.writeFileSync(path.join(rd, "feedbeef.txt"), "written while Servex was down");
    fs.writeFileSync(path.join(rd, "oldold01.txt"), "two days old");
    const two_days = new Date(Date.now() - 2 * 86400000); fs.utimesSync(path.join(rd, "oldold01.txt"), two_days, two_days);
    gw.sweep(); gw.sweep();
    const swept = (await up({})).updates;
    assert.equal(swept.length, 1, "exactly one swept answer: a marker stops a second delivery, a stale file is skipped");
    assert.equal(swept[0].text, "written while Servex was down"); assert.equal(swept[0].reply_to, "feedbeef");
    assert.ok(fs.existsSync(path.join(rd, "feedbeef.delivered")), "delivery is marked");
}
srv.close();
fs.rmSync(root, { recursive: true, force: true });
console.log("ok", log.length, "calls");
