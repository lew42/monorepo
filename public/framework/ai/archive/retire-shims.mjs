// Moves the eight ai/sessions/Session*.js shims into archive/retired/2026-10-13/sessions/ (git mv) with a manifest; --undo reverses.
import fs from "node:fs"; import { execSync } from "node:child_process";
const names = "Session SessionDetail SessionFollow SessionLive SessionRows SessionTrace SessionView SessionsPage".split(" ");
const from = n => `public/framework/ai/sessions/${n}.js`, dir = "public/framework/ai/archive/retired/2026-10-13/sessions";
const man = `${dir}/manifest.json`, undo = process.argv.includes("--undo");
if (undo) { for (const m of JSON.parse(fs.readFileSync(man, "utf8"))) execSync(`git mv ${m.to} ${m.from}`); }
else { fs.mkdirSync(dir, { recursive: true }); const ms = names.map(n => ({ from: from(n), to: `${dir}/${n}.js` }));
  for (const m of ms) execSync(`git mv ${m.from} ${m.to}`); fs.writeFileSync(man, JSON.stringify(ms, null, 1)); }
