// Lists every landed task under ai/2026-10-12/ into claims.json (record-keeping is code).
import fs from "fs"; import path from "path"; import {execSync} from "child_process";
const day = path.resolve(import.meta.dirname, "..");
const root = path.resolve(day, "../../../..");
const claims = [];
for (const d of fs.readdirSync(day)) {
  const f = path.join(day, d, "task.jsonl");
  if (!fs.existsSync(f) || d === "night-audit") continue;
  let landing = null;
  for (const l of fs.readFileSync(f, "utf8").split("\n").filter(Boolean)) {
    const o = JSON.parse(l), a = o.assign || o;
    if (a.landed_at && a.outcome) landing = a;
  }
  if (!landing) { claims.push({task: d, landed: false}); continue; }
  const out = landing.outcome;
  const points = [...out.matchAll(/^- \[(x| )\] (.+)$/gm)].map(m => ({ticked: m[1] === "x", text: m[2]}));
  const commits = [...new Set(out.match(/\b[0-9a-f]{7,40}\b/g) || [])].filter(h => /\d/.test(h) && /[a-f]/.test(h));
  const commitsOnDev = commits.filter(h => { try { execSync(`git merge-base --is-ancestor ${h} HEAD`, {cwd: root, stdio: "pipe"}); return true; } catch { return false; } });
  claims.push({task: d, landed: true, title: landing.title, at: landing.landed_at, alreadyBuilt: /already (built|exist|shipped)|no code changed/i.test(out), points, commits, commitsOnDev, outcome: out});
}
fs.writeFileSync(path.join(import.meta.dirname, "claims.json"), JSON.stringify(claims, null, 1));
console.log(claims.length, "tasks;", claims.filter(c=>c.landed).length, "landed;", claims.reduce((n,c)=>n+(c.points?.length||0),0), "points;", claims.filter(c=>c.alreadyBuilt).length, "already-built");
