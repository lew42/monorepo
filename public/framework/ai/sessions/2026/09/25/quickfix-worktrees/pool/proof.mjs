/* The worktree pool, proven on a PRIVATE Servex — never the live one on 8090.
 *
 *   node public/framework/ai/2026-09-25/quickfix-worktrees/pool/proof.mjs <scratch dir>
 *
 * Run from the root of the checkout whose Servex you are testing. It boots
 * `node Servex/index.js` there on 8190 (hidden, its own SERVEX_HOME, no gate,
 * no assistant, no monitor, no layers, no whisper, slots named qfp-*), drives
 * take_worktree / return_worktree over /mcp, then stops that Servex, removes
 * every qfp-* worktree and shows `git worktree list` has none left.
 * Everything it prints also lands in proof.txt beside this file. */
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.cwd();
const SCRATCH = path.resolve(process.argv[2] || path.join(HERE, ".proof-scratch"));
const PORT = 8190;
const BASE = `http://127.0.0.1:${PORT}`;
const POOL_FILE = path.join(SCRATCH, "pool.json");
const MAIN = path.resolve(REPO, execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: REPO, encoding: "utf8", windowsHide: true }).trim(), "..");
fs.mkdirSync(SCRATCH, { recursive: true });

const lines = [];
const t0 = Date.now();
const say = (...a) => { const s = `[${((Date.now() - t0) / 1000).toFixed(1).padStart(6)}s] ${a.join(" ")}`; console.log(s); lines.push(s); };
const ok = (pass, what) => say(pass ? "PASS" : "FAIL", what);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tool(name, args = {}, as = "proof"){
    const r = await fetch(`${BASE}/mcp?as=${as}`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) });
    const j = await r.json();
    const text = j.result?.content?.[0]?.text ?? j.error?.message;
    return { error: !!(j.error || j.result?.isError), text, json: (() => { try { return JSON.parse(text); } catch { return null; } })() };
}
const pool = async () => (await fetch(`${BASE}/api/worktrees`)).json();
async function until(test, what, ms = 240000){
    const end = Date.now() + ms;
    let seen = false;
    const start = Date.now();
    while (Date.now() < end){
        const p = await pool().catch(() => null);
        if (p) seen = true;
        else if (!seen && Date.now() - start > 30000) throw new Error("the private Servex never answered /api/worktrees — see servex.log.err in the scratch dir");
        if (p && test(p)) return p;
        await sleep(1000);
    }
    throw new Error(`timed out waiting for: ${what}`);
}
const brief = p => p.slots.map(s => `${s.id}:${s.state}${s.taken_by ? `(${s.taken_by})` : ""}`).join(" ") || "(empty)";
const ps = cmd => spawnSync("powershell.exe", ["-NoProfile", "-Command", cmd], { encoding: "utf8", windowsHide: true }).stdout.trim();

/* ── boot the private Servex, hidden ─────────────────────────────────── */
const env = { SERVEX_PORT: PORT, SERVEX_PROXY_PORT: 8191, SERVEX_PROXY_INTERNAL: 8192, SERVEX_NO_GATE: 1, SERVEX_NO_ASSISTANT: 1,
    SERVEX_NO_MONITOR: 1, SERVEX_NO_LAYERS: 1, SERVEX_NO_USAGE: 1, SERVEX_DISABLE_WAKE: 1, NO_WHISPER: 1, WHISPER_PORT: 8193,
    SERVEX_HOME: path.join(SCRATCH, "servex-home"), SERVEX_POOL_PREFIX: "qfp", SERVEX_POOL_FILE: POOL_FILE };
