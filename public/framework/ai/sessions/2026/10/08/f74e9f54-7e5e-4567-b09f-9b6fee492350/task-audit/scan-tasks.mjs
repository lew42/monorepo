// Scans every task.jsonl; prints/writes one row per task: dir, title, brief, landed?, last log, counts.
import fs from "fs"; import path from "path";
const root = path.resolve(import.meta.dirname, "../..");
const out = [];
function walk(d, depth = 0) {
  if (depth > 6) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, depth + 1);
    else if (e.name === "task.jsonl") out.push(p);
  }
}
walk(root);
const rows = [];
for (const f of out) {
  const dir = path.dirname(f), rel = path.relative(root, dir).split(path.sep).join("/");
  let lines; try { lines = fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) } catch { continue }
  let landed = null, title = null, card = null, now = null, brief = null, logs = 0, last = null, assigns = 0, started = null;
  for (const l of lines) {
    if (l.landed_at) landed = l.landed_at;
    if (l.assign) { assigns++; if (l.assign.landed_at) landed = l.assign.landed_at; title = l.assign.title || title; card = l.assign.card || card; now = l.assign.now || now; brief = l.assign.brief || brief; started = started || l.assign.requested_at; title = title || l.assign.title }
    if (l.title) title = title || l.title;
    if (l.log) { logs++; last = l.log.msg }
    if (l.landed) landed = landed || l.landed.at || true;
    if (l.status) now = l.status;
  }
  const has = n => fs.existsSync(path.join(dir, n));
  rows.push({ dir: rel, title: title || card || rel.split("/").slice(-1)[0], card, started, landed, now, logs, assigns, last: (last || "").slice(0, 160), req: has("requirements.md"), report: has("report.md") || has("page.js") });
}
fs.writeFileSync(process.argv[2] || "tasks.json", JSON.stringify(rows, null, 1));
const open = rows.filter(r => !r.landed);
console.log("tasks", rows.length, "no-landed", open.length, "queued-now", rows.filter(r => !r.landed && /queued/.test(r.now || "")).length, "with-requirements-no-logs", rows.filter(r => r.req && !r.logs).length);
const by = {}; for (const r of open) by[r.now || "?"] = (by[r.now || "?"] || 0) + 1; console.log(by);
