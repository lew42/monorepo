// node Servex/ext/remote/RemoteMCP.test.mjs — gateway on a private port, a fake agent host, plain HTTP calls
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import express from "express";
import RemoteMCP from "./RemoteMCP.js";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "remote-test-"));
fs.mkdirSync(path.join(root, "public/framework/ai"), { recursive: true });
const token_file = path.join(root, "state", "remote.token");
const spawned = [], sent = [];
const servex = {
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
            fs.writeFileSync(out, `answer from ${id}`);
        },
    },
};
const make = () => {
    const app = express(); const gw = new RemoteMCP({ servex, root, router: app, token_file, wait_ms: 3000 });
    return new Promise(r => { const srv = app.listen(0, "127.0.0.1", () => r({ gw, srv, url: `http://127.0.0.1:${srv.address().port}${RemoteMCP.PATH}/${gw.token}` })); });
};
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
srv.close();
fs.rmSync(root, { recursive: true, force: true });
console.log("ok", log.length, "calls");
