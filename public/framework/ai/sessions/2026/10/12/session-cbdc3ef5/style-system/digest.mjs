// Digest of past style/token/card tasks: landing outcome + head of the main report, for the Haiku audit.
import fs from "node:fs"; import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const root = path.resolve(here, "../../..");   // public/framework
const dirs = fs.readFileSync(path.join(here, "past-dirs.txt"), "utf8").trim().split(/\r?\n/);
const out = [];
for (const d of dirs) {
  const abs = path.join(root, d); let outcome = "";
  try { for (const l of fs.readFileSync(path.join(abs, "task.jsonl"), "utf8").split("\n")) { try { const o = JSON.parse(l); const a = o.assign || o; if (a.outcome) outcome = typeof a.outcome == "string" ? a.outcome : JSON.stringify(a.outcome); } catch {} } } catch {}
  let head = "";
  for (const f of ["STATE.md", "report.md", "result.md", "verdict.md", "findings.md", "requirements.md"]) {
    try { head = `[${f}] ` + fs.readFileSync(path.join(abs, f), "utf8").slice(0, 900); break; } catch {}
  }
  out.push(`## ${d}\noutcome: ${outcome.slice(0, 900) || "(none)"}\n${head}\n`);
}
const n = Number(process.argv[2] || 3), size = Math.ceil(out.length / n);
for (let i = 0; i < n; i++) fs.writeFileSync(path.join(here, `digest-${i + 1}.md`), out.slice(i * size, (i + 1) * size).join("\n"));
console.log(out.length, "dirs ->", n, "files", out.map(s => s.length).reduce((a, b) => a + b) , "chars");
