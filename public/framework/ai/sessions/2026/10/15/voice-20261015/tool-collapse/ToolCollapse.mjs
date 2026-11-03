// Measures the Servex MCP tool registry (size) and how often each tool is called (transcripts).
// Usage: node ToolCollapse.mjs [days=14]   Writes data/tools.json + data/calls.json, prints a summary. No AI, no writes outside data/.
import fs from "fs"; import os from "os"; import path from "path"; import readline from "readline";

const DAYS = Number(process.argv[2] ?? 14), HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const DATA = path.join(HERE, "data"); fs.mkdirSync(DATA, { recursive: true });
const TOK = chars => Math.round(chars / 3.5);   // rough: JSON-ish English+code is ~3.5 chars per token

// 1. size of the live registry (the same list every local session and the tunnel get)
const res = await fetch("http://127.0.0.1:8090/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) });
const tools = (await res.json()).result.tools;
const rows = tools.map(t => {
    const d = (t.description ?? "").length, s = JSON.stringify(t.inputSchema ?? {}).length;
    return { name: t.name, desc: d, schema: s, total: d + s + t.name.length, props: Object.keys(t.inputSchema?.properties ?? {}).length };
}).sort((a, b) => b.total - a.total);
const sum = k => rows.reduce((n, r) => n + r[k], 0);
const full = JSON.stringify(tools).length;
fs.writeFileSync(path.join(DATA, "tools.json"), JSON.stringify({ at: new Date().toISOString(), count: rows.length, desc: sum("desc"), schema: sum("schema"), full_json_chars: full, rows }, null, 1));

// 2. call counts from every transcript touched in the last DAYS days
const root = path.join(os.homedir(), ".claude", "projects"), since = Date.now() - DAYS * 864e5;
const files = [];
for (const d of fs.readdirSync(root)) if (/^c--Code-lew42/i.test(d)) {
    for (const f of fs.readdirSync(path.join(root, d))) if (f.endsWith(".jsonl")) {
        const p = path.join(root, d, f); if (fs.statSync(p).mtimeMs >= since) files.push(p);
    }
}
const calls = {}, sessions = {}, other = {}; let lines = 0;
for (const p of files) {
    const sid = path.basename(p, ".jsonl");
    const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });
    for await (const line of rl) {
        if (!line.includes('"tool_use"')) continue; lines++;
        for (const m of line.matchAll(/"name":"(mcp__servex__\w+|Skill)"/g)) {
            const n = m[1].replace("mcp__servex__", ""); calls[n] = (calls[n] ?? 0) + 1; (sessions[n] ??= new Set()).add(sid);
        }
    }
}
const called = Object.entries(calls).map(([name, n]) => ({ name, calls: n, sessions: sessions[name].size })).sort((a, b) => b.calls - a.calls);
fs.writeFileSync(path.join(DATA, "calls.json"), JSON.stringify({ days: DAYS, files: files.length, called }, null, 1));

// 3. summary
const names = new Set(rows.map(r => r.name)), used = called.filter(c => names.has(c.name)), usedSet = new Set(used.map(c => c.name));
const unused = rows.filter(r => !usedSet.has(r.name));
const top = (n) => used.slice(0, n).reduce((a, c) => a + rows.find(r => r.name === c.name).total, 0);
console.log(`registry: ${rows.length} tools, descriptions ${sum("desc")} chars, schemas ${sum("schema")} chars, full tools/list JSON ${full} chars (~${TOK(full)} tokens)`);
console.log(`transcripts: ${files.length} files in last ${DAYS} days, ${lines} tool_use lines`);
console.log(`called at least once: ${used.length} of ${rows.length}; never called: ${unused.length} (${unused.reduce((a, r) => a + r.total, 0)} chars, ~${TOK(unused.reduce((a, r) => a + r.total, 0))} tokens)`);
console.log(`calls total ${used.reduce((a, c) => a + c.calls, 0)}; top 10 hold ${used.slice(0, 10).reduce((a, c) => a + c.calls, 0)}; top 10 cost ${top(10)} chars`);
console.log("TOP calls:", used.slice(0, 12).map(c => `${c.name}=${c.calls}`).join(" "));
console.log("BIGGEST tools:", rows.slice(0, 8).map(r => `${r.name}=${r.total}`).join(" "));
console.log("NEVER:", unused.map(r => r.name).join(" "));
console.log("Skill calls:", calls.Skill ?? 0);

// 4. proposed tiers (a proposal, not a policy): size of each tier and the share of the last DAYS days' calls it holds
const TIERS = {
    core: "send_to_agent list_agents card_reply check_page page_add page_set page_read page_note page_log append_log owner_note close_task take_worktree return_worktree create_card list_cards read_card card_set card_ask session_summary",
    orchestrate: "spawn_agent wait_for_agent stop_agent fork_self interrupt_agent snooze_task kill_task reprioritise_task pause_dispatch resume_dispatch task_loop_status heartbeat_status system_health quick_fix quick_fix_landed start_job job_result ask_directory ask_manager ask_module ask_expert list_experts list_waiting",
    ops: "list_servers start_server stop_server restart_server restart_servex server_logs",
    coordinate: "claim_topic release_topic list_claims follow unfollow list_follows load_module readme_modules module_inbox inbox register_session file_to_group place drop clear add_item attach_card card_summary dir_log",
    refine: "refine_step append_prompt_event amend_bubble audit_session log_session session_line",
    page_rare: "page_call page_reply read_page create_page list_pages set_layout set_focus",
};
const seen = new Set(), byName = Object.fromEntries(rows.map(r => [r.name, r])), cc = Object.fromEntries(called.map(c => [c.name, c.calls]));
const total_calls = used.reduce((a, c) => a + c.calls, 0), tiers = {};
for (const [tier, list] of Object.entries(TIERS)) {
    const ns = list.split(" ").filter(n => byName[n]); ns.forEach(n => seen.add(n));
    tiers[tier] = { tools: ns.length, chars: ns.reduce((a, n) => a + byName[n].total, 0), calls: ns.reduce((a, n) => a + (cc[n] ?? 0), 0) };
}
const left = rows.filter(r => !seen.has(r.name)).map(r => r.name);
tiers.unplaced = { tools: left.length, names: left };
fs.writeFileSync(path.join(DATA, "tiers.json"), JSON.stringify(tiers, null, 1));
for (const [t, v] of Object.entries(tiers)) console.log(`tier ${t}:`, v.tools, "tools", v.chars ?? "", "chars", v.calls != null ? `${(100 * v.calls / total_calls).toFixed(1)}% of calls` : v.names.join(","));
