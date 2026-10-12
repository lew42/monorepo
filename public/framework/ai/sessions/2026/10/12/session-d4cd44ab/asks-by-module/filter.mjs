// Narrow owner-prompts.jsonl to real dictation about the page/AI systems -> candidates.jsonl, chunked into chunks/NN.json (<=~45k tokens each)
import fs from "fs";
const dir = import.meta.dirname;
const L = fs.readFileSync(dir + "/owner-prompts.jsonl", "utf8").trim().split("\n").map(l => JSON.parse(l));
const clean = t => t.replace(/<ide_[a-z_]+>[\s\S]*?<\/ide_[a-z_]+>/g, "").replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
const skip = /^(\[from:|\[Servex|\[Task|\[Reply|\[Heartbeat|\[servex|# (Mastermind|Build|Brief)|Servex monitor|\{|<)/;
const page = /\b(page|pages|router|routing|children|page\.js|page\.jsonl|columns?|layout|sidebar|breadcrumb|view|capturing|template)\b/i;
const ai = /\b(ai board|ai system|inbox|servex|session|sessions|mastermind|card|cards|rail|dashboard|agent|agents|task|tasks|skill|skills|readme|log|usage|budget|token|spawn|minion|model)\b/i;
const cands = [];
for (const x of L) {
  const t = clean(x.text); if (t.length < 80 || skip.test(t)) continue;
  const m = []; if (page.test(t)) m.push("page"); if (ai.test(t)) m.push("ai");
  if (!m.length) continue;
  cands.push({ id: cands.length, at: String(x.at).slice(0, 16), src: x.src, text: t.length > 1400 ? t.slice(0, 1400) + " …[cut]" : t });
}
fs.writeFileSync(dir + "/candidates.jsonl", cands.map(c => JSON.stringify(c)).join("\n") + "\n");
fs.mkdirSync(dir + "/chunks", { recursive: true });
let cur = [], size = 0, n = 0; const LIM = 160000; // chars ~ 40k tokens
const flush = () => { if (cur.length) fs.writeFileSync(`${dir}/chunks/${String(n++).padStart(2, "0")}.json`, JSON.stringify(cur)); cur = []; size = 0; };
for (const c of cands) { if (size + c.text.length > LIM) flush(); cur.push({ id: c.id, at: c.at, text: c.text }); size += c.text.length + 40; }
flush();
console.log("candidates", cands.length, "chars", cands.reduce((a, c) => a + c.text.length, 0), "chunks", n);
