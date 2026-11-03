/* Times the cloud voice agent's path through the remote MCP door, the way the Claude app calls it.
 * node measure.mjs [--tunnel] [--asks N] [--bridge]
 * --tunnel: go out through the public tunnel (remote.url) instead of http://localhost
 * --asks N: how many ask_mastermind round trips (default 2; the first one in a session spawns the mastermind)
 * --bridge: the bridge (ask_mastermind wait:false, then voice_hear long-polls) instead of polling updates
 * Prints one JSON line per step, then a summary line. Never prints the token. */
import fs from "fs";
import path from "path";

const DIR = path.join(process.env.LOCALAPPDATA, "lew42", "servex");
const token = fs.readFileSync(path.join(DIR, "remote.token"), "utf8").trim();
const tunnel = process.argv.includes("--tunnel"), bridge = process.argv.includes("--bridge");
const asks = Number(process.argv[process.argv.indexOf("--asks") + 1]) || 2;
const base = tunnel ? fs.readFileSync(path.join(DIR, "remote.url"), "utf8").trim() : (process.env.REMOTE_BASE ?? "http://localhost/mcp/remote");
let sid = null, rpc = 0;
const out = [];
const say = o => { out.push(o); console.log(JSON.stringify(o)); };

async function call(method, params, tries = 2){
    const t = performance.now();
    let res;
    try { res = await fetch(base, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...(sid ? { "mcp-session-id": sid } : {}) }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rpc, method, params }) }); }
    catch (e) { say({ error: method, tool: params?.name, why: e.cause?.code ?? e.message, ms: Math.round(performance.now() - t) }); if (tries > 1) return call(method, params, tries - 1); throw e; }
    sid ??= res.headers.get("mcp-session-id");
    const j = await res.json();
    return { ms: Math.round(performance.now() - t), j, text: j.result?.content?.map(c => c.text).join("\n") ?? JSON.stringify(j.error ?? j.result).slice(0, 200) };
}
const tool = (name, args = {}) => call("tools/call", { name, arguments: args });

const init = await call("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "voice-bridge-measure", version: "1" } });
say({ step: "initialize", ms: init.ms, via: tunnel ? "tunnel" : "local" });
for (const m of ["ping", "tools/list"]) { const r = await call(m, {}); say({ step: m, ms: r.ms, bytes: JSON.stringify(r.j).length }); }
say({ step: "register_session", ms: (await tool("register_session", { title: "latency-probe" })).ms });
for (let i = 0; i < 3; i++) say({ step: "updates", ms: (await tool("updates")).ms });
say({ step: "list_agents", ms: (await tool("list_agents")).ms });

const rounds = [];
for (let i = 0; i < asks; i++){
    const q = `Latency probe ${i + 1} from the voice-bridge task: reply with exactly the word ok${i + 1} and nothing else.`;
    const t0 = performance.now();
    const fire = await tool("ask_mastermind", { question: q, wait: false });
    let ticket = null;
    try { ticket = JSON.parse(fire.text).ticket; } catch {}
    const r = { ask: i + 1, ack_ms: fire.ms, ticket, polls: 0 };
    // the voice app can only pull: poll the way it would, and note when the first words and the full answer arrive
    while (performance.now() - t0 < 180000){
        const u = bridge ? await tool("voice_hear", { ticket, wait_s: 8 }) : await tool("updates");
        r.polls++;
        if (bridge){
            let h = {}; try { h = JSON.parse(u.text); } catch {}
            if (h.first && r.first_ms == null) r.first_ms = Math.round(performance.now() - t0);
            if (h.status && h.status !== "asked" && r.status_ms == null) r.status_ms = Math.round(performance.now() - t0), r.status = h.status;
            if (h.done){ r.answer_ms = Math.round(performance.now() - t0); r.answer = String(h.answer).slice(0, 60); break; }
        } else if (ticket && u.text.includes(ticket)){
            r.answer_ms = r.first_ms = Math.round(performance.now() - t0);
            r.answer = u.text.slice(0, 120).replace(/\s+/g, " ");
            break;
        } else await new Promise(res => setTimeout(res, 1000));   // the old path: a poll every second is already more than the app does
    }
    say(r); rounds.push(r);
}
say({ summary: { via: tunnel ? "tunnel" : "local", path: bridge ? "bridge" : "ask_mastermind+updates", init_ms: init.ms, rounds: rounds.map(r => ({ ack_ms: r.ack_ms, status_ms: r.status_ms, first_ms: r.first_ms, answer_ms: r.answer_ms, polls: r.polls })) } });
