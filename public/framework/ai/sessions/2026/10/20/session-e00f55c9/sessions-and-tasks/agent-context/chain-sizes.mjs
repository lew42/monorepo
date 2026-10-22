// node chain-sizes.mjs — whole-readme chain size (tokens ≈ chars/4) for every folder that has a readme. Prints a summary + writes chain-sizes.json beside it.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
import { readme_chain, REPO } from "../../../../../../../../../../Servex/agents/readme-chain.js";
const here = path.dirname(fileURLToPath(import.meta.url));
const skip = /node_modules|\.git$|\.claude[\/]worktrees|[\/]Temp|[\/]sessions[\/]\d{4}[\/]/;
const rows = [];
(function walk(d, depth){
  if (skip.test(d) || depth > 8) return;
  let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  if (ents.some(e => e.isFile() && /^readme\.md$/i.test(e.name))) {
    const chain = readme_chain(d); const chars = chain.reduce((n, r) => n + r.text.length, 0);
    rows.push({ dir: path.relative(REPO, d).split(path.sep).join("/") || ".", levels: chain.length, tokens: Math.round(chars / 4), own: Math.round(chain.at(-1).text.length / 4) });
  }
  for (const e of ents) if (e.isDirectory() && !e.name.startsWith(".") ) walk(path.join(d, e.name), depth + 1);
})(REPO, 0);
rows.sort((a, b) => b.tokens - a.tokens);
fs.writeFileSync(path.join(here, "chain-sizes.json"), JSON.stringify(rows));
const t = rows.map(r => r.tokens).sort((a, b) => a - b), q = p => t[Math.floor(p * (t.length - 1))];
console.log(`folders ${rows.length}  median ${q(.5)}  p90 ${q(.9)}  max ${t.at(-1)}  over 12000: ${rows.filter(r => r.tokens > 12000).length}  over 8000: ${rows.filter(r => r.tokens > 8000).length}`);
console.log("biggest readmes:"); [...rows].sort((a, b) => b.own - a.own).slice(0, 10).forEach(r => console.log(" ", r.own, r.dir));
console.log("biggest chains:"); rows.slice(0, 8).forEach(r => console.log(" ", r.tokens, r.dir));
for (const d of ["Servex", "Server", "public/framework/core/Page", "public/framework/ai", "public/framework/ext/Refine", "public/framework/ux/Dictate"]) console.log(" ", rows.find(r => r.dir === d)?.tokens, d);
