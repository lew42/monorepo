// Transcription filter over asks-by-module/owner-prompts.jsonl -> candidates.jsonl + chunks/ (<=~40k tokens). Reuses asks-by-module's method.
import fs from "fs";
const dir = import.meta.dirname, src = dir + "/../asks-by-module/owner-prompts.jsonl";
const clean = t => t.replace(/<ide_[a-z_]+>[\s\S]*?<\/ide_[a-z_]+>/g, "").replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
const skip = /^(\[from:|\[Servex|\[Task|\[Reply|\[Heartbeat|\[servex|# (Mastermind|Build|Brief)|Servex monitor|\{|<)/;
const re = /dictat|transcri|whisper|voice|speech|microphone|\bmic\b|refine|\becho\b|clean(ed)? transcript|raw words|speak|talking to|push.to.talk/i;
const c = [];
for (const l of fs.readFileSync(src, "utf8").trim().split("\n")) {
  const x = JSON.parse(l), t = clean(x.text);
  if (t.length < 80 || skip.test(t) || !re.test(t)) continue;
  c.push({ id: c.length, at: String(x.at).slice(0, 16), src: x.src, text: t.length > 1400 ? t.slice(0, 1400) + " …[cut]" : t });
}
fs.writeFileSync(dir + "/candidates.jsonl", c.map(x => JSON.stringify(x)).join("\n") + "\n");
let cur = [], size = 0, n = 0; const flush = () => { if (cur.length) fs.writeFileSync(`${dir}/chunks/${String(n++).padStart(2, "0")}.json`, JSON.stringify(cur)); cur = []; size = 0; };
for (const x of c) { if (size + x.text.length > 150000) flush(); cur.push({ id: x.id, at: x.at, text: x.text }); size += x.text.length + 40; }
flush(); console.log("candidates", c.length, "chunks", n);