const log = path.join(SCRATCH, "servex.log");
const setenv = Object.entries(env).map(([k, v]) => `$env:${k}='${v}'`).join("; ");
const cmdline = `/d /c ""${process.execPath}" Servex/index.js >>"${log}" 2>>"${log}.err""`;
const boot = () => Number(ps(`${setenv}; $p = Start-Process -FilePath $env:ComSpec -ArgumentList '${cmdline.replaceAll("'", "''")}' -WorkingDirectory '${REPO}' -WindowStyle Hidden -PassThru; $p.Id`));
let pid = boot();
say(`private Servex started from ${REPO} — cmd pid ${pid}, dashboard ${BASE}, pool file ${POOL_FILE}`);

try {
    /* 1. one slot ready at boot */
    let p = await until(p => p.slots.some(s => s.state === "ready"), "a ready slot at boot");
    ok(p.slots.length === 1 && p.slots[0].state === "ready", `one slot ready at boot: ${brief(p)} — ${p.slots[0].url}`);
    const answer = await fetch(p.slots[0].url).then(r => r.status).catch(e => e.message);
    ok(answer === 200, `its own server answers ${p.slots[0].url} with ${answer}`);
    await sleep(3000);   // the watcher forks health.mjs, which takes its lock or exits
    const watcher = JSON.parse(fs.readFileSync(POOL_FILE, "utf8")).slots[0].watcher_pid;
    const kid = ps(`Get-CimInstance Win32_Process -Filter "ParentProcessId=${watcher}" | Where-Object { $_.CommandLine -match 'health.mjs' } | ForEach-Object { $_.ProcessId }`);
    ok(!!kid, `its page watcher is on: health-supervisor pid ${watcher}, running health.mjs as pid ${kid || "none"} (its own temp dir, so the owner's watcher lock does not stop it)`);
    const identity = execFileSync("git", ["-C", p.slots[0].path, "config", "user.name"], { encoding: "utf8", windowsHide: true }).trim();
    ok(!!identity, `git identity present in the slot: ${identity ? "yes" : "no"}`);

    /* 2. take answers in under 1 s with a path */
    let t = Date.now();
    const a = await tool("take_worktree", {}, "proof-a");
    const took = Date.now() - t;
    ok(!a.error && took < 1000 && fs.existsSync(a.json?.path ?? ""), `take_worktree answered in ${took} ms: ${a.text.replace(/\s+/g, " ")}`);

    /* 3. a second slot becomes ready */
    t = Date.now();
    p = await until(p => p.slots.some(s => s.state === "ready"), "the next slot ready");
    ok(p.slots.length === 2, `a second slot became ready ${((Date.now() - t) / 1000).toFixed(1)} s after the take: ${brief(p)}`);

    /* 4. returning an unused one: back to ready, and the extra is removed */
    const r1 = await tool("return_worktree", { id: a.json.id }, "proof-a");
    p = await pool();
    ok(!r1.error && p.slots.length === 1 && p.slots[0].id === a.json.id && p.slots[0].state === "ready",
        `returned ${a.json.id} unused: it is ready again and the extra was removed: ${brief(p)}`);

    /* 5. a dirty one is refused, and nothing is discarded */
    const b = await tool("take_worktree", {}, "proof-b");
    const junk = path.join(b.json.path, "pool-proof-dirty.txt");
    fs.writeFileSync(junk, "uncommitted work\n");
    const r2 = await tool("return_worktree", { id: b.json.id }, "proof-b");
    ok(r2.error && /uncommitted/.test(r2.text) && fs.existsSync(junk), `returning a dirty ${b.json.id} was refused, the file is still there: ${r2.text.replace(/\s+/g, " ")}`);
    fs.unlinkSync(junk);   // the proof's own file

    /* 6. the K cap: take until all three are out, then one more */
    await until(p => p.slots.some(s => s.state === "ready"), "a ready slot after the second take");
    const c = await tool("take_worktree", {}, "proof-c");
    await until(p => p.slots.some(s => s.state === "ready"), "a third ready slot");
    const d = await tool("take_worktree", {}, "proof-d");
    p = await pool();
    ok(p.slots.length === 3 && p.slots.every(s => s.state === "taken"), `three taken, none being made (K = 3): ${brief(p)}`);
    const e = await tool("take_worktree", {}, "proof-e");
    ok(e.error && /taken/.test(e.text), `a fourth take is refused and names who holds each: ${e.text}`);

    /* 7. GET /api/worktrees, as the Live card reads it */
    say("GET /api/worktrees:\n" + JSON.stringify(p, null, 2));

    /* 8. hidden: no node, cmd, powershell or chrome window on the desktop */
    const shown = ps(`Get-Process node,cmd,conhost,powershell,chrome,chrome-headless-shell -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 -and $_.StartTime -gt (Get-Date).AddSeconds(-${Math.ceil((Date.now() - t0) / 1000)}) } | ForEach-Object { $_.ProcessName + ' ' + $_.Id }`);
    ok(!shown, `every process started is hidden (MainWindowHandle 0): ${shown || "no node/cmd/powershell/chrome window opened since the proof began"}`);

    for (const x of [b, c, d]) await tool("return_worktree", { id: x.json.id }, "proof");
    say(`all returned: ${brief(await pool())}`);
    const leaving = () => { try { return JSON.parse(fs.readFileSync(POOL_FILE, "utf8")).leaving?.length ?? 0; } catch { return 0; } };
    for (const end = Date.now() + 90000; leaving() && Date.now() < end;) await sleep(500);
    ok(!leaving(), `the extra ready slots were removed (nothing left in the pool file's leaving list)`);

    /* 9. it survives a restart: stop this Servex, boot it again, the same slot is adopted */
    const before = (await pool()).slots[0];
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true });
    await sleep(1500);
    pid = boot();
    t = Date.now();
    p = await until(p => p.slots.some(s => s.state === "ready"), "the adopted slot after a restart", 60000);
    ok(p.slots.length === 1 && p.slots[0].id === before.id && p.slots[0].url === before.url,
        `after a Servex restart the same slot was adopted, not rebuilt: ${brief(p)} at ${p.slots[0].url} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
} catch (e){
    say("FAIL", e.message);
} finally {
    /* stop the private Servex, then remove every qfp-* worktree and its page watcher */
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true });
    say(`private Servex stopped (taskkill /T on ${pid})`);
    /* the pool's own remove(): stops the watcher and server, puts back only the
     * baseline the slot's server wrote at boot, then worktree-down */
    const { default: Pool } = await import(pathToFileURL(path.join(REPO, "Servex", "Pool.js")).href);
    const left_pool = new Pool({ file: POOL_FILE, prefix: "qfp", servex: { dashboard_port: PORT, say: m => say(m) } });
    for (const slot of [...left_pool.slots]) await left_pool.remove(slot);
    let registry = {};
    try { registry = JSON.parse(fs.readFileSync(path.join(MAIN, ".worktrees.json"), "utf8")); } catch {}
    for (const name of Object.keys(registry).filter(n => n.startsWith("qfp-"))){
        const out = spawnSync(process.execPath, [path.join(MAIN, "Server", "worktree-down.mjs"), name], { cwd: MAIN, encoding: "utf8", windowsHide: true });
        say(`worktree-down ${name}: ${(out.stdout + out.stderr).trim().split("\n").at(-1)}`);
    }
    const left = execFileSync("git", ["worktree", "list"], { cwd: MAIN, encoding: "utf8", windowsHide: true }).split("\n").filter(l => /qfp-/.test(l));
    const branches = execFileSync("git", ["branch", "--list", "worktree/qfp-*"], { cwd: MAIN, encoding: "utf8", windowsHide: true }).trim();
    ok(!left.length && !branches, `git worktree list shows no qfp-* worktree${left.length ? `: ${left.join("; ")}` : ""}, and no worktree/qfp-* branch${branches ? `: ${branches}` : ""}`);
    fs.writeFileSync(path.join(HERE, "proof.txt"), lines.join("\n") + "\n");
}
