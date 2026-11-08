// Move the stray sessions/YYYY/MM/DD/session-cloud-vo/ caches aside (never delete); --go to move, else dry run.
// Each stray held only a gitignored index.json, written by AISessionIndex.dir_of before 6f60981c7.
import fs from "node:fs"; import path from "node:path";
const root = "public/framework/ai/sessions", to = "public/framework/ai/archive/stray-session-cloud-vo", go = process.argv.includes("--go");
const rows = [];
for (const y of fs.readdirSync(root).filter(n => /^\d{4}$/.test(n)))
  for (const m of fs.readdirSync(path.join(root, y)).filter(n => /^\d\d$/.test(n)))
    for (const d of fs.readdirSync(path.join(root, y, m)).filter(n => /^\d\d$/.test(n))) {
      const from = path.join(root, y, m, d, "session-cloud-vo");
      if (!fs.existsSync(from)) continue;
      const dest = path.join(to, `${y}-${m}-${d}`);
      rows.push({ from, to: dest, files: fs.readdirSync(from) });
      if (go) { fs.mkdirSync(to, { recursive: true }); fs.renameSync(from, dest); }
    }
if (go) fs.writeFileSync(path.join(to, "manifest.jsonl"), rows.map(r => JSON.stringify({ ...r, at: new Date().toISOString() })).join("\n") + "\n");
console.log(JSON.stringify({ go, count: rows.length, odd: rows.filter(r => r.files.join() !== "index.json") }, null, 1));
