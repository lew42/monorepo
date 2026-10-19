/* The proof run: node proof.mjs  (from anywhere). Starts a WorktreeWatch on the qf-7 worktree, breaks one page.js two ways, times
 * the message to the owner (through the live Servex send_to_agent door) and the clear line, restores the file. Output: proof-run.txt. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WorktreeWatch from "file:///C:/Code/lew42/worktrees/qf-7/Servex/WorktreeWatch.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const wt = "C:/Code/lew42/worktrees/qf-7", main = "C:/Code/lew42/monorepo", port = 59714;
const page = path.join(wt, "public/framework/ux/Dictate/page.js"), url = "/framework/ux/Dictate/";
const original = fs.readFileSync(page, "utf8");
const out = [];
const say = s => { out.push(s); console.error(s); };

const mcp = async (name, args) => {
    const r = await fetch("http://127.0.0.1:8090/mcp?as=worktree-watch", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) });
    return (await r.text()).slice(0, 200);
};

let t0 = 0, got = null, clear_at = null;
const watch = new WorktreeWatch({ id: "qf-7", path: wt, port, owner: "helper-worktree-watch", main, task_dir: here,
    send: (to, text) => { got = { at: Date.now(), text }; mcp("send_to_agent", { id: to, text, from: "worktree-watch", priority: "normal" }).then(r => say("   send_to_agent -> " + r)); } });
const note = watch.note.bind(watch);
watch.note = (msg, log) => { if (/ clear /.test(msg)) clear_at = Date.now(); note(msg, log); };
watch.start();
await new Promise(r => setTimeout(r, 1500));

const wait = async (f, ms = 90000) => { const end = Date.now() + ms; while (Date.now() < end && !f()) await new Promise(r => setTimeout(r, 100)); return f(); };
const secs = t => ((t - t0) / 1000).toFixed(1);

async function round(label, broken, cut_the_gate){
    got = null; clear_at = null;
    if (cut_the_gate) watch.pages.get(url).messaged_at = 0;   // the 10-minute gate has its own unit test; the proof must not wait it out
    say(`\n== ${label}`);
    t0 = Date.now(); fs.writeFileSync(page, broken);
    const ok = await wait(() => got);
    say(ok ? `   message after ${secs(got.at)} s: ${got.text}` : "   NO MESSAGE within 90 s");
    t0 = Date.now(); fs.writeFileSync(page, original);
    const ok2 = await wait(() => clear_at);
    say(ok2 ? `   clear line after ${secs(clear_at)} s` : "   NO CLEAR within 90 s");
    return [ok && (got.at), ok2];
}

const syntax = original + "\n}}} this is a deliberate syntax error\n";
const overflow = original + `\n;document.body.append(Object.assign(document.createElement("div"), { style: "width:900px;height:12px;background:red" }));\n`;
try {
    await round("1. syntax error in page.js", syntax, false);
    await round("2. element 900px wide (overflow at 400)", overflow, true);
} finally {
    fs.writeFileSync(page, original);
    watch.stop();
    fs.writeFileSync(path.join(here, "proof-run.txt"), out.join("\n") + "\n");
    process.exit(0);
}
