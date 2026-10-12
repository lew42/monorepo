// Collect the owner's own prompts (not agent briefs) mentioning the page or AI systems.
// Sources: .claude/prompts/*.jsonl and Claude session logs. Output: owner-prompts.jsonl (rerunnable).
import fs from "fs"; import path from "path"; import os from "os";
const root = path.resolve(import.meta.dirname, "../../../../..");
const out = []; const seen = new Set();
const bad = /^(\[You are |You are |<system|<command|<local-command|Caveat:|\[Request interrupted|Base directory|<task-notification|<user-prompt|Load the )/;
function add(at, session, text, src) {
  if (typeof text !== "string") return; text = text.trim();
  if (text.length < 60 || bad.test(text)) return;
  const k = text.slice(0, 200); if (seen.has(k)) return; seen.add(k);
  out.push({ at, session, src, text });
}
for (const f of fs.readdirSync(path.join(root, ".claude/prompts")))
  for (const l of fs.readFileSync(path.join(root, ".claude/prompts", f), "utf8").split("\n")) {
    if (!l) continue; try { const p = JSON.parse(l).prompt; if (p && p.author === "owner") add(p.at, p.session_id, p.text, ".claude/prompts/" + f); } catch {}
  }
const dir = path.join(os.homedir(), ".claude/projects/C--Code-lew42-monorepo");
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".jsonl")) continue;
  const fp = path.join(dir, f); if (fs.statSync(fp).size > 60e6) continue;
  let first = true;
  for (const l of fs.readFileSync(fp, "utf8").split("\n")) {
    if (!l || !l.includes('"type":"user"')) continue;
    let o; try { o = JSON.parse(l); } catch { continue; }
    if (o.type !== "user" || o.isSidechain || o.isMeta) continue;
    let t = o.message?.content; if (Array.isArray(t)) t = t.filter(x => x.type === "text").map(x => x.text).join("\n");
    if (first) { first = false; if (/^\[You are Servex|^Load the|^You are/.test(String(t).trim())) break; } // agent session
    add(o.timestamp, f.replace(".jsonl", ""), t, "claude-session:" + f + ":" + (o.uuid || ""));
  }
}
out.sort((a, b) => String(a.at).localeCompare(String(b.at)));
fs.writeFileSync(path.join(import.meta.dirname, "owner-prompts.jsonl"), out.map(x => JSON.stringify(x)).join("\n") + "\n");
const kw = /\b(page|pages|Page\.js|page\.jsonl|router|children|ai board|inbox|servex|session|mastermind|card|rail|agent|dashboard|log)\b/i;
const hit = out.filter(x => kw.test(x.text));
console.log("owner prompts:", out.length, "chars:", out.reduce((a, x) => a + x.text.length, 0), "keyword hits:", hit.length, hit.reduce((a, x) => a + x.text.length, 0));
