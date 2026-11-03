// Builds loose-ends.jsonl from: scan-tasks/evidence output (items.json) + Haiku verdicts + todo.md + asks.jsonl + servex-queue.json.
// Usage: node build.mjs <scratch dir with items.json and v1.txt>
import fs from "fs"; import path from "path";
const S = process.argv[2], ai = path.resolve(import.meta.dirname, "../..");
const items = JSON.parse(fs.readFileSync(S + "/items.json", "utf8"));
const vt = {}; for (const l of fs.readFileSync(S + "/v1.txt", "utf8").split("\n")) { const m = l.match(/^#(\d+) \| (delivered|partial|not found)( scratch)? \| (.*)$/); if (m) vt[m[1]] = { v: m[2], scratch: !!m[3], ev: m[4] } }
const rows = [];
import { execSync } from "child_process";
const subj = d => { try { return execSync(`git log -3 --format=%s -- "${d}"`, { cwd: ai, encoding: "utf8" }).trim() } catch { return "" } };
const module_of = d => { const t = d.toLowerCase(); for (const k of ["servex", "dictate", "chat", "ai2", "page", "panel", "playground", "layout", "openrouter", "files", "tree", "voice", "research", "design"]) if (t.includes(k)) return k; return "ai" };
for (const x of items) {
  const j = vt[x.id]; if (!j) continue;
  const runArtefact = /\/runs\/|-17\d{11}$/.test(x.dir);
  const gl = j.v === "delivered" || runArtefact ? "" : subj(x.dir); const gitLanded = /landed/i.test(gl);
  const scratch = runArtefact || j.scratch || /proof|scratch|test-|\/qa|locked\.txt/.test(x.dir) && j.v === "not found";
  const state = scratch ? "scratch" : gitLanded ? "done-unverified" : j.v === "not found" ? "never-started" : j.v === "partial" ? "half-done" : "done-unverified";
  rows.push({ title: x.title, ask: x.brief.slice(0, 200), source: "task.jsonl", date: x.started || x.dir.slice(0, 10), state, evidence: j.ev + (runArtefact ? " [harness run output, not a task]" : "") + (gitLanded ? " [git subject says landed: " + gl.split(/\r?\n/).find(l => /landed/i.test(l)).slice(0, 70) + "]" : ""), dir: x.dir, module: module_of(x.dir), count: 1, id: x.id });
}
// asks.jsonl not landed
const taskDirs = items.map(x => x.dir);
const asks = fs.readFileSync(path.join(ai, "asks.jsonl"), "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l).ask } catch { } }).filter(Boolean);
const open = new Set(["building", "stalled", "queued", "routed", "parked", undefined]);
const seen = new Map();
for (const a of asks) {
  if (!open.has(a.status)) continue;
  const key = (a.title || "").toLowerCase().slice(0, 60);
  if (seen.has(key)) { seen.get(key).count++; continue }
  const dup = a.card && taskDirs.some(d => d.includes(a.card.split("/").slice(-1)[0]) || a.card.includes(d.split("/").slice(-1)[0]) && d.split("/").slice(-1)[0].length > 8);
  const r = { title: a.title, ask: (a.words || "").slice(0, 200), source: "asks.jsonl", date: (a.at || "").slice(0, 10), state: a.status === "queued" || a.status === "routed" ? "never-started" : "half-done", evidence: `ask status "${a.status}", owner ${a.owner || "?"}, card ${a.card || "none"}` + (dup ? " (also a task row)" : ""), dir: a.card || "", module: module_of(a.title || ""), count: 1, dupOfTask: !!dup };
  seen.set(key, r); if (!dup) rows.push(r);
}
// servex-queue.json: queued-but-never-run
for (const q of JSON.parse(fs.readFileSync(path.join(ai, "servex-queue.json"), "utf8"))) {
  const done = fs.existsSync(path.join(ai, "../../..", q.dir, "task.jsonl")) && /landed_at":"20/.test(fs.readFileSync(path.join(ai, "../../..", q.dir, "task.jsonl"), "utf8"));
  rows.push({ title: q.title, ask: (q.next || "").slice(0, 200), source: "servex-queue.json", date: "", state: done ? "done-unverified" : "never-started", evidence: `queued with $${q.budget_usd} on ${q.model}; ${done ? "task dir has landed_at" : "task dir not landed"}`, dir: q.dir.replace("public/framework/ai/", ""), module: module_of(q.dir + q.title), count: 1 });
}
// todo.md section 1 (not struck-through)
const todo = fs.readFileSync(path.join(ai, "todo.md"), "utf8").split("\n"); let sec = 0;
for (const l of todo) {
  if (/^## 1\./.test(l)) { sec = 1; continue } if (/^## /.test(l)) { sec = 0; continue }
  const m = l.match(/^- \*\*(.+?)\*\*(.*)$/); if (sec === 1 && m && !/~~/.test(l)) rows.push({ title: m[1].replace(/\s*\(.*$/, "").slice(0, 120), ask: m[2].replace(/^[\s—:-]+/, "").slice(0, 200), source: "todo.md §1", date: (l.match(/20\d\d-\d\d-\d\d/) || [""])[0], state: "never-started", evidence: "listed under 'Asked for, not finished yet'", dir: "todo.md", module: module_of(l), count: 1 });
}
const order = { "never-started": 0, "half-done": 1, "done-unverified": 2, scratch: 3 };
rows.sort((a, b) => order[a.state] - order[b.state] || (b.date || "").localeCompare(a.date || ""));
fs.writeFileSync("loose-ends.jsonl", rows.map(r => JSON.stringify(r)).join("\n") + "\n");
const c = {}; for (const r of rows) { const k = r.source + "/" + r.state; c[k] = (c[k] || 0) + 1 }
const st = {}; for (const r of rows) st[r.state] = (st[r.state] || 0) + 1;
console.log(rows.length, st); console.log(c);
// accuracy spot-check (script evidence): delivered with 0 commits; not-found with >=3 commits
const sus = items.filter(x => vt[x.id] && ((vt[x.id].v === "delivered" && x.commits === 0) || (vt[x.id].v === "not found" && x.commits >= 3)));
console.log("suspect verdicts", sus.length, sus.map(x => x.id + ":" + vt[x.id].v + ":" + x.commits).join(" "));
const dv = Object.entries(vt).filter(([, j]) => j.v === "delivered").length; console.log("delivered", dv, "of", Object.keys(vt).length);
