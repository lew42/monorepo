// ledger.mjs — core/Page work graded from the logs and git, never from memory.
// node public/framework/ai/sessions/2026/10/15/voice-20261015/page-system/ledger.mjs > ledger.md
import fs from "node:fs"; import path from "node:path"; import { execSync } from "node:child_process";
const ROOT = "public/framework/ai/sessions"; const DEV = "michael/dev";
const PAGE = /(^|[-/ ])(page|pages|jsonl|router|routing|columns|navigation|nav-model|template|templates|binding|parts|property-of|page-files|page-tools|page-ai-api|page-split|page-inbox|page-cms|paging)([-/ ]|$)|core\/Page/i;
const NOT = /figma|openrouter|voice|dictat|session-page-assistant|imagine|website|audio|fresh-eyes-review/i;
const git = c => { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return null; } };
const onDev = new Map(); const isDev = h => { if (!onDev.has(h)) onDev.set(h, git(`git merge-base --is-ancestor ${h} ${DEV}`) !== null); return onDev.get(h); };
const exists = h => git(`git cat-file -t ${h}`) === "commit";
const rows = [];
(function walk(d){ for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name);
  if (e.isDirectory()) { if (["cards", "screenshots", "pictures"].includes(e.name)) continue; walk(p); } else if (e.name === "task.jsonl") take(p); } })(ROOT);
function take(p){
  const dir = path.dirname(p).split(path.sep).join("/"); const m = dir.match(/sessions\/(\d{4})\/(\d\d)\/(\d\d)\//); if (!m) return;
  const txt = fs.readFileSync(p, "utf8"); const lines = txt.split("\n").filter(Boolean);
  let a = {}; try { a = JSON.parse(lines[0]).assign || {}; } catch {}
  const slug = path.basename(dir); const key = `${slug} ${a.card || ""} ${a.agent || ""}`;
  if (!PAGE.test(key) || NOT.test(key + " " + dir)) return;
  const landed = /"landed_at"/.test(txt);
  const hashes = [...new Set((txt.match(/\b[0-9a-f]{8,12}\b/g) || []))].filter(h => /[a-f]/.test(h) && /\d/.test(h)).slice(0, 40).filter(exists);
  const dev = hashes.filter(isDev);
  const grade = landed ? (dev.length ? "landed, commit on dev" : hashes.length ? "landed, commits NOT on dev" : "landed, no commit named")
    : dev.length ? "committed, never closed" : hashes.length ? "committed off dev, never closed" : "no commit, never closed";
  rows.push({ day: `${m[1]}-${m[2]}-${m[3]}`, dir: dir.replace(ROOT + "/", ""), card: (a.card || "").slice(0, 70), grade, commits: dev.slice(0, 2).join(" ") || hashes.slice(0, 2).join(" ") });
}
rows.sort((x, y) => x.day < y.day ? 1 : x.day > y.day ? -1 : 0);
const count = rows.reduce((c, r) => (c[r.grade] = (c[r.grade] || 0) + 1, c), {});
const wk = d => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 6) % 7); return t.toISOString().slice(0, 10); };
console.log(`# core/Page work ledger (computed ${new Date().toISOString().slice(0, 10)})\n\nEvery task folder under \`ai/sessions/\` whose name, card or agent is page work, graded from its \`task.jsonl\` (a \`landed_at\` line) and git (do the commit hashes it names exist, and are they on \`${DEV}\`). Rerun: \`node ${"public/framework/ai/sessions/2026/10/15/voice-20261015/page-system/ledger.mjs"}\`.\n`);
console.log("| grade | tasks |\n|---|---|"); for (const [k, v] of Object.entries(count).sort((a, b) => b[1] - a[1])) console.log(`| ${k} | ${v} |`);
const weeks = {}; for (const r of rows) { const w = wk(r.day); weeks[w] ??= {}; weeks[w][r.grade] = (weeks[w][r.grade] || 0) + 1; }
console.log("\n## By week\n\n| week of | " + Object.keys(count).join(" | ") + " |\n|---|" + Object.keys(count).map(() => "---").join("|") + "|");
for (const w of Object.keys(weeks).sort().reverse()) console.log(`| ${w} | ` + Object.keys(count).map(k => weeks[w][k] || 0).join(" | ") + " |");
const gl = git(`git log ${DEV} --since=2026-08-01 --format=%ad --date=short -- public/framework/core/Page public/framework/ext/JSONL public/framework/core/Router`).split("\n");
const gw = {}; for (const d of gl) gw[wk(d)] = (gw[wk(d)] || 0) + 1;
console.log("\n## Commits on dev touching core/Page, ext/JSONL, core/Router, by week\n\n| week of | commits |\n|---|---|"); for (const w of Object.keys(gw).sort().reverse()) console.log(`| ${w} | ${gw[w]} |`);
for (const g of ["committed off dev, never closed", "landed, commits NOT on dev", "committed, never closed", "no commit, never closed", "landed, no commit named", "landed, commit on dev"]) {
  const rs = rows.filter(r => r.grade === g); if (!rs.length) continue;
  console.log(`\n## ${g} (${rs.length})\n\n| day | task | card | commits |\n|---|---|---|---|`);
  for (const r of rs) console.log(`| ${r.day} | [${r.dir}](/framework/ai/sessions/${r.dir}/) | ${r.card.replace(/\|/g, "/")} | ${r.commits} |`);
}
