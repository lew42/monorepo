// Token rename, scripted (CLAUDE.md: moves and renames are scripted). Dry run by default; --apply writes.
//   --prim-ink → --prime-ink · --prim → --prime          (every tracked .css/.js/.mjs/.md/.html under public/, and .claude/skills)
//   var(--bg) → var(--dark) · `--bg:` → `--dark:`        (.css files only; docs that discuss the old name keep it)
// Skips dated task logs (public/framework/ai/20*), sessions and every .jsonl (history is never rewritten).
// Writes rename-manifest.json beside this script: every file, every rule, count before → after. Reverse: swap the pairs.
import fs from "node:fs"; import path from "node:path"; import { execSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const repo = execSync("git rev-parse --show-toplevel", { cwd: here }).toString().trim();
const apply = process.argv.includes("--apply");
const files = execSync("git ls-files public .claude/skills", { cwd: repo, maxBuffer: 1 << 28 }).toString().split("\n")
  .filter(f => /\.(css|js|mjs|md|html)$/.test(f))
  .filter(f => !/^public\/framework\/ai\/(20\d\d|sessions)\//.test(f))
  .filter(f => !f.endsWith("ai/sessions/2026/10/12/session-cbdc3ef5/style-system/rename-tokens.mjs"));
const RULES = [
  { name: "--prim-ink", re: /--prim-ink(?![\w-])/g, to: "--prime-ink", ext: /./ },
  { name: "--prim", re: /--prim(?![\w-])/g, to: "--prime", ext: /./ },
  { name: "var(--bg)", re: /var\(--bg\)/g, to: "var(--dark)", ext: /\.css$/ },
  { name: "--bg:", re: /--bg(\s*):/g, to: "--dark$1:", ext: /\.css$/ },
];
const manifest = []; let total = 0;
for (const f of files) {
  const abs = path.join(repo, f); let src; try { src = fs.readFileSync(abs, "utf8"); } catch { continue; }
  let out = src; const hits = {};
  for (const r of RULES) if (r.ext.test(f)) { const n = (out.match(r.re) || []).length; if (n) { hits[r.name] = n; out = out.replace(r.re, r.to); total += n; } }
  if (out !== src) { manifest.push({ file: f, hits }); if (apply) fs.writeFileSync(abs, out); }
}
fs.writeFileSync(path.join(here, "rename-manifest.json"), JSON.stringify({ applied: apply, at: new Date().toISOString(), files: manifest.length, replacements: total, manifest }, null, 1));
console.log(`${apply ? "APPLIED" : "dry run"}: ${total} replacements in ${manifest.length} files; manifest → rename-manifest.json`);
